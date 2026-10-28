import { SITE_URL } from '../src/config/site';

const FRESH_MS = 10 * 60_000;
const RETENTION_S = 30 * 24 * 3600;
const refreshing = new Set<string>();
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
    await cache.put(key, copy);
  };
  const started = performance.now();
  const lookup = Promise.race([cache.match(key).catch(() => undefined), new Promise<undefined>(resolve => setTimeout(resolve, 150))]);
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
    const body = await first.response.arrayBuffer();
    context.waitUntil(store(new Response(body, first.response)).catch(() => undefined));
    return new Response(body, first.response);
  }
  const hit = 'hit' in first ? first.hit : await lookup;
  if ('error' in first && !hit) throw first.error;
  if (context.timings) context.timings.cache = (context.timings.cache || 0) + performance.now() - started;
  if (hit) {
    if (Date.now() - Number(hit.headers.get('X-News-Cached-At') || 0) > FRESH_MS && !refreshing.has(key.url)) {
      refreshing.add(key.url);
      context.waitUntil((loading || load()).then(store).catch(() => undefined).finally(() => refreshing.delete(key.url)));
    }
    else if (loading) context.waitUntil(loading.catch(() => undefined));
    const result = new Response(await hit.arrayBuffer(), hit);
    result.headers.delete('X-News-Cached-At');
    result.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=600, stale-if-error=2592000');
    return result;
  }
  const response = await (loading || load());
  // Consume the transformed stream once before returning: cloning a streaming response
  // tees it and can couple the client to an abandoned or slow cache branch.
  const body = await response.arrayBuffer();
  context.waitUntil(store(new Response(body, response)).catch(() => undefined));
  return new Response(body, response);
}
