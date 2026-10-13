import { useInfiniteQuery } from '@tanstack/react-query';

export interface CffNewsItem { link: string; title: string; image?: string; date?: string; summary?: string }
interface CffNewsPage { items: CffNewsItem[]; nextCursor: number | null }

export const CFF_NEWS_URL = 'https://site.cff.org.br/noticias';
export const CFF_IMG_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500'%3E%3Crect width='800' height='500' fill='%23E6F0F8'/%3E%3C/svg%3E";

async function fetchCffNews(limit: number, cursor: number, signal: AbortSignal): Promise<CffNewsPage> {
  const res = await fetch(`/api/cff?limite=${limit}&cursor=${cursor}`, { signal });
  if (!res.ok) throw new Error('Falha ao carregar as notícias do CFF');
  const data = (await res.json()) as Partial<CffNewsPage>;
  return {
    items: Array.isArray(data.items) ? data.items.filter((item) => item.link && item.title) : [],
    nextCursor: typeof data.nextCursor === 'number' ? data.nextCursor : null,
  };
}

/** Notícias do CFF com paginação por cursor (páginas da listagem do CFF). */
export function useCffNews(limit: number) {
  return useInfiniteQuery({
    queryKey: ['cff-news', limit],
    queryFn: ({ pageParam, signal }) => fetchCffNews(limit, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 15 * 60 * 1000,
    retry: 1,
  });
}

export function formatCffDate(date?: string) {
  if (!date) return undefined;
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

