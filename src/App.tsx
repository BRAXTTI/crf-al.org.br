import { StrictMode, type ReactNode } from 'react';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary';

interface AppProps {
  queryClient: QueryClient;
  /** RouterProvider no navegador; StaticRouterProvider no pré-render. */
  children: ReactNode;
}

/** Árvore comum ao navegador e ao pré-render: qualquer diferença aqui quebraria a hidratação. */
function App({ queryClient, children }: AppProps) {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </HelmetProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

export default App;
