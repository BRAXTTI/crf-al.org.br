import type { LiveNotification } from '@/components/ui/live-notification-feed';
import { corporateMenu, individualMenu } from '@/data/requerimentos';
import { MODALIDADE_LABELS, formatarData, parseWPDateTime, rotuloContagem, type Evento } from '@/features/events/utils';
import { getPostCategory, stripHTML } from '@/services/wordpress/client';
import type { WPPost } from '@/services/wordpress/types';
import type { Novidade } from '@/config/novidades';
import { capaDaMidia, capaDoBanner } from './capas';
import { idEvento, idNoticia, idNovidade, type FontesNotificacoes } from './fontes';

/* Cards das notificações montados a partir das fontes: usados pelo painel do sino e pelos toasts. */

/** Cores por origem, todas tokens do site (dourado de texto em #8A6A12 para contraste AA). */
const ACCENT = {
  evento: '#0066cc',
  novidade: '#003366',
  servico: '#00875a',
  noticia: '#8A6A12',
} as const;
/** Seção do site exibida na faixa das novidades (pelo primeiro trecho da rota). */
const SECOES: Record<string, string> = {
  eventos: 'Eventos',
  servicos: 'Serviços',
  imprensa: 'Imprensa',
  instituicao: 'Institucional',
  fiscalizacao: 'Fiscalização',
  legislacao: 'Legislação',
};
const CATEGORIAS_GENERICAS = new Set(['Blog', 'Geral']);

const contarItens = (menu: typeof individualMenu) => menu.reduce((soma, categoria) => soma + categoria.items.length, 0);

/** "hoje", "ontem", "há 13 dias", "há 1 mês" — por dia de calendário. */
function haQuanto(data: string, agora: number) {
  const [ano, mes, dia] = data.slice(0, 10).split('-').map(Number);
  const hoje = new Date(agora);
  const dias = Math.round((Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()) - Date.UTC(ano, mes - 1, dia)) / 86_400_000);
  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
  if (dias < 30) return rtf.format(-Math.max(0, dias), 'day');
  if (dias < 365) return rtf.format(-Math.round(dias / 30), 'month');
  return rtf.format(-Math.round(dias / 365), 'year');
}

function resumir(texto: string, limite = 120) {
  if (texto.length <= limite) return texto;
  return `${texto.slice(0, limite).replace(/\s+\S*$/, '')}…`;
}

export interface Montado {
  item: LiveNotification;
  /** Ordem de chegada: quanto maior, mais acima no feed. */
  ordem: number;
}

function deEvento(evento: Evento): Montado {
  const hora = evento.data.slice(11, 16);
  const inicio = parseWPDateTime(evento.data) ?? 0;
  return {
    // Eventos ficam acima das novidades e notícias; o mais próximo, no topo.
    ordem: Number.MAX_SAFE_INTEGER - inicio,
    item: {
      kind: 'evento',
      id: idEvento(evento),
      app: 'Eventos',
      accent: ACCENT.evento,
      title: evento.titulo,
      body: evento.local || undefined,
      time: evento.status === 'em-andamento' ? 'Em andamento' : (rotuloContagem(evento.data) ?? formatarData(evento.data)),
      date: evento.data.slice(0, 10),
      tags: [hora && hora !== '00:00' ? hora.replace(':', 'h') : '', MODALIDADE_LABELS[evento.modalidade]].filter(Boolean),
      href: `/eventos/${evento.slug}`,
      image: capaDoBanner(evento.banner),
    },
  };
}

function deNovidade(novidade: Novidade, agora: number): Montado {
  const base = { id: idNovidade(novidade.id), title: novidade.titulo, body: novidade.resumo, time: haQuanto(novidade.data, agora), href: novidade.href };
  const ordem = Date.parse(`${novidade.data}T12:00:00-03:00`);
  if (novidade.tipo === 'servico') {
    const counts =
      novidade.contagem === 'requerimentos-por-perfil'
        ? [
            { label: 'para farmacêuticos', value: contarItens(individualMenu) },
            { label: 'para empresas', value: contarItens(corporateMenu) },
          ]
        : [];
    return { ordem, item: { ...base, kind: 'servico', app: 'Serviços', accent: ACCENT.servico, counts } };
  }
  const section = SECOES[novidade.href.split('/')[1] ?? ''];
  return { ordem, item: { ...base, kind: 'novidade', app: 'Novidade no site', accent: ACCENT.novidade, section } };
}

function deNoticia(post: WPPost, agora: number): Montado {
  const categoria = getPostCategory(post);
  return {
    ordem: Date.parse(post.date),
    item: {
      kind: 'noticia',
      id: idNoticia(post),
      app: 'Notícias',
      accent: ACCENT.noticia,
      title: stripHTML(post.title.rendered),
      body: resumir(stripHTML(post.excerpt.rendered)) || undefined,
      time: haQuanto(post.date, agora),
      image: capaDaMidia(post._embedded?.['wp:featuredmedia']?.[0]),
      category: CATEGORIAS_GENERICAS.has(categoria) ? undefined : categoria,
      date: formatarData(post.date),
      href: `/imprensa/noticias/${post.slug}`,
    },
  };
}

/** Todas as notificações das fontes, da mais antiga (início) para a mais nova (fim). */
export function montarNotificacoes(fontes: FontesNotificacoes, agora: number): Montado[] {
  return [
    ...fontes.novidades.map((novidade) => deNovidade(novidade, agora)),
    ...fontes.eventos.map(deEvento),
    ...fontes.noticias.map((post) => deNoticia(post, agora)),
  ].sort((a, b) => a.ordem - b.ordem);
}
