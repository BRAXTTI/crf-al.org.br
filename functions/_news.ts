import type { KVNamespace } from '@cloudflare/workers-types';
import { SITE_URL } from '../src/config/site';
import { NEWS_MAP, BLOCKED_NEWS_SLUGS, BLOCKED_NEW_IDS } from './_news-map';
import type { HistoricalNews } from './_news-map';
import { LEGACY_COVERS } from './_news-covers';
import type { WPPost, WPPostsPage, WPMedia } from '../src/services/wordpress/types';

export const NEWS_CATEGORY_SLUG = 'noticias-do-portal';
type Entry = {
  id: number;
  slug: string;
  date: string;
  date_gmt: string;
  modified?: string;
  title?: { rendered: string };
  categories?: number[];
  newsSource: 'current';
};
const byOldId = new Map(NEWS_MAP.map((row) => [row.oldId, row]));
const byNewId = new Map(
  NEWS_MAP.filter((row) => row.newId !== null).map((row) => [row.newId!, row]),
);
const bySlug = new Map(NEWS_MAP.map((row) => [row.slug, row]));
const byNewSlug = new Map(
  NEWS_MAP.filter((row) => row.newSlug !== row.slug).map((row) => [row.newSlug, row]),
);
const blockedSlugs = new Set(BLOCKED_NEWS_SLUGS);
const blockedIds = new Set(BLOCKED_NEW_IDS);
const fields =
  'id,date,date_gmt,modified,slug,link,title,excerpt,content,categories,featured_media,author,_links';
export const ORIGIN_CACHE = {
  cf: { cacheTtlByStatus: { '200-299': 60, '404': 60, '500-599': 0 }, cacheEverything: true },
} as RequestInit;
export interface NewsEnv {
  WP_SITE_URL?: string;
  NEWS_ARCHIVE_API_URL?: string;
  NEWS_INDEX?: KVNamespace;
}
/** Prazo total das chamadas ao WordPress de uma requisição; sem ele, 15 s por chamada e uma repetição. */
export interface NewsBudget {
  deadline: number;
  retry: boolean;
}
interface NewsContext {
  env?: NewsEnv;
  waitUntil: (promise: Promise<unknown>) => void;
  budget?: NewsBudget;
}
/** HTML: ~4,5 s no total e sem repetição; com cache (inclusive antigo), a origem nem é consultada. */
export const PAGE_BUDGET_MS = 4500;
export const API_BUDGET_MS = 8000;
const CALL_TIMEOUT_MS = 15_000;
export function withNewsBudget(context: NewsContext, ms: number, retry: boolean): NewsContext {
  return {
    env: context.env,
    waitUntil: (promise) => context.waitUntil(promise),
    budget: { deadline: Date.now() + ms, retry },
  };
}
/** Recargas em segundo plano e o índice compartilhado não herdam o prazo da requisição. */
function background(context?: NewsContext): NewsContext | undefined {
  return context && { env: context.env, waitUntil: (promise) => context.waitUntil(promise) };
}
interface PublicCache {
  match: (request: Request) => Promise<Response | undefined>;
  put: (request: Request, response: Response) => Promise<void>;
  delete?: (request: Request) => Promise<unknown>;
}

const scopedNamespaces = new WeakMap<KVNamespace, Map<string, KVNamespace>>();
function originScope(context?: NewsContext): string {
  const origin = new URL(context?.env?.WP_SITE_URL || 'https://wordpress.crf-al.org.br').origin;
  return origin === 'https://wordpress.crf-al.org.br' ? '' : encodeURIComponent(origin);
}
function newsKV(context?: NewsContext): KVNamespace | undefined {
  const kv = context?.env?.NEWS_INDEX;
  const scope = originScope(context);
  if (!kv || !scope) return kv;
  let namespaces = scopedNamespaces.get(kv);
  if (!namespaces) {
    namespaces = new Map();
    scopedNamespaces.set(kv, namespaces);
  }
  let scoped = namespaces.get(scope);
  if (!scoped) {
    scoped = new Proxy(kv, {
      get(target, property) {
        const member = Reflect.get(target, property);
        if (typeof member !== 'function') return member;
        return (...args: unknown[]) => {
          if (['get', 'getWithMetadata', 'put', 'delete'].includes(String(property)))
            args[0] = `${scope}:${args[0]}`;
          return Reflect.apply(member, target, args);
        };
      },
    });
    namespaces.set(scope, scoped);
  }
  return scoped;
}

async function request(
  path: string,
  params: Record<string, string> = {},
  missing = false,
  missingPage = false,
  context?: NewsContext,
): Promise<Response | null> {
  const budget = context?.budget;
  const url = new URL('/index.php', context?.env?.WP_SITE_URL || 'https://wordpress.crf-al.org.br');
  url.searchParams.set('rest_route', `/wp/v2/${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  for (let attempt = 0; ; attempt++) {
    const remaining = budget ? budget.deadline - Date.now() : CALL_TIMEOUT_MS;
    if (remaining <= 0) throw new DOMException('News budget exhausted', 'TimeoutError');
    const retry = attempt === 0 && (!budget || budget.retry);
    let response: Response;
    try {
      const upstream = await fetch(url, {
        ...ORIGIN_CACHE,
        signal: AbortSignal.timeout(Math.min(remaining, CALL_TIMEOUT_MS)),
      });
      // Inclui a leitura do corpo na tentativa: timeout pode ocorrer após os headers.
      response = new Response(await upstream.arrayBuffer(), {
        status: upstream.status,
        headers: upstream.headers,
      });
    } catch (error) {
      if (retry && error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name))
        continue;
      throw error;
    }
    if (retry && response.status >= 500) {
      await response.body?.cancel();
      continue;
    }
    if (missing && [401, 403, 404, 410].includes(response.status)) return null;
    if (missingPage && response.status === 400) {
      const body = (await response.json()) as { code?: string };
      if (body.code === 'rest_post_invalid_page_number') return null;
    }
    if (!response.ok) throw new Error(`News current HTTP ${response.status}`);
    return response;
  }
}
type Stored<T> = { storedAt: number; checkedAt?: number; value: T };
const MAX_STALE_MS = 24 * 3600_000;
const FRESH_MS = 60_000;
// Reserva durável de posts no KV (news:cache:v1:post/<slug>), compartilhada entre data centers.
// Só o cron cria cópias (os ~30 posts recentes, em warmNewsPosts); visitas apenas leem e,
// se o conteúdo mudou, atualizam ou apagam uma cópia existente. A cópia é servida sem esperar
// a origem nas primeiras 24 h após a última gravação (MAX_STALE_MS) e expira em 30 dias; depois
// das 24 h, a visita consulta a origem e a cópia serve só para evitar escritas iguais.
const DURABLE_TTL_S = 30 * 24 * 3600;
// O cron (de 3 em 3 h) renova as cópias com mais de 17,5 h, mesmo sem mudança: regrava na 6ª execução,
// a cada ~18 h (a margem de 30 min absorve a variação do horário; ~40 escritas/dia para 30 posts).
// Uma execução perdida renova com 21 h; duas chegam ao limite das 24 h. Visitas nunca regravam por idade.
const DURABLE_RENEW_MS = 17.5 * 3600_000;
// Cartões recentes (news:recent-cards:v1): regravados se mudam ou com 24 h, na primeira execução
// do cron depois disso (24–27 h, ~1 escrita/dia).
const DURABLE_REWRITE_MS = 24 * 3600_000;
const revalidating = new Map<string, Promise<void>>();
const durableKey = (key: string) => `news:cache:v1:${key}`;
function localCache() {
  return (globalThis as typeof globalThis & { caches?: { default?: PublicCache } }).caches?.default;
}
async function storeDurable<T>(
  kv: KVNamespace,
  key: string,
  value: T,
  previous?: Stored<T> | null,
  warming = false,
): Promise<void> {
  const now = Date.now();
  const stored =
    previous === undefined ? await kv.get<Stored<T>>(durableKey(key), 'json') : previous;
  // Só o cron cria cópias; visitas apenas atualizam as que já existem.
  if (!stored && !warming) return;
  const renew = warming && stored && now - stored.storedAt >= DURABLE_RENEW_MS;
  if (stored && !renew && JSON.stringify(stored.value) === JSON.stringify(value)) return;
  await kv.put(durableKey(key), JSON.stringify({ storedAt: now, value }), {
    expirationTtl: DURABLE_TTL_S,
  });
}
/**
 * Cache API por data center (fresco por 60 s) + stale-while-revalidate. Com `durable`, a reserva
 * do KV NEWS_INDEX (criada só pelo cron em warmNewsPosts) é servida de imediato quando o cache
 * local está vazio; visitas a atualizam se o conteúdo mudar, mas nunca a criam. Recargas em segundo plano são single-flight por isolate e marcam
 * apenas a tentativa com checkedAt, sem renovar a idade do conteúdo. Resultados `null` (não encontrado)
 * ficam 5 min só no cache local, para que slugs inexistentes não cheguem sempre à origem.
 */
const NOT_FOUND_S = 300;
interface CacheOptions {
  durable?: boolean;
  freshMs?: number;
}

async function readLocal<T>(
  cache: PublicCache | undefined,
  request: Request,
): Promise<Stored<T> | undefined> {
  const hit = await cache?.match(request);
  return hit ? ((await hit.json()) as Stored<T>) : undefined;
}

function writeLocal<T>(
  cache: PublicCache,
  request: Request,
  entry: Stored<T>,
  durable: boolean,
): Promise<void> {
  const maxAge = entry.value === null ? NOT_FOUND_S : durable ? DURABLE_TTL_S : 600;
  return cache.put(
    request,
    Response.json(entry, {
      headers: { 'Cache-Control': `public, max-age=${maxAge}` },
    }),
  );
}

async function cachedLoad<T>(
  key: string,
  context: NewsContext | undefined,
  load: (context?: NewsContext) => Promise<T>,
  { durable = false, freshMs = FRESH_MS }: CacheOptions = {},
): Promise<T> {
  const cache = context ? localCache() : undefined;
  const kv = durable ? newsKV(context) : undefined;
  const scopeKey = `${originScope(context)}/${key}`;
  const request = new Request(`${SITE_URL}/__news/v5/${scopeKey}`);
  const putLocal = (value: T, storedAt = Date.now(), checkedAt?: number) =>
    writeLocal(cache!, request, { storedAt, checkedAt, value }, Boolean(kv));
  const persist = async (value: T, previous?: Stored<T> | null) => {
    if (value === null) {
      // Exclusões no KV também contam como escritas: só apaga o que existia.
      await Promise.all([
        cache && putLocal(value),
        previous !== null && kv?.delete(durableKey(key)),
      ]);
      return;
    }
    await Promise.all([cache && putLocal(value), kv && storeDurable(kv, key, value, previous)]);
  };
  let entry = await readLocal<T>(cache, request);
  // "Não encontrado" não tem stale-while-revalidate: após 5 min consulta a origem de novo.
  if (entry?.value === null && Date.now() - entry.storedAt > NOT_FOUND_S * 1000) entry = undefined;
  let fromDurable = false;
  // Entrada local vencida também confere o KV: o cron pode ter renovado a cópia depois dela.
  if (kv && (!entry || Date.now() - entry.storedAt > MAX_STALE_MS)) {
    entry = (await kv.get<Stored<T>>(durableKey(key), 'json')) ?? undefined;
    fromDurable = Boolean(entry);
  }
  if (entry && Date.now() - entry.storedAt <= MAX_STALE_MS) {
    const stale = entry;
    if (
      stale.value !== null &&
      (fromDurable || Date.now() - (stale.checkedAt ?? stale.storedAt) > freshMs) &&
      !revalidating.has(scopeKey)
    ) {
      const task = (async () => {
        if (cache) await putLocal(stale.value, stale.storedAt, Date.now());
        // Reserva lida do KV evita uma segunda leitura; vinda do cache local, confere o KV.
        await persist(await load(background(context)), kv && !fromDurable ? undefined : stale);
      })()
        .catch(() => undefined)
        .finally(() => revalidating.delete(scopeKey));
      revalidating.set(scopeKey, task);
      context!.waitUntil(task);
    }
    return stale.value;
  }
  const value = await load(context);
  if (cache || (kv && value !== null))
    await persist(value, fromDurable ? entry : null).catch(() => undefined);
  return value;
}
// Compartilha inclusive a leitura inicial do KV e a persistência em rajadas frias.
const loading = new Map<string, Promise<unknown>>();
function cached<T>(
  key: string,
  context: NewsContext | undefined,
  load: (context?: NewsContext) => Promise<T>,
  options: CacheOptions = {},
): Promise<T> {
  const scopeKey = `${originScope(context)}/${key}`;
  const pending = loading.get(scopeKey);
  if (pending) return pending as Promise<T>;
  const task = cachedLoad(key, context, load, options).finally(() => loading.delete(scopeKey));
  loading.set(scopeKey, task);
  return task;
}
function hasTitle(post: { title?: { rendered: string } }) {
  return Boolean(
    post.title?.rendered
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim(),
  );
}
export function isBlockedNews(slug: string): boolean {
  const row = /^\d+$/.test(slug)
    ? byOldId.get(Number(slug))
    : bySlug.get(slug) || byNewSlug.get(slug);
  return Boolean(row?.blocked || blockedSlugs.has(slug));
}
export function knownHistoricalSlug(id: string): string | null {
  const row = byOldId.get(Number(id));
  return row && !row.blocked && row.newId !== null ? row.slug : null;
}
function historical(post: { id: number; slug: string }): HistoricalNews | undefined {
  const row = byNewId.get(post.id) || bySlug.get(post.slug);
  // Um ID pode ter sido reutilizado; nunca atribua outro conteúdo à URL histórica.
  return row &&
    (row.newId === null
      ? row.slug === post.slug
      : row.newId === post.id && row.newSlug === post.slug)
    ? row
    : undefined;
}
function acceptable(
  post: { id: number; slug: string; categories?: number[] },
  category: number | null,
  spamCategory: number | null,
): boolean {
  if (
    blockedIds.has(post.id) ||
    blockedSlugs.has(post.slug) ||
    (spamCategory !== null && post.categories?.includes(spamCategory))
  )
    return false;
  const row = historical(post);
  if (row?.blocked) return false;
  if (row) return true;
  if (
    byNewId.has(post.id) ||
    bySlug.has(post.slug) ||
    byNewSlug.has(post.slug) ||
    /^\d+$/.test(post.slug)
  )
    return false;
  return category !== null && Boolean(post.categories?.includes(category));
}
function normalize<T extends { id: number; slug: string; title?: { rendered: string } }>(
  post: T,
): T {
  const row = historical(post);
  const result = {
    ...post,
    slug: row?.slug ?? post.slug,
    ...(row?.title ? { title: { rendered: row.title } } : {}),
    newsSource: 'current',
  };
  // Reescreve todos os campos de mídia, inclusive srcset e tamanhos aninhados.
  return JSON.parse(
    JSON.stringify(result).replace(
      /https?:\/\/(?:www\.)?crf-al\.org\.br(?=\/(?:app|wp-content)\/uploads\/)/gi,
      'https://midias.crf-al.org.br',
    ),
  ) as T;
}
// O WordPress novo herdou o ID da capa, mas não o anexo (/wp/v2/media/{id} → 404). O arquivo continua
// em midias.crf-al.org.br; os metadados vêm do levantamento do WordPress antigo, com o mesmo ID.
const LEGACY_UPLOADS = 'https://midias.crf-al.org.br/app/uploads/';
export function legacyCover(id: number | undefined): WPMedia | undefined {
  const cover = id ? LEGACY_COVERS[id] : undefined;
  if (!cover) return undefined;
  const [path, width, height, alt, sizes] = cover;
  const folder = LEGACY_UPLOADS + path.slice(0, path.lastIndexOf('/') + 1);
  return {
    id,
    source_url: LEGACY_UPLOADS + path,
    alt_text: alt,
    media_details: {
      width,
      height,
      sizes: Object.fromEntries(
        Object.entries(sizes).map(([name, [file, w, h]]) => [
          name,
          { source_url: folder + file, width: w, height: h },
        ]),
      ),
    },
  };
}
type Category = { id: number; slug: string; name: string };
async function categories(context?: NewsContext) {
  return cached('categories', context, async (scoped) => {
    const rows: Category[] = [];
    for (let page = 1, pages = 1; page <= pages; page++) {
      const response = (await request(
        'categories',
        { per_page: '100', page: String(page), _fields: 'id,slug,name' },
        false,
        false,
        scoped,
      ))!;
      rows.push(...((await response.json()) as Category[]));
      pages = Math.min(100, Number(response.headers.get('x-wp-totalpages')) || 1);
    }
    return {
      rows,
      category: rows.find((row) => row.slug === NEWS_CATEGORY_SLUG)?.id ?? null,
      spam: rows.find((row) => row.slug === 'dating-online')?.id ?? null,
    };
  });
}
async function enrich(
  posts: WPPost[],
  taxonomy: Awaited<ReturnType<typeof categories>>,
  context?: NewsContext,
  withAuthor = false,
): Promise<WPPost[]> {
  const ids = [
    ...new Set(posts.map((post) => post.featured_media).filter((id): id is number => Boolean(id))),
  ];
  const authorIds = withAuthor
    ? [...new Set(posts.map((post) => post.author).filter((id): id is number => Boolean(id)))]
    : [];
  // Mídia e autores não dependem um do outro: uma única ida e volta à origem.
  const [media, authors] = await Promise.all([
    ids.length
      ? request(
          'media',
          {
            include: ids.join(','),
            per_page: String(ids.length),
            _fields: 'id,source_url,media_details,alt_text',
          },
          false,
          false,
          context,
        ).then((response) => response!.json() as Promise<WPMedia[]>)
      : Promise.resolve([]),
    Promise.all(
      authorIds.map(
        async (id) =>
          [
            id,
            await cached(`author/${id}`, context, async (scoped) => {
              const response = await request(
                `users/${id}`,
                { _fields: 'name' },
                true,
                false,
                scoped,
              );
              return response ? ((await response.json()) as { name: string }) : null;
            }),
          ] as const,
      ),
    ),
  ]);
  const images = new Map(media.map((item) => [item.id, item]));
  const names = new Map(authors);
  return posts.map((post) => {
    const image = images.get(post.featured_media) ?? legacyCover(post.featured_media);
    const author = withAuthor && post.author ? names.get(post.author) : null;
    return normalize({
      ...post,
      _embedded: {
        ...(image ? { 'wp:featuredmedia': [image] } : {}),
        'wp:term': [
          (post.categories ?? []).flatMap((id) => taxonomy.rows.filter((row) => row.id === id)),
        ],
        ...(author ? { author: [author] } : {}),
      },
    });
  });
}
// Teto de segurança contra cabeçalhos absurdos (~20 mil posts; hoje ~30 páginas). Acima dele,
// o índice guarda as páginas mais recentes e registra o corte em vez de falhar para sempre.
export const NEWS_INDEX_MAX_PAGES = 200;
async function buildNewsIndex(context?: NewsContext): Promise<Entry[]> {
  const { category, spam } = await categories(context);
  let pages = 1;
  let truncated = false;
  const loadPage = async (page: number): Promise<Entry[]> => {
    const response = await request(
      'posts',
      {
        per_page: '100',
        page: String(page),
        orderby: 'date',
        order: 'desc',
        _fields: 'id,slug,date,date_gmt,modified,title,categories',
      },
      false,
      page > 1,
      context,
    );
    if (!response) return [];
    const pageCount = Number(response.headers.get('x-wp-totalpages'));
    if (!Number.isInteger(pageCount) || pageCount < 0) throw new Error('Invalid news inventory');
    if (pageCount > NEWS_INDEX_MAX_PAGES && !truncated) {
      truncated = true;
      console.error(
        JSON.stringify({
          event: 'news_index_truncated',
          pages: pageCount,
          limit: NEWS_INDEX_MAX_PAGES,
        }),
      );
    }
    pages = Math.max(pages, Math.min(pageCount, NEWS_INDEX_MAX_PAGES));
    return (await response.json()) as Entry[];
  };
  const rows = await loadPage(1);
  let next = 2;
  // Cada conexão começa a próxima página assim que termina; nunca mais de quatro.
  const results = await Promise.allSettled(
    Array.from({ length: 4 }, async () => {
      while (next <= pages) rows.push(...(await loadPage(next++)));
    }),
  );
  const failed = results.find((result) => result.status === 'rejected');
  if (failed?.status === 'rejected') throw failed.reason;
  return [...new Map(rows.map((post) => [post.id, post])).values()]
    .filter((post) => acceptable(post, category, spam))
    .map(normalize)
    .filter(hasTitle)
    .sort((a, b) => b.date_gmt.localeCompare(a.date_gmt) || b.id - a.id);
}
export const NEWS_INDEX_KEY = 'news:index:v1';
export const NEWS_INDEX_LOCK = 'news:index:refresh:v1';
export const NEWS_RECENT_CARDS_KEY = 'news:recent-cards:v1';
export const NEWS_REFRESH_QUOTA_PREFIX = 'news:refresh-quota:v1:';
const RECENT_LIMIT = 60;
// Refresh de visitante (só quando o cron falha) reserva 6 escritas na cota diária
// (contador, lease, índice ou checked, cartões e falha), com teto de 500/dia.
// O cron não usa contador nem lease.
const REFRESH_WRITES = 6;
export const NEWS_INDEX_CHECK = 'news:index:checked:v1';
// Índice inalterado: checked só é regravado a cada ~6 h (a 2ª execução do cron de 3 em 3 h;
// a margem de 30 min absorve a variação do horário de cada execução). Cerca de 4 escritas/dia.
export const NEWS_INDEX_CHECK_REWRITE_MS = 5.5 * 3600_000;
// O cron (de 3 em 3 h) é a fonte regular; visitantes só disparam refresh se o cron falhar.
// checkedAt chega a ~6 h com o cron saudável: 15 h (6 h + 3 × 3 h) tolera ~3 execuções perdidas.
export const NEWS_INDEX_REFRESH_MS = 15 * 3600_000;
const REFRESH_MS = NEWS_INDEX_REFRESH_MS;
const LEASE_MS = 120_000;
// Após falha, o lease vira um intervalo curto: sem 503 por 2 min com o KV vazio e sem martelar a origem.
export const NEWS_INDEX_RETRY_MS = 15_000;
type StoredIndex = { storedAt: number; checkedAt?: number; hash?: string; value: Entry[] };
const refreshing = new WeakMap<KVNamespace, Promise<Entry[] | null>>();
// O índice tem ~1 MB: lido do KV com cache de borda de 60 s e decodificado no máximo uma vez
// por minuto em cada isolate. Um índice novo aparece em até ~2 min (memória + borda do KV).
export const NEWS_INDEX_MEMO_MS = 60_000;
const memo = new WeakMap<KVNamespace, { readAt: number; entry: StoredIndex }>();
type RecentCard = { id: number; slug: string; modified?: string; post: WPPost };
const cardsMemo = new WeakMap<KVNamespace, { readAt: number; value: Stored<RecentCard[]> }>();
/** Somente para testes: descarta a cópia em memória do índice. */
export function clearNewsIndexMemo(kv: KVNamespace) {
  memo.delete(kv);
  cardsMemo.delete(kv);
}
async function readRecentCards(kv: KVNamespace): Promise<Stored<RecentCard[]> | null> {
  const hit = cardsMemo.get(kv);
  if (hit && Date.now() - hit.readAt < NEWS_INDEX_MEMO_MS) return hit.value;
  const raw = await kv.get<Stored<RecentCard[]> | RecentCard[]>(NEWS_RECENT_CARDS_KEY, { type: 'json', cacheTtl: 60 });
  const value = Array.isArray(raw) ? { storedAt: 0, value: raw } : raw;
  if (value) cardsMemo.set(kv, { readAt: Date.now(), value });
  return value;
}
async function refreshRecentCards(kv: KVNamespace, index: Entry[], context: NewsContext) {
  const entries = index.slice(0, RECENT_LIMIT);
  const previous = await readRecentCards(kv);
  const old = new Map(previous?.value.map((card) => [card.id, card]));
  const changed = entries.filter((entry) => {
    const card = old.get(entry.id);
    return !entry.modified || card?.modified !== entry.modified || card.slug !== entry.slug;
  });
  const fresh = new Map<number, WPPost>();
  if (changed.length) {
    const ids = changed.map((entry) => entry.id);
    const [response, taxonomy] = await Promise.all([
      request('posts', { include: ids.join(','), per_page: String(ids.length), _fields: fields.replace('content,', '') }, false, false, context),
      categories(context),
    ]);
    const rows = ((await response!.json()) as WPPost[])
      .filter((post) => acceptable(post, taxonomy.category, taxonomy.spam)).map(normalize);
    const lookup = new Map(rows.map((post) => [post.id, post]));
    if (changed.some((entry) => lookup.get(entry.id)?.slug !== entry.slug))
      throw new Error('News inventory changed during listing');
    for (const post of await enrich(changed.map((entry) => lookup.get(entry.id)!), taxonomy, context)) fresh.set(post.id, post);
  }
  const value = entries.map((entry) => {
    const post = fresh.get(entry.id) ?? old.get(entry.id)!.post;
    const cover = !post._embedded?.['wp:featuredmedia']?.length && legacyCover(post.featured_media);
    return { id: entry.id, slug: entry.slug, modified: entry.modified, post: cover
      ? { ...post, _embedded: { ...post._embedded, 'wp:featuredmedia': [cover] } }
      : post };
  });
  if (!previous || Date.now() - previous.storedAt >= DURABLE_REWRITE_MS || JSON.stringify(previous.value) !== JSON.stringify(value)) {
    const stored = { storedAt: Date.now(), value };
    await kv.put(NEWS_RECENT_CARDS_KEY, JSON.stringify(stored), { expirationTtl: DURABLE_TTL_S });
    cardsMemo.set(kv, { readAt: Date.now(), value: stored });
  }
}
async function readNewsIndex(kv: KVNamespace): Promise<StoredIndex | null> {
  const hit = memo.get(kv);
  if (hit && Date.now() - hit.readAt < NEWS_INDEX_MEMO_MS) return hit.entry;
  const entry = await kv.get<StoredIndex>(NEWS_INDEX_KEY, { type: 'json', cacheTtl: 60 });
  if (entry) {
    const checked = await kv.get<{ hash: string; checkedAt: number }>(NEWS_INDEX_CHECK, {
      type: 'json',
      cacheTtl: 60,
    });
    // checked pode ser anterior ao próprio índice (só é gravado quando o índice não muda).
    if (checked?.hash && checked.hash === entry.hash)
      entry.checkedAt = Math.max(entry.checkedAt ?? entry.storedAt, checked.checkedAt);
    memo.set(kv, { readAt: Date.now(), entry });
  }
  return entry;
}
export function refreshNewsIndex(context: NewsContext, scheduled = false): Promise<Entry[] | null> {
  const kv = newsKV(context);
  if (!kv) return Promise.reject(new Error('NEWS_INDEX binding required'));
  const pending = refreshing.get(kv);
  if (pending) return pending;
  const commit = async (value: Entry[]) => {
    const bytes = new TextEncoder().encode(JSON.stringify(value));
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    const hash = Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, '0'),
    ).join('');
    const previous = await readNewsIndex(kv);
    const now = Date.now();
    // Índice novo já leva checkedAt; inalterado, só renova checked quando envelhece.
    if (previous?.hash !== hash)
      await kv.put(NEWS_INDEX_KEY, JSON.stringify({ storedAt: now, value, hash, checkedAt: now }));
    else if (now - (previous.checkedAt ?? previous.storedAt) >= NEWS_INDEX_CHECK_REWRITE_MS)
      await kv.put(NEWS_INDEX_CHECK, JSON.stringify({ hash, checkedAt: now }));
    const entry = { storedAt: previous?.hash === hash ? previous.storedAt : now, value, hash, checkedAt: now };
    memo.set(kv, { readAt: Date.now(), entry });
    context.waitUntil(refreshRecentCards(kv, value, background(context)!).catch((error) => {
      console.error(JSON.stringify({ event: 'news_recent_cards_refresh_failed', message: String(error) }));
    }));
    // Em caso de sucesso o lease segue até expirar, cobrindo a propagação do KV.
    return value;
  };
  const task = (async () => {
    // Cron: execução única a cada 3 h, sem contador nem lease no KV (2 escritas a menos).
    if (scheduled) return commit(await buildNewsIndex(background(context)));
    const quotaKey = NEWS_REFRESH_QUOTA_PREFIX + new Date().toISOString().slice(0, 10);
    const used = (await kv.get<number>(quotaKey, 'json')) ?? 0;
    if (used + REFRESH_WRITES > 500) {
      console.error(JSON.stringify({ event: 'news_refresh_quota_exceeded', used }));
      if (await readNewsIndex(kv)) return null;
      return cached('index', context, () => buildNewsIndex(background(context)));
    }
    const lock = await kv.get<number>(NEWS_INDEX_LOCK, 'json');
    if (lock && Date.now() - lock < LEASE_MS) return null;
    await kv.put(quotaKey, JSON.stringify(used + REFRESH_WRITES), { expirationTtl: DURABLE_TTL_S });
    // KV não oferece compare-and-swap: lease distribuído best-effort + single-flight local.
    await kv.put(NEWS_INDEX_LOCK, JSON.stringify(Date.now()), { expirationTtl: LEASE_MS / 1000 });
    let value: Entry[];
    try {
      value = await buildNewsIndex(background(context));
    } catch (error) {
      // Libera o lease: o timestamp recuado expira em NEWS_INDEX_RETRY_MS (o TTL mínimo do KV é 60 s).
      await kv
        .put(NEWS_INDEX_LOCK, JSON.stringify(Date.now() - LEASE_MS + NEWS_INDEX_RETRY_MS), {
          expirationTtl: 60,
        })
        .catch(() => undefined);
      throw error;
    }
    return commit(value);
  })().finally(() => refreshing.delete(kv));
  refreshing.set(kv, task);
  return task;
}
export async function newsIndex(context?: NewsContext): Promise<Entry[]> {
  const kv = newsKV(context);
  if (!kv) return cached('index', context, () => buildNewsIndex(background(context)));
  const entry = await readNewsIndex(kv);
  if (entry) {
    if (Date.now() - (entry.checkedAt ?? entry.storedAt) > REFRESH_MS)
      context!.waitUntil(
        refreshNewsIndex(context!).catch((error) => {
          console.error(
            JSON.stringify({ event: 'news_index_refresh_failed', message: String(error) }),
          );
        }),
      );
    return entry.value;
  }
  const value = await refreshNewsIndex(context!);
  if (value) return value;
  throw new Error('News index warming up');
}
export const newsSitemapIndex = newsIndex;
const postKey = (slug: string) => `post/${encodeURIComponent(slug)}`;
/** Detalhe completo da notícia. Middleware (metadados) e /api/news compartilham a mesma chave. */
export async function newsPost(slug: string, context?: NewsContext): Promise<WPPost | null> {
  if (isBlockedNews(slug)) return null;
  return cached(
    postKey(slug),
    context,
    async (scoped) => {
      const row = /^\d+$/.test(slug)
        ? byOldId.get(Number(slug))
        : bySlug.get(slug) || byNewSlug.get(slug);
      const params = { _fields: fields };
      const loadPost = async (): Promise<WPPost | undefined> => {
        if (row?.newId != null) {
          const response = await request(`posts/${row.newId}`, params, true, false, scoped);
          const post = response ? ((await response.json()) as WPPost) : undefined;
          if (post && (post.id !== row.newId || post.slug !== row.newSlug))
            throw new Error('News identity mismatch');
          return post;
        }
        if (row || !/^\d+$/.test(slug)) {
          const response = await request(
            'posts',
            { ...params, slug: row?.newSlug ?? slug, per_page: '1' },
            false,
            false,
            scoped,
          );
          return ((await response!.json()) as WPPost[])[0];
        }
        const response = await request(`posts/${slug}`, params, true, false, scoped);
        return response ? ((await response.json()) as WPPost) : undefined;
      };
      // Categorias normalmente vêm do cache; ainda assim não esperam pelo post.
      const [post, taxonomy] = await Promise.all([loadPost(), categories(scoped)]);
      if (!post || !acceptable(post, taxonomy.category, taxonomy.spam)) return null;
      const [result] = await enrich([post], taxonomy, scoped, true);
      return hasTitle(result) ? result : null;
    },
    { durable: true },
  );
}
export const WARM_POSTS = 30;
/**
 * Pré-aquece no KV o detalhe das notícias mais recentes (cron). Uma consulta `include`
 * cobre todos os posts; é o único caminho que cria cópias de posts no KV, e cada uma só é
 * gravada quando não existe, quando o conteúdo mudou ou quando tem mais de ~18 h.
 */
export async function warmNewsPosts(
  context: NewsContext,
  index?: Entry[] | null,
  limit = WARM_POSTS,
): Promise<number> {
  const kv = newsKV(context);
  if (!kv) throw new Error('NEWS_INDEX binding required');
  const entries = (index ?? (await readNewsIndex(kv))?.value ?? []).slice(0, limit);
  if (!entries.length) return 0;
  const ids = entries.map((entry) => entry.id);
  const [response, taxonomy] = await Promise.all([
    request(
      'posts',
      { include: ids.join(','), per_page: String(ids.length), _fields: fields },
      false,
      false,
      context,
    ),
    categories(context),
  ]);
  const rows = ((await response!.json()) as WPPost[]).filter((post) =>
    acceptable(post, taxonomy.category, taxonomy.spam),
  );
  const posts = (await enrich(rows, taxonomy, context, true)).filter(hasTitle);
  await Promise.all(posts.map((post) => storeDurable(kv, postKey(post.slug), post, undefined, true)));
  return posts.length;
}
export async function newsPage(
  page = 1,
  perPage = 12,
  context?: NewsContext,
): Promise<WPPostsPage> {
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(perPage) ||
    perPage < 1 ||
    perPage > 100
  )
    throw new RangeError('Invalid news pagination');
  const index = await newsIndex(context);
  const entries = index.slice((page - 1) * perPage, page * perPage);
  if (!entries.length)
    return { posts: [], total: index.length, totalPages: Math.ceil(index.length / perPage) };
  const ids = entries.map((entry) => entry.id);
  const kv = newsKV(context);
  const cards = kv && (await readRecentCards(kv));
  if (cards) {
    const lookup = new Map(cards.value.map((card) => [card.id, card]));
    if (entries.every((entry) => {
      const card = lookup.get(entry.id);
      return card && card.slug === entry.slug && card.modified === entry.modified;
    }))
      return { posts: entries.map((entry) => lookup.get(entry.id)!.post), total: index.length, totalPages: Math.ceil(index.length / perPage) };
  }
  const posts = await cached<WPPost[]>(`list/${ids.join(',')}`, context, async (scoped) => {
    const [response, taxonomy] = await Promise.all([
      request(
        'posts',
        {
          include: ids.join(','),
          per_page: String(ids.length),
          _fields: fields.replace('content,', ''),
        },
        false,
        false,
        scoped,
      ),
      categories(scoped),
    ]);
    const rows = (await response!.json()) as WPPost[];
    const filtered = rows
      .filter((post) => acceptable(post, taxonomy.category, taxonomy.spam))
      .map(normalize);
    const lookup = new Map(filtered.map((post) => [post.id, post]));
    if (entries.some((entry) => lookup.get(entry.id)?.slug !== entry.slug))
      throw new Error('News inventory changed during listing');
    return enrich(
      entries.map((entry) => lookup.get(entry.id)!),
      taxonomy,
      scoped,
    );
  });
  return { posts, total: index.length, totalPages: Math.ceil(index.length / perPage) };
}
const SEARCH_MAX_LENGTH = 120;
const SEARCH_MAX_WORDS = 8;
/**
 * Normaliza o termo (espaços, caixa, Unicode) para que variações compartilhem o cache e
 * limita o número de palavras: cada uma vira uma cláusula LIKE no WordPress.
 */
export function normalizeSearch(term: string): string | null {
  // eslint-disable-next-line no-control-regex
  if (term.length > SEARCH_MAX_LENGTH || /[\u0000-\u001f\u007f]/.test(term)) return null;
  const words = term
    .normalize('NFC')
    .toLocaleLowerCase('pt-BR')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, SEARCH_MAX_WORDS);
  const normalized = words.join(' ');
  return normalized.length >= 3 ? normalized : null;
}
export async function searchNews(term: string, context?: NewsContext): Promise<WPPost[]> {
  const normalized = normalizeSearch(term);
  if (normalized === null) throw new RangeError('Invalid news search');
  // Resultados de busca mudam pouco: 5 min frescos, depois stale-while-revalidate.
  return cached(
    `search/${encodeURIComponent(normalized)}`,
    context,
    async (scoped) => {
      const [response, { category, spam }] = await Promise.all([
        request(
          'posts',
          {
            search: normalized,
            per_page: '100',
            _fields: 'id,slug,date,date_gmt,title,excerpt,categories',
          },
          false,
          false,
          scoped,
        ),
        categories(scoped),
      ]);
      const posts = (await response!.json()) as WPPost[];
      return posts
        .filter((post) => acceptable(post, category, spam))
        .map(normalize)
        .filter(hasTitle)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 10);
    },
    { freshMs: 5 * 60_000 },
  );
}
export async function newsApi(request: Request, base?: NewsContext): Promise<Response> {
  if (!['GET', 'HEAD'].includes(request.method))
    return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
  const url = new URL(request.url);
  const context = base && withNewsBudget(base, API_BUDGET_MS, true);
  try {
    const search = url.searchParams.get('search');
    if (search !== null) {
      if (normalizeSearch(search) === null)
        return Response.json(
          { error: 'Busca deve ter entre 3 e 120 caracteres.' },
          { status: 400, headers: { 'Cache-Control': 'no-store' } },
        );
      return Response.json(await searchNews(search, context), {
        headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=600' },
      });
    }
    const slug = url.searchParams.get('slug');
    if (slug !== null && (!slug || slug.length > 200 || /[/?#]/.test(slug)))
      return Response.json({ error: 'Slug inválido.' }, { status: 400 });
    if (slug && isBlockedNews(slug))
      return Response.json({ error: 'Conteúdo removido.' }, { status: 410 });
    const result =
      slug !== null
        ? await newsPost(slug, context)
        : await newsPage(
            Number(url.searchParams.get('page') ?? 1),
            Number(url.searchParams.get('per_page') ?? 12),
            context,
          );
    return new Response(request.method === 'HEAD' ? null : JSON.stringify(result), {
      status: result ? 200 : 404,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': result ? 'public, max-age=60' : 'no-store',
      },
    });
  } catch (error) {
    if (error instanceof RangeError)
      return Response.json(
        { error: 'Paginação inválida.' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } },
      );
    console.error(JSON.stringify({ event: 'news_api_failed', message: String(error) }));
    return Response.json(
      { error: 'Notícias temporariamente indisponíveis.' },
      { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '60' } },
    );
  }
}
