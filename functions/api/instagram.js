/**
 * Pages Function: /api/instagram
 *
 * Lê a página do feed (Smash Balloon) no WordPress e devolve apenas as
 * imagens + links dos posts, para o carrossel nativo do site novo.
 * Evita o iframe (frágil e com scroll vertical excessivo no mobile).
 *
 * Cache na borda por 15 min (acompanha o cache do próprio plugin).
 */
import { DEFAULT_FEED_URL, getInstagramItems } from './_parse.js';

const CACHE_TTL_SECONDS = 900;

export async function onRequestGet(context) {
  const { request, env } = context;
  const feedUrl = env.INSTAGRAM_FEED_URL || DEFAULT_FEED_URL;

  const cache = caches.default;
  const cacheKey = new Request(new URL('/api/instagram', request.url).toString(), { method: 'GET' });
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const items = await getInstagramItems(feedUrl);

  const response = new Response(JSON.stringify({ items }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=${CACHE_TTL_SECONDS}`,
    },
  });

  if (items.length > 0) {
    context.waitUntil(cache.put(cacheKey, response.clone()));
  }
  return response;
}
