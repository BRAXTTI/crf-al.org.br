import { requestJson } from '../http';
import type { PhotoAlbum, PhotoAlbumPage } from './types';

const WP_SITE_URL = (import.meta.env.VITE_WP_SITE_URL ?? 'https://wordpress.crf-al.org.br').replace(/\/$/, '');

export class GalleryApiError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`Não foi possível carregar a galeria (${status}).`);
    this.status = status;
  }
}

async function galleryRequest<T>(route: string, params: Record<string, string>, signal?: AbortSignal): Promise<T> {
  const query = new URLSearchParams({ rest_route: `/crfal/v1/photo-albums${route}`, ...params });
  return requestJson<T>(`${WP_SITE_URL}/index.php?${query}`, {
    signal,
    errorForStatus: status => new GalleryApiError(status),
  });
}

export function fetchPhotoAlbums(page = 1, signal?: AbortSignal): Promise<PhotoAlbumPage> {
  return galleryRequest('', { page: String(page), per_page: '12' }, signal);
}

export function fetchPhotoAlbum(slug: string, signal?: AbortSignal): Promise<PhotoAlbum> {
  return galleryRequest(`/${encodeURIComponent(slug)}`, {}, signal);
}
