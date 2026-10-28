/**
 * Novidades do site exibidas nas notificações do cabeçalho (sino).
 *
 * Só entram páginas e recursos que existem de verdade no site, com a data em que
 * foram publicados (a do commit que os colocou no ar). Manter poucas entradas e
 * retirar as antigas: cada `id` novo aparece como não lido para todos os visitantes.
 * Eventos e notícias não vêm daqui: chegam do WordPress (/api/events e /api/news).
 */
export interface Novidade {
  /** Identificador estável: guardado no navegador para lembrar lidas e dispensadas. */
  id: string;
  /** `novidade`: página nova ou renovada. `servico`: serviço ou requerimento. */
  tipo: 'novidade' | 'servico';
  /** Data de publicação, `YYYY-MM-DD`. */
  data: string;
  titulo: string;
  resumo: string;
  /** Rota interna publicada (conferida por `scripts/check-links.mjs`). */
  href: string;
  /** Serviços: contagem exibida no detalhe, calculada dos dados do site. */
  contagem?: 'requerimentos-por-perfil';
}

export const NOVIDADES: Novidade[] = [
  {
    id: 'agenda-eventos-ics',
    tipo: 'novidade',
    data: '2026-10-26',
    titulo: 'Agenda de eventos no seu calendário',
    resumo: 'Baixe os eventos do CRF-AL em .ics e acompanhe pelo calendário do celular ou do computador.',
    href: '/eventos',
  },
  {
    id: 'requerimentos-pre-inscricao',
    tipo: 'servico',
    data: '2026-10-19',
    titulo: 'Pré-inscrição direta nos Requerimentos',
    resumo: 'Primeira Inscrição e Registro Inicial de empresas levam direto à pré-inscrição no CRF AL em Casa.',
    href: '/servicos/requerimentos',
    contagem: 'requerimentos-por-perfil',
  },
  {
    id: 'manual-crf-em-casa',
    tipo: 'novidade',
    data: '2026-10-14',
    titulo: 'Manual de uso do CRF AL em Casa',
    resumo: 'Demonstrações curtas de como acessar o sistema, enviar documentos e acompanhar solicitações.',
    href: '/servicos/manual-crf-em-casa',
  },
  {
    id: 'publicacoes-cff',
    tipo: 'novidade',
    data: '2026-10-14',
    titulo: 'Publicações do CFF',
    resumo: 'Revistas, guias, notas técnicas e relatórios do Conselho Federal, com o PDF oficial.',
    href: '/imprensa/publicacoes-cff',
  },
];
