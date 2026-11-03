// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GUIAS, type GuiaTutorial, type VideoGuia } from '@/data/tutoriais-guias';
import { telaDe } from '../tela';
import PassosComVideo from './PassosComVideo';

const guiaBase = GUIAS['emitir-boletos'] as GuiaTutorial & { video: VideoGuia };
const guia: GuiaTutorial & { video: VideoGuia } = {
  ...guiaBase,
  video: { ...guiaBase.video, narrado: false, proporcao: '4:3' },
};
const guiaNarrado = GUIAS['afastamento-provisorio'] as GuiaTutorial & { video: VideoGuia };
let root: Root;
let host: HTMLElement;
let beacon: ReturnType<typeof vi.fn>;
let playSpy: ReturnType<typeof vi.spyOn>;
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
  playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, 'readyState', 'get').mockReturnValue(4);
  host = document.body.appendChild(document.createElement('div'));
  root = createRoot(host);
  act(() => root.render(<PassosComVideo tarefa="emitir-boletos" guia={guia} onConcluir={concluir} acao={null} antes={null}>fim</PassosComVideo>));
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.restoreAllMocks();
});

describe('PassosComVideo', () => {
  it('telaDe devolve aspect-video para 16:9 e aspect-4/3 por padrão', () => {
    expect(telaDe('16:9')).toContain('aspect-video');
    expect(telaDe('16:9')).not.toContain('aspect-4/3');
    expect(telaDe()).toContain('aspect-4/3');
  });

  it('o passo ativo acompanha o vídeo', () => {
    expect(ativos()[0]).toContain(guia.passos[0].titulo);
    tempo(19);
    expect(ativos()[0]).toContain(guia.passos[2].titulo);
    expect(host.textContent).toContain('Passo 3 de 5');
  });

  it('todos os títulos ficam visíveis; o detalhe só no passo ativo', () => {
    for (const passo of guia.passos) expect(host.textContent).toContain(passo.titulo);
    expect(host.textContent).toContain(guia.passos[0].detalhe);
    expect(host.textContent).not.toContain(guia.passos[1].detalhe);
  });

  it('clicar em um passo salta ao trecho e fica em loop nele, medindo uma vez', async () => {
    clicar(/Clique em "Consultar"/);
    expect(video().currentTime).toBe(23.2);
    expect(ativos()[0]).toContain('Clique em "Consultar"');
    tempo(25.5);
    expect(video().currentTime).toBe(23.2);
    expect(ativos()[0]).toContain('Clique em "Consultar"');
    clicar(/Clique em "Consultar"/);
    expect(beacon).toHaveBeenCalledTimes(1);
    expect(await (beacon.mock.calls[0][1] as Blob).text()).toBe('{"evento":"passo","tarefa":"emitir-boletos","passo":4}');
  });

  it('anterior e próximo param nas pontas; o fim do último passo destaca a ação', () => {
    const anterior = host.querySelector<HTMLButtonElement>('[aria-label="Passo anterior"]')!;
    expect(anterior.disabled).toBe(true);
    for (let i = 0; i < 4; i++) clicar('Próximo passo');
    expect(host.querySelector<HTMLButtonElement>('[aria-label="Próximo passo"]')!.disabled).toBe(true);
    expect(concluir).not.toHaveBeenCalled();
    tempo(47.6);
    expect(concluir).toHaveBeenCalled();
  });

  it('o botão de pausa fica visível', () => {
    expect(host.querySelector('[aria-label="Tocar vídeo"]')).not.toBeNull();
  });

  describe('narrado', () => {
    beforeEach(() => {
      playSpy.mockClear();
      concluir.mockClear();
      act(() => root.render(<PassosComVideo tarefa="afastamento-provisorio" guia={guiaNarrado} onConcluir={concluir} acao={null} antes={null}>fim</PassosComVideo>));
    });

    it('na montagem, play não é chamado e a linha do passo exibe o título', () => {
      expect(playSpy).not.toHaveBeenCalled();
      expect(host.textContent).toContain(`Passo 1 de 6: ${guiaNarrado.passos[0].titulo}`);
    });

    it('clicar em um passo com o vídeo pausado posiciona sem chamar play, mantém na folga e avança sem loop', () => {
      clicar(/Marque a responsabilidade técnica \(RT\)/);
      expect(video().currentTime).toBe(21.1);
      expect(ativos()[0]).toContain('Marque a responsabilidade técnica (RT)');
      expect(playSpy).not.toHaveBeenCalled();

      tempo(21.08);
      expect(ativos()[0]).toContain('Marque a responsabilidade técnica (RT)');

      Object.defineProperty(video(), 'paused', { value: false, configurable: true });
      tempo(25.5);
      expect(ativos()[0]).toContain('Selecione o motivo da ausência');
      expect(video().currentTime).toBe(25.5);
      expect(host.textContent).toContain('Passo 3 de 6: Selecione o motivo da ausência');
    });

    it('disparar ended chama onConcluir e não chama play', () => {
      act(() => {
        video().dispatchEvent(new Event('ended', { bubbles: true }));
      });
      expect(concluir).toHaveBeenCalledTimes(1);
      expect(playSpy).not.toHaveBeenCalled();
    });
  });
});
