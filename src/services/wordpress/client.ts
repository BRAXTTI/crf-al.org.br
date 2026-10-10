import DOMPurify from 'dompurify';
import type { CRFEvent, CRFInstagramPost, WPEmbedded, WPEventListing, WPPost, WPPostsPage } from './types';

/**
 * WordPress "novo" (wordpress.crf-al.org.br): eventos e demais recursos.
 * Mantém o estilo de URL `index.php?rest_route=`.
 */
const WP_SITE_URL =
  import.meta.env.VITE_WP_SITE_URL ?? 'https://wordpress.crf-al.org.br';

export const WP_UPLOADS_URL = `${WP_SITE_URL}/wp-content/uploads`;

export const LEGACY_WP_UPLOADS_URL = 'https://www.crf-al.org.br/app/uploads';

const DEFAULT_TIMEOUT_MS = 15_000;

/** URL no estilo `index.php?rest_route=` (usada pelo WP de eventos). */
function restUrl(route: string, params: Record<string, string> = {}): string {
  const search = new URLSearchParams(params).toString();
  return `${WP_SITE_URL}/index.php?rest_route=${route}${search ? `&${search}` : ''}`;
}

async function wpRequest(url: string, signal?: AbortSignal): Promise<Response> {
  const controller = new AbortController();
  let timedOut = false;

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, DEFAULT_TIMEOUT_MS);

  const onAbort = () => controller.abort();
  if (signal?.aborted) {
    controller.abort();
  } else {
    signal?.addEventListener('abort', onAbort, { once: true });
  }

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`A API do WordPress respondeu com status ${response.status}.`);
    }
    return response;
  } catch (error) {
    // Cancelamento do chamador (ex.: TanStack Query abortou a query): propaga o
    // AbortError original em vez de mascará-lo como timeout.
    if (signal?.aborted) throw error;
    if (timedOut) {
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
  return wpJson<WPPostsPage>(`/api/news?page=${page}&per_page=${perPage}`, signal);
}

export async function fetchPostById(id: number, signal?: AbortSignal): Promise<WPPost> {
  const post = await fetchPostBySlug(String(id), signal);
  if (!post) throw new Error('Notícia não encontrada.');
  return post;
}

export async function fetchPostBySlug(slug: string, signal?: AbortSignal): Promise<WPPost | null> {
  const response = await fetch(`/api/news?slug=${encodeURIComponent(slug)}`, { signal });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`A API de notícias respondeu com status ${response.status}.`);
  return response.json();
}

/** Decodifica entidades HTML (ex.: `&ccedil;` -> `ç`) em texto puro vindo do WordPress. */
export function decodeHTMLEntities(value: string): string {
  if (typeof document === 'undefined') return value;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value;
}

/** Lista as publicações do feed do Instagram (Smash Balloon) em formato enxuto. */
export async function fetchInstagramFeed(signal?: AbortSignal): Promise<CRFInstagramPost[]> {
  const posts = await wpJson<CRFInstagramPost[]>(
    restUrl('/crfal/v1/instagram', { limit: '12' }),
    signal
  );
  return Array.isArray(posts) ? posts.filter((post) => post && post.image) : [];
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
  excludeSlug: string,
  perPage = 3,
  signal?: AbortSignal
): Promise<WPPost[]> {
  const posts = await fetchPosts({ perPage: perPage + 1, signal }).then((page) => page.posts);
  return posts.filter((post) => post.slug !== excludeSlug).slice(0, perPage);
}

/** Qualquer payload do WordPress que possa conter recursos embutidos (`_embed`). */
type WPWithEmbed = { _embedded?: WPEmbedded };

export function getPostCategory(post: WPWithEmbed): string {
  const categories = post._embedded?.['wp:term']?.[0] ?? [];
  const isPortalCategory = (category: (typeof categories)[number]) =>
    category.slug === 'noticias-do-portal' ||
    category.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR') === 'noticias do portal';
  return categories.find(category => !isPortalCategory(category))?.name || (categories.some(isPortalCategory) ? 'Notícias' : 'Geral');
}

export function getPostImage(post: WPWithEmbed): string | undefined {
  return post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
}

export function getPostAuthor(post: WPWithEmbed): string | undefined {
  return post._embedded?.author?.[0]?.name;
}

/** Sanitiza HTML do WordPress para uso seguro com dangerouslySetInnerHTML. */
export function sanitizeWP(html: string): string {
  return DOMPurify.sanitize(html);
}

/**
 * Remove tags HTML e decodifica entidades (ex.: `&ccedil;` -> `ç`) em texto puro.
 * Também descarta o bloco "Ver mais" que o tema do WordPress legado anexa ao excerpt.
 */
export function stripHTML(html: string): string {
  const semReadMore = html.replace(
    /<div[^>]*\bclass="[^"]*read-more-wrapper[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
    ''
  );
  return decodeHTMLEntities(semReadMore.replace(/<[^>]*>?/gm, '')).trim();
}
