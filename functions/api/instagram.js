/**
 * Pages Function: /api/instagram
 *
 * Lê a página do feed (Smash Balloon) no WordPress e devolve apenas as
 * imagens + links dos posts, para o carrossel nativo do site novo.
 * Evita o iframe (frágil e com scroll vertical excessivo no mobile).
 *
 * Cache na borda por 15 min (acompanha o cache do próprio plugin).
 */

const DEFAULT_FEED_URL = 'https://wordpress.crf-al.org.br/instagram/';
const CACHE_TTL_SECONDS = 900;

function decodeEntities(value) {
  return value
    .replace(/&#0?38;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function parseItems(html) {
  const items = [];
  const seen = new Set();
  const anchorRe = /<a[^>]*class="[^"]*sbi_photo[^"]*"[^>]*>/g;
  for (const match of html.matchAll(anchorRe)) {
    const tag = match[0];
    const href = tag.match(/href="([^"]+)"/)?.[1];
    let img = tag.match(/data-full-res="([^"]+)"/)?.[1];
    if (!img) {
      const set = tag.match(/data-img-src-set="([^"]+)"/)?.[1];
      if (set) {
        try {
          const parsed = JSON.parse(decodeEntities(set));
          img = parsed.d || parsed.h || parsed.m;
        } catch {
          /* ignora */
        }
      }
    }
    if (!href || !img) continue;
    const link = decodeEntities(href);
    const image = decodeEntities(img);
    if (seen.has(link)) continue;
    seen.add(link);
    items.push({ link, image });
  }
  return items;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const feedUrl = env.INSTAGRAM_FEED_URL || DEFAULT_FEED_URL;

  const cache = caches.default;
  const cacheKey = new Request(new URL('/api/instagram', request.url).toString(), { method: 'GET' });
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  let items = [];
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const upstream = await fetch(feedUrl, {
      signal: controller.signal,
      headers: { 'user-agent': 'crfal-site/1.0 (+https://institucional.crf-al.org.br)' },
    });
    clearTimeout(timer);
    if (upstream.ok) {
      items = parseItems(await upstream.text());
    }
  } catch {
    items = [];
  }

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
