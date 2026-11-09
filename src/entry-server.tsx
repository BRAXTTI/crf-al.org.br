/**
 * Pré-render do build (scripts/prerender.mjs): HTML das rotas estáticas dentro de #root.
 * Sem dados de API: consultas do React Query saem no estado "carregando", como no
 * primeiro render do navegador, e a hidratação continua a partir daí.
 */
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom';
import App from './App';
import { SITE_URL } from './config/site';
import { definirInstantePreRender } from './lib/hydration';
import { createQueryClient } from './query-client';
import { routes } from './router/app-router';

/**
 * Tags de <head> que o React 19 emite antes do conteúdo (Helmet → <title>/<meta>/<link>/JSON-LD,
 * preload de imagens). Ficam fora de #root: o middleware injeta os metadados no <head> e o React
 * os recria ao montar; deixá-los no corpo duplicaria title/canonical para os buscadores.
 */
const HOISTED = /^(?:<title\b[^>]*>[\s\S]*?<\/title>|<meta\b[^>]*\/?>|<link\b[^>]*\/?>|<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>)/;
export function stripHoisted(html: string) {
  let rest = html;
  for (let match = rest.match(HOISTED); match; match = rest.match(HOISTED)) rest = rest.slice(match[0].length);
  return rest;
}

/**
 * `instante`: "agora" das páginas (data de hoje, expediente, ano). Vai para `data-prerender-at`
 * e o navegador usa o mesmo valor na hidratação; logo depois, a hora real (src/lib/hydration.ts).
 */
export async function render(path: string, instante = Date.now()): Promise<{ html: string; status: number; instante: number }> {
  definirInstantePreRender(instante);
  const handler = createStaticHandler(routes);
  const context = await handler.query(new Request(`${SITE_URL}${path}`));
  if (context instanceof Response) throw new Error(`${path}: a rota redireciona (${context.status}) e não pode ser pré-renderizada`);
  const router = createStaticRouter(handler.dataRoutes, context);
  const queryClient = createQueryClient();
  let html: string;
  try {
    html = renderToString(
      <App queryClient={queryClient}>
        {/* hydrate={false}: sem <script> inline (a CSP só permite scripts de 'self'). */}
        <StaticRouterProvider router={router} context={context} hydrate={false} />
      </App>,
    );
  } finally {
    // gcTime de 30 min agenda setTimeout por consulta: sem limpar, o Node não encerra o build.
    queryClient.clear();
  }
  return { html: stripHoisted(html), status: context.statusCode, instante };
}
