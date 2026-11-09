import { useCallback, useSyncExternalStore } from 'react';

/**
 * Valores que só o navegador conhece (hora, localStorage, media queries) com o HTML pré-renderizado
 * no build (scripts/prerender.mjs). `useSyncExternalStore` entrega o valor "do servidor" no
 * pré-render e durante a hidratação, e o do navegador logo depois, sem divergência na hidratação.
 * Em render só no cliente (rotas sem pré-render), o valor do navegador vale desde o início.
 */

const semAssinatura = () => () => {};

/** false no pré-render e durante a hidratação; true depois (e desde o início fora da hidratação). */
export function useHydrated() {
  return useSyncExternalStore(semAssinatura, () => true, () => false);
}

const MINUTO_MS = 60_000;
/** Arredondado ao minuto: leituras seguidas no mesmo render devolvem o mesmo valor. */
const minutoAtual = () => Math.floor(Date.now() / MINUTO_MS) * MINUTO_MS;

/** Instante do pré-render: no build, o do render; no navegador, o gravado em #root (`data-prerender-at`). */
let instantePreRender: number | undefined;
export function definirInstantePreRender(instante: number | undefined) {
  instantePreRender = instante !== undefined && Number.isFinite(instante) ? instante : undefined;
}

function assinarRelogio(aoMudar: () => void) {
  const timer = setInterval(aoMudar, MINUTO_MS);
  return () => clearInterval(timer);
}

/** Agora (ms, ao minuto), atualizado a cada minuto; na hidratação, o instante do pré-render. */
export function useAgora() {
  return useSyncExternalStore(assinarRelogio, minutoAtual, () => instantePreRender ?? minutoAtual());
}

/** Media query; `valorNoServidor` vale no pré-render e na hidratação. */
export function useMediaQuery(query: string, valorNoServidor = false) {
  const assinar = useCallback((aoMudar: () => void) => {
    const mql = window.matchMedia(query);
    // Safari < 14 (e stubs de teste) não têm addEventListener no MediaQueryList.
    mql.addEventListener?.('change', aoMudar);
    return () => mql.removeEventListener?.('change', aoMudar);
  }, [query]);
  return useSyncExternalStore(assinar, () => window.matchMedia(query).matches, () => valorNoServidor);
}

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
