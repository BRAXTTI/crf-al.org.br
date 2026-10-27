import { eventsCalendar } from '../src/lib/calendar';
import { SITE_URL } from '../src/config/site';
import type { CRFEvent } from '../src/services/wordpress/types';
/** Proxy público de rotas permitidas. Nunca aceita uma URL de origem do cliente. */
export interface ContentEnv {
  WP_SITE_URL?: string;
}
export interface ContentContext {
  env?: ContentEnv;
  waitUntil: (promise: Promise<unknown>) => void;
}
/** Páginas acima do teto são inválidas; nunca repetem a última página. */
export const MAX_GALLERY_PAGE = 100;
// Só o que detalhe e relacionados usam: sem autor, termos ou meta crua; `_links`/`_embedded` mantêm a capa.
const EVENT_FIELDS =
  'id,date,modified,slug,link,status,title,excerpt,content,featured_media,event_details,_links,_embedded';
const refreshing = new Map<string, Promise<void>>();
const MAX_STALE_MS = 86400_000;

function publicResponse(response: Response, method: string): Response {
  const result = new Response(method === 'HEAD' ? null : response.body, response);
  result.headers.delete('X-Stored-At');
  result.headers.delete('X-Checked-At');
  result.headers.set(
    'Cache-Control',
    response.status === 404 ? 'public, max-age=300' : 'public, max-age=60',
  );
  return result;
}

function contentParameters(input: URL) {
  const slug = input.searchParams.get('slug');
  const id = input.searchParams.get('id');
  const related = input.searchParams.get('related');
  const requestedPage = Number(input.searchParams.get('page') ?? 1);
  const page = requestedPage;
  if (
    (slug !== null && (!slug || slug.length > 200 || /[/?#]/.test(slug))) ||
    (id !== null && !/^[1-9]\d*$/.test(id)) ||
    (related !== null && !/^[1-9]\d*$/.test(related)) ||
    !Number.isSafeInteger(requestedPage) ||
    requestedPage < 1 ||
    requestedPage > MAX_GALLERY_PAGE
  )
    return null;
  return { slug, id, related, page };
}

export async function contentApi(request: Request, context: ContentContext): Promise<Response> {
  if (!['GET', 'HEAD'].includes(request.method))
    return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
  const input = new URL(request.url);
  const params = contentParameters(input);
  if (!params)
    return Response.json(
      { error: 'Parâmetros inválidos.' },
      {
        status: 400,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  const { slug, id, related, page } = params;
  const gallery = input.pathname.replace(/\/$/, '') === '/api/gallery';
  const origin = new URL(
    '/index.php',
    context.env?.WP_SITE_URL || 'https://wordpress.crf-al.org.br',
  );
  origin.searchParams.set(
    'rest_route',
    gallery
      ? `/crfal/v1/photo-albums${slug ? `/${slug}` : ''}`
      : slug || id || related
        ? `/wp/v2/event_listing${id ? `/${id}` : ''}`
        : '/crfal/v1/events',
  );
  const embedFeaturedMedia = () => {
    origin.searchParams.set('_embed', 'wp:featuredmedia');
    origin.searchParams.set('_fields', EVENT_FIELDS);
  };
  if (related && !gallery) {
    origin.searchParams.set('per_page', '3');
    origin.searchParams.set('exclude', related);
    embedFeaturedMedia();
  }
  if (gallery && !slug) {
    origin.searchParams.set('page', String(page));
    origin.searchParams.set('per_page', '12');
  }
  if (!gallery && (slug || id)) {
    embedFeaturedMedia();
    if (slug) {
      origin.searchParams.set('slug', slug);
      origin.searchParams.set('per_page', '1');
    }
  }
  const cache = (
    globalThis as typeof globalThis & {
      caches?: {
        default?: {
          match: (request: Request) => Promise<Response | undefined>;
          put: (request: Request, response: Response) => Promise<void>;
        };
      };
    }
  ).caches?.default;
  // Origem e parâmetros normalizados fazem parte da chave, isolando ambientes.
  const calendar =
    !gallery && !slug && !id && !related && input.searchParams.get('format') === 'ics';
  const key = new Request(origin.href + (calendar ? '&format=ics' : ''));
  const store = async (response: Response, storedAt = Date.now(), checkedAt = storedAt) => {
    if (!cache) return;
    // Respostas de cache.match têm headers imutáveis (inclusive no clone): copiar antes de alterar.
    const saved = new Response(response.clone().body, response);
    saved.headers.set('X-Stored-At', String(storedAt));
    saved.headers.set('X-Checked-At', String(checkedAt));
    saved.headers.set(
      'Cache-Control',
      response.status === 404 ? 'public, max-age=300' : 'public, max-age=86400',
    );
    await cache.put(key, saved);
  };
  const load = async () => {
    const upstream = await fetch(origin, {
      signal: AbortSignal.timeout(8000),
      cf: { cacheEverything: true, cacheTtlByStatus: { '200-299': 60, '500-599': 0 } },
    } as RequestInit);
    if (upstream.status === 404 && ((gallery && slug) || id))
      return Response.json({ error: 'Conteúdo não encontrado.' }, { status: 404 });
    if (!upstream.ok) throw new Error(`Content HTTP ${upstream.status}`);
    const data = await upstream.json();
    return calendar
      ? new Response(eventsCalendar(data as CRFEvent[], SITE_URL), {
          headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
        })
      : Response.json(data, { headers: { 'X-Content-Type-Options': 'nosniff' } });
  };
  try {
    const hit = await cache?.match(key);
    const storedAt = Number(hit?.headers.get('X-Stored-At'));
    const checkedAt = Number(hit?.headers.get('X-Checked-At')) || storedAt;
    const age = Date.now() - storedAt;
    if (hit && age < (hit.status === 404 ? 300_000 : MAX_STALE_MS)) {
      if (hit.status !== 404 && Date.now() - checkedAt > 60_000 && !refreshing.has(key.url)) {
        const task = (async () => {
          await store(hit, storedAt, Date.now());
          await store(await load());
        })()
          .catch(() => undefined)
          .finally(() => refreshing.delete(key.url));
        refreshing.set(key.url, task);
        context.waitUntil(task);
      }
      return publicResponse(hit, request.method);
    }
    const response = await load();
    context.waitUntil(store(response).catch(() => undefined));
    return publicResponse(response, request.method);
  } catch (error) {
    console.error(
      JSON.stringify({ event: 'content_api_failed', path: input.pathname, message: String(error) }),
    );
    return Response.json(
      { error: 'Conteúdo temporariamente indisponível.' },
      { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '60' } },
    );
  }
}
