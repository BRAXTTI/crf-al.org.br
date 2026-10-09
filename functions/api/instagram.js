/** Pages Function: feed do Instagram com último resultado válido na borda. */
import { DEFAULT_FEED_URL, getInstagramItems } from './_parse';

const FRESH_TTL_SECONDS = 900;
const BACKUP_TTL_SECONDS = 86400;

function jsonResponse(body, status = 200, stale = false) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // Não guardar indisponibilidade ou feed antigo no navegador/CDN.
      'cache-control': status !== 200 || stale ? 'no-store' : `public, max-age=${FRESH_TTL_SECONDS}`,
      'x-content-type-options': 'nosniff',
    },
  });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const feedUrl = env.INSTAGRAM_FEED_URL || DEFAULT_FEED_URL;
  const cache = caches.default;
  // A origem faz parte da chave para não reutilizar dados de outra configuração.
  const cacheUrl = new URL('/api/instagram', request.url);
  cacheUrl.searchParams.set('source', feedUrl);
  cacheUrl.searchParams.set('version', '2');
  const cacheKey = new Request(cacheUrl, { method: 'GET' });
  const cached = await cache.match(cacheKey);
  let backup;
  if (cached) {
    try {
      const body = await cached.json();
      if (Array.isArray(body.items) && body.items.length && Number.isFinite(body.fetchedAt)) {
        backup = body;
        if (Date.now() - body.fetchedAt < FRESH_TTL_SECONDS * 1000) {
          return jsonResponse(body);
        }
      }
    } catch {
      // Cache inválido: buscar novamente na origem.
    }
  }

  try {
    const items = await getInstagramItems(feedUrl);
    const body = { items, fetchedAt: Date.now() };
    const stored = new Response(JSON.stringify(body), {
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': `public, max-age=${BACKUP_TTL_SECONDS}` },
    });
    context.waitUntil(cache.put(cacheKey, stored).catch((error) => {
      console.error(JSON.stringify({ event: 'instagram_cache_failed', message: String(error) }));
    }));
    return jsonResponse(body);
  } catch (error) {
    console.error(JSON.stringify({ event: 'instagram_origin_failed', message: String(error), usingBackup: Boolean(backup) }));
    if (backup && Date.now() - backup.fetchedAt < BACKUP_TTL_SECONDS * 1000) {
      return jsonResponse({ ...backup, stale: true }, 200, true);
    }
    const response = jsonResponse({ items: [], error: 'Feed temporariamente indisponível' }, 503);
    response.headers.set('retry-after', '60');
    return response;
  }
}
