/** Pages Function: Notícias do CFF com último resultado válido guardado na borda. */
import { getCffNews } from './_cff';

const FRESH_TTL_SECONDS = 1800;
const BACKUP_TTL_SECONDS = 86400;

function jsonResponse(body, status = 200, stale = false) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': status !== 200 || stale ? 'no-store' : `public, max-age=${FRESH_TTL_SECONDS}`,
      'x-content-type-options': 'nosniff',
    },
  });
}

function readInt(value, fallback, min, max) {
  const number = Number.parseInt(value ?? '', 10);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const limit = readInt(url.searchParams.get('limite'), 8, 1, 12);
  const cursor = readInt(url.searchParams.get('cursor'), 1, 1, 400);

  const cache = caches.default;
  const cacheUrl = new URL('/api/cff', request.url);
  cacheUrl.searchParams.set('limite', String(limit));
  cacheUrl.searchParams.set('cursor', String(cursor));
  cacheUrl.searchParams.set('version', '1');
  const cacheKey = new Request(cacheUrl, { method: 'GET' });

  let backup;
  const cached = await cache.match(cacheKey);
  if (cached) {
    try {
      const body = await cached.json();
      if (Array.isArray(body.items) && Number.isFinite(body.fetchedAt)) {
        backup = body;
        if (Date.now() - body.fetchedAt < FRESH_TTL_SECONDS * 1000) return jsonResponse(body);
      }
    } catch {
      // Cache inválido: buscar novamente na origem.
    }
  }

  try {
    const page = await getCffNews({ limit, cursor });
    const body = { ...page, fetchedAt: Date.now() };
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
    const response = jsonResponse({ items: [], nextCursor: null, error: 'Notícias do CFF temporariamente indisponíveis' }, 503);
    response.headers.set('retry-after', '60');
    return response;
  }
}
