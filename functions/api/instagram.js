/** Pages Function: feed do Instagram com último resultado válido na borda. */
import { DEFAULT_FEED_URL, getInstagramItems } from './_parse';

const FRESH_TTL_SECONDS = 900;
const BACKUP_TTL_SECONDS = 86400;
// Com reserva válida, no máximo uma atualização em segundo plano por minuto e por data center.
const REFRESH_RETRY_MS = 60_000;
/** @type {Set<string>} */
const refreshing = new Set();

/** @param {{ items: unknown[], fetchedAt: number, checkedAt?: number }} body */
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
      // Erros não são guardados; a reserva evita executar a Function a cada visita.
      'cache-control': status !== 200 ? 'no-store' : stale ? 'public, max-age=60' : `public, max-age=${FRESH_TTL_SECONDS}`,
      'x-content-type-options': 'nosniff',
    },
  });
}

/** @param {EventContext<{ INSTAGRAM_FEED_URL?: string }, string, Record<string, unknown>>} context */
export async function onRequestGet(context) {
  const { request, env } = context;
  const feedUrl = env.INSTAGRAM_FEED_URL || DEFAULT_FEED_URL;
  const cache = caches.default;
  // A origem faz parte da chave para não reutilizar dados de outra configuração.
  const cacheUrl = new URL('/api/instagram', request.url);
  cacheUrl.searchParams.set('source', feedUrl);
  cacheUrl.searchParams.set('version', '3');
  const cacheKey = new Request(cacheUrl, { method: 'GET' });
  const cached = await cache.match(cacheKey);
  /** @type {{ items: import('./_parse').InstagramFeedItem[], fetchedAt: number, checkedAt?: number } | undefined} */
  let backup;
  if (cached) {
    try {
      const body = await cached.json();
      if (Array.isArray(body.items) && body.items.length && Number.isFinite(body.fetchedAt)) {
        backup = body;
        if (Date.now() - body.fetchedAt < FRESH_TTL_SECONDS * 1000) {
          return jsonResponse({ items: body.items, fetchedAt: body.fetchedAt });
        }
      }
    } catch {
      // Cache inválido: buscar novamente na origem.
    }
  }

  // Reserva ainda válida: responde de imediato e atualiza em segundo plano (stale-while-revalidate).
  if (backup && Date.now() - backup.fetchedAt < BACKUP_TTL_SECONDS * 1000) {
    const current = backup;
    if (!refreshing.has(cacheKey.url) && !(Date.now() - (current.checkedAt ?? 0) < REFRESH_RETRY_MS)) {
      refreshing.add(cacheKey.url);
      context.waitUntil((async () => {
        // Marca a tentativa antes de ir à origem: outros isolates não disparam outra em seguida.
        await cache.put(cacheKey, storedResponse({ ...current, checkedAt: Date.now() }));
        await cache.put(cacheKey, storedResponse({ items: await getInstagramItems(feedUrl), fetchedAt: Date.now() }));
      })().catch((error) => {
        console.error(JSON.stringify({ event: 'instagram_origin_failed', message: String(error), usingBackup: true }));
      }).finally(() => refreshing.delete(cacheKey.url)));
    }
    return jsonResponse({ items: current.items, fetchedAt: current.fetchedAt, stale: true }, 200, true);
  }

  try {
    const items = await getInstagramItems(feedUrl);
    const body = { items, fetchedAt: Date.now() };
    context.waitUntil(cache.put(cacheKey, storedResponse(body)).catch((error) => {
      console.error(JSON.stringify({ event: 'instagram_cache_failed', message: String(error) }));
    }));
    return jsonResponse(body);
  } catch (error) {
    console.error(JSON.stringify({ event: 'instagram_origin_failed', message: String(error), usingBackup: false }));
    const response = jsonResponse({ items: [], error: 'Feed temporariamente indisponível' }, 503);
    response.headers.set('retry-after', '60');
    return response;
  }
}
