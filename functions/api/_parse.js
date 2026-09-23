/**
 * Lógica compartilhada de leitura do feed do Instagram (Smash Balloon).
 * Usada pela Pages Function (/api/instagram) e pelo middleware de dev do Vite.
 */

export const DEFAULT_FEED_URL = 'https://wordpress.crf-al.org.br/instagram/';

export function decodeEntities(value) {
  return value
    .replace(/&#0?38;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export function parseItems(html) {
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

export async function getInstagramItems(feedUrl = DEFAULT_FEED_URL) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(feedUrl, {
      signal: controller.signal,
      headers: { 'user-agent': 'crfal-site/1.0 (+https://institucional.crf-al.org.br)' },
    });
    if (!res.ok) return [];
    return parseItems(await res.text());
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}
