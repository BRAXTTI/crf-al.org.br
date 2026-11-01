// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GUIAS, type GuiaTutorial, type VideoGuia } from '@/data/tutoriais-guias';
import PassosComVideo from './PassosComVideo';

const guia = GUIAS['baixa-rt'] as GuiaTutorial & { video: VideoGuia };
let root: Root;
let host: HTMLElement;
let beacon: ReturnType<typeof vi.fn>;
const concluir = vi.fn();

const video = () => host.querySelector('video')!;
const ativos = () => [...host.querySelectorAll('[aria-current="step"]')].map((li) => li.textContent);
const tempo = (segundo: number) => act(() => {
  Object.defineProperty(video(), 'currentTime', { value: segundo, writable: true, configurable: true });
  video().dispatchEvent(new Event('timeupdate', { bubbles: true }));
});
const clicar = (rotulo: string | RegExp) => act(() => {
  const botao = [...host.querySelectorAll('button')].find((b) => (typeof rotulo === 'string' ? b.getAttribute('aria-label') === rotulo : rotulo.test(b.textContent ?? '')));
  botao!.click();
});

beforeEach(() => {
  (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  concluir.mockClear();
  beacon = vi.fn(() => true);
  Object.defineProperty(navigator, 'sendBeacon', { value: beacon, configurable: true });
  window.matchMedia = vi.fn(() => ({ matches: false })) as unknown as typeof window.matchMedia;
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, 'readyState', 'get').mockReturnValue(4);
  host = document.body.appendChild(document.createElement('div'));
  root = createRoot(host);
  act(() => root.render(<PassosComVideo tarefa="baixa-rt" guia={guia} onConcluir={concluir} acao={null} antes={null}>fim</PassosComVideo>));
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.restoreAllMocks();
});

describe('PassosComVideo', () => {
  it('o passo ativo acompanha o vídeo', () => {
    expect(ativos()[0]).toContain(guia.passos[0].titulo);
    tempo(12);
    expect(ativos()[0]).toContain(guia.passos[2].titulo);
    expect(host.textContent).toContain('Passo 3 de 6');
  });

  it('todos os títulos ficam visíveis; o detalhe só no passo ativo', () => {
    for (const passo of guia.passos) expect(host.textContent).toContain(passo.titulo);
    expect(host.textContent).toContain(guia.passos[0].detalhe);
    expect(host.textContent).not.toContain(guia.passos[3].detalhe);
  });

  it('clicar em um passo salta ao trecho e fica em loop nele, medindo uma vez', async () => {
    clicar(/Informe a data de desligamento/);
    expect(video().currentTime).toBe(15);
    expect(ativos()[0]).toContain('Informe a data de desligamento');
    tempo(19);
    expect(video().currentTime).toBe(15);
    expect(ativos()[0]).toContain('Informe a data de desligamento');
    clicar(/Informe a data de desligamento/);
    expect(beacon).toHaveBeenCalledTimes(1);
    expect(await (beacon.mock.calls[0][1] as Blob).text()).toBe('{"evento":"passo","tarefa":"baixa-rt","passo":4}');
  });

  it('anterior e próximo param nas pontas; o fim do último passo destaca a ação', () => {
    const anterior = host.querySelector<HTMLButtonElement>('[aria-label="Passo anterior"]')!;
    expect(anterior.disabled).toBe(true);
    for (let i = 0; i < 5; i++) clicar('Próximo passo');
    expect(host.querySelector<HTMLButtonElement>('[aria-label="Próximo passo"]')!.disabled).toBe(true);
    expect(concluir).not.toHaveBeenCalled();
    tempo(32.4);
    expect(concluir).toHaveBeenCalled();
  });

  it('o botão de pausa fica visível', () => {
    expect(host.querySelector('[aria-label="Tocar vídeo"]')).not.toBeNull();
  });
});
