// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getRequerimento } from '@/data/requerimentos';
import { GUIAS } from '@/data/tutoriais-guias';
import RequirementDetailPage from './RequirementDetailPage';

let root: Root;
let host: HTMLElement;
let beacon: ReturnType<typeof vi.fn>;

function renderizar(entrada: string, { anteriores = [] as string[] } = {}) {
  const url = new URL(entrada, 'https://crf-al.org.br');
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  act(() => {
    root.render(
      <HelmetProvider>
        <MemoryRouter initialEntries={[...anteriores, entrada]} initialIndex={anteriores.length}>
          <Routes>
            <Route path="/servicos/requerimentos/:slug" element={<RequirementDetailPage />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>,
    );
  });
}

const aba = (rotulo: RegExp) => [...host.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find((b) => rotulo.test(b.textContent ?? ''))!;
const painelDe = (tab: HTMLButtonElement) => host.querySelector<HTMLElement>(`[id="${tab.getAttribute('aria-controls')}"]`)!;
const esperar = (ms: number) => act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)));
const rolouAteAbas = () => vi.mocked(Element.prototype.scrollIntoView).mock.contexts.some((el) => (el as Element).querySelector(':scope > div > div > [role="tablist"]'));
const eventos = async () => Promise.all(beacon.mock.calls.map(async ([, blob]) => JSON.parse(await (blob as Blob).text())));

beforeEach(() => {
  (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  beacon = vi.fn(() => true);
  Object.defineProperty(navigator, 'sendBeacon', { value: beacon, configurable: true });
  window.matchMedia = vi.fn(() => ({ matches: false })) as unknown as typeof window.matchMedia;
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  host = document.body.appendChild(document.createElement('div'));
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.restoreAllMocks();
});

describe('RequirementDetailPage: tutorial na aba Passo a passo', () => {
  it('com tutorialId, a aba mostra o tutorial (vídeo sem pré-carga) e conta os passos do guia', () => {
    renderizar('/servicos/requerimentos/defesa-auto-infracao#passo-a-passo');
    const tab = aba(/Passo a passo/);
    expect(tab.getAttribute('aria-selected')).toBe('true');
    expect(tab.textContent).toContain(String(GUIAS['defesa-auto-infracao'].passos.length));
    const painel = painelDe(tab);
    const video = painel.querySelector('video')!;
    expect(video.getAttribute('preload')).toBe('none');
    expect(video.getAttribute('poster')).toBe('/images/tutoriais/defesa-auto-infracao-poster.webp');
    expect(painel.querySelector('.section-panel')).toBeNull();
    expect(painel.textContent).toContain('Deu certo?');
    // Só uma barra fixa: a da página.
    expect(host.querySelectorAll('.fixed').length).toBe(1);
  });

  it('mede `abrir` uma vez com o id do tutorial, só quando a aba é aberta', async () => {
    renderizar('/servicos/requerimentos/defesa-auto-infracao');
    expect(await eventos()).toEqual([]);
    act(() => aba(/Passo a passo/).click());
    act(() => aba(/Para que serve/).click());
    act(() => aba(/Passo a passo/).click());
    expect(await eventos()).toEqual([{ evento: 'abrir', tarefa: 'defesa-auto-infracao' }]);
  });

  it('trocar de aba pausa o vídeo', () => {
    renderizar('/servicos/requerimentos/defesa-auto-infracao#passo-a-passo');
    const pause = vi.mocked(HTMLMediaElement.prototype.pause);
    pause.mockClear();
    act(() => aba(/Formulário/).click());
    expect(pause).toHaveBeenCalled();
  });

  it('"Ver documentos" troca para a aba Formulário sem sair da página', () => {
    renderizar('/servicos/requerimentos/defesa-auto-infracao#passo-a-passo');
    const link = [...painelDe(aba(/Passo a passo/)).querySelectorAll('a')].find((a) => a.textContent?.startsWith('Ver documentos'))!;
    expect(link.textContent).toContain(`(${getRequerimento('defesa-auto-infracao')!.documentos.length})`);
    act(() => link.click());
    expect(aba(/Formulário/).getAttribute('aria-selected')).toBe('true');
    expect(window.location.pathname).toBe('/servicos/requerimentos/defesa-auto-infracao');
  });

  it('inscrição definitiva: passos em texto e link do vídeo completo no YouTube', () => {
    renderizar('/servicos/requerimentos/inscricao-profissional-definitiva#passo-a-passo');
    const painel = painelDe(aba(/Passo a passo/));
    expect(painel.querySelector('video')).toBeNull();
    const youtube = painel.querySelector<HTMLAnchorElement>('a[href^="https://youtu.be/"]')!;
    expect(youtube.textContent).toContain('Ver vídeo completo (1:47)');
    for (const passo of GUIAS['inscricao-definitiva'].passos) expect(painel.textContent).toContain(passo.titulo);
  });

  it('sem tutorialId, a aba segue com as instruções do requerimento', () => {
    renderizar('/servicos/requerimentos/certidao-regularidade-pf#passo-a-passo');
    const painel = painelDe(aba(/Passo a passo/));
    expect(painel.textContent).toContain('Acompanhe em Protocolos Web');
    expect(painel.textContent).not.toContain('Deu certo?');
  });
});

describe('RequirementDetailPage: botão de ação e abertura com #aba', () => {
  it('o botão da aba Passo a passo e o da barra fixa usam o rótulo do tutorial', () => {
    renderizar('/servicos/requerimentos/defesa-auto-infracao#passo-a-passo');
    const botoes = [...host.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]')].filter((a) => a.textContent?.includes('CRF AL em Casa'));
    expect(painelDe(aba(/Passo a passo/)).textContent).toContain('Abrir o CRF AL em Casa');
    expect(host.querySelector('.fixed')!.textContent).toContain('Abrir o CRF AL em Casa');
    expect(botoes.length).toBeGreaterThan(0);
    expect(host.textContent).not.toContain('Acessar CRF AL em Casa');
  });

  it('rótulo próprio do requerimento continua valendo (pré-inscrição)', () => {
    renderizar('/servicos/requerimentos/primeira-inscricao-profissional-provisoria#passo-a-passo');
    expect(host.querySelector('.fixed')!.textContent).toContain('Fazer pré-inscrição');
  });

  it('aberta com #passo-a-passo, rola até as abas', async () => {
    renderizar('/servicos/requerimentos/defesa-auto-infracao#passo-a-passo');
    await esperar(20);
    expect(aba(/Passo a passo/).getAttribute('aria-selected')).toBe('true');
    expect(rolouAteAbas()).toBe(true);
  });

  it('sem #, ou no "Voltar" com #passo-a-passo, não mexe na rolagem', async () => {
    renderizar('/servicos/requerimentos/defesa-auto-infracao');
    await esperar(20);
    expect(rolouAteAbas()).toBe(false);
    act(() => root.unmount());
    root = createRoot(host);
    renderizar('/servicos/requerimentos/defesa-auto-infracao#passo-a-passo', { anteriores: ['/servicos/requerimentos'] });
    await esperar(20);
    expect(rolouAteAbas()).toBe(false);
  });

  it('trocar de aba depois da abertura não rola de novo e ainda pausa o vídeo', async () => {
    renderizar('/servicos/requerimentos/defesa-auto-infracao#passo-a-passo');
    await esperar(20);
    const scroll = vi.mocked(Element.prototype.scrollIntoView);
    scroll.mockClear();
    const pause = vi.mocked(HTMLMediaElement.prototype.pause);
    pause.mockClear();
    act(() => aba(/Formulário/).click());
    expect(aba(/Formulário/).getAttribute('aria-selected')).toBe('true');
    expect(pause).toHaveBeenCalled();
    expect(rolouAteAbas()).toBe(false);
  });
});
