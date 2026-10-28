import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { retryTransient } from './services/http'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: retryTransient(2),
      refetchOnWindowFocus: false,
    },
  },
})

queryClient.setQueryDefaults(['wp', 'events'], { staleTime: 10 * 60 * 1000 })
queryClient.setQueryDefaults(['wp', 'posts', 1, 5], { staleTime: 10 * 60 * 1000 })

// Persist only the shared notification sources, keeping their original update time so
// React Query can refresh stale entries when a page or the notification panel needs them.
const cacheKey = 'crfal:fontes-notificacoes:v1';
const isSharedSource = (key: readonly unknown[]) =>
  JSON.stringify(key) === JSON.stringify(['wp', 'events']) ||
  JSON.stringify(key) === JSON.stringify(['wp', 'posts', 1, 5]);
try {
  const saved = JSON.parse(sessionStorage.getItem(cacheKey) ?? '[]');
  if (Array.isArray(saved)) {
    for (const entry of saved) {
      if (Array.isArray(entry.key) && isSharedSource(entry.key) && entry.data != null &&
          typeof entry.updatedAt === 'number' && entry.updatedAt <= Date.now()) {
        queryClient.setQueryData(entry.key, entry.data, { updatedAt: entry.updatedAt });
      }
    }
  }
} catch { /* Storage can be unavailable or contain invalid data. */ }
queryClient.getQueryCache().subscribe((event) => {
  if (event.type !== 'updated' || event.action.type !== 'success' || !isSharedSource(event.query.queryKey)) return;
  try {
    const entries = queryClient.getQueryCache().getAll()
      .filter((query) => isSharedSource(query.queryKey) && query.state.data != null)
      .map((query) => ({ key: query.queryKey, data: query.state.data, updatedAt: query.state.dataUpdatedAt }));
    sessionStorage.setItem(cacheKey, JSON.stringify(entries));
  } catch { /* The in-memory query cache remains available. */ }
});

// React 19 manages head tags itself; remove server tags before mounting the SPA.
document.querySelectorAll('[data-page-metadata]').forEach((element) => element.remove())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </QueryClientProvider>
  </StrictMode>,
)
