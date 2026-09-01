import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchEventById, fetchEvents, fetchPostById, fetchPostBySlug, fetchPosts, fetchRelatedPosts } from './client';

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

export function useRelatedPosts(excludeId: number, perPage = 3) {
  return useQuery({
    queryKey: ['wp', 'posts', 'related', excludeId, perPage],
    queryFn: ({ signal }) => fetchRelatedPosts(excludeId, perPage, signal),
    enabled: Number.isFinite(excludeId),
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
