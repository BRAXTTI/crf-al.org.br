import type { KVNamespace } from '@cloudflare/workers-types';
import { SITE_URL } from '../src/config/site';
import { NEWS_MAP, BLOCKED_NEWS_SLUGS, BLOCKED_NEW_IDS } from './_news-map';
import type { HistoricalNews } from './_news-map';
import type { WPPost, WPPostsPage, WPMedia } from '../src/services/wordpress/types';

export const NEWS_CATEGORY_SLUG = 'noticias-do-portal';
type Entry = { id: number; slug: string; date: string; date_gmt: string; modified?: string; title?: { rendered: string }; categories?: number[]; newsSource: 'current' };
const byOldId = new Map(NEWS_MAP.map(row => [row.oldId, row]));
const byNewId = new Map(NEWS_MAP.filter(row => row.newId !== null).map(row => [row.newId!, row]));
const bySlug = new Map(NEWS_MAP.map(row => [row.slug, row]));
const byNewSlug = new Map(NEWS_MAP.filter(row => row.newSlug !== row.slug).map(row => [row.newSlug, row]));
const blockedSlugs = new Set(BLOCKED_NEWS_SLUGS);
const blockedIds = new Set(BLOCKED_NEW_IDS);
const fields = 'id,date,date_gmt,modified,slug,link,title,excerpt,content,categories,featured_media,author,_links';
export const ORIGIN_CACHE = { cf: { cacheTtlByStatus: { '200-299': 60, '404': 60, '500-599': 0 }, cacheEverything: true } } as RequestInit;
export interface NewsEnv { NEWS_ARCHIVE_API_URL?: string; NEWS_INDEX?: KVNamespace }
interface NewsContext { env?: NewsEnv; waitUntil: (promise: Promise<unknown>) => void }
interface PublicCache { match: (request: Request) => Promise<Response | undefined>; put: (request: Request, response: Response) => Promise<void>; delete?: (request: Request) => Promise<unknown> }

async function request(path: string, params: Record<string, string> = {}, missing = false, missingPage = false): Promise<Response | null> {
  const url = new URL('https://wordpress.crf-al.org.br/index.php');
  url.searchParams.set('rest_route', `/wp/v2/${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  for (let attempt = 0; ; attempt++) {
    let response: Response;
    try {
      const upstream = await fetch(url, { ...ORIGIN_CACHE, signal: AbortSignal.timeout(15000) });
      // Inclui a leitura do corpo na tentativa: timeout pode ocorrer após os headers.
      response = new Response(await upstream.arrayBuffer(), { status: upstream.status, headers: upstream.headers });
    }
    catch (error) {
      if (attempt === 0 && error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name)) continue;
      throw error;
    }
    if (attempt === 0 && response.status >= 500) { await response.body?.cancel(); continue; }
    if (missing && response.status === 404) return null;
    if (missingPage && response.status === 400) {
      const body = await response.json() as { code?: string };
      if (body.code === 'rest_post_invalid_page_number') return null;
    }
    if (!response.ok) throw new Error(`News current HTTP ${response.status}`);
    return response;
  }
}
async function cached<T>(key: string, context: NewsContext | undefined, load: () => Promise<T>): Promise<T> {
  const cache = (globalThis as typeof globalThis & { caches?: { default?: PublicCache } }).caches?.default;
  const request = new Request(`${SITE_URL}/__news/v5/${key}`);
  const store = (value: T) => cache!.put(request, Response.json({ storedAt: Date.now(), value }, { headers: { 'Cache-Control': 'public, max-age=600' } }));
  const hit = cache && context ? await cache.match(request) : undefined;
  if (hit) {
    const entry = await hit.json() as { storedAt: number; value: T };
    if (Date.now() - entry.storedAt > 60_000) context!.waitUntil(load().then(async value => { await (value !== null ? store(value) : cache!.delete?.(request)); }).catch(() => undefined));
    return entry.value;
  }
  const value = await load();
  if (cache && context && value !== null) context.waitUntil(store(value).catch(() => undefined));
  return value;
}
function hasTitle(post: { title?: { rendered: string } }) { return Boolean(post.title?.rendered.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()); }
export function isBlockedNews(slug: string): boolean {
  const row = /^\d+$/.test(slug) ? byOldId.get(Number(slug)) : bySlug.get(slug) || byNewSlug.get(slug);
  return Boolean(row?.blocked || blockedSlugs.has(slug));
}
export function knownHistoricalSlug(id: string): string | null {
  const row = byOldId.get(Number(id));
  return row && !row.blocked && row.newId !== null ? row.slug : null;
}
function historical(post: { id: number; slug: string }): HistoricalNews | undefined {
  const row = byNewId.get(post.id) || bySlug.get(post.slug);
  // Um ID pode ter sido reutilizado; nunca atribua outro conteúdo à URL histórica.
  return row && (row.newId === null ? row.slug === post.slug : row.newId === post.id && row.newSlug === post.slug) ? row : undefined;
}
function acceptable(post: { id: number; slug: string; categories?: number[] }, category: number | null, spamCategory: number | null): boolean {
  if (blockedIds.has(post.id) || blockedSlugs.has(post.slug) || (spamCategory !== null && post.categories?.includes(spamCategory))) return false;
  const row = historical(post);
  if (row?.blocked) return false;
  if (row) return true;
  if (byNewId.has(post.id) || bySlug.has(post.slug) || byNewSlug.has(post.slug) || /^\d+$/.test(post.slug)) return false;
  return category !== null && Boolean(post.categories?.includes(category));
}
function normalize<T extends { id: number; slug: string; title?: { rendered: string } }>(post: T): T {
  const row = historical(post);
  const result = { ...post, slug: row?.slug ?? post.slug, ...(row?.title ? { title: { rendered: row.title } } : {}), newsSource: 'current' };
  // Reescreve todos os campos de mídia, inclusive srcset e tamanhos aninhados.
  return JSON.parse(JSON.stringify(result).replace(/https?:\/\/(?:www\.)?crf-al\.org\.br(?=\/(?:app|wp-content)\/uploads\/)/gi, 'https://midias.crf-al.org.br')) as T;
}
type Category = { id: number; slug: string; name: string };
async function categories(context?: NewsContext) {
  return cached('categories', context, async () => {
    const rows: Category[] = [];
    for (let page = 1, pages = 1; page <= pages; page++) {
      const response = (await request('categories', { per_page: '100', page: String(page), _fields: 'id,slug,name' }))!;
      rows.push(...await response.json() as Category[]);
      pages = Math.min(100, Number(response.headers.get('x-wp-totalpages')) || 1);
    }
    return { rows, category: rows.find(row => row.slug === NEWS_CATEGORY_SLUG)?.id ?? null, spam: rows.find(row => row.slug === 'dating-online')?.id ?? null };
  });
}
async function enrich(posts: WPPost[], taxonomy: Awaited<ReturnType<typeof categories>>, context?: NewsContext, withAuthor = false): Promise<WPPost[]> {
  const ids = [...new Set(posts.map(post => post.featured_media).filter((id): id is number => Boolean(id)))];
  const media = await (ids.length ? request('media', { include: ids.join(','), per_page: String(ids.length), _fields: 'id,source_url,media_details,alt_text' }).then(response => response!.json() as Promise<WPMedia[]>) : Promise.resolve([]));
  const images = new Map(media.map(item => [item.id, item]));
  return Promise.all(posts.map(async post => {
    const image = images.get(post.featured_media);
    const author = withAuthor && post.author ? await cached(`author/${post.author}`, context, async () => {
      const response = await request(`users/${post.author}`, { _fields: 'name' }, true);
      return response ? await response.json() as { name: string } : null;
    }) : null;
    return normalize({ ...post, _embedded: {
      ...(image ? { 'wp:featuredmedia': [image] } : {}),
      'wp:term': [(post.categories ?? []).flatMap(id => taxonomy.rows.filter(row => row.id === id))],
      ...(author ? { author: [author] } : {}),
    } });
  }));
}
async function buildNewsIndex(context?: NewsContext): Promise<Entry[]> {
  const { category, spam } = await categories(context);
  let pages = 1;
  const loadPage = async (page: number): Promise<Entry[]> => {
    const response = await request('posts', { per_page: '100', page: String(page), _fields: 'id,slug,date,date_gmt,modified,title,categories' }, false, page > 1);
    if (!response) return [];
    const pageCount = Number(response.headers.get('x-wp-totalpages'));
    if (!Number.isInteger(pageCount) || pageCount < 0 || pageCount > 100) throw new Error('Invalid news inventory');
    pages = Math.max(pages, pageCount);
    return await response.json() as Entry[];
  };
  const rows = await loadPage(1);
  let next = 2;
  // Cada conexão começa a próxima página assim que termina; nunca mais de quatro.
  const results = await Promise.allSettled(Array.from({ length: 4 }, async () => {
    while (next <= pages) rows.push(...await loadPage(next++));
  }));
  const failed = results.find(result => result.status === 'rejected');
  if (failed?.status === 'rejected') throw failed.reason;
  return [...new Map(rows.map(post => [post.id, post])).values()].filter(post => acceptable(post, category, spam)).map(normalize).filter(hasTitle).sort((a, b) => b.date_gmt.localeCompare(a.date_gmt) || b.id - a.id);
}
export const NEWS_INDEX_KEY = 'news:index:v1';
export const NEWS_INDEX_LOCK = 'news:index:refresh:v1';
const REFRESH_MS = 10 * 60_000;
type StoredIndex = { storedAt: number; value: Entry[] };
const refreshing = new WeakMap<KVNamespace, Promise<Entry[] | null>>();
export function refreshNewsIndex(context: NewsContext): Promise<Entry[] | null> {
  const kv = context.env?.NEWS_INDEX;
  if (!kv) return Promise.reject(new Error('NEWS_INDEX binding required'));
  const pending = refreshing.get(kv);
  if (pending) return pending;
  const task = (async () => {
    const lock = await kv.get<number>(NEWS_INDEX_LOCK, 'json');
    if (lock && Date.now() - lock < 120_000) return null;
    // KV não oferece compare-and-swap: lease distribuído best-effort + single-flight local.
    await kv.put(NEWS_INDEX_LOCK, JSON.stringify(Date.now()), { expirationTtl: 120 });
    const value = await buildNewsIndex(context);
    await kv.put(NEWS_INDEX_KEY, JSON.stringify({ storedAt: Date.now(), value }));
    // Mantém o lease até expirar, evitando novas tentativas durante propagação/falhas.
    return value;
  })().finally(() => refreshing.delete(kv));
  refreshing.set(kv, task);
  return task;
}
export async function newsIndex(context?: NewsContext): Promise<Entry[]> {
  const kv = context?.env?.NEWS_INDEX;
  if (!kv) return cached('index', context, () => buildNewsIndex(context));
  const entry = await kv.get<StoredIndex>(NEWS_INDEX_KEY, 'json');
  if (entry) {
    if (Date.now() - entry.storedAt > REFRESH_MS) context!.waitUntil(refreshNewsIndex(context!).catch(error => {
      console.error(JSON.stringify({ event: 'news_index_refresh_failed', message: String(error) }));
    }));
    return entry.value;
  }
  const value = await refreshNewsIndex(context!);
  if (value) return value;
  throw new Error('News index warming up');
}
export const newsSitemapIndex = newsIndex;
export async function newsPost(slug: string, context?: NewsContext, metadataOnly = false): Promise<WPPost | null> {
  if (isBlockedNews(slug)) return null;
  return cached(`${metadataOnly ? 'metadata' : 'post'}/${encodeURIComponent(slug)}`, context, async () => {
    const row = /^\d+$/.test(slug) ? byOldId.get(Number(slug)) : bySlug.get(slug) || byNewSlug.get(slug);
    const postFields = metadataOnly ? fields.replace('content,', '') : fields;
    const params = { _fields: postFields };
    let post: WPPost | undefined;
    if (row?.newId != null) {
      const response = await request(`posts/${row.newId}`, params, true);
      post = response ? await response.json() as WPPost : undefined;
      if (post && (post.id !== row.newId || post.slug !== row.newSlug)) throw new Error('News identity mismatch');
    } else if (row || !/^\d+$/.test(slug)) {
      const response = await request('posts', { ...params, slug: row?.newSlug ?? slug, per_page: '1' });
      post = (await response!.json() as WPPost[])[0];
    } else {
      const response = await request(`posts/${slug}`, params, true);
      post = response ? await response.json() as WPPost : undefined;
    }
    if (!post) return null;
    const taxonomy = await categories(context);
    if (!acceptable(post, taxonomy.category, taxonomy.spam)) return null;
    const [result] = await enrich([post], taxonomy, context, !metadataOnly);
    return hasTitle(result) ? result : null;
  });
}
export async function newsPage(page = 1, perPage = 12, context?: NewsContext): Promise<WPPostsPage> {
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(perPage) || perPage < 1 || perPage > 100) throw new RangeError('Invalid news pagination');
  const index = await newsIndex(context); const entries = index.slice((page - 1) * perPage, page * perPage);
  if (!entries.length) return { posts: [], total: index.length, totalPages: Math.ceil(index.length / perPage) };
  const ids = entries.map(entry => entry.id);
  const posts = await cached<WPPost[]>(`list/${ids.join(',')}`, context, async () => {
    const response = await request('posts', { include: ids.join(','), per_page: String(ids.length), _fields: fields.replace('content,', '') });
    const rows = await response!.json() as WPPost[]; const taxonomy = await categories(context);
    const filtered = rows.filter(post => acceptable(post, taxonomy.category, taxonomy.spam)).map(normalize);
    const lookup = new Map(filtered.map(post => [post.id, post]));
    if (entries.some(entry => lookup.get(entry.id)?.slug !== entry.slug)) throw new Error('News inventory changed during listing');
    return enrich(entries.map(entry => lookup.get(entry.id)!), taxonomy, context);
  });
  return { posts, total: index.length, totalPages: Math.ceil(index.length / perPage) };
}
export async function searchNews(term: string, context?: NewsContext): Promise<WPPost[]> {
  return cached(`search/${encodeURIComponent(term)}`, context, async () => {
    const response = await request('posts', { search: term, per_page: '100', _fields: 'id,slug,date,date_gmt,title,excerpt,categories' });
    const posts = await response!.json() as WPPost[]; const { category, spam } = await categories(context);
    return posts.filter(post => acceptable(post, category, spam)).map(normalize).filter(hasTitle).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
  });
}
export async function newsApi(request: Request, context?: NewsContext): Promise<Response> {
  if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
  const url = new URL(request.url);
  try {
    const search = url.searchParams.get('search');
    if (search !== null) {
      if (search.trim().length < 3 || search.length > 120) return Response.json({ error: 'Busca deve ter entre 3 e 120 caracteres.' }, { status: 400 });
      return Response.json(await searchNews(search.trim(), context), { headers: { 'Cache-Control': 'public, max-age=60' } });
    }
    const slug = url.searchParams.get('slug');
    if (slug !== null && (!slug || slug.length > 200 || /[/?#]/.test(slug))) return Response.json({ error: 'Slug inválido.' }, { status: 400 });
    if (slug && isBlockedNews(slug)) return Response.json({ error: 'Conteúdo removido.' }, { status: 410 });
    const result = slug !== null ? await newsPost(slug, context) : await newsPage(Number(url.searchParams.get('page') ?? 1), Number(url.searchParams.get('per_page') ?? 12), context);
    return new Response(request.method === 'HEAD' ? null : JSON.stringify(result), { status: result ? 200 : 404, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': result ? 'public, max-age=60' : 'no-store' } });
  } catch (error) {
    if (error instanceof RangeError) return Response.json({ error: 'Paginação inválida.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    console.error(JSON.stringify({ event: 'news_api_failed', message: String(error) }));
    return Response.json({ error: 'Notícias temporariamente indisponíveis.' }, { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '60' } });
  }
}
