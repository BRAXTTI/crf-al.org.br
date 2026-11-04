// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Abas, { type ItemAba } from './abas';

let root: Root;
let host: HTMLElement;

const ABAS_EXEMPLO: readonly ItemAba<'para-que-serve' | 'passo-a-passo' | 'formulario'>[] = [
  {
    id: 'para-que-serve',
    rotulo: 'Para que serve',
    conteudo: <p>Conteúdo para que serve</p>,
  },
  {
    id: 'passo-a-passo',
    rotulo: 'Passo a passo',
    conteudo: <p>Conteúdo passo a passo</p>,
  },
  {
    id: 'formulario',
    rotulo: 'Formulário e documentos',
    contador: 3,
    conteudo: <p>Conteúdo formulário e documentos</p>,
  },
];

function renderizar(initialEntry = '/servicos/requerimentos/defesa-auto-infracao') {
  const url = new URL(initialEntry, 'https://crf-al.org.br');
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  act(() => {
    root.render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Abas ariaLabel="Seções do requerimento" abas={ABAS_EXEMPLO} />
      </MemoryRouter>,
    );
  });
}

beforeEach(() => {
  (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.body.appendChild(document.createElement('div'));
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  window.history.replaceState(null, '', '/');
  vi.restoreAllMocks();
});

describe('Abas (WAI-ARIA, teclado e hash)', () => {
  it('renderiza tablist, 3 tabs e 3 tabpanels no HTML com hidden nos inativos e roving tabindex', () => {
    renderizar();

    const tablist = host.querySelector('[role="tablist"]');
    expect(tablist).not.toBeNull();
    expect(tablist?.getAttribute('aria-label')).toBe('Seções do requerimento');

    const tabs = [...host.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    const panels = [...host.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
    expect(tabs).toHaveLength(3);
    expect(panels).toHaveLength(3);

    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].tabIndex).toBe(0);
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
    expect(tabs[1].tabIndex).toBe(-1);
    expect(tabs[2].getAttribute('aria-selected')).toBe('false');
    expect(tabs[2].tabIndex).toBe(-1);

    for (let i = 0; i < 3; i++) {
      const controls = tabs[i].getAttribute('aria-controls');
      expect(controls).toBeTruthy();
      expect(panels[i].id).toBe(controls);
      expect(panels[i].getAttribute('aria-labelledby')).toBe(tabs[i].id);
      expect(panels[i].tabIndex).toBe(0);
    }

    expect(panels[0].hidden).toBe(false);
    expect(panels[1].hidden).toBe(true);
    expect(panels[2].hidden).toBe(true);
  });

  it('navega com ArrowRight, ArrowLeft (circular), Home e End com ativação automática e foco', () => {
    const replaceSpy = vi.spyOn(window.history, 'replaceState');
    renderizar();

    const tabs = [...host.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    const panels = [...host.querySelectorAll<HTMLElement>('[role="tabpanel"]')];

    tabs[0].focus();
    expect(document.activeElement).toBe(tabs[0]);

    // ArrowRight: 0 -> 1
    act(() => {
      tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    });
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs[1]);
    expect(panels[1].hidden).toBe(false);
    expect(panels[0].hidden).toBe(true);
    expect(window.location.hash).toBe('#passo-a-passo');

    // ArrowRight: 1 -> 2
    act(() => {
      tabs[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    });
    expect(tabs[2].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs[2]);
    expect(panels[2].hidden).toBe(false);
    expect(window.location.hash).toBe('#formulario');

    // ArrowRight circular: 2 -> 0 (aba padrão limpa o #)
    act(() => {
      tabs[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    });
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs[0]);
    expect(panels[0].hidden).toBe(false);
    expect(window.location.hash).toBe('');

    // ArrowLeft circular: 0 -> 2
    act(() => {
      tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    });
    expect(tabs[2].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs[2]);
    expect(window.location.hash).toBe('#formulario');

    // Home: 2 -> 0
    act(() => {
      tabs[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    });
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs[0]);
    expect(window.location.hash).toBe('');

    // End: 0 -> 2
    act(() => {
      tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    });
    expect(tabs[2].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs[2]);
    expect(window.location.hash).toBe('#formulario');
    expect(replaceSpy).toHaveBeenCalled();
  });

  it('abre direto na aba correspondente ao #hash sem roubar o foco', () => {
    renderizar('/servicos/requerimentos/defesa-auto-infracao#formulario');

    const tabs = [...host.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    const panels = [...host.querySelectorAll<HTMLElement>('[role="tabpanel"]')];

    expect(tabs[2].getAttribute('aria-selected')).toBe('true');
    expect(panels[2].hidden).toBe(false);
    expect(panels[0].hidden).toBe(true);
    expect(document.activeElement).toBe(document.body);
  });

  it('cai na aba padrão quando o #hash não corresponde a nenhuma aba', () => {
    renderizar('/servicos/requerimentos/defesa-auto-infracao#aba-inexistente');

    const tabs = [...host.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
  });
});
