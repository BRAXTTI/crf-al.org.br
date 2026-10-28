import { SITE_URL } from '../src/config/site';

const FRESH_MS = 10 * 60_000;
const RETENTION_S = 30 * 24 * 3600;
const refreshing = new Set<string>();
type Context = { waitUntil: (promise: Promise<unknown>) => void };

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

export async function cachedNewsResponse(context: Context, key: Request, load: () => Promise<Response>): Promise<Response> {
  const cache = (globalThis as typeof globalThis & { caches?: { default?: Cache } }).caches?.default;
  if (!cache) return load();
  const store = async (response: Response) => {
    if (response.status !== 200 || response.headers.get('Cache-Control')?.includes('no-store')) return;
    const copy = response;
    copy.headers.set('X-News-Cached-At', String(Date.now()));
    copy.headers.set('Cache-Control', `public, max-age=${RETENTION_S}`);
    await cache.put(key, copy);
  };
  const hit = await cache.match(key).catch(() => undefined);
  if (hit) {
    if (Date.now() - Number(hit.headers.get('X-News-Cached-At') || 0) > FRESH_MS && !refreshing.has(key.url)) {
      refreshing.add(key.url);
      context.waitUntil(load().then(store).catch(() => undefined).finally(() => refreshing.delete(key.url)));
    }
    const result = new Response(hit.body, hit);
    result.headers.delete('X-News-Cached-At');
    result.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=600, stale-if-error=2592000');
    return result;
  }
  const response = await load();
  // Consume the transformed stream once before returning: cloning a streaming response
  // tees it and can couple the client to an abandoned or slow cache branch.
  const body = await response.arrayBuffer();
  context.waitUntil(store(new Response(body, response)).catch(() => undefined));
  return new Response(body, response);
}
