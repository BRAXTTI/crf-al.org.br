import DOMPurify from 'dompurify';
import type { CRFBanner, CRFEvent, WPEmbedded, WPEventListing, WPPost, WPPostsPage } from './types';

/**
 * WordPress "novo" (wordpress.crf-al.org.br): eventos e demais recursos.
 * Mantém o estilo de URL `index.php?rest_route=`.
 */
const WP_SITE_URL =
  import.meta.env.VITE_WP_SITE_URL ?? 'https://wordpress.crf-al.org.br';

/**
 * WordPress antigo (crf-al.org.br): fonte exclusiva de notícias e suas mídias.
 * Aqui a REST API fica em `/wp-json/wp/v2` e as imagens usam URLs originais
 * do legado (`www.crf-al.org.br/app/uploads`).
 */
const NEWS_WP_SITE_URL =
  import.meta.env.VITE_WP_NEWS_SITE_URL ?? 'https://www.crf-al.org.br';

export const WP_UPLOADS_URL = `${WP_SITE_URL}/wp-content/uploads`;

export const LEGACY_WP_UPLOADS_URL = 'https://www.crf-al.org.br/app/uploads';

const DEFAULT_TIMEOUT_MS = 15_000;

/**
 * Campos enxutos para listagens (sem `content`).
 * `_links` é obrigatório para que o WP consiga resolver o `_embedded`.
 */
const NEWS_LIST_FIELDS = 'id,date,slug,link,title,excerpt,_links,_embedded';
/** Campos para a matéria individual (inclui o corpo completo). */
const NEWS_DETAIL_FIELDS = 'id,date,modified,slug,link,title,excerpt,content,_embedded';
/** Limita o `_embed` à mídia destacada e aos termos, reduzindo muito a resposta. */
const NEWS_EMBED = 'wp:featuredmedia,wp:term';

/** URL no estilo `index.php?rest_route=` (usada pelo WP de eventos). */
function restUrl(route: string, params: Record<string, string> = {}): string {
  const search = new URLSearchParams(params).toString();
  return `${WP_SITE_URL}/index.php?rest_route=${route}${search ? `&${search}` : ''}`;
}

/** URL no estilo `/wp-json/...` (usada pelo WP de notícias). */
function newsUrl(route: string, params: Record<string, string> = {}): string {
  const search = new URLSearchParams(params).toString();
  return `${NEWS_WP_SITE_URL}/wp-json${route}${search ? `?${search}` : ''}`;
}

async function wpRequest(url: string, signal?: AbortSignal): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort, { once: true });

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`A API do WordPress respondeu com status ${response.status}.`);
    }
    return response;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('A requisição ao WordPress excedeu o tempo limite.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onAbort);
  }
}

async function wpJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await wpRequest(url, signal);
  return (await response.json()) as T;
}

export async function fetchPosts(
  options: { page?: number; perPage?: number; signal?: AbortSignal } = {}
): Promise<WPPostsPage> {
  const { page = 1, perPage = 10, signal } = options;

  const response = await wpRequest(
    newsUrl('/wp/v2/posts', {
      _embed: NEWS_EMBED,
      _fields: NEWS_LIST_FIELDS,
      page: String(page),
      per_page: String(perPage),
    }),
    signal
  );
  const posts = (await response.json()) as WPPost[];

  return {
    posts,
    total: Number(response.headers.get('X-WP-Total')) || posts.length,
    totalPages: Number(response.headers.get('X-WP-TotalPages')) || 1,
  };
}

export async function fetchPostById(id: number, signal?: AbortSignal): Promise<WPPost> {
  return wpJson<WPPost>(
    newsUrl(`/wp/v2/posts/${id}`, { _embed: NEWS_EMBED, _fields: NEWS_DETAIL_FIELDS }),
    signal
  );
}

export async function fetchPostBySlug(slug: string, signal?: AbortSignal): Promise<WPPost | null> {
  const posts = await wpJson<WPPost[]>(
    newsUrl('/wp/v2/posts', { slug, _embed: NEWS_EMBED, _fields: NEWS_DETAIL_FIELDS }),
    signal
  );
  return posts[0] ?? null;
}

/** Decodifica entidades HTML (ex.: `&ccedil;` -> `ç`) em texto puro vindo do WordPress. */
export function decodeHTMLEntities(value: string): string {
  if (typeof document === 'undefined') return value;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value;
}

/** Lista os banners da home gerenciados pelo MetaSlider. */
export async function fetchBanners(signal?: AbortSignal): Promise<CRFBanner[]> {
  const banners = await wpJson<CRFBanner[]>(restUrl('/crfal/v1/banners'), signal);
  return banners.map((banner) => ({
    ...banner,
    title: decodeHTMLEntities(banner.title),
    subtitle: decodeHTMLEntities(banner.subtitle),
    ctaLabel: decodeHTMLEntities(banner.ctaLabel ?? ''),
  }));
}

/** Lista todos os eventos (publicados e encerrados) vindos do WP Event Manager. */
export async function fetchEvents(signal?: AbortSignal): Promise<CRFEvent[]> {
  return wpJson<CRFEvent[]>(restUrl('/crfal/v1/events'), signal);
}

/** Busca um evento individual (com conteúdo completo e meta) pelo id. */
export async function fetchEventById(id: number, signal?: AbortSignal): Promise<WPEventListing> {
  return wpJson<WPEventListing>(restUrl(`/wp/v2/event_listing/${id}`, { _embed: '1' }), signal);
}

export async function fetchRelatedPosts(
  excludeId: number,
  perPage = 3,
  signal?: AbortSignal
): Promise<WPPost[]> {
  const posts = await fetchPosts({ perPage: perPage + 1, signal }).then((page) => page.posts);
  return posts.filter((post) => post.id !== excludeId).slice(0, perPage);
}

/** Qualquer payload do WordPress que possa conter recursos embutidos (`_embed`). */
type WPWithEmbed = { _embedded?: WPEmbedded };

export function getPostCategory(post: WPWithEmbed): string {
  return post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Geral';
}

export function getPostImage(post: WPWithEmbed): string | undefined {
  return post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
}

/** Sanitiza HTML do WordPress para uso seguro com dangerouslySetInnerHTML. */
export function sanitizeWP(html: string): string {
  return DOMPurify.sanitize(html);
}

/** Remove tags HTML e retorna texto puro. */
export function stripHTML(html: string): string {
  return html.replace(/<[^>]*>?/gm, '').trim();
}
