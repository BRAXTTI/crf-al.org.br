// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NotificationBanner from './NotificationBanner';
import { STORAGE_KEY } from './estado';
import { EVENTO_ABRIR_PAINEL, EVENTO_BANNER_FIM, definirPainelAberto } from './sinal';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const SAIDA_MS = 160;
const VISIVEL_MS = 8000;

let host: HTMLDivElement;
let root: Root;
let onFim: ReturnType<typeof vi.fn<() => void>>;

function montar(naoLidas = 3) {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(<NotificationBanner ids={['evento-1', 'novidade-a']} naoLidas={naoLidas} onFim={onFim} />));
}

const banner = () => document.querySelector<HTMLElement>('[data-notification-banner]')!;
const avancar = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });
const clicar = (seletor: string) => act(() => document.querySelector<HTMLElement>(seletor)!.click());

describe('NotificationBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    onFim = vi.fn<() => void>();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    act(() => root.unmount());
    definirPainelAberto(false);
    vi.useRealTimers();
  });

  it('avisa sem listar o conteúdo e anuncia de forma educada', () => {
    montar();
    expect(banner().textContent).toContain('Há novidades no site');
    expect(banner().textContent).toContain('Ver 3 não lidas');
    const vivo = document.querySelector('[aria-live="polite"]')!;
    expect(vivo.textContent).toBe('');
    avancar(200);
    expect(vivo.textContent).toContain('3 não lidas');
  });

  it('ao aparecer, marca as candidatas como avisadas', () => {
    montar();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).mostradas).toEqual(expect.arrayContaining(['evento-1', 'novidade-a']));
  });

  it('clicar pede a abertura do painel e o banner some', () => {
    const pedido = vi.fn();
    window.addEventListener(EVENTO_ABRIR_PAINEL, pedido);
    montar();
    clicar('[data-banner-open]');
    window.removeEventListener(EVENTO_ABRIR_PAINEL, pedido);
    expect(pedido).toHaveBeenCalledOnce();
    expect(banner().dataset.state).toBe('saindo');
    avancar(SAIDA_MS);
    expect(onFim).toHaveBeenCalledOnce();
  });

  it('o botão de fechar e o Esc encerram o banner', () => {
    const fim = vi.fn();
    window.addEventListener(EVENTO_BANNER_FIM, fim);
    montar();
    clicar('[data-banner-close]');
    avancar(SAIDA_MS);
    expect(onFim).toHaveBeenCalledOnce();
    expect(fim).toHaveBeenCalledOnce();
    window.removeEventListener(EVENTO_BANNER_FIM, fim);
    act(() => root.unmount());

    onFim = vi.fn<() => void>();
    montar();
    act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); });
    expect(banner().dataset.state).toBe('saindo');
  });

  it('fechado pelo teclado, o foco vai para o sino', () => {
    document.body.innerHTML = '<div data-notification-bell><button type="button" id="sino">Sino</button></div>';
    const sino = document.getElementById('sino')!;
    vi.spyOn(sino, 'getBoundingClientRect').mockReturnValue({ width: 44 } as DOMRect);
    montar();
    act(() => document.querySelector<HTMLElement>('[data-banner-close]')!.focus());
    clicar('[data-banner-close]');
    expect(document.activeElement).toBe(sino);
  });

  it('o painel aberto por outro caminho também o tira da tela', () => {
    montar();
    act(() => definirPainelAberto(true));
    expect(banner().dataset.state).toBe('saindo');
  });

  it('some sozinho, mas pausa enquanto há foco', () => {
    montar();
    act(() => document.querySelector<HTMLElement>('[data-banner-close]')!.focus());
    avancar(VISIVEL_MS * 2);
    expect(banner().dataset.state).toBe('visivel');
    act(() => document.querySelector<HTMLElement>('[data-banner-close]')!.blur());
    avancar(VISIVEL_MS);
    expect(banner().dataset.state).toBe('saindo');
  });

  it('rolar a página o tira do caminho', () => {
    montar();
    const rolar = (y: number) => act(() => {
      Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    rolar(40);
    expect(banner().dataset.state).toBe('visivel');
    rolar(120);
    expect(banner().dataset.state).toBe('saindo');
    rolar(0);
  });

  it('não aparece com um diálogo aberto', () => {
    document.body.innerHTML = '<div role="dialog"></div>';
    localStorage.removeItem(STORAGE_KEY);
    montar();
    expect(onFim).toHaveBeenCalledOnce();
  });
});
