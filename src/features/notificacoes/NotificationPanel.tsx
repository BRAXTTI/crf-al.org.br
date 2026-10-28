import { useEffect, useMemo, useState } from 'react';
import { LiveNotificationFeed, type LiveNotification } from '@/components/ui/live-notification-feed';
import { SITE_URL } from '@/config/site';
import { corporateMenu, individualMenu } from '@/data/requerimentos';
import { MODALIDADE_LABELS, formatarData, parseWPDateTime, rotuloContagem, type Evento } from '@/features/events/utils';
import { getPostCategory, getPostImageSet, stripHTML } from '@/services/wordpress/client';
import type { WPPost } from '@/services/wordpress/types';
import type { Novidade } from '@/config/novidades';
import { dispensar, marcarLidas, marcarVistas, type EstadoNotificacoes } from './estado';
import { idEvento, idNoticia, idNovidade, type FontesNotificacoes } from './fontes';

/** Cores por origem, todas tokens do site (dourado de texto em #8A6A12 para contraste AA). */
const ACCENT = {
  evento: '#0066cc',
  novidade: '#003366',
  servico: '#00875a',
  noticia: '#8A6A12',
} as const;
/** Novas desde a última visita: no máximo três chegam animadas, uma a uma. */
const MAX_CHEGADAS = 3;
const PRIMEIRA_CHEGADA_MS = 450;
const INTERVALO_CHEGADA_MS = 900;
const HOST = new URL(SITE_URL).host;
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

interface Montado {
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
  return { ordem, item: { ...base, kind: 'novidade', app: 'Novidade no site', accent: ACCENT.novidade, host: HOST, path: novidade.href } };
}

function deNoticia(post: WPPost, agora: number): Montado {
  const categoria = getPostCategory(post);
  const imagem = getPostImageSet(post);
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
      image: imagem ? { src: imagem.src, srcSet: imagem.srcSet } : undefined,
      category: CATEGORIAS_GENERICAS.has(categoria) ? undefined : categoria,
      date: formatarData(post.date),
      href: `/imprensa/noticias/${post.slug}`,
    },
  };
}

export interface NotificationPanelProps {
  fontes: FontesNotificacoes;
  estado: EstadoNotificacoes;
  onNavigate: (href: string) => void;
}

export default function NotificationPanel({ fontes, estado, onNavigate }: NotificationPanelProps) {
  // Retrato do estado na abertura: dispensadas somem só na próxima abertura (a saída
  // é animada pelo feed) e as não vistas são as que chegam com animação agora.
  const [abertura] = useState(() => ({ agora: Date.now(), dispensadas: new Set(estado.dispensadas), vistas: new Set(estado.vistas) }));
  const [chegadas, setChegadas] = useState<string[]>([]);

  const montados = useMemo(
    () =>
      [
        ...fontes.novidades.map((novidade) => deNovidade(novidade, abertura.agora)),
        ...fontes.eventos.map(deEvento),
        ...fontes.noticias.map((post) => deNoticia(post, abertura.agora)),
      ]
        .filter(({ item }) => !abertura.dispensadas.has(item.id))
        .sort((a, b) => a.ordem - b.ordem),
    [fontes, abertura],
  );

  // Fila de chegada: as não vistas mais recentes (até três), da mais antiga para a mais nova.
  const fila = useMemo(
    () => montados.filter(({ item }) => !abertura.vistas.has(item.id)).slice(-MAX_CHEGADAS).map(({ item }) => item.id),
    [montados, abertura],
  );
  const proxima = fila.find((id) => !chegadas.includes(id));

  useEffect(() => {
    if (!proxima) return;
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const espera = reduzido ? 0 : chegadas.length === 0 ? PRIMEIRA_CHEGADA_MS : INTERVALO_CHEGADA_MS;
    const timer = window.setTimeout(() => setChegadas((anteriores) => [...anteriores, proxima]), espera);
    return () => window.clearTimeout(timer);
  }, [proxima, chegadas.length]);

  const ids = useMemo(() => montados.map(({ item }) => item.id), [montados]);
  useEffect(() => marcarVistas(ids), [ids]);

  const lidas = useMemo(() => new Set(estado.lidas), [estado.lidas]);
  const items = useMemo(() => {
    const naFila = new Set([...fila, ...chegadas]);
    const porId = new Map(montados.map(({ item }) => [item.id, item]));
    const visiveis = new Set([...montados.filter(({ item }) => !naFila.has(item.id)).map(({ item }) => item.id), ...chegadas]);
    return montados.filter(({ item }) => visiveis.has(item.id) && porId.has(item.id)).map(({ item }) => ({ ...item, read: lidas.has(item.id) }));
  }, [montados, fila, chegadas, lidas]);

  return (
    <LiveNotificationFeed
      items={items}
      onOpen={(id) => marcarLidas([id])}
      onReadAll={marcarLidas}
      onDismiss={(id) => dispensar([id])}
      onClear={dispensar}
      onNavigate={(href) => onNavigate(href)}
    />
  );
}
