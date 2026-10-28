import { useSyncExternalStore } from 'react';

/**
 * Sinais entre o sino e os toasts (só nesta aba, sem armazenamento): se o painel está
 * aberto, quais toasts ainda estão "voando" (o contador do sino só os conta ao chegarem)
 * e o aviso de chegada que dispara o "bump" do sino. Fica no chunk principal: é minúsculo.
 */
export interface SinalNotificacoes {
  painelAberto: boolean;
  emTransito: readonly string[];
}

/** No máximo três toasts: as mais recentes entre as candidatas. */
export const MAX_TOASTS = 3;
/** `sessionStorage`: os toasts aparecem uma vez por sessão do navegador. */
const SESSAO_TOASTS = 'crfal:notificacoes:toasts';

/** Disparado em `window` quando os toasts chegam ao sino (o sino faz o "bump"). */
export const EVENTO_CHEGADA = 'crfal:notificacoes:chegada';
/** Disparado em `window` quando os toasts terminam (o pop-up pode abrir). */
export const EVENTO_TOASTS_FIM = 'crfal:notificacoes:toasts-fim';

let atual: SinalNotificacoes = { painelAberto: false, emTransito: [] };
const listeners = new Set<() => void>();

function publicar(proximo: Partial<SinalNotificacoes>) {
  atual = { ...atual, ...proximo };
  listeners.forEach((listener) => listener());
}

export const lerSinal = () => atual;
export function definirPainelAberto(painelAberto: boolean) {
  if (atual.painelAberto !== painelAberto) publicar({ painelAberto });
}
export const definirEmTransito = (emTransito: readonly string[]) => publicar({ emTransito });

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSinalNotificacoes() {
  return useSyncExternalStore(subscribe, lerSinal, lerSinal);
}

/** Inscrição fora do React (os toasts reagem ao painel abrir no meio da animação). */
export const observarSinal = (listener: () => void) => subscribe(listener);

/** Pop-up do site aberto ou painel do sino aberto: os toasts não aparecem. */
export function toastsBloqueados() {
  return atual.painelAberto || Boolean(document.querySelector('[data-site-popup]'));
}

export function toastsJaMostradosNaSessao() {
  try {
    return window.sessionStorage.getItem(SESSAO_TOASTS) !== null;
  } catch {
    return true;
  }
}

export function marcarSessaoToasts() {
  try {
    window.sessionStorage.setItem(SESSAO_TOASTS, String(Date.now()));
  } catch {
    /* sem sessionStorage: vale só nesta visita */
  }
}
