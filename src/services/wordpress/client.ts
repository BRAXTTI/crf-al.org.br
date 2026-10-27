import { HttpError, requestJson } from '../http';
import { mediaImageSet, type ImageSet } from './image-set';
import type { CRFEvent, WPEmbedded, WPEventListing, WPPost, WPPostsPage } from './types';

/**
 * WordPress "novo" (wordpress.crf-al.org.br): eventos e demais recursos.
 * Mantém o estilo de URL `index.php?rest_route=`.
 */
const WP_SITE_URL =
  import.meta.env.VITE_WP_SITE_URL ?? 'https://wordpress.crf-al.org.br';

export const WP_UPLOADS_URL = `${WP_SITE_URL}/wp-content/uploads`;

export const LEGACY_WP_UPLOADS_URL = 'https://www.crf-al.org.br/app/uploads';

export async function fetchPosts(
  options: { page?: number; perPage?: number; signal?: AbortSignal } = {}
): Promise<WPPostsPage> {
  const { page = 1, perPage = 10, signal } = options;
  // Sem cache, a API recompõe o índice completo do acervo antes de paginar.
  return requestJson<WPPostsPage>(`/api/news?page=${page}&per_page=${perPage}`, { signal, timeoutMs: 60_000 });
}

export async function fetchPostById(id: number, signal?: AbortSignal): Promise<WPPost> {
  const post = await fetchPostBySlug(String(id), signal);
  if (!post) throw new Error('Notícia não encontrada.');
  return post;
}

export async function fetchPostBySlug(slug: string, signal?: AbortSignal): Promise<WPPost | null> {
  try {
    return await requestJson<WPPost>(`/api/news?slug=${encodeURIComponent(slug)}`, { signal });
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) return null;
    throw error;
  }
}

/** Decodifica entidades HTML (ex.: `&ccedil;` -> `ç`) em texto puro vindo do WordPress. */
export function decodeHTMLEntities(value: string): string {
  if (typeof document === 'undefined') return value;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value;
}

/** Lista todos os eventos (publicados e encerrados) vindos do WP Event Manager. */
export async function fetchEvents(signal?: AbortSignal): Promise<CRFEvent[]> {
  return requestJson<CRFEvent[]>('/api/events', { signal });
}

/** Busca um evento individual (com conteúdo completo e meta) pelo id. */
export async function fetchEventById(id: number, signal?: AbortSignal): Promise<WPEventListing> {
  return requestJson<WPEventListing>(`/api/events?id=${id}`, { signal });
}

/** Permite abrir eventos publicados sem esperar pela listagem de relacionados. */
export async function fetchEventBySlug(slug: string, signal?: AbortSignal): Promise<WPEventListing | null> {
  const events = await requestJson<WPEventListing[]>(
    `/api/events?slug=${encodeURIComponent(slug)}`,
    { signal },
  );
  return events[0] ?? null;
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

/** Capa com srcset (ver `mediaImageSet`). */
export function getPostImageSet(post: WPWithEmbed): ImageSet | undefined {
  return mediaImageSet(post._embedded?.['wp:featuredmedia']?.[0]);
}

export function getPostAuthor(post: WPWithEmbed): string | undefined {
  return post._embedded?.author?.[0]?.name;
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
