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
import { fetchEventById, fetchEvents, fetchInstagramFeed, fetchPostById, fetchPostBySlug, fetchPosts, fetchRelatedPosts } from './client';

export function usePosts(page = 1, perPage = 10) {
  return useQuery({
    queryKey: ['wp', 'posts', page, perPage],
    queryFn: ({ signal }) => fetchPosts({ page, perPage, signal }),
    placeholderData: keepPreviousData,
  });
}

export function usePost(id: number) {
  return useQuery({
    queryKey: ['wp', 'post', 'id', id],
    queryFn: ({ signal }) => fetchPostById(id, signal),
    enabled: Number.isFinite(id),
  });
}

export function usePostBySlug(slug: string) {
  return useQuery({
    queryKey: ['wp', 'post', 'slug', slug],
    queryFn: ({ signal }) => fetchPostBySlug(slug, signal),
    enabled: slug.length > 0,
  });
}

export function useRelatedPosts(excludeSlug: string, perPage = 3) {
  return useQuery({
    queryKey: ['wp', 'posts', 'related', excludeSlug, perPage],
    queryFn: ({ signal }) => fetchRelatedPosts(excludeSlug, perPage, signal),
    enabled: Boolean(excludeSlug),
  });
}

export function useInstagramFeed() {
  return useQuery({
    queryKey: ['wp', 'instagram'],
    queryFn: ({ signal }) => fetchInstagramFeed(signal),
    staleTime: 15 * 60 * 1000,
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ['wp', 'events'],
    queryFn: ({ signal }) => fetchEvents(signal),
  });
}

export function useEventById(id: number) {
  return useQuery({
    queryKey: ['wp', 'event', 'id', id],
    queryFn: ({ signal }) => fetchEventById(id, signal),
    enabled: Number.isFinite(id),
  });
}
