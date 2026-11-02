// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tutoriais } from '@/data/servicos';
import { GUIAS } from '@/data/tutoriais-guias';
import TutorialDetail from './TutorialDetail';

let root: Root;
let host: HTMLElement;

const render = (id: string) => {
  const tutorial = tutoriais.find((t) => t.id === id)!;
  act(() => root.render(<MemoryRouter><TutorialDetail tutorial={tutorial} /></MemoryRouter>));
};
const capa = (id: string) => host.querySelector<HTMLImageElement>(`img[src="${GUIAS[id].capaProvisoria?.src}"]`);

beforeEach(() => {
  (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  window.matchMedia = vi.fn(() => ({ matches: false })) as unknown as typeof window.matchMedia;
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

describe('TutorialDetail: capa provisória', () => {
  it.each(['primeira-inscricao', 'afastamento-provisorio'])('%s mostra a capa na tela do vídeo, sem player', (id) => {
    render(id);
    const img = capa(id)!;
    expect(img.alt).toBe(GUIAS[id].capaProvisoria!.alt);
    expect(img.getAttribute('width')).toBe('540');
    expect(img.getAttribute('height')).toBe('960');
    expect(img.getAttribute('decoding')).toBe('async');
    expect(img.parentElement!.className).toContain('aspect-4/3');
    expect(host.querySelector('video')).toBeNull();
    expect(host.textContent).not.toMatch(/Passo \d+ de \d+/);
    for (const passo of GUIAS[id].passos) expect(host.textContent).toContain(passo.titulo);
  });

  it('mantém o link do vídeo completo', () => {
    render('afastamento-provisorio');
    expect(host.textContent).toContain('Ver vídeo completo (2:13)');
  });

  it('com vídeo, o vídeo tem prioridade sobre a capa', () => {
    const guia = GUIAS['baixa-rt'];
    guia.capaProvisoria = { src: '/images/tutoriais/capa-de-teste.webp', alt: 'Capa de teste' };
    try {
      render('baixa-rt');
      expect(host.querySelector('video')).not.toBeNull();
      expect(capa('baixa-rt')).toBeNull();
    } finally {
      delete guia.capaProvisoria;
    }
  });

  it('tarefa sem vídeo nem capa segue em coluna única, sem imagem', () => {
    render('consulta-rt');
    expect(host.querySelector('img')).toBeNull();
    expect(host.querySelector('.max-w-3xl')).not.toBeNull();
  });
});
