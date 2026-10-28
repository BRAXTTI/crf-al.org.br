/** Deliver page metadata in initial HTML for browsers and sharing crawlers alike. */
import { newsPost, newsSitemapIndex, isBlockedNews, knownHistoricalSlug, knownHistoricalSlugBySlug, withNewsBudget, ORIGIN_CACHE, PAGE_BUDGET_MS } from './_news';
import type { NewsEnv } from './_news';
import { cachedNewsResponse, newsResponseKey } from './_news-response-cache';
import { NEWS_SHELL, NEWS_SHELL_VERSION } from './_news-shell';
import { PAGE_METADATA } from '../src/config/page-metadata';
import { mediaImageSet, NEWS_COVER_SIZES } from '../src/services/wordpress/image-set';
import { banners, bannerMobileSrcSet, BANNER_MOBILE_SIZES, BANNER_MOBILE_MEDIA, BANNER_DESKTOP_MEDIA } from '../src/data/banners';

import { SITE_URL } from '../src/config/site';

const NEWS_PREFIX = '/imprensa/noticias/';

// Eventos: WordPress novo (rota customizada crfal/v1).
const EVENTS_WP = 'https://wordpress.crf-al.org.br';
const EVENTS_PREFIX = '/eventos/';

interface OgData {
  title: string;
  description?: string;
  image?: string;
  canonical: string;
  ogType?: string;
  publishedAt?: string;
  modifiedAt?: string;
  noindex?: boolean;
  structuredData?: Record<string, unknown>;
  /** Capa da notícia (LCP): mesmo src/srcset que o `<img>` do NewsDetailPage. */
  preloadImage?: string;
  preloadSrcset?: string;
}

type PagesContext = EventContext<NewsEnv & { WP_SITE_URL?: string }, string, Record<string, unknown>>;

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

async function fetchJson<T>(url: string, allowNotFound = false): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PAGE_BUDGET_MS);
  try {
    const res = await fetch(url, { ...ORIGIN_CACHE, signal: controller.signal, headers: { 'user-agent': 'crfal-og/2.0' } });
    if (res.status === 404 && allowNotFound) return null;
    if (!res.ok) throw new Error(`WordPress metadata HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Resolvedores por rota
// ---------------------------------------------------------------------------

async function resolveNews(slug: string, context: PagesContext): Promise<OgData | null> {
  // Também limita a espera por uma carga compartilhada iniciada pela API com prazo maior.
  const loading = newsPost(slug, withNewsBudget(context, PAGE_BUDGET_MS, false));
  let timer: ReturnType<typeof setTimeout> | null = null;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new DOMException('News page deadline', 'TimeoutError')), PAGE_BUDGET_MS);
  });
  let post: Awaited<typeof loading>;
  try {
    post = await Promise.race([loading, timeout]);
  } catch (error) {
    // Mantém a carga viva após entregar o shell; se falhar, tenta aquecer sem prazo da página.
    context.waitUntil(loading.catch(() => newsPost(slug, context)).catch(() => undefined));
    throw error;
  } finally {
    clearTimeout(timer);
  }
  if (!post) return null;
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  const cover = mediaImageSet(media);
  return {
    title: stripHTML(post.title.rendered),
    description: stripHTML(post.excerpt?.rendered ?? '').slice(0, 160) || undefined,
    image: media?.source_url,
    canonical: `${SITE_URL}${NEWS_PREFIX}${post.slug}`,
    ogType: 'article',
    publishedAt: post.date,
    modifiedAt: post.modified,
    structuredData: { '@type': 'NewsArticle', headline: stripHTML(post.title.rendered), datePublished: post.date, dateModified: post.modified || post.date, image: media?.source_url, mainEntityOfPage: `${SITE_URL}${NEWS_PREFIX}${post.slug}`, publisher: { '@type': 'GovernmentOrganization', name: SITE_NAME, url: SITE_URL } },
    preloadImage: cover?.src,
    preloadSrcset: cover?.srcSet,
  };
}

async function resolveEvent(slug: string, context: PagesContext): Promise<OgData | null> {
  const events = await fetchJson<import('../src/services/wordpress/types').WPEventListing[]>(
    `${context.env?.WP_SITE_URL || EVENTS_WP}/index.php?rest_route=${encodeURIComponent('/wp/v2/event_listing')}&slug=${encodeURIComponent(slug)}&per_page=1&_embed=wp:featuredmedia`
  );
  const post = events?.[0];
  const evento = post ? { slug: post.slug, title: post.title.rendered, excerpt: post.excerpt?.rendered, banner: post._embedded?.['wp:featuredmedia']?.[0]?.source_url } : null;
  if (!evento) return null;
  return {
    title: stripHTML(evento.title ?? ''),
    description: stripHTML(evento.excerpt ?? '') || `Detalhes do evento ${stripHTML(evento.title ?? '')} do CRF-AL.`,
    image: evento.banner ?? undefined,
    structuredData: { '@type': 'Event', name: stripHTML(evento.title ?? ''), url: `${SITE_URL}${EVENTS_PREFIX}${evento.slug}`, startDate: post?.event_details?.startDate, endDate: post?.event_details?.endDate, location: post?.event_details?.location ? { '@type': 'Place', name: post.event_details.location } : undefined },
    canonical: `${SITE_URL}${EVENTS_PREFIX}${evento.slug}`,
    ogType: 'article',
  };
}

const GALLERY_PREFIX = '/imprensa/galeria-de-fotos/';
const DEFAULT_IMAGE = `${SITE_URL}/images/og-image.jpg`;
const SITE_NAME = 'Conselho Regional de Farmácia do Estado de Alagoas';

async function resolveAlbum(slug: string, context: PagesContext): Promise<OgData | null> {
  const search = new URLSearchParams({
    rest_route: `/crfal/v1/photo-albums/${slug}`,
    _fields: 'title,description,slug,cover',
  });
  const album = await fetchJson<{ title: string; description?: string; slug: string; cover?: { src: string } }>(
    `${context.env?.WP_SITE_URL || EVENTS_WP}/index.php?${search}`, true
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
    !og.noindex ? `<script data-page-metadata="true" type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': [ ...(og.structuredData ? [og.structuredData] : []), { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL }, ...(og.canonical !== SITE_URL ? [{ '@type': 'ListItem', position: 2, name: og.title, item: og.canonical }] : [])] }] }).replace(/</g, '\\u003c')}</script>` : '',
    `<link data-page-metadata="true" rel="canonical" href="${escapeAttr(og.canonical)}">`,
  ].filter(Boolean).join('\n');
}

interface ImagePreload { href: string; type?: string; srcset?: string; sizes?: string; media?: string }

/** Preload da imagem LCP. Sem data-page-metadata: o SPA remove esses elementos ao hidratar. */
export function buildPreload(preloads: ImagePreload[]): string {
  return preloads.map(({ href, type, srcset, sizes, media }) => '<link rel="preload" as="image" fetchpriority="high"'
    + ` href="${escapeAttr(href)}"`
    + (type ? ` type="${escapeAttr(type)}"` : '')
    + (srcset ? ` imagesrcset="${escapeAttr(srcset)}"` : '')
    + (srcset && sizes ? ` imagesizes="${escapeAttr(sizes)}"` : '')
    + (media ? ` media="${escapeAttr(media)}"` : '') + '>').join('');
}

/** Capa da notícia: mesmo srcset/sizes do `<img>` do NewsDetailPage. */
export function newsPreload(og: OgData): ImagePreload[] {
  return og.preloadImage ? [{ href: og.preloadImage, srcset: og.preloadSrcset, sizes: NEWS_COVER_SIZES }] : [];
}

/** 1º banner da home: mesmas fontes do `<picture>` do HeroSlider. */
export function homePreload(): ImagePreload[] {
  const first = banners.find(banner => banner.image);
  if (!first) return [];
  if (!first.imageMobile) return [{ href: first.image }];
  return [
    { href: first.imageMobile, type: 'image/webp', srcset: bannerMobileSrcSet(first), sizes: first.imageMobileSmall ? BANNER_MOBILE_SIZES : undefined, media: BANNER_MOBILE_MEDIA },
    { href: first.image, type: 'image/webp', media: BANNER_DESKTOP_MEDIA },
  ];
}

function injectOg(asset: Response, og: OgData, preloads = newsPreload(og)): Response {
  const preload = buildPreload(preloads);
  const rewritten = new HTMLRewriter()
    .on('title', { element(el) { el.setAttribute('data-page-metadata', 'true'); el.setInnerContent(`${og.title} | CRFAL`); } })
    .on('meta', { element(el) {
      const property = el.getAttribute('property') || '';
      const name = el.getAttribute('name') || '';
      if (property.startsWith('og:') || property.startsWith('article:') || name.startsWith('twitter:') || name === 'description' || name === 'robots') el.remove();
    } })
    .on('link[rel="canonical"]', { element(el) { el.remove(); } })
    .on('meta[name="viewport"]', { element(el) {
      // O viewport deve ser conhecido antes de avaliar media e imagesizes no mobile.
      if (preload) el.after(preload, { html: true });
    } })
    .on('head', { element(el) {
      el.append(buildMeta(og), { html: true });
    } })
    .transform(asset);
  // The rewritten body no longer matches the shell's validators.
  const response = new Response(rewritten.body, rewritten);
  if (og.noindex) response.headers.set('X-Robots-Tag', 'noindex');
  response.headers.delete('ETag');
  response.headers.delete('Last-Modified');
  return response;
}

const METADATA_FRESH_MS = 10 * 60_000;
const NOT_FOUND_S = 300;
const refreshingMetadata = new Set<string>();

async function cachedMetadata(context: PagesContext, pathname: string, resolve: () => Promise<OgData | null>): Promise<OgData | null> {
  // Cache metadata only: never retain HTML pointing to an outdated deployment bundle.
  const cache = (caches as CacheStorage & { default: Cache }).default;
  const key = new Request(`${SITE_URL}/__page-metadata/v6/${encodeURIComponent(context.env?.WP_SITE_URL || '')}/${encodeURIComponent(context.env?.NEWS_ARCHIVE_API_URL || '')}${pathname}`);
  // "Não encontrado" fica 5 min: slugs inexistentes não chegam sempre ao WordPress.
  const store = (data: OgData | null, storedAt = Date.now(), checkedAt?: number) => cache.put(key, new Response(JSON.stringify({ storedAt, checkedAt, data }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${data ? 86400 : NOT_FOUND_S}` },
  }));
  const cached = await cache.match(key);
  const entry = cached ? await cached.json() as { storedAt: number; checkedAt?: number; data: OgData | null } : undefined;
  if (entry?.data === null && Date.now() - entry.storedAt < NOT_FOUND_S * 1000) return null;
  if (entry?.data && Date.now() - entry.storedAt <= 24 * 3600_000) {
    // Stale-while-revalidate: a página nunca espera pela origem quando já há metadados.
    const current = entry.data;
    if (Date.now() - (entry.checkedAt ?? entry.storedAt) > METADATA_FRESH_MS && !refreshingMetadata.has(key.url)) {
      refreshingMetadata.add(key.url);
      context.waitUntil((async () => {
        await store(current, entry.storedAt, Date.now());
        await store(await resolve());
      })().catch(() => undefined).finally(() => refreshingMetadata.delete(key.url)));
    }
    return current;
  }
  const data = await resolve();
  context.waitUntil(store(data).catch(() => undefined));
  return data;
}

/**
 * Mesmo conjunto do bloco `/*` de public/_headers (teste garante a sincronia). O `_headers`
 * não se aplica a respostas geradas por Functions (APIs, 404/410/503, sitemap, redirects).
 */
export const SECURITY_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; object-src 'none'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://midias.crf-al.org.br https://wordpress.crf-al.org.br https://crf-al.org.br https://www.crf-al.org.br https://*.cdninstagram.com https://*.fbcdn.net https://admin.cff.org.br; font-src 'self' data:; connect-src 'self' https://cloudflareinsights.com; frame-src https://www.youtube-nocookie.com; media-src 'self' https://midias.crf-al.org.br https://wordpress.crf-al.org.br https://www.crf-al.org.br; upgrade-insecure-requests",
};

/** Completa apenas os headers ausentes; nunca substitui um valor definido pela resposta. */
export function withSecurityHeaders(response: Response): Response {
  const missing = Object.keys(SECURITY_HEADERS).filter(name => !response.headers.has(name));
  if (!missing.length || response.status === 101) return response;
  // Headers de Response.redirect() e de respostas de fetch são imutáveis: copiar antes.
  const secured = new Response(response.body, response);
  for (const name of missing) secured.headers.set(name, SECURITY_HEADERS[name]);
  return secured;
}

async function handleRequest(context: PagesContext & { timings: Record<string, number> }): Promise<Response> {
  return withSecurityHeaders(await handle(context));
}

async function handle(context: PagesContext & { timings: Record<string, number> }): Promise<Response> {
  const url = new URL(context.request.url);
  const pathname = url.pathname.replace(/\/$/, '') || '/';
  // Endpoints do WordPress antigo não pertencem ao institucional, em qualquer método.
  if (/^\/wp-admin/.test(pathname) || /^\/wp-json/.test(pathname) ||
      /^\/(?:wp-login\.php|xmlrpc\.php|wp-cron\.php)$/.test(pathname) ||
      /^\/(?:wp-includes|web\/wp)(?:\/|$)/.test(pathname) ||
      (/^\/wp-content(?:\/|$)/.test(pathname) && !/^\/wp-content\/uploads(?:\/|$)/.test(pathname))) {
    return new Response(context.request.method === 'HEAD' ? null : 'Conteúdo indisponível.', { status: 410, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex' } });
  }
  if (!['GET', 'HEAD'].includes(context.request.method)) return context.next();
  const remainingQuery = (param: string) => {
    const params = new URLSearchParams(url.search);
    params.delete(param);
    const query = params.toString();
    return query ? `?${query}` : '';
  };
  if (pathname === '/rss' || /(?:^|\/)feed$/.test(pathname) || (pathname === '/' && url.searchParams.has('feed'))) {
    return Response.redirect(`${SITE_URL}/api/rss${url.searchParams.has('feed') ? remainingQuery('feed') : url.search}`, 301);
  }
  if (/^\/page\/\d+$/.test(pathname)) {
    return Response.redirect(`${SITE_URL}/imprensa/noticias${url.search}`, 301);
  }
  if (pathname === '/sitemap-news.xml') {
    try {
      const cache = (caches as CacheStorage & { default: Cache }).default;
      const key = new Request(`${SITE_URL}/__sitemap-news/v1/${encodeURIComponent(context.env?.WP_SITE_URL || '')}`);
      const hit = await cache.match(key);
      if (hit) return new Response(context.request.method === 'HEAD' ? null : hit.body, hit);
      const entries = await newsSitemapIndex(context);
      const xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + entries.map(post => `<url><loc>${escapeAttr(`${SITE_URL}${NEWS_PREFIX}${post.slug}`)}</loc><lastmod>${escapeAttr((post.modified || post.date).slice(0, 10))}</lastmod></url>`).join('') + '</urlset>';
      const response = new Response(xml, {
        headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=600' },
      });
      context.waitUntil(cache.put(key, response.clone()).catch(() => undefined));
      return new Response(context.request.method === 'HEAD' ? null : response.body, response);
    } catch {
      return new Response('Sitemap temporariamente indisponível.', { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '60' } });
    }
  }

  const idFromQuery = pathname === '/' || pathname === '/index.php';
  const numericPath = pathname.match(/^\/(?:imprensa\/noticias|publicacao)\/(\d+)$/);
  const historicalId = idFromQuery ? url.searchParams.get('p') : numericPath?.[1] ?? null;
  const idQuery = idFromQuery ? remainingQuery('p') : url.search;
  const legacySlug = pathname.startsWith('/publicacao/') ? pathname.slice('/publicacao/'.length) : pathname.startsWith(NEWS_PREFIX) ? pathname.slice(NEWS_PREFIX.length) : '';
  if (url.pathname.endsWith('/') && pathname.startsWith(NEWS_PREFIX) && legacySlug && !legacySlug.includes('/') && !historicalId) {
    return Response.redirect(`${SITE_URL}${pathname}${url.search}`, 301);
  }
  let decodedSlug = legacySlug;
  try { decodedSlug = decodeURIComponent(legacySlug); } catch { /* inválido: será tratado como 404 */ }
  if ((historicalId && isBlockedNews(historicalId)) || (decodedSlug && isBlockedNews(decodedSlug))) {
    return new Response('Conteúdo removido.', { status: 410, headers: { 'Cache-Control': 'public, max-age=300', 'X-Robots-Tag': 'noindex' } });
  }
  if (historicalId && /^\d+$/.test(historicalId)) {
    const knownSlug = knownHistoricalSlug(historicalId);
    if (knownSlug) return Response.redirect(`${SITE_URL}${NEWS_PREFIX}${knownSlug}${idQuery}`, 301);
    try {
      const post = await newsPost(historicalId, withNewsBudget(context, PAGE_BUDGET_MS, false));
      if (post) return Response.redirect(`${SITE_URL}${NEWS_PREFIX}${post.slug}${idQuery}`, 301);
      return new Response('Notícia não encontrada.', { status: 404, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
    } catch {
      return new Response('Notícia temporariamente indisponível.', { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '60' } });
    }
  }
  if (pathname === '/instituicao/missao-visao') return Response.redirect(`${SITE_URL}/instituicao/sobre-conselho${url.search}`, 301);
  if (pathname === '/imprensa/noticias-cff') return Response.redirect(`${SITE_URL}/imprensa/publicacoes-cff${url.search}`, 301);
  if (pathname.startsWith('/publicacao/') && pathname.slice('/publicacao/'.length) && !pathname.slice('/publicacao/'.length).includes('/')) {
    return Response.redirect(`${SITE_URL}${NEWS_PREFIX}${encodeURIComponent(knownHistoricalSlugBySlug(decodedSlug) || decodedSlug)}${url.search}`, 301);
  }
  // Apenas um segmento conhecido do mapa pode ser uma notícia legada na raiz.
  // Rotas da SPA e nomes de assets têm precedência mesmo se colidirem com o mapa.
  const rootSlug = pathname.match(/^\/([^/.]+)$/)?.[1];
  if (rootSlug && !Object.hasOwn(PAGE_METADATA, pathname) &&
      !/^(?:assets|images|fonts|api|documentos|instituicao|servicos|imprensa|publicacao|fiscalizacao|eventos)$/.test(rootSlug)) {
    let decoded = rootSlug;
    try { decoded = decodeURIComponent(rootSlug); } catch { /* slug inválido segue para o 404 */ }
    const known = knownHistoricalSlugBySlug(decoded);
    if (known) return Response.redirect(`${SITE_URL}${NEWS_PREFIX}${encodeURIComponent(known)}${url.search}`, 301);
  }
  const staticData = Object.hasOwn(PAGE_METADATA, pathname) ? PAGE_METADATA[pathname] : undefined;
  const prefix = [NEWS_PREFIX, EVENTS_PREFIX, GALLERY_PREFIX].find(p => pathname.startsWith(p));
  // Os validadores pertencem ao shell estático: nas rotas HTML um 304 pularia a injeção de metadados.
  // Assets reais (imagens, PDFs, fontes, bundles) mantêm os validadores e podem responder 304.
  const htmlRoute = Boolean(staticData || prefix) || !/\.[a-z0-9]+$/i.test(pathname);
  let upstream = context.request;
  if (htmlRoute && (upstream.headers.has('If-None-Match') || upstream.headers.has('If-Modified-Since'))) {
    const headers = new Headers(upstream.headers);
    headers.delete('If-None-Match');
    headers.delete('If-Modified-Since');
    upstream = new Request(upstream, { headers });
  }
  const assetStart = performance.now();
  const asset = prefix === NEWS_PREFIX
    ? new Response(NEWS_SHELL, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    : await context.next(upstream);
  context.timings.asset += performance.now() - assetStart;
  if (!asset.ok || !asset.headers.get('content-type')?.includes('text/html')) return asset;
  // Pages falls back to index.html for missing files and routes in a SPA.
  // Keep real assets/API responses, but never report that HTML fallback as success.
  if (!staticData && !prefix) {
    if (/^\/(assets|images|fonts|api)(\/|$)/.test(pathname)) {
      return new Response('Recurso não encontrado.', {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex' },
      });
    }
    return notFound(asset, pathname);
  }
  if (staticData) return injectOg(asset, { ...staticData, noindex: ['/eventos', '/imprensa/galeria-de-fotos'].includes(pathname), canonical: `${SITE_URL}${pathname === '/' ? '' : pathname}` }, pathname === '/' ? homePreload() : []);
  let slug: string;
  try { slug = decodeURIComponent(pathname.slice(prefix!.length)); } catch { return notFound(asset, pathname); }
  if (!slug || slug.includes('/')) return notFound(asset, pathname);
  try {
    if (prefix === NEWS_PREFIX && /^\d+$/.test(slug)) {
      const post = await newsPost(slug, withNewsBudget(context, PAGE_BUDGET_MS, false));
      return post?.slug ? Response.redirect(`${SITE_URL}${NEWS_PREFIX}${post.slug}${idQuery}`, 301) : notFound(asset, pathname);
    }
    // Notícias já têm cache próprio (Cache API + KV, SWR) com a mesma chave de /api/news.
    const render = async () => {
      const og = prefix === NEWS_PREFIX ? await resolveNews(slug, context) : await cachedMetadata(context, pathname, () => prefix === EVENTS_PREFIX ? resolveEvent(slug, context) : resolveAlbum(slug, context));
      if (!og?.title) return notFound(asset, pathname);
      const rewriteStart = performance.now();
      const rewritten = injectOg(asset, og);
      const response = new Response(await rewritten.arrayBuffer(), rewritten);
      context.timings.rewriter += performance.now() - rewriteStart;
      if (prefix === NEWS_PREFIX) response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=600, stale-if-error=2592000');
      return response;
    };
    // A versão do shell impede servir HTML com bundles de um deploy anterior.
    const version = prefix === NEWS_PREFIX ? NEWS_SHELL_VERSION : asset.headers.get('ETag');
    if (prefix === NEWS_PREFIX && context.request.method === 'GET' && version) {
      const scope = `${context.env?.WP_SITE_URL || ''}|${context.env?.NEWS_ARCHIVE_API_URL || ''}`;
      return await cachedNewsResponse(context, newsResponseKey(context.request, scope, version), render, true);
    }
    return await render();
  } catch (error) {
    // Temporary origin failures are neither successful pages nor missing content.
    console.error(JSON.stringify({ event: 'page_metadata_failed', path: pathname, message: error instanceof Error ? error.message : String(error) }));
    if (prefix === NEWS_PREFIX) {
      const response = injectOg(asset, { title: 'Notícias', description: 'Notícias do CRF-AL.', canonical: `${SITE_URL}${pathname}` });
      response.headers.set('Cache-Control', 'no-store');
      return response;
    }
    const response = new Response(asset.body, { status: 503, headers: asset.headers });
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('Retry-After', '60');
    response.headers.delete('ETag');
    response.headers.delete('Last-Modified');
    return response;
  }
}

function notFound(asset: Response, pathname: string): Response {
  const headers = new Headers(asset.headers);
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Robots-Tag', 'noindex');
  headers.delete('ETag');
  headers.delete('Last-Modified');
  return injectOg(new Response(asset.body, { status: 404, headers }), {
    title: 'Página não encontrada', description: 'O conteúdo solicitado não foi encontrado.', canonical: `${SITE_URL}${pathname}`, noindex: true,
  });
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const timings = { cache: 0, kv: 0, asset: 0, rewriter: 0, origin: 0 };
  const task = handleRequest(Object.assign(context, { timings }));
  const isNews = new URL(context.request.url).pathname.startsWith(NEWS_PREFIX);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const fallback = () => withSecurityHeaders(new Response(NEWS_SHELL, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  }));
  const response = isNews ? await Promise.race([task.then(async response => new Response(await response.arrayBuffer(), response)).catch(fallback), new Promise<Response>(resolve => {
    timer = setTimeout(() => resolve(fallback()), PAGE_BUDGET_MS + 300);
  })]).finally(() => { if (timer !== undefined) clearTimeout(timer); }) : await task;
  const result = new Response(context.request.method === 'HEAD' ? null : response.body, response);
  result.headers.set('Server-Timing', Object.entries(timings).map(([name, value]) => `${name};dur=${value.toFixed(1)}`).join(', '));
  return result;
}
