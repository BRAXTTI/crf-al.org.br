/**
 * Tabela única de redirects de Requerimentos e Tutoriais.
 * Compartilhada entre `functions/_middleware.ts` (301 HTTP) e o roteador React
 * (`<Navigate replace>`), evitando divergência entre servidor e cliente.
 */

export const REQUERIMENTOS_PATH = '/servicos/requerimentos';
export const TUTORIAIS_PATH = '/servicos/tutoriais';
export const ABA_PASSO_A_PASSO_HASH = '#passo-a-passo';
export const ABA_FORMULARIO_HASH = '#formulario';

/**
 * Ids dos 21 requerimentos publicados (`/servicos/requerimentos/<id>`).
 * Sincronia com `TODOS_OS_REQUERIMENTOS` garantida por `requerimentos.test.ts`.
 */
export const IDS_REQUERIMENTOS = [
  'primeira-inscricao-profissional-provisoria',
  'inscricao-profissional-definitiva',
  'inscricao-secundaria-transferencia-reativacao',
  'prorrogacao-inscricao-provisoria',
  'carteira-definitiva-segunda-via',
  'certidao-regularidade-pf',
  'transferencia-outro-regional',
  'cancelamento-inscricao',
  'registro-novo-pj',
  'registro-inicial-servico-publico',
  'registro-posto-medicamentos',
  'contratacao-rt-pj',
  'contratacao-rt-servico-publico',
  'contratacao-rt-plantonista',
  'alteracao-horarios',
  'transferencia-matriz-filiais',
  'alteracao-contratual-firma',
  'dap',
  'defesa-auto-infracao',
  'recurso-multa-fiscal',
  'reconsideracao-indeferimento',
] as const;

const CONJUNTO_IDS_REQUERIMENTOS = new Set<string>(IDS_REQUERIMENTOS);

/**
 * Os 4 tutoriais que espelham um requerimento: `tutorialId -> requerimentoId`.
 * Sincronia com `requerimentos.ts` (`tutorialId`) e `servicos.ts` (`requerimentoId`)
 * garantida por `requerimentos.test.ts`.
 */
export const TUTORIAIS_ESPELHO_REQUERIMENTO: Readonly<Record<string, string>> = {
  'primeira-inscricao': 'primeira-inscricao-profissional-provisoria',
  'inscricao-definitiva': 'inscricao-profissional-definitiva',
  'contratacao-rt': 'contratacao-rt-pj',
  'defesa-auto-infracao': 'defesa-auto-infracao',
};

/**
 * Tabela direta de redirects 301 das 4 páginas de tutorial espelho para a aba
 * "Passo a passo" da página do respectivo requerimento.
 */
export const REDIRECTS_TUTORIAIS_PARA_REQUERIMENTOS: Readonly<Record<string, string>> = {
  '/servicos/tutoriais/primeira-inscricao':
    '/servicos/requerimentos/primeira-inscricao-profissional-provisoria#passo-a-passo',
  '/servicos/tutoriais/inscricao-definitiva':
    '/servicos/requerimentos/inscricao-profissional-definitiva#passo-a-passo',
  '/servicos/tutoriais/contratacao-rt':
    '/servicos/requerimentos/contratacao-rt-pj#passo-a-passo',
  '/servicos/tutoriais/defesa-auto-infracao':
    '/servicos/requerimentos/defesa-auto-infracao#passo-a-passo',
};

const PARAMS_FILTRO_REQUERIMENTOS = ['item', 'perfil', 'categoria', 'q'] as const;
const PARAMS_FILTRO_TUTORIAIS = ['tutorial', 'perfil'] as const;

function limparQuery(search: string, remover: readonly string[]): string {
  if (!search) return '';
  const params = new URLSearchParams(search);
  for (const chave of remover) params.delete(chave);
  return params.size ? `?${params}` : '';
}

export function ehIdRequerimentoValido(id: string | null | undefined): id is string {
  return Boolean(id && CONJUNTO_IDS_REQUERIMENTOS.has(id));
}

/**
 * Resolve `/servicos/requerimentos?item=<id>` para `/servicos/requerimentos/<id>`
 * (ou `/servicos/requerimentos` quando o id não existe), preservando parâmetros como `utm_*`.
 */
export function resolverRedirectRequerimentoItem(
  itemId: string | null | undefined,
  search = '',
): string {
  const query = limparQuery(search, PARAMS_FILTRO_REQUERIMENTOS);
  const destinoBase = ehIdRequerimentoValido(itemId)
    ? `${REQUERIMENTOS_PATH}/${itemId}`
    : REQUERIMENTOS_PATH;
  return `${destinoBase}${query}`;
}

/**
 * Resolve `/servicos/tutoriais/<id>` ou `/servicos/tutoriais?tutorial=<id>`:
 * - se for um dos 4 tutoriais espelho, aponta direto em um único salto para
 *   `/servicos/requerimentos/<slug>#passo-a-passo` (com `utm_*` antes do `#`);
 * - se for outro tutorial válido (`isTutorialAutoatendimento`), aponta para `/servicos/tutoriais/<id>`;
 * - caso contrário, aponta para `/servicos/tutoriais`.
 */
export function resolverRedirectTutorial(
  tutorialId: string | null | undefined,
  search = '',
  isTutorialValido?: (id: string) => boolean,
): string {
  const query = limparQuery(search, PARAMS_FILTRO_TUTORIAIS);
  if (tutorialId && Object.hasOwn(TUTORIAIS_ESPELHO_REQUERIMENTO, tutorialId)) {
    const reqId = TUTORIAIS_ESPELHO_REQUERIMENTO[tutorialId];
    return `${REQUERIMENTOS_PATH}/${reqId}${query}${ABA_PASSO_A_PASSO_HASH}`;
  }
  if (tutorialId && isTutorialValido?.(tutorialId)) {
    return `${TUTORIAIS_PATH}/${tutorialId}${query}`;
  }
  return `${TUTORIAIS_PATH}${query}`;
}
