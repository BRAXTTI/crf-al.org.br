import { useSyncExternalStore } from 'react';

/**
 * Estado das notificações guardado só no navegador (`localStorage`, com try/catch):
 * quais foram lidas, quais foram dispensadas e quais o visitante já viu chegar
 * (as não vistas "chegam" com animação na próxima abertura do painel) e quais já
 * foram avisadas pelo banner de novidades (não voltam a acionar o banner).
 * O sino e o painel leem a mesma fonte; outras abas acompanham pelo evento `storage`.
 */
export const STORAGE_KEY = 'crfal:notificacoes';
/** Limite por lista: ids antigos (eventos encerrados, novidades retiradas) saem primeiro. */
const MAX_IDS = 200;

export interface EstadoNotificacoes {
  lidas: string[];
  dispensadas: string[];
  vistas: string[];
  /** Já avisadas pelo banner de novidades. */
  mostradas: string[];
}

const VAZIO: EstadoNotificacoes = { lidas: [], dispensadas: [], vistas: [], mostradas: [] };
const listeners = new Set<() => void>();
let atual: EstadoNotificacoes | null = null;

const lista = (valor: unknown) => (Array.isArray(valor) ? valor.filter((id): id is string => typeof id === 'string') : []);

function ler(): EstadoNotificacoes {
  try {
    const bruto = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<EstadoNotificacoes> | null;
    if (!bruto || typeof bruto !== 'object') return VAZIO;
    return { lidas: lista(bruto.lidas), dispensadas: lista(bruto.dispensadas), vistas: lista(bruto.vistas), mostradas: lista(bruto.mostradas) };
  } catch {
    return VAZIO;
  }
}

function snapshot() {
  atual ??= ler();
  return atual;
}

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    atual = ler();
    listener();
  };
  listeners.add(listener);
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function acrescentar(campo: keyof EstadoNotificacoes, ids: string[]) {
  const anterior = snapshot();
  const novos = [...new Set(ids)].filter((id) => !anterior[campo].includes(id));
  if (novos.length === 0) return;
  atual = { ...anterior, [campo]: [...anterior[campo], ...novos].slice(-MAX_IDS) };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(atual));
  } catch {
    /* armazenamento indisponível: vale só nesta visita */
  }
  listeners.forEach((listener) => listener());
}

export const marcarLidas = (ids: string[]) => acrescentar('lidas', ids);
export const dispensar = (ids: string[]) => acrescentar('dispensadas', ids);
export const marcarVistas = (ids: string[]) => acrescentar('vistas', ids);
export const marcarMostradas = (ids: string[]) => acrescentar('mostradas', ids);

/** Não lidas e não dispensadas: o número do sino e do banner. */
export function contarNaoLidas(ids: string[], estado: EstadoNotificacoes) {
  const fora = new Set([...estado.lidas, ...estado.dispensadas]);
  return ids.filter((id) => !fora.has(id)).length;
}

/** O que ainda justifica o banner: nem lido, nem dispensado, nem visto no painel, nem já avisado. */
export function candidatasDoBanner(ids: string[], estado: EstadoNotificacoes) {
  const fora = new Set([...estado.lidas, ...estado.dispensadas, ...estado.vistas, ...estado.mostradas]);
  return ids.filter((id) => !fora.has(id));
}

export function useEstadoNotificacoes(): EstadoNotificacoes {
  return useSyncExternalStore(subscribe, snapshot, () => VAZIO);
}
