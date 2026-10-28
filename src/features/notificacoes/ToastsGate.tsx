import { lazy, Suspense, useEffect, useState } from 'react';
import { useEstadoNotificacoes } from './estado';
import { useFontesNotificacoes } from './fontes';
import { toastsBloqueados, toastsJaMostradosNaSessao } from './sinal';

// Chunk próprio, baixado só se houver o que mostrar e com a página já ociosa.
const NotificationToasts = lazy(() => import('./NotificationToasts'));

/** Espera mínima depois do carregamento: o LCP e a hidratação da página vêm primeiro. */
const ATRASO_MS = 1500;
const OCIOSO_TIMEOUT_MS = 2000;

/**
 * Decide se os toasts do carregamento aparecem: uma vez por sessão, ~1,5 s depois da carga
 * e com a página ociosa, só com não lidas nunca mostradas, sem painel do sino nem pop-up abertos.
 */
export default function ToastsGate() {
  const [fase, setFase] = useState<'esperando' | 'pronto' | 'fim'>('esperando');
  const [ids, setIds] = useState<string[] | null>(null);
  const fontes = useFontesNotificacoes(false);
  const estado = useEstadoNotificacoes();

  useEffect(() => {
    if (toastsJaMostradosNaSessao()) return;
    let ocioso = 0;
    let reserva = 0;
    const timer = window.setTimeout(() => {
      const quandoOcioso = () => setFase(toastsBloqueados() ? 'fim' : 'pronto');
      if (typeof window.requestIdleCallback === 'function') ocioso = window.requestIdleCallback(quandoOcioso, { timeout: OCIOSO_TIMEOUT_MS });
      else reserva = window.setTimeout(quandoOcioso, 200);
    }, ATRASO_MS);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(reserva);
      if (ocioso) window.cancelIdleCallback(ocioso);
    };
  }, []);

  // Retrato das candidatas assim que os eventos chegarem (sem eles, a fila mudaria no meio).
  if (fase === 'pronto' && ids === null && !fontes.carregando) {
    const vistas = new Set([...estado.lidas, ...estado.dispensadas, ...estado.mostradas]);
    const candidatas = fontes.ids.filter((id) => !vistas.has(id));
    setIds(candidatas);
    if (candidatas.length === 0) setFase('fim');
  }

  if (fase !== 'pronto' || !ids || ids.length === 0) return null;
  return (
    <Suspense fallback={null}>
      <NotificationToasts fontes={fontes} ids={ids} onFim={() => setFase('fim')} />
    </Suspense>
  );
}
