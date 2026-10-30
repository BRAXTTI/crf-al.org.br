import { useSyncExternalStore } from 'react';

/**
 * Sinais entre o sino e o banner de novidades (só nesta aba, sem armazenamento): se o painel
 * está aberto e os avisos de novidade, de pedido de abertura e de fim do banner.
 */
export interface SinalNotificacoes {
  painelAberto: boolean;
}

/** `sessionStorage`: o banner aparece uma vez por sessão do navegador. */
const SESSAO_BANNER = 'crfal:notificacoes:banner';

/** Disparado em `window` quando o banner aparece (o sino balança uma vez). */
export const EVENTO_NOVIDADE = 'crfal:notificacoes:novidade';
/** Disparado em `window` para o sino visível abrir o painel. */
export const EVENTO_ABRIR_PAINEL = 'crfal:notificacoes:abrir-painel';
/** Disparado em `window` quando o banner termina (o pop-up pode abrir). */
export const EVENTO_BANNER_FIM = 'crfal:notificacoes:banner-fim';

let atual: SinalNotificacoes = { painelAberto: false };
const listeners = new Set<() => void>();

function publicar(proximo: Partial<SinalNotificacoes>) {
  atual = { ...atual, ...proximo };
  listeners.forEach((listener) => listener());
}

export const lerSinal = () => atual;
export function definirPainelAberto(painelAberto: boolean) {
  if (atual.painelAberto !== painelAberto) publicar({ painelAberto });
}
export const abrirPainel = () => window.dispatchEvent(new Event(EVENTO_ABRIR_PAINEL));

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSinalNotificacoes() {
  return useSyncExternalStore(subscribe, lerSinal, lerSinal);
}

/** Inscrição fora do React (o banner some quando o painel abre). */
export const observarSinal = (listener: () => void) => subscribe(listener);

/** Painel do sino, menu do celular, outro diálogo ou pop-up abertos: o banner não aparece. */
export function bannerBloqueado() {
  return atual.painelAberto || Boolean(document.querySelector('[data-site-popup], [role="dialog"]'));
}

export function bannerJaMostradoNaSessao() {
  try {
    return window.sessionStorage.getItem(SESSAO_BANNER) !== null;
  } catch {
    return true;
  }
}

export function marcarSessaoBanner() {
  try {
    window.sessionStorage.setItem(SESSAO_BANNER, String(Date.now()));
  } catch {
    /* sem sessionStorage: vale só nesta visita */
  }
}
