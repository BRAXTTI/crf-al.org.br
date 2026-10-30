import { useEffect, useMemo, useState } from 'react';
import { LiveNotificationFeed } from '@/components/ui/live-notification-feed';
import { contarNaoLidas, dispensar, marcarLidas, marcarVistas, type EstadoNotificacoes } from './estado';
import type { FontesNotificacoes } from './fontes';
import { montarNotificacoes } from './montar';

/** Novas desde a última visita: no máximo três chegam animadas, uma a uma. */
const MAX_CHEGADAS = 3;
const PRIMEIRA_CHEGADA_MS = 450;
const INTERVALO_CHEGADA_MS = 900;

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
    () => montarNotificacoes(fontes, abertura.agora).filter(({ item }) => !abertura.dispensadas.has(item.id)),
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
      // Mesmo número do sino e do banner desde a abertura, mesmo com cards ainda na fila de chegada.
      unreadCount={contarNaoLidas(fontes.ids, estado)}
      onOpen={(id) => marcarLidas([id])}
      // "Todas" inclui as que ainda estão na fila: o contador já as conta.
      onReadAll={() => marcarLidas(ids)}
      onDismiss={(id) => dispensar([id])}
      onClear={dispensar}
      onNavigate={(href) => onNavigate(href)}
    />
  );
}
