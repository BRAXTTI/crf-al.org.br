/**
 * Pages Function (middleware): Open Graph dinâmico para notícias e eventos.
 *
 * O site é uma SPA: as meta tags por página são injetadas em runtime pelo
 * react-helmet-async. Scrapers sociais (WhatsApp, Facebook, X, LinkedIn…)
 * NÃO executam JavaScript, então leem apenas o index.html estático — daí o
 * preview genérico (logo + nome do site) em vez do título/imagem do conteúdo.
 *
 * Aqui detectamos esses robôs e devolvemos o HTML inicial já com as meta tags
 * específicas da página (título, descrição e imagem). Usuários comuns seguem
 * recebendo a SPA normalmente.
 *
 * Também converte URLs antigas de notícia por ID (/imprensa/noticias/16193) em
 * 301 para a URL canônica por slug.
 *
 * Observação: isto é "dynamic rendering" (paliativo). A solução definitiva é
 * SSR, que gera essas meta tags para todos no servidor.
 *
 * Fica na raiz de /functions para rodar também em frente aos arquivos
 * estáticos (as rotas de conteúdo são SPA fallback, sem Function própria).
 */

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

/** Robôs de preview social que não executam JavaScript. */
const SOCIAL_BOT_RE =
  /whatsapp|facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|telegrambot|discordbot|pinterest|skypeuripreview|vkshare|embedly|redditbot|w3c_validator|mastodon|bluesky|google-structured-data-testing-tool/i;

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
}

interface PagesContext {
  request: Request;
  next: () => Promise<Response>;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&#0?38;|&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
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
  const res = await fetch(url, { headers: { 'user-agent': 'crfal-og/1.0' } });
  if (!res.ok) return null;
  return (await res.json()) as T;
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
    description: stripHTML(post.excerpt?.rendered ?? '').slice(0, 200) || undefined,
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
    description: stripHTML(evento.excerpt ?? '').slice(0, 200) || undefined,
    image: evento.banner ?? undefined,
    canonical: `${SITE_URL}${EVENTS_PREFIX}${evento.slug}`,
    ogType: 'article',
  };
}

// ---------------------------------------------------------------------------
// Injeção das meta tags
// ---------------------------------------------------------------------------

/** Meta tags que não existem no index.html estático e precisam ser anexadas. */
function buildExtraMeta(og: OgData): string {
  const fullTitle = `${og.title} | CRFAL`;
  return [
    `<meta property="og:title" content="${escapeAttr(fullTitle)}" />`,
    og.description
      ? `<meta property="og:description" content="${escapeAttr(og.description)}" />`
      : '',
    `<meta property="og:url" content="${escapeAttr(og.canonical)}" />`,
    og.publishedAt
      ? `<meta property="article:published_time" content="${escapeAttr(og.publishedAt)}" />`
      : '',
    og.modifiedAt
      ? `<meta property="article:modified_time" content="${escapeAttr(og.modifiedAt)}" />`
      : '',
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(fullTitle)}" />`,
    og.description
      ? `<meta name="twitter:description" content="${escapeAttr(og.description)}" />`
      : '',
    og.image ? `<meta name="twitter:image" content="${escapeAttr(og.image)}" />` : '',
    `<link rel="canonical" href="${escapeAttr(og.canonical)}" />`,
  ]
    .filter(Boolean)
    .join('\n    ');
}

function injectOg(context: PagesContext, og: OgData): Promise<Response> {
  const { title, image, ogType } = og;
  return context.next().then((asset) => {
    try {
      const fullTitle = `${title} | CRFAL`;
      const extraMeta = buildExtraMeta(og);

      const rewriter = new HTMLRewriter()
        .on('title', {
          element(el) {
            el.setInnerContent(fullTitle);
          },
        })
        // Substitui a imagem/alt genéricas (evita og:image duplicado).
        .on('meta[property="og:image"]', {
          element(el) {
            if (image) el.setAttribute('content', image);
          },
        })
        .on('meta[property="og:image:alt"]', {
          element(el) {
            if (image) el.setAttribute('content', title);
          },
        })
        // Dimensões/formato genéricos não valem para a arte do conteúdo.
        .on('meta[property="og:image:type"]', { element(el) { el.remove(); } })
        .on('meta[property="og:image:width"]', { element(el) { el.remove(); } })
        .on('meta[property="og:image:height"]', { element(el) { el.remove(); } })
        .on('head', {
          element(el) {
            el.append(extraMeta, { html: true });
          },
        });

      if (ogType) {
        rewriter.on('meta[property="og:type"]', {
          element(el) {
            el.setAttribute('content', ogType);
          },
        });
      }

      return rewriter.transform(asset);
    } catch {
      return asset;
    }
  });
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function onRequest(context: PagesContext) {
  const { request, next } = context;
  const url = new URL(request.url);
  const { pathname } = url;

  // 301 de URL antiga de notícia por ID para a canônica por slug (vale para todos).
  if (pathname.startsWith(NEWS_PREFIX) && /^\d+$/.test(pathname.slice(NEWS_PREFIX.length))) {
    const id = pathname.slice(NEWS_PREFIX.length);
    try {
      const post = await fetchNewsPost(`/${id}`, {});
      if (post?.slug) return Response.redirect(`${SITE_URL}${NEWS_PREFIX}${post.slug}`, 301);
    } catch {
      /* segue para a SPA */
    }
    return next();
  }

  const isNews = pathname.startsWith(NEWS_PREFIX);
  const isEvent = pathname.startsWith(EVENTS_PREFIX);
  if (!isNews && !isEvent) return next();

  // Apenas robôs de preview precisam das meta tags no HTML inicial.
  const ua = request.headers.get('user-agent') ?? '';
  if (!SOCIAL_BOT_RE.test(ua)) return next();

  const prefix = isNews ? NEWS_PREFIX : EVENTS_PREFIX;
  const slug = decodeURIComponent(pathname.slice(prefix.length));
  if (!slug || slug.includes('/')) return next();

  let og: OgData | null = null;
  try {
    og = isNews ? await resolveNews(slug) : await resolveEvent(slug);
  } catch {
    /* segue para a SPA */
  }
  if (!og || !og.title) return next();

  return injectOg(context, og);
}
