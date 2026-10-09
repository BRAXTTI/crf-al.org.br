/** Deliver page metadata in initial HTML for browsers and sharing crawlers alike. */
import { PAGE_METADATA } from '../src/config/page-metadata';

const SITE_URL = 'https://institucional.crf-al.org.br';

// Notícias: WordPress legado (/wp-json/wp/v2).
const NEWS_WP = 'https://www.crf-al.org.br';
const NEWS_PREFIX = '/imprensa/noticias/';
const NEWS_DETAIL_FIELDS = 'id,date,modified,slug,link,title,excerpt,content,_links,_embedded';
const NEWS_EMBED = 'wp:featuredmedia,wp:term';

// Eventos: WordPress novo (rota customizada crfal/v1).
const EVENTS_WP = 'https://wordpress.crf-al.org.br';
const EVENTS_PREFIX = '/eventos/';
const EVENTS_ROUTE = '/crfal/v1/events';

interface WPFeaturedMedia {
  source_url?: string;
  alt_text?: string;
}

interface WPPostLite {
  id: number;
  date: string;
  modified?: string;
  slug: string;
  title: { rendered: string };
  excerpt?: { rendered: string };
  _embedded?: {
    'wp:featuredmedia'?: WPFeaturedMedia[];
    'wp:term'?: Array<Array<{ name?: string }>>;
  };
}

interface CRFEventLite {
  slug: string;
  title?: string;
  excerpt?: string;
  banner?: string | null;
}

interface OgData {
  title: string;
  description?: string;
  image?: string;
  canonical: string;
  ogType?: string;
  publishedAt?: string;
  modifiedAt?: string;
  noindex?: boolean;
}

interface PagesContext {
  request: Request;
  next: () => Promise<Response>;
  waitUntil: (promise: Promise<unknown>) => void;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&#0?38;|&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (entity, code: string) => {
      const value = code.toLowerCase().startsWith('x') ? parseInt(code.slice(1), 16) : Number(code);
      return value > 0 && value <= 0x10ffff ? String.fromCodePoint(value) : entity;
    });
}

/** Remove HTML (e o bloco "Ver mais" do tema legado) e decodifica entidades. */
function stripHTML(html: string): string {
  const semReadMore = html.replace(
    /<div[^>]*\bclass="[^"]*read-more-wrapper[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
    ''
  );
  return decodeEntities(semReadMore.replace(/<[^>]*>?/gm, '')).replace(/\s+/g, ' ').trim();
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { 'user-agent': 'crfal-og/2.0' } });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`WordPress metadata HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Resolvedores por rota
// ---------------------------------------------------------------------------

async function fetchNewsPost(
  path: string,
  params: Record<string, string>
): Promise<WPPostLite | null> {
  const search = new URLSearchParams({ _embed: NEWS_EMBED, _fields: NEWS_DETAIL_FIELDS, ...params });
  const data = await fetchJson<WPPostLite | WPPostLite[]>(
    `${NEWS_WP}/wp-json/wp/v2/posts${path}?${search.toString()}`
  );
  if (!data) return null;
  return Array.isArray(data) ? data[0] ?? null : data;
}

async function resolveNews(slug: string): Promise<OgData | null> {
  const post = await fetchNewsPost('', { slug });
  if (!post) return null;
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  return {
    title: stripHTML(post.title.rendered),
    description: stripHTML(post.excerpt?.rendered ?? '').slice(0, 160) || undefined,
    image: media?.source_url,
    canonical: `${SITE_URL}${NEWS_PREFIX}${post.slug}`,
    ogType: 'article',
    publishedAt: post.date,
    modifiedAt: post.modified,
  };
}

async function resolveEvent(slug: string): Promise<OgData | null> {
  const events = await fetchJson<CRFEventLite[]>(
    `${EVENTS_WP}/index.php?rest_route=${encodeURIComponent(EVENTS_ROUTE)}`
  );
  const evento = (events ?? []).find((e) => e.slug === slug);
  if (!evento) return null;
  return {
    title: stripHTML(evento.title ?? ''),
    description: stripHTML(evento.excerpt ?? '') || `Detalhes do evento ${stripHTML(evento.title ?? '')} do CRF-AL.`,
    image: evento.banner ?? undefined,
    canonical: `${SITE_URL}${EVENTS_PREFIX}${evento.slug}`,
    ogType: 'article',
  };
}

const GALLERY_PREFIX = '/imprensa/galeria-de-fotos/';
const DEFAULT_IMAGE = `${SITE_URL}/images/og-image.jpg`;
const SITE_NAME = 'Conselho Regional de Farmácia do Estado de Alagoas';

async function resolveAlbum(slug: string): Promise<OgData | null> {
  const search = new URLSearchParams({ rest_route: `/crfal/v1/photo-albums/${slug}` });
  const album = await fetchJson<{ title: string; description?: string; slug: string; cover?: { src: string } }>(
    `${EVENTS_WP}/index.php?${search}`
  );
  if (!album) return null;
  return {
    title: stripHTML(album.title),
    description: stripHTML(album.description || 'Confira as fotos dos eventos e ações do CRF-AL.'),
    image: album.cover?.src,
    canonical: `${SITE_URL}${GALLERY_PREFIX}${album.slug}`,
  };
}

export function buildMeta(og: OgData): string {
  const fullTitle = `${og.title} | CRFAL`;
  const image = og.image || DEFAULT_IMAGE;
  const meta = (key: string, value: string, property = false) =>
    `<meta data-page-metadata="true" ${property ? 'property' : 'name'}="${key}" content="${escapeAttr(value)}">`;
  return [
    meta('description', og.description || ''),
    meta('og:title', fullTitle, true),
    meta('og:description', og.description || '', true),
    meta('og:url', og.canonical, true),
    meta('og:image', image, true),
    meta('og:image:alt', og.title, true),
    meta('og:site_name', SITE_NAME, true),
    meta('og:locale', 'pt_BR', true),
    meta('og:type', og.ogType || 'website', true),
    og.publishedAt ? meta('article:published_time', og.publishedAt, true) : '',
    og.modifiedAt ? meta('article:modified_time', og.modifiedAt, true) : '',
    meta('twitter:card', 'summary_large_image'),
    meta('twitter:title', fullTitle),
    meta('twitter:description', og.description || ''),
    meta('twitter:image', image),
    og.noindex ? meta('robots', 'noindex, nofollow') : '',
    `<link data-page-metadata="true" rel="canonical" href="${escapeAttr(og.canonical)}">`,
  ].filter(Boolean).join('\n');
}

function injectOg(asset: Response, og: OgData): Response {
  return new HTMLRewriter()
    .on('title', { element(el) { el.setAttribute('data-page-metadata', 'true'); el.setInnerContent(`${og.title} | CRFAL`); } })
    .on('meta', { element(el) {
      const property = el.getAttribute('property') || '';
      const name = el.getAttribute('name') || '';
      if (property.startsWith('og:') || property.startsWith('article:') || name.startsWith('twitter:') || name === 'description' || name === 'robots') el.remove();
    } })
    .on('link[rel="canonical"]', { element(el) { el.remove(); } })
    .on('head', { element(el) { el.append(buildMeta(og), { html: true }); } })
    .transform(asset);
}

async function cachedMetadata(context: PagesContext, pathname: string, resolve: () => Promise<OgData | null>): Promise<OgData | null> {
  // Cache metadata only: never retain HTML pointing to an outdated deployment bundle.
  const cache = (caches as CacheStorage & { default: Cache }).default;
  const key = new Request(`${SITE_URL}/__page-metadata/v2${pathname}`);
  const cached = await cache.match(key);
  if (cached) return cached.json();
  const data = await resolve();
  if (data) context.waitUntil(cache.put(key, new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
  })).catch(() => undefined));
  return data;
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const url = new URL(context.request.url);
  const pathname = url.pathname.replace(/\/$/, '') || '/';
  if (!['GET', 'HEAD'].includes(context.request.method)) return context.next();
  if (pathname === '/instituicao/missao-visao') return Response.redirect(`${SITE_URL}/instituicao/sobre-conselho`, 301);
  if (pathname.startsWith('/publicacao/') && pathname.slice('/publicacao/'.length) && !pathname.slice('/publicacao/'.length).includes('/')) {
    return Response.redirect(`${SITE_URL}${NEWS_PREFIX}${pathname.slice('/publicacao/'.length)}`, 301);
  }
  const staticData = PAGE_METADATA[pathname];
  const prefix = [NEWS_PREFIX, EVENTS_PREFIX, GALLERY_PREFIX].find(p => pathname.startsWith(p));
  if (!staticData && !prefix) return context.next();
  const asset = await context.next();
  if (!asset.ok || !asset.headers.get('content-type')?.includes('text/html')) return asset;
  if (staticData) return injectOg(asset, { ...staticData, canonical: `${SITE_URL}${pathname === '/' ? '' : pathname}` });
  let slug: string;
  try { slug = decodeURIComponent(pathname.slice(prefix!.length)); } catch { return asset; }
  if (!slug || slug.includes('/')) return asset;
  try {
    if (prefix === NEWS_PREFIX && /^\d+$/.test(slug)) {
      const post = await fetchNewsPost(`/${slug}`, {});
      return post?.slug ? Response.redirect(`${SITE_URL}${NEWS_PREFIX}${post.slug}`, 301) : asset;
    }
    const og = await cachedMetadata(context, pathname, () => prefix === NEWS_PREFIX ? resolveNews(slug) : prefix === EVENTS_PREFIX ? resolveEvent(slug) : resolveAlbum(slug));
    if (og?.title) return injectOg(asset, og);
    return injectOg(new Response(asset.body, { status: 404, headers: asset.headers }), {
      title: 'Página não encontrada', description: 'O conteúdo solicitado não foi encontrado.', canonical: `${SITE_URL}${pathname}`, noindex: true,
    });
  } catch {
    // Origin outages must not turn valid pages into cached 404s.
    const response = new Response(asset.body, asset);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }
}
