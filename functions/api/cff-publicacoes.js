/** Pages Function: Publicações do CFF (só links para os PDFs), com reserva guardada na borda. */
import { getCffPublications } from './_cff';

const FRESH_TTL_SECONDS = 6 * 3600;
const BACKUP_TTL_SECONDS = 7 * 86400;

function jsonResponse(body, status = 200, stale = false) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': status !== 200 || stale ? 'no-store' : 'public, max-age=1800',
      'x-content-type-options': 'nosniff',
    },
  });
}

export async function onRequestGet(context) {
  const { request } = context;
  const cache = caches.default;
  const cacheKey = new Request(new URL('/api/cff-publicacoes?version=1', request.url), { method: 'GET' });

  let backup;
  const cached = await cache.match(cacheKey);
  if (cached) {
    try {
      const body = await cached.json();
      if (Array.isArray(body.collections) && Number.isFinite(body.fetchedAt)) {
        backup = body;
        if (Date.now() - body.fetchedAt < FRESH_TTL_SECONDS * 1000) return jsonResponse(body);
      }
    } catch {
      // Cache inválido: buscar novamente na origem.
    }
  }

  try {
    const body = { collections: await getCffPublications(), fetchedAt: Date.now() };
    const stored = new Response(JSON.stringify(body), {
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': `public, max-age=${BACKUP_TTL_SECONDS}` },
    });
    context.waitUntil(cache.put(cacheKey, stored).catch((error) => {
      console.error(JSON.stringify({ event: 'cff_cache_failed', message: String(error) }));
    }));
    return jsonResponse(body);
  } catch (error) {
    console.error(JSON.stringify({ event: 'cff_origin_failed', message: String(error), usingBackup: Boolean(backup) }));
    if (backup && Date.now() - backup.fetchedAt < BACKUP_TTL_SECONDS * 1000) {
      return jsonResponse({ ...backup, stale: true }, 200, true);
    }
    const response = jsonResponse({ collections: [], error: 'Publicações do CFF temporariamente indisponíveis' }, 503);
    response.headers.set('retry-after', '60');
    return response;
  }
}
