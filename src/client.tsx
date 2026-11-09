import { createRoot, hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, matchRoutes, RouterProvider, type RouteObject } from 'react-router-dom';
import type { QueryClient } from '@tanstack/react-query';
import App from './App';
import { AfterCommit } from './lib/AfterCommit';
import { definirInstantePreRender } from './lib/hydration';
import { createQueryClient } from './query-client';
import { routes } from './router/app-router';

/** Atributo de #root com a rota pré-renderizada no build (scripts/prerender.mjs). */
export const PRERENDER_ATTR = 'data-prerender';
/** Instante (ms) usado no pré-render; a hidratação usa o mesmo. */
export const PRERENDER_AT_ATTR = 'data-prerender-at';

// Persist only the shared notification sources, keeping their original update time so
// React Query can refresh stale entries when a page or the notification panel needs them.
const cacheKey = 'crfal:fontes-notificacoes:v1';
const isSharedSource = (key: readonly unknown[]) =>
  JSON.stringify(key) === JSON.stringify(['wp', 'events']) ||
  JSON.stringify(key) === JSON.stringify(['wp', 'posts', 1, 5]);

function restoreSharedSources(queryClient: QueryClient) {
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
}

/**
 * Hidratar só quando o HTML é exatamente o desta URL. Com query string ou hash a página pode
 * renderizar outra coisa (busca `?q=`, aba `#...`): nesse caso, render completo como antes.
 */
export function canHydrate(container: HTMLElement, url: Pick<Location, 'pathname' | 'search' | 'hash'>) {
  const path = url.pathname.replace(/\/+$/, '') || '/';
  return container.getAttribute(PRERENDER_ATTR) === path && !url.search && !url.hash;
}

/**
 * Carrega os chunks `lazy` da rota atual antes do primeiro render: sem "Carregando página…" por
 * cima do HTML pronto. Falha de rede: devolve false e o `lazy` fica para o router (com seu erro).
 */
export async function loadRouteModules(routeList: RouteObject[], pathname: string) {
  const results = await Promise.allSettled((matchRoutes(routeList, pathname) ?? []).map(async ({ route }) => {
    if (typeof route.lazy !== 'function') return;
    Object.assign(route, await route.lazy(), { lazy: undefined });
  }));
  return results.every((result) => result.status === 'fulfilled');
}

interface MountOptions {
  /** Erros de hidratação recuperados pelo React (padrão: reportError). */
  onRecoverableError?: (error: unknown) => void;
}

export async function mount(container: HTMLElement, { onRecoverableError }: MountOptions = {}) {
  const queryClient = createQueryClient();
  const instante = container.getAttribute(PRERENDER_AT_ATTR);
  // Sem os módulos da rota, o router mostraria o fallback: aí não dá para hidratar.
  const hydrate = canHydrate(container, window.location) && Boolean(instante) && await loadRouteModules(routes, window.location.pathname);
  // Mesmo "agora" do pré-render durante a hidratação (data de hoje, expediente...).
  definirInstantePreRender(hydrate ? Number(instante) : undefined);
  container.removeAttribute(PRERENDER_ATTR);
  container.removeAttribute(PRERENDER_AT_ATTR);
  if (!hydrate) await loadRouteModules(routes, window.location.pathname);
  const router = createBrowserRouter(routes);
  const tree = (
    <App queryClient={queryClient}>
      <RouterProvider router={router} />
    </App>
  );
  if (hydrate) {
    // O cache da sessão entra só depois da hidratação: com dados já no primeiro render,
    // o HTML do build (sem dados) não bateria.
    let restored = false;
    const restore = () => {
      if (restored) return; // StrictMode repete efeitos em desenvolvimento.
      restored = true;
      restoreSharedSources(queryClient);
    };
    return { root: hydrateRoot(container, <AfterCommit run={restore}>{tree}</AfterCommit>, { onRecoverableError }), hydrated: true, router };
  }
  restoreSharedSources(queryClient);
  // HTML de outra rota (fallback do SPA) é substituído no primeiro commit.
  const root = createRoot(container, { onRecoverableError });
  root.render(tree);
  return { root, hydrated: false, router };
}
