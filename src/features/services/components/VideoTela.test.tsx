// @vitest-environment jsdom
import { act, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import VideoTela, { ControlesSom } from './VideoTela';

let root: Root;
let host: HTMLElement;
let playSpy: ReturnType<typeof vi.spyOn>;
let callbacksObserver: IntersectionObserverCallback[];
const descriptorVolumeOriginal = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'volume');

function PlayerTeste({ narrado = true, webm }: { narrado?: boolean; webm?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  return (
    <div>
      <VideoTela
        videoRef={ref}
        src="https://midias.crf-al.org.br/site/videos/tutoriais/afastamento-provisorio.mp4"
        webm={webm}
        poster="/images/tutoriais/afastamento-provisorio-foto-poster.webp"
        alt="Vídeo de teste"
        duracao="0:55"
        narrado={narrado}
      />
      {narrado && <ControlesSom videoRef={ref} duracao="0:55" />}
    </div>
  );
}

const video = () => host.querySelector('video')!;
const botao = (rotulo: string) => host.querySelector<HTMLButtonElement>(`button[aria-label="${rotulo}"]`);

beforeEach(() => {
  (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  callbacksObserver = [];
  window.matchMedia = vi.fn(() => ({ matches: false })) as unknown as typeof window.matchMedia;
  globalThis.IntersectionObserver = class {
    private cb: IntersectionObserverCallback;
    constructor(cb: IntersectionObserverCallback) {
      this.cb = cb;
      callbacksObserver.push(cb);
    }
    observe() {
      this.cb([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
    }
    disconnect() {}
    unobserve() {}
    takeRecords() { return []; }
    root = null;
    rootMargin = '';
    thresholds = [];
  } as unknown as typeof IntersectionObserver;
  playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  host = document.body.appendChild(document.createElement('div'));
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  if (descriptorVolumeOriginal) {
    Object.defineProperty(HTMLMediaElement.prototype, 'volume', descriptorVolumeOriginal);
  }
  vi.restoreAllMocks();
});

describe('VideoTela', () => {
  it('narrado: não chama play na montagem mesmo visível e não tem muted nem loop', () => {
    act(() => root.render(<PlayerTeste narrado />));
    expect(playSpy).not.toHaveBeenCalled();
    expect(video().hasAttribute('muted')).toBe(false);
    expect(video().muted).toBe(false);
    expect(video().hasAttribute('loop')).toBe(false);
    expect(video().loop).toBe(false);
  });

  it('narrado: clicar em "Tocar vídeo com narração (0:55)" chama play uma vez com muted === false', () => {
    act(() => root.render(<PlayerTeste narrado />));
    const iniciar = botao('Tocar vídeo com narração (0:55)')!;
    expect(iniciar).not.toBeNull();
    act(() => iniciar.click());
    expect(playSpy).toHaveBeenCalledTimes(1);
    expect(video().muted).toBe(false);
    expect(botao('Tocar vídeo com narração (0:55)')).toBeNull();
    expect(botao('Pausar vídeo')).not.toBeNull();
  });

  it('mudo: clicar em "Desativar som" alterna muted e atualiza o rótulo após volumechange', () => {
    act(() => root.render(<PlayerTeste narrado />));
    const btnMudo = botao('Desativar som')!;
    act(() => {
      btnMudo.click();
      video().dispatchEvent(new Event('volumechange'));
    });
    expect(video().muted).toBe(true);
    const btnAtivar = botao('Ativar som')!;
    expect(btnAtivar).not.toBeNull();
    act(() => {
      btnAtivar.click();
      video().dispatchEvent(new Event('volumechange'));
    });
    expect(video().muted).toBe(false);
    expect(botao('Desativar som')).not.toBeNull();
  });

  it('volume ajustável: exibe slider de volume e atualiza volume e mudo no vídeo', () => {
    act(() => root.render(<PlayerTeste narrado />));
    const slider = host.querySelector<HTMLInputElement>('input[type="range"][aria-label="Volume"]')!;
    expect(slider).not.toBeNull();
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    act(() => {
      setter.call(slider, '0.4');
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      slider.dispatchEvent(new Event('change', { bubbles: true }));
      video().dispatchEvent(new Event('volumechange'));
    });
    expect(video().volume).toBeCloseTo(0.4);
    expect(video().muted).toBe(false);
    expect(slider.getAttribute('aria-valuetext')).toBe('40%');

    act(() => {
      setter.call(slider, '0');
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      slider.dispatchEvent(new Event('change', { bubbles: true }));
      video().dispatchEvent(new Event('volumechange'));
    });
    expect(video().volume).toBe(0);
    expect(video().muted).toBe(true);
  });

  it('iOS simulado: esconde o slider de volume e mantém o botão de mudo', () => {
    Object.defineProperty(HTMLMediaElement.prototype, 'volume', {
      get: () => 1,
      set: () => {},
      configurable: true,
    });
    act(() => root.render(<PlayerTeste narrado />));
    expect(host.querySelector('input[type="range"][aria-label="Volume"]')).toBeNull();
    expect(botao('Desativar som')).not.toBeNull();
  });

  it('controles têm type="button" ou input com aria-label em português e botões têm h-11 w-11', () => {
    act(() => root.render(<PlayerTeste narrado />));
    const botoesBarra = [...host.querySelectorAll('button')].filter((b) => b.getAttribute('aria-label') !== 'Tocar vídeo com narração (0:55)');
    expect(botoesBarra.length).toBe(2);
    for (const b of botoesBarra) {
      expect(b.getAttribute('type')).toBe('button');
      expect(b.getAttribute('aria-label')).toBeTruthy();
      expect(b.className).toContain('h-11');
      expect(b.className).toContain('w-11');
    }
  });

  it('com webm: dois <source>, webm antes do mp4, sem src no <video>', () => {
    act(() => root.render(<PlayerTeste webm="https://midias.crf-al.org.br/site/videos/tutoriais/teste.webm" />));
    expect(video().hasAttribute('src')).toBe(false);
    const fontes = [...video().querySelectorAll('source')].map((s) => [s.getAttribute('type'), s.getAttribute('src')]);
    expect(fontes).toEqual([
      ['video/webm', 'https://midias.crf-al.org.br/site/videos/tutoriais/teste.webm'],
      ['video/mp4', 'https://midias.crf-al.org.br/site/videos/tutoriais/afastamento-provisorio.mp4'],
    ]);
  });

  it('com webm: se o webm falhar, não mostra o aviso (o navegador tenta o mp4)', () => {
    act(() => root.render(<PlayerTeste webm="https://midias.crf-al.org.br/site/videos/tutoriais/teste.webm" />));
    act(() => { video().querySelector('source[type="video/webm"]')!.dispatchEvent(new Event('error')); });
    expect(host.querySelector('video')).not.toBeNull();
    expect(host.textContent).not.toContain('Não foi possível tocar o vídeo neste aparelho.');
  });

  it('sem webm: erro no <video> mostra o aviso', () => {
    act(() => root.render(<PlayerTeste />));
    act(() => { video().dispatchEvent(new Event('error')); });
    expect(host.textContent).toContain('Não foi possível tocar o vídeo neste aparelho.');
  });

  it('com webm: se o mp4 (último <source>) falhar, mostra o aviso', () => {
    act(() => root.render(<PlayerTeste webm="https://midias.crf-al.org.br/site/videos/tutoriais/teste.webm" />));
    act(() => { video().querySelector('source[type="video/mp4"]')!.dispatchEvent(new Event('error')); });
    expect(host.querySelector('video')).toBeNull();
    expect(host.textContent).toContain('Não foi possível tocar o vídeo neste aparelho.');
  });

  it('sem webm: mantém src no <video>, sem <source>', () => {
    act(() => root.render(<PlayerTeste />));
    expect(video().getAttribute('src')).toBe('https://midias.crf-al.org.br/site/videos/tutoriais/afastamento-provisorio.mp4');
    expect(video().querySelector('source')).toBeNull();
  });

  it('ambiente (sem narrado): continua com muted e chama play quando visível', () => {
    act(() => root.render(<PlayerTeste narrado={false} />));
    expect(video().muted).toBe(true);
    expect(playSpy).toHaveBeenCalled();
  });
});
