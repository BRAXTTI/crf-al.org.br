import { PAGE_METADATA } from './page-metadata';

/**
 * Rotas de PAGE_METADATA fora do pré-render do build (scripts/prerender.mjs), com o motivo:
 * o conteúdo principal vem de API e o HTML do build sairia só com o "carregando".
 * Rotas dinâmicas (notícia, evento, álbum) nem estão em PAGE_METADATA.
 */
export const PRERENDER_EXCLUDED: Record<string, string> = {
  '/imprensa/noticias': 'lista de notícias vem de /api/news',
  '/imprensa/publicacoes-cff': 'publicações vêm de /api/cff-publicacoes',
  '/imprensa/galeria-de-fotos': 'álbuns vêm de /api/gallery (e a rota é noindex)',
  '/eventos': 'agenda vem de /api/events (e a rota é noindex)',
};

/** Rotas alvo: todas as estáticas com metadados, menos as que dependem de API. */
export const PRERENDER_ROUTES = Object.keys(PAGE_METADATA).filter((path) => !Object.hasOwn(PRERENDER_EXCLUDED, path));
