import DOMPurify from 'dompurify';
import type { CRFEvent, WPEmbedded, WPEventListing, WPPost, WPPostsPage } from './types';

const WP_SITE_URL =
  import.meta.env.VITE_WP_SITE_URL ?? 'https://wordpress.crf-al.org.br';

export const WP_UPLOADS_URL = `${WP_SITE_URL}/wp-content/uploads`;

export const LEGACY_WP_UPLOADS_URL = 'https://www.crf-al.org.br/app/uploads';

const DEFAULT_TIMEOUT_MS = 15_000;

function restUrl(route: string, params: Record<string, string> = {}): string {
  const search = new URLSearchParams(params).toString();
  return `${WP_SITE_URL}/index.php?rest_route=${route}${search ? `&${search}` : ''}`;
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
    restUrl('/wp/v2/posts', { _embed: '1', page: String(page), per_page: String(perPage) }),
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
  return wpJson<WPPost>(restUrl(`/wp/v2/posts/${id}`, { _embed: '1' }), signal);
}

export async function fetchPostBySlug(slug: string, signal?: AbortSignal): Promise<WPPost | null> {
  const posts = await wpJson<WPPost[]>(restUrl('/wp/v2/posts', { slug, _embed: '1' }), signal);
  return posts[0] ?? null;
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
