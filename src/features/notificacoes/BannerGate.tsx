import { useCallback, useEffect, useState } from 'react';
import { candidatasDoBanner, contarNaoLidas, useEstadoNotificacoes } from './estado';
import { useFontesNotificacoes } from './fontes';
import NotificationBanner from './NotificationBanner';
import { bannerBloqueado, bannerJaMostradoNaSessao } from './sinal';

/** Espera mínima depois do carregamento: o LCP e a hidratação da página vêm primeiro. */
const ATRASO_MS = 1500;
const OCIOSO_TIMEOUT_MS = 2000;

/**
 * Decide se o banner de novidades aparece: uma vez por sessão, ~1,5 s depois da carga e com
 * a página ociosa, só se houver não lidas ainda não vistas no painel nem avisadas, e sem
 * painel, menu ou pop-up abertos.
 */
export default function BannerGate() {
  const [fase, setFase] = useState<'esperando' | 'pronto' | 'fim'>('esperando');
  const [ids, setIds] = useState<string[] | null>(null);
  const fontes = useFontesNotificacoes(false);
  const estado = useEstadoNotificacoes();
  const terminar = useCallback(() => setFase('fim'), []);

  useEffect(() => {
    if (bannerJaMostradoNaSessao()) return;
    let ocioso = 0;
    let reserva = 0;
    const timer = window.setTimeout(() => {
      const quandoOcioso = () => setFase(bannerBloqueado() ? 'fim' : 'pronto');
      if (typeof window.requestIdleCallback === 'function') ocioso = window.requestIdleCallback(quandoOcioso, { timeout: OCIOSO_TIMEOUT_MS });
      else reserva = window.setTimeout(quandoOcioso, 200);
    }, ATRASO_MS);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(reserva);
      if (ocioso) window.cancelIdleCallback(ocioso);
    };
  }, []);

  // Retrato das candidatas quando os eventos chegarem: aparecer já as marca como avisadas.
  if (fase === 'pronto' && ids === null && !fontes.carregando) {
    const candidatas = candidatasDoBanner(fontes.ids, estado);
    setIds(candidatas);
    if (candidatas.length === 0) setFase('fim');
  }

  if (fase !== 'pronto' || !ids || ids.length === 0) return null;
  return <NotificationBanner ids={ids} naoLidas={contarNaoLidas(fontes.ids, estado)} onFim={terminar} />;
}
