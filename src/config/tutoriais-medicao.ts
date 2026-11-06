/**
 * Contador anônimo de uso dos tutoriais: regras compartilhadas pelo navegador
 * (`src/lib/medir.ts`) e pela Function (`functions/api/evento.ts`). Só contagens
 * por evento, tarefa e passo; nada aqui identifica quem usa o site.
 */
export const EVENTOS = ['abrir', 'video_inicio', 'video_75', 'passo', 'acao', 'util_sim', 'util_nao', 'ajuda', 'contato', 'busca_vazia'] as const;
export type EventoTutorial = (typeof EVENTOS)[number];

/** Ids aceitos em `tarefa`; um teste confere a lista com `src/data/servicos.ts`. */
export const TAREFAS = [
  'primeira-inscricao',
  'inscricao-definitiva',
  'alteracao-de-dados',
  'contratacao-rt',
  'baixa-rt',
  'afastamento-provisorio',
  'justificativa-de-ausencia',
  'defesa-auto-infracao',
  'situacao-protocolos',
  'emitir-boletos',
  'imprimir-crt',
  // Vídeos de orientação, sem passo a passo.
  'sncr',
  'crf-em-casa',
] as const;

const TERMO_MAX = 40;
const PASSO_MAX = 30;
/** Eventos que não pertencem a uma tarefa específica. */
const SEM_TAREFA: readonly string[] = ['contato', 'busca_vazia'];

export interface EventoValido {
  evento: EventoTutorial;
  tarefa?: string;
  passo?: number;
  termo?: string;
}

/**
 * Termo de busca sem resultado, normalizado. Descarta o que pode ser dado pessoal
 * ou texto livre: dígitos (CPF, inscrição, telefone), e-mail e termos longos.
 */
export function limparTermo(termo: unknown): string {
  if (typeof termo !== 'string') return '';
  const limpo = termo.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim().replace(/\s+/g, ' ');
  return limpo.length <= TERMO_MAX && /^[a-z -]+$/.test(limpo) ? limpo : '';
}

/** Lista fechada: devolve só os campos conhecidos, ou `null` se o evento não for aceito. */
export function validarEvento(dados: unknown): EventoValido | null {
  if (typeof dados !== 'object' || dados === null) return null;
  const { evento, tarefa, passo, termo } = dados as Record<string, unknown>;
  if (!(EVENTOS as readonly unknown[]).includes(evento)) return null;
  const valido: EventoValido = { evento: evento as EventoTutorial };

  if (tarefa !== undefined || !SEM_TAREFA.includes(valido.evento)) {
    if (!(TAREFAS as readonly unknown[]).includes(tarefa)) return null;
    valido.tarefa = tarefa as string;
  }
  if (valido.evento === 'passo') {
    if (!Number.isInteger(passo) || (passo as number) < 1 || (passo as number) > PASSO_MAX) return null;
    valido.passo = passo as number;
  }
  if (valido.evento === 'busca_vazia') valido.termo = limparTermo(termo);
  return valido;
}
