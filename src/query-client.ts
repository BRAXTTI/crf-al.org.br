import { QueryClient } from '@tanstack/react-query';
import { retryTransient } from './services/http';

/** Mesma configuração no navegador e no pré-render do build. */
export function createQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: retryTransient(2),
        refetchOnWindowFocus: false,
      },
    },
  });
  queryClient.setQueryDefaults(['wp', 'events'], { staleTime: 10 * 60 * 1000 });
  queryClient.setQueryDefaults(['wp', 'posts', 1, 5], { staleTime: 10 * 60 * 1000 });
  return queryClient;
}
