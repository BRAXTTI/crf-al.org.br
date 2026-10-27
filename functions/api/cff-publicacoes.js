/** Pages Function: Publicações do CFF (só links para os PDFs), com reserva guardada na borda. */
import { getCffPublications } from './_cff';

const FRESH_TTL_SECONDS = 6 * 3600;
const BACKUP_TTL_SECONDS = 7 * 86400;
// Com reserva válida, no máximo uma atualização em segundo plano por minuto e por data center.
const REFRESH_RETRY_MS = 60_000;
/** @type {Set<string>} */
const refreshing = new Set();

/** @param {{ collections: unknown[], fetchedAt: number, checkedAt?: number }} body */
function storedResponse(body) {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': `public, max-age=${BACKUP_TTL_SECONDS}` },
  });
}

/** @param {unknown} body */
function jsonResponse(body, status = 200, stale = false) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': status !== 200 ? 'no-store' : stale ? 'public, max-age=60' : 'public, max-age=1800',
      'x-content-type-options': 'nosniff',
    },
  });
}

/** @param {EventContext<unknown, string, Record<string, unknown>>} context */
export async function onRequestGet(context) {
  const { request } = context;
  const cache = caches.default;
  const cacheKey = new Request(new URL('/api/cff-publicacoes?version=1', request.url), { method: 'GET' });

  /** @type {{ collections: import('./_cff').CffCollection[], fetchedAt: number, checkedAt?: number } | undefined} */
  let backup;
  const cached = await cache.match(cacheKey);
  if (cached) {
    try {
      const body = await cached.json();
      if (Array.isArray(body.collections) && Number.isFinite(body.fetchedAt)) {
        backup = body;
        if (Date.now() - body.fetchedAt < FRESH_TTL_SECONDS * 1000) return jsonResponse({ collections: body.collections, fetchedAt: body.fetchedAt });
      }
    } catch {
      // Cache inválido: buscar novamente na origem.
    }
  }

  // Reserva ainda válida: responde de imediato e atualiza em segundo plano (stale-while-revalidate).
  // A coleta percorre vários lotes de páginas do CFF; a home não deve esperar por ela.
  if (backup && Date.now() - backup.fetchedAt < BACKUP_TTL_SECONDS * 1000) {
    const current = backup;
    if (!refreshing.has(cacheKey.url) && !(Date.now() - (current.checkedAt ?? 0) < REFRESH_RETRY_MS)) {
      refreshing.add(cacheKey.url);
      context.waitUntil((async () => {
        // Marca a tentativa antes de ir à origem: outros isolates não disparam outra em seguida.
        await cache.put(cacheKey, storedResponse({ ...current, checkedAt: Date.now() }));
        await cache.put(cacheKey, storedResponse({ collections: await getCffPublications(), fetchedAt: Date.now() }));
      })().catch((error) => {
        console.error(JSON.stringify({ event: 'cff_origin_failed', message: String(error), usingBackup: true }));
      }).finally(() => refreshing.delete(cacheKey.url)));
    }
    return jsonResponse({ collections: current.collections, fetchedAt: current.fetchedAt, stale: true }, 200, true);
  }

  try {
    const body = { collections: await getCffPublications(), fetchedAt: Date.now() };
    context.waitUntil(cache.put(cacheKey, storedResponse(body)).catch((error) => {
      console.error(JSON.stringify({ event: 'cff_cache_failed', message: String(error) }));
    }));
    return jsonResponse(body);
  } catch (error) {
    console.error(JSON.stringify({ event: 'cff_origin_failed', message: String(error), usingBackup: false }));
    const response = jsonResponse({ collections: [], error: 'Publicações do CFF temporariamente indisponíveis' }, 503);
    response.headers.set('retry-after', '60');
    return response;
  }
}
