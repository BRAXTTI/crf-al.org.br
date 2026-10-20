import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchPhotoAlbum, fetchPhotoAlbums } from './gallery';

export function usePhotoAlbums(page = 1) {
  return useQuery({
    queryKey: ['wp', 'photo-albums', page],
    queryFn: ({ signal }) => fetchPhotoAlbums(page, signal),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function usePhotoAlbum(slug: string) {
  return useQuery({
    queryKey: ['wp', 'photo-album', slug],
    queryFn: ({ signal }) => fetchPhotoAlbum(slug, signal),
    enabled: Boolean(slug),
    staleTime: 60_000,
  });
}
