/**
 * Lógica compartilhada de leitura do feed do Instagram (Smash Balloon).
 * Usada pela Pages Function (/api/instagram) e pelo middleware de dev do Vite.
 */

export interface InstagramFeedItem {
  link: string;
  image: string;
}

export const DEFAULT_FEED_URL = 'https://wordpress.crf-al.org.br/index.php?rest_route=/wp/v2/pages&slug=instagram&_fields=content';

export function decodeEntities(value: string): string {
  return value
    .replace(/&#0?38;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export function parseItems(html: string): InstagramFeedItem[] {
  const items: InstagramFeedItem[] = [];
  const seen = new Set<string>();
  const anchorRe = /<a[^>]*class="[^"]*sbi_photo[^"]*"[^>]*>/g;
  for (const match of html.matchAll(anchorRe)) {
    const tag = match[0];
    const href = tag.match(/href="([^"]+)"/)?.[1];
    let img = tag.match(/data-full-res="([^"]+)"/)?.[1];
    if (!img) {
      const set = tag.match(/data-img-src-set="([^"]+)"/)?.[1];
      if (set) {
        try {
          const parsed = JSON.parse(decodeEntities(set)) as { d?: string; h?: string; m?: string };
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

export async function getInstagramItems(feedUrl: string = DEFAULT_FEED_URL): Promise<InstagramFeedItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(feedUrl, {
      signal: controller.signal,
      headers: { 'user-agent': 'crfal-site/1.0 (+https://institucional.crf-al.org.br)' },
    });
    if (!res.ok) throw new Error(`Instagram feed origin returned HTTP ${res.status}`);
    // A API REST evita depender das regras de links permanentes da hospedagem.
    // URLs personalizadas de páginas HTML continuam sendo aceitas.
    let html: string;
    if (res.headers.get('content-type')?.includes('application/json')) {
      const pages: unknown = await res.json();
      if (!Array.isArray(pages)) throw new Error('Instagram feed origin returned an invalid page list');
      html = pages.map((page) => typeof page?.content?.rendered === 'string' ? page.content.rendered : '').join('\n');
    } else {
      html = await res.text();
    }
    const items = parseItems(html);
    if (items.length === 0) throw new Error('Instagram feed origin returned no publications');
    return items;
  } finally {
    clearTimeout(timer);
  }
}
