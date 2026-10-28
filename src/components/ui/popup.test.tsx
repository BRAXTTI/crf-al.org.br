// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Popup from './popup';
import type { Popup as PopupData } from '@/data/popups';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const teste: PopupData = { id: 'teste', image: '/x.webp', alt: 'Popup de teste', href: '/', ate: '2026-10-30' };

let host: HTMLDivElement;
let root: Root;

function montar(popup?: PopupData) {
  document.body.innerHTML = `
    <header><button type="button" aria-expanded="false" id="menu">Abrir menu</button><a href="/" id="logo">CRF-AL</a></header>
    <main><p id="texto">Texto</p><button type="button" id="botao">Ação</button><a href="/servicos/ouvidoria" id="link">Link</a><div role="button" id="falso">Falso</div></main>
    <div data-notification-bell><button type="button" aria-expanded="false" id="sino">Notificações</button></div>`;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(<MemoryRouter><Popup popup={popup} /></MemoryRouter>));
}

const aberto = () => Boolean(document.querySelector('[data-site-popup]'));
const avancar = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });
const tocar = (id: string) => act(() => {
  document.getElementById(id)!.dispatchEvent(new Event('pointerdown', { bubbles: true }));
});
const rolar = (id = 'texto') => act(() => {
  document.getElementById(id)!.dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 120 }));
});

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date', 'performance'] });
  vi.setSystemTime(new Date('2026-10-28T10:00:00-03:00'));
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  act(() => root.unmount());
  vi.useRealTimers();
});

describe('gatilho do popup', () => {
  it('não abre sem interação, mesmo depois do delay', () => {
    montar(teste);
    avancar(10_000);
    expect(aberto()).toBe(false);
  });

  it('rolagem abre depois do delay e de ~1,5 s de calma', () => {
    montar(teste);
    avancar(3000);
    rolar();
    avancar(1400);
    expect(aberto()).toBe(false);
    avancar(200);
    expect(aberto()).toBe(true);
  });

  it('rolagem antes do delay abre ao fim do delay', () => {
    montar(teste);
    rolar();
    avancar(2999);
    expect(aberto()).toBe(false);
    avancar(1);
    expect(aberto()).toBe(true);
  });

  it('toque em botão, link, [role=button] ou no cabeçalho não abre', () => {
    montar(teste);
    avancar(3000);
    // Confere a cada toque: um toque fora fecharia um popup aberto pelo anterior.
    for (const id of ['botao', 'link', 'falso', 'menu', 'logo']) {
      tocar(id);
      avancar(2000);
      expect(aberto(), id).toBe(false);
    }
    act(() => {
      document.getElementById('link')!.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
    });
    avancar(5000);
    expect(aberto()).toBe(false);
  });

  it('rolagem sobre o cabeçalho não conta', () => {
    montar(teste);
    avancar(3000);
    rolar('menu');
    avancar(5000);
    expect(aberto()).toBe(false);
  });

  it('toque num controle depois da rolagem cancela a abertura até nova interação neutra', () => {
    montar(teste);
    avancar(3000);
    rolar();
    avancar(1000);
    tocar('botao');
    avancar(10_000);
    expect(aberto()).toBe(false);
    rolar();
    avancar(1600);
    expect(aberto()).toBe(true);
  });

  it('rolar, tocar num link e esperar 1,5 s não abre', () => {
    montar(teste);
    avancar(3000);
    rolar();
    tocar('link');
    avancar(1500);
    expect(aberto()).toBe(false);
    avancar(10_000);
    expect(aberto()).toBe(false);
  });

  it('rolagem antes do delay seguida de toque num link não abre ao fim do delay', () => {
    montar(teste);
    rolar();
    avancar(1000);
    tocar('link');
    avancar(10_000);
    expect(aberto()).toBe(false);
  });

  it('abrir e fechar o sino não abre o popup', () => {
    montar(teste);
    const sino = document.getElementById('sino')!;
    avancar(3000);
    rolar();
    avancar(500);
    tocar('sino');
    act(() => sino.setAttribute('aria-expanded', 'true'));
    avancar(2000);
    expect(aberto()).toBe(false);
    tocar('sino');
    act(() => sino.setAttribute('aria-expanded', 'false'));
    avancar(10_000);
    expect(aberto()).toBe(false);
  });

  it('não abre com o menu aberto; abre depois que ele fecha', () => {
    montar(teste);
    const menu = document.getElementById('menu')!;
    act(() => menu.setAttribute('aria-expanded', 'true'));
    avancar(3000);
    rolar();
    avancar(5000);
    expect(aberto()).toBe(false);
    tocar('menu');
    act(() => menu.setAttribute('aria-expanded', 'false'));
    avancar(5000);
    expect(aberto()).toBe(false);
    rolar();
    avancar(1600);
    expect(aberto()).toBe(true);
  });

  it('popup vencido (31/10 em Maceió) não aparece', () => {
    vi.setSystemTime(new Date('2026-10-31T00:00:00-03:00'));
    montar(teste);
    avancar(3000);
    rolar();
    avancar(5000);
    expect(aberto()).toBe(false);
  });

  it('ainda aparece em 30/10 23:59 em Maceió', () => {
    vi.setSystemTime(new Date('2026-10-30T23:59:00-03:00'));
    montar(teste);
    rolar();
    avancar(3000);
    expect(aberto()).toBe(true);
  });

  it('aberto quando o prazo vence, fecha sozinho às 00:00 de 31/10 em Maceió', () => {
    vi.setSystemTime(new Date('2026-10-30T23:58:00-03:00'));
    montar(teste);
    rolar();
    avancar(3000);
    expect(aberto()).toBe(true);
    // 23:58:03 → 23:59:59.999: ainda aberto.
    avancar(116_999);
    expect(aberto()).toBe(true);
    avancar(1);
    expect(aberto()).toBe(false);
    // Não volta a abrir com novas interações depois do vencimento.
    rolar();
    avancar(5000);
    expect(aberto()).toBe(false);
  });

  it('fecha no vencimento mesmo se o relógio pular (checagem periódica)', () => {
    vi.setSystemTime(new Date('2026-10-30T23:00:00-03:00'));
    montar(teste);
    rolar();
    avancar(3000);
    expect(aberto()).toBe(true);
    // O relógio do sistema salta para depois do prazo sem os timers correrem (aba suspensa).
    vi.setSystemTime(new Date('2026-10-31T00:30:00-03:00'));
    avancar(60_000);
    expect(aberto()).toBe(false);
  });
});
