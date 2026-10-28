import { CFF_CLIENT_TIMEOUT_MS } from '@/config/cff';
import { requestJson, retryTransient } from '@/services/http';
import { useQuery } from '@tanstack/react-query';

export interface CffPublication { link: string; cover?: string; edition?: number }
export interface CffCollection { title: string; items: CffPublication[]; slug: string }

export const CFF_PUBLICATIONS_URL = 'https://site.cff.org.br/publicacoes';
export const CFF_PUBLICATIONS_PATH = '/imprensa/publicacoes-cff';
export const CFF_COVER_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='700'%3E%3Crect width='500' height='700' fill='%23E6F0F8'/%3E%3C/svg%3E";

const slugify = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function fetchCffPublications(signal: AbortSignal): Promise<CffCollection[]> {
  const data = await requestJson<{ collections?: Omit<CffCollection, 'slug'>[] }>('/api/cff-publicacoes', {
    signal,
    timeoutMs: CFF_CLIENT_TIMEOUT_MS,
  });
  const collections = Array.isArray(data.collections) ? data.collections : [];
  return collections
    .map((c) => ({ title: c.title, slug: slugify(c.title), items: (c.items ?? []).filter((item) => /^https?:\/\//.test(item.link)) }))
    .filter((c) => c.title && c.items.length > 0);
}

/** Coleções de publicações do CFF (os PDFs ficam no site do CFF; aqui só os links). */
export function useCffPublications() {
  return useQuery({
    queryKey: ['cff-publications'],
    queryFn: ({ signal }) => fetchCffPublications(signal),
    staleTime: 60 * 60 * 1000,
    retry: retryTransient(1),
  });
}

export const isPdfLink = (link: string) => /\.pdf($|[?#])/i.test(link);

/** Nome acessível de uma capa (as capas do CFF não trazem título em texto). */
export function publicationLabel(collection: CffCollection, index: number) {
  const item = collection.items[index];
  if (item.edition) return `${collection.title}, edição ${item.edition}`;
  return collection.items.length > 1 ? `${collection.title}, publicação ${index + 1} de ${collection.items.length}` : collection.title;
}
