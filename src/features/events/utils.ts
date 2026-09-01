import type { ElementType } from 'react';
import { Building2, CheckCircle2, Clock, MapPin, Monitor, XCircle } from 'lucide-react';
import { stripHTML } from '@/services/wordpress/client';
import type { CRFEvent } from '@/services/wordpress/types';

export type StatusEvento = 'em-andamento' | 'em-breve' | 'encerrado' | 'cancelado';
export type ModalidadeEvento = 'presencial' | 'online' | 'hibrido';

export interface Evento {
  id: number;
  slug: string;
  titulo: string;
  descricao: string;
  data: string;
  dataFim?: string;
  local: string;
  modalidade: ModalidadeEvento;
  status: StatusEvento;
  publico?: string;
  link?: string;
  banner?: string | null;
}

export const STATUS_LABELS: Record<StatusEvento, string> = {
  'em-andamento': 'Em Andamento',
  'em-breve': 'Em Breve',
  encerrado: 'Encerrado',
  cancelado: 'Cancelado',
};

export const STATUS_COLORS: Record<StatusEvento, { bg: string; text: string; icon: ElementType }> = {
  'em-andamento': {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    icon: CheckCircle2,
  },
  'em-breve': {
    bg: 'bg-sky-50 dark:bg-sky-900/20',
    text: 'text-sky-700 dark:text-sky-300',
    icon: Clock,
  },
  encerrado: {
    bg: 'bg-crfal-gray-100 dark:bg-slate-800',
    text: 'text-crfal-gray-500 dark:text-slate-400',
    icon: CheckCircle2,
  },
  cancelado: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
    icon: XCircle,
  },
};

export const MODALIDADE_ICONS: Record<ModalidadeEvento, ElementType> = {
  presencial: Building2,
  online: Monitor,
  hibrido: MapPin,
};

export const MODALIDADE_LABELS: Record<ModalidadeEvento, string> = {
  presencial: 'Presencial',
  online: 'Online',
  hibrido: 'Híbrido',
};

/** Converte "YYYY-MM-DD HH:mm:ss" (hora local do WP, UTC-3) em timestamp; null se inválido. */
export function parseWPDateTime(valor?: string): number | null {
  if (!valor) return null;
  const ts = Date.parse(`${valor.trim().replace(' ', 'T')}-03:00`);
  return Number.isNaN(ts) ? null : ts;
}

/**
 * Normaliza o valor do campo "Modalidade" do WP Event Manager.
 * Aceita "presencial", "online", "híbrido" (com/sem acento) e listas separadas
 * por vírgula ou underscore — presencial + online combinados são tratados como híbrido.
 */
function derivarModalidade(bruto: string, online: boolean): ModalidadeEvento {
  const tokens = bruto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[,_]/)
    .map((token) => token.trim())
    .filter(Boolean);
  const presencial = tokens.includes('presencial');
  const onlineToken = tokens.includes('online');
  if (presencial && onlineToken) return 'hibrido';
  if (tokens.includes('hibrido')) return 'hibrido';
  if (onlineToken) return 'online';
  if (presencial) return 'presencial';
  return online ? 'online' : 'presencial';
}

/** Deriva o status exibido a partir do cancelamento, do status do WP e das datas. */
function derivarStatus(
  evento: Pick<CRFEvent, 'cancelled' | 'status'>,
  inicio: number | null,
  fim: number | null
): StatusEvento {
  if (evento.cancelled) return 'cancelado';
  if (evento.status === 'expired') return 'encerrado';
  const agora = Date.now();
  if (inicio !== null && agora < inicio) return 'em-breve';
  if (fim !== null && agora <= fim) return 'em-andamento';
  if (inicio !== null) return 'encerrado';
  return 'em-breve';
}

/** Mapeia um evento da API para o modelo de exibição da listagem/detalhe. */
export function mapEvent(evento: CRFEvent): Evento {
  const inicio = parseWPDateTime(evento.startDate);
  const fim = parseWPDateTime(evento.endDate);
  const modalidade = derivarModalidade(evento.modalidade, evento.online);
  const multiDia =
    Boolean(evento.startDate) &&
    Boolean(evento.endDate) &&
    evento.endDate.slice(0, 10) !== evento.startDate.slice(0, 10);

  return {
    id: evento.id,
    slug: evento.slug,
    titulo: stripHTML(evento.title) || 'Evento',
    descricao: stripHTML(evento.excerpt),
    data: evento.startDate,
    dataFim: multiDia ? evento.endDate : undefined,
    local: stripHTML(evento.location) || (modalidade === 'online' ? 'Evento Online' : ''),
    modalidade,
    status: derivarStatus(evento, inicio, fim),
    publico: stripHTML(evento.publico) || undefined,
    link: evento.registrationUrl || undefined,
    banner: evento.banner,
  };
}

/** Formata "YYYY-MM-DD[ HH:mm:ss]" como intervalo de datas ("7 a 10 de set de 2026"). */
export function formatarData(data: string, dataFim?: string): string {
  const partes = (valor: string) => {
    const [ano, mes, dia] = valor.slice(0, 10).split('-').map(Number);
    const nomeMes = new Date(Date.UTC(ano, mes - 1, dia))
      .toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' })
      .replace('.', '');
    return { dia, mes: nomeMes, ano };
  };

  const inicio = partes(data);
  if (!dataFim) return `${inicio.dia} de ${inicio.mes} de ${inicio.ano}`;

  const fim = partes(dataFim);
  if (inicio.ano === fim.ano) {
    if (inicio.mes === fim.mes) return `${inicio.dia} a ${fim.dia} de ${inicio.mes} de ${inicio.ano}`;
    return `${inicio.dia} de ${inicio.mes} a ${fim.dia} de ${fim.mes} de ${inicio.ano}`;
  }
  return `${inicio.dia} de ${inicio.mes} de ${inicio.ano} a ${fim.dia} de ${fim.mes} de ${fim.ano}`;
}

/** Formata "YYYY-MM-DD HH:mm:ss" como "7 de set de 2026 · 09:00". */
export function formatarDataHora(valor: string): string {
  const data = formatarData(valor);
  const hora = valor.slice(11, 16);
  return hora ? `${data} · ${hora}` : data;
}
