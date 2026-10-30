// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NotificationPanel from './NotificationPanel';
import type { EstadoNotificacoes } from './estado';
import { STORAGE_KEY } from './estado';
import type { FontesNotificacoes } from './fontes';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const ESTADO: EstadoNotificacoes = { lidas: [], dispensadas: [], vistas: [], mostradas: [] };
const novidades = ['a', 'b', 'c', 'd', 'e'].map((id, indice) => ({
  id,
  tipo: 'novidade' as const,
  data: `2026-10-0${indice + 1}`,
  titulo: `Novidade ${id}`,
  resumo: 'Resumo',
  href: '/eventos',
}));
const fontes = { eventos: [], noticias: [], novidades, ids: novidades.map(({ id }) => `novidade-${id}`), carregando: false } as FontesNotificacoes;

let root: Root;
const contador = () => document.querySelector('[data-count]')!.textContent;
const cards = () => document.querySelectorAll('[data-notification]').length;

function montar(estado: EstadoNotificacoes) {
  const host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(<NotificationPanel fontes={fontes} estado={estado} onNavigate={() => {}} />));
}

describe('NotificationPanel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.removeItem(STORAGE_KEY);
    window.matchMedia = (() => ({ matches: false, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
    Element.prototype.animate = (() => ({ cancel() {} })) as unknown as typeof Element.prototype.animate;
  });

  afterEach(() => {
    act(() => root.unmount());
    vi.useRealTimers();
  });

  it('abre com o mesmo número do sino, antes de os cards da fila chegarem', () => {
    montar(ESTADO);
    expect(cards()).toBe(2);
    expect(contador()).toBe('5');
    for (const espera of [450, 900, 900]) act(() => { vi.advanceTimersByTime(espera); });
    expect(cards()).toBe(5);
    expect(contador()).toBe('5');
  });

  it('desconta o que já foi lido ou dispensado', () => {
    montar({ ...ESTADO, lidas: ['novidade-a'], dispensadas: ['novidade-b'] });
    expect(contador()).toBe('3');
  });

  it('"Marcar lidas" inclui os cards que ainda estão na fila', () => {
    montar(ESTADO);
    act(() => document.querySelector<HTMLElement>('[data-read-all]')!.click());
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).lidas).toHaveLength(5);
  });
});
