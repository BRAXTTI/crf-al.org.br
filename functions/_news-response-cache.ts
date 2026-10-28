import { SITE_URL } from '../src/config/site';

const FRESH_MS = 10 * 60_000;
const RETENTION_S = 30 * 24 * 3600;
const refreshing = new Set<string>();
const IO_TIMEOUT_MS = 300;
function bounded<T>(task: Promise<T>, ms = IO_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([task, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('News cache timeout')), ms); })]).finally(() => clearTimeout(timer));
}
async function materialize(response: Response, key: Request): Promise<ArrayBuffer> {
  const body = await bounded(response.arrayBuffer());
  const text = new TextDecoder().decode(body);
  if (!text.trim()) throw new Error('Empty news cache body');
  if (new URL(key.url).searchParams.get('path') === '/api/news') JSON.parse(text);
  else if (!/<html[\s>]/i.test(text) || !/<\/html\s*>/i.test(text)) throw new Error('Invalid news HTML');
  return body;
}
type Context = { waitUntil: (promise: Promise<unknown>) => void; timings?: Record<string, number> };

/** Chaves internas só incluem parâmetros que alteram o resultado; rastreadores são ignorados. */
export function newsResponseKey(request: Request, scope: string, version = ''): Request {
  const url = new URL(request.url);
  const key = new URL('/__news-response/v1', SITE_URL);
  key.searchParams.set('path', url.pathname.replace(/\/$/, '') || '/');
  key.searchParams.set('scope', scope);
  key.searchParams.set('version', version);
  if (url.pathname === '/api/news') {
    for (const name of ['page', 'per_page', 'search', 'slug']) {
      const value = url.searchParams.get(name);
      if (value !== null) key.searchParams.set(name, value);
    }
  }
  key.searchParams.sort();
  return new Request(key);
}

export async function cachedNewsResponse(context: Context, key: Request, load: () => Promise<Response>, parallel = false): Promise<Response> {
  const cache = (globalThis as typeof globalThis & { caches?: { default?: Cache } }).caches?.default;
  if (!cache) return load();
  const store = async (response: Response) => {
    if (response.status !== 200 || response.headers.get('Cache-Control')?.includes('no-store')) return;
    const copy = response;
    copy.headers.set('X-News-Cached-At', String(Date.now()));
    copy.headers.set('Cache-Control', `public, max-age=${RETENTION_S}`);
    await bounded(cache.put(key, copy));
  };
  const started = performance.now();
  const lookup = bounded(cache.match(key), 150).then(async hit => {
    if (!hit || hit.status !== 200) return undefined;
    try { return new Response(await materialize(hit, key), hit); } catch { return undefined; }
  }).catch(() => undefined);
  // Para páginas, consulta KV/metadados em paralelo ao cache HTTP; o primeiro
  // resultado útil responde. A API mantém o comportamento anterior.
  const loading = parallel ? load() : undefined;
  const first = loading
    ? await Promise.race([
      lookup.then(hit => ({ hit })),
      loading.then(response => ({ response }), error => ({ error })),
    ])
    : { hit: await lookup };
  if ('response' in first && first.response && first.response.status === 200 && !first.response.headers.get('Cache-Control')?.includes('no-store')) {
    if (context.timings) context.timings.cache = (context.timings.cache || 0) + performance.now() - started;
    const body = await bounded(first.response.arrayBuffer());
    context.waitUntil(store(new Response(body, first.response)).catch(() => undefined));
    return new Response(body, first.response);
  }
  const hit = 'hit' in first ? first.hit : await lookup;
  if ('error' in first && !hit) throw first.error;
  if (context.timings) context.timings.cache = (context.timings.cache || 0) + performance.now() - started;
  if (hit) {
    if (Date.now() - Number(hit.headers.get('X-News-Cached-At') || 0) > FRESH_MS && !refreshing.has(key.url)) {
      refreshing.add(key.url);
      context.waitUntil(bounded(loading || load(), 8_000).then(store).catch(() => undefined).finally(() => refreshing.delete(key.url)));
    }
    else if (loading) context.waitUntil(bounded(loading, 8_000).catch(() => undefined));
    const result = new Response(await bounded(hit.arrayBuffer()), hit);
    result.headers.delete('X-News-Cached-At');
    result.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=600, stale-if-error=2592000');
    return result;
  }
  const response = await (loading || load());
  // Consume the transformed stream once before returning: cloning a streaming response
  // tees it and can couple the client to an abandoned or slow cache branch.
  const body = await bounded(response.arrayBuffer());
  context.waitUntil(store(new Response(body, response)).catch(() => undefined));
  return new Response(body, response);
}
