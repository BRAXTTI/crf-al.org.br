import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchPostById, fetchPostBySlug, fetchPosts } from './client';

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

/**
 * A página 1 não depende do slug: começa junto com o detalhe da notícia e é
 * compartilhada entre matérias; o filtro do post atual acontece na tela.
 */
export function useRelatedPosts(excludeSlug: string, perPage = 3) {
  return useQuery({
    queryKey: ['wp', 'posts', 1, perPage + 1],
    queryFn: ({ signal }) => fetchPosts({ perPage: perPage + 1, signal }),
    select: (page) => page.posts.filter((post) => !excludeSlug || post.slug !== excludeSlug).slice(0, perPage),
  });
}
