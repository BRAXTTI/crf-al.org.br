import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchPostById, fetchPostBySlug, fetchPosts, fetchRelatedPosts } from './client';

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

