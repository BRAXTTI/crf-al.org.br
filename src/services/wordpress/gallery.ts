import { requestJson } from '../http';
import type { PhotoAlbum, PhotoAlbumPage } from './types';


export class GalleryApiError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`Não foi possível carregar a galeria (${status}).`);
    this.status = status;
  }
}

async function galleryRequest<T>(route: string, params: Record<string, string>, signal?: AbortSignal): Promise<T> {
  const query = new URLSearchParams({ ...(route ? { slug: decodeURIComponent(route.slice(1)) } : {}), ...params });
  return requestJson<T>(`/api/gallery?${query}`, {
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
