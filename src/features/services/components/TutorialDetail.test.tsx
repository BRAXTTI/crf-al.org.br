// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tutoriais } from '@/data/servicos';
import { GUIAS } from '@/data/tutoriais-guias';
import TutorialDetail, { BotaoAcao, type LinkDocumentos } from './TutorialDetail';

let root: Root;
let host: HTMLElement;

const acao = (destaque: boolean) => <BotaoAcao href="https://exemplo.test/acao" rotulo="Ação de teste" destaque={destaque} />;
const render = (id: string, extras: { linkDocumentos?: LinkDocumentos; visivel?: boolean; embutido?: boolean } = {}) => {
  const tutorial = tutoriais.find((t) => t.id === id)!;
  act(() => root.render(<MemoryRouter><TutorialDetail tutorial={tutorial} acao={acao} {...extras} /></MemoryRouter>));
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

describe('TutorialDetail: capa provisória e vídeo', () => {
  it('sem vídeo, a capa provisória fica na tela do vídeo, sem player', () => {
    const id = 'consulta-rt';
    const guia = GUIAS[id];
    guia.capaProvisoria = { src: '/images/tutoriais/capa-de-teste.webp', alt: 'Capa de teste' };
    try {
      render(id);
      const img = capa(id)!;
      expect(img.alt).toBe('Capa de teste');
      expect(img.getAttribute('width')).toBe('960');
      expect(img.getAttribute('height')).toBe('540');
      expect(img.getAttribute('decoding')).toBe('async');
      expect(img.parentElement!.className).toContain('aspect-video');
      expect(host.querySelector('video')).toBeNull();
      expect(host.textContent).not.toMatch(/Passo \d+ de \d+/);
      for (const passo of guia.passos) expect(host.textContent).toContain(passo.titulo);

      const grid = host.querySelector('.section-panel > div')!;
      expect(grid.className).toContain('grid-cols-[minmax(0,1fr)]');
      for (const coluna of grid.children) {
        expect(coluna.className).toContain('min-w-0');
      }
    } finally {
      delete guia.capaProvisoria;
    }
  });

  it.each([
    ['primeira-inscricao', '/images/tutoriais/primeira-inscricao-foto-poster.webp', '0:48', 6],
    ['contratacao-rt', '/images/tutoriais/contratacao-rt-poster.webp', '0:59', 9],
  ])('%s usa o vídeo 9:16 narrado no R2, só MP4, sem esmagar', (id, poster, duracao, passos) => {
    render(id);
    const video = host.querySelector('video')!;
    expect(video.getAttribute('src')).toBe(`https://midias.crf-al.org.br/site/videos/tutoriais/${id}.mp4`);
    expect(video.querySelector('source')).toBeNull();
    expect(video.getAttribute('poster')).toBe(poster);
    expect(video.getAttribute('width')).toBe('540');
    expect(video.getAttribute('height')).toBe('960');
    expect(video.className).toContain('object-contain');
    const moldura = video.parentElement!.parentElement!;
    expect(moldura.className).toContain('aspect-[9/16]');
    expect(moldura.className).not.toMatch(/aspect-video|aspect-4\/3/);
    expect(video.muted).toBe(false);
    expect(host.querySelector(`button[aria-label="Tocar vídeo com narração (${duracao})"]`)).not.toBeNull();
    expect(host.textContent).toContain(`Passo 1 de ${passos}`);
    expect(host.textContent).toContain(GUIAS[id].passos[0].detalhe!);
    expect(host.textContent).not.toContain('Ver vídeo completo');
    expect(host.textContent).not.toMatch(/pedido|fictíci|dados de exemplo/i);
    expect(host.querySelector('img[src="/images/tutoriais/primeira-inscricao-foto-poster.webp"]')).toBeNull();
  });

  it('primeira-inscricao não manda mais levar original à sede nem fala em plenária', () => {
    render('primeira-inscricao');
    expect(host.textContent).not.toMatch(/sede|seccional|plenária|original/i);
    expect(host.textContent).toContain('Preencha o formulário de pré-inscrição');
    expect(host.textContent).toContain('Tudo que tiver asterisco (*) é obrigatório.');
  });

  it('afastamento-provisorio usa vídeo 16:9 narrado no R2, details antes do vídeo e orienta acompanhar em Protocolos Web', () => {
    render('afastamento-provisorio');
    const details = host.querySelectorAll('details');
    const video = host.querySelector('video')!;
    expect(details.length).toBe(1);
    expect(video).not.toBeNull();
    expect(Boolean(details[0].compareDocumentPosition(video) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    expect(video.parentElement!.parentElement!.className).toContain('aspect-video');
    expect(video.hasAttribute('muted')).toBe(false);
    expect(video.muted).toBe(false);
    expect(host.querySelector('button[aria-label="Tocar vídeo com narração (0:55)"]')).not.toBeNull();
    expect(video.getAttribute('poster')).toBe('/images/tutoriais/afastamento-provisorio-comunicado-poster.webp');
    expect(host.textContent).toContain('Passo 1 de 6');
    expect(host.textContent).toContain('No painel, em "Atalhos de Menus Mais Usados" > Fiscalização.');
    expect(host.textContent).toContain('Acompanhe o status do protocolo no menu "Protocolos Web".');
    expect(host.textContent).not.toContain('10 dias');
    expect(host.textContent).not.toContain('Ver vídeo completo');

    const grid = host.querySelector('.section-panel > div')!;
    expect(grid.className).toContain('grid-cols-[minmax(0,1fr)]');
    for (const coluna of grid.children) {
      expect(coluna.className).toContain('min-w-0');
    }
  });

  it.each([
    ['defesa-auto-infracao', 'defesa-auto-infracao', '1:02', '"Atalhos de Menus Mais Usados"'],
    ['baixa-rt', 'baixa-responsabilidade-tecnica', '0:53', '"Atalhos de Menus Mais Usados"'],
    ['situacao-protocolos', 'situacao-protocolos', '0:54', '"Atalhos de Menus Mais Usados"'],
    ['imprimir-crt', 'imprimir-crt', '0:47', '"Atalhos de Menus Mais Usados"'],
    ['emitir-boletos', 'emitir-boletos', '0:48', '"Painel de Controle"'],
  ])('%s usa o vídeo v3 16:9 narrado no R2', (id, arquivo, duracao, trecho) => {
    render(id);
    const video = host.querySelector('video')!;
    const fontes = [...video.querySelectorAll('source')].map((s) => [s.getAttribute('type'), s.getAttribute('src')]);
    expect(fontes).toEqual([
      ['video/webm', `https://midias.crf-al.org.br/site/videos/tutoriais/${arquivo}.webm`],
      ['video/mp4', `https://midias.crf-al.org.br/site/videos/tutoriais/${arquivo}.mp4`],
    ]);
    expect(video.getAttribute('poster')).toBe(`/images/tutoriais/${arquivo}-poster.webp`);
    expect(video.parentElement!.parentElement!.className).toContain('aspect-video');
    expect(video.muted).toBe(false);
    expect(host.querySelector(`button[aria-label="Tocar vídeo com narração (${duracao})"]`)).not.toBeNull();
    expect(host.textContent).toContain(`Passo 1 de ${GUIAS[id].passos.length}`);
    expect(host.textContent).toContain(trecho);
    expect(host.textContent).not.toContain('Ver vídeo completo');
    expect(host.textContent).not.toContain('O vídeo mostra a tela de parcelamentos');
    expect(host.textContent).not.toMatch(/pedido/i);
  });

  it('mantém o link do vídeo completo nas tarefas sem vídeo curto', () => {
    render('inscricao-definitiva');
    expect(host.textContent).toContain('Ver vídeo completo (1:47)');
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

describe('TutorialDetail: ação, documentos e aba', () => {
  it('usa a ação recebida e não tem barra fixa nem mexe no body (a página cuida disso)', () => {
    render('defesa-auto-infracao');
    expect(host.querySelector('a[href="https://exemplo.test/acao"]')?.textContent).toContain('Ação de teste');
    expect(host.querySelector('.fixed')).toBeNull();
    expect(document.body.classList.contains('max-lg:pb-20')).toBe(false);
  });

  it('"Ver documentos" leva aonde a página mandar; sem link, não aparece', () => {
    const onClick = vi.fn();
    render('defesa-auto-infracao', { linkDocumentos: { to: '#formulario', onClick } });
    const links = [...host.querySelectorAll('a')].filter((a) => a.textContent?.startsWith('Ver documentos'));
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) expect(link.getAttribute('href')).toBe('/#formulario');
    act(() => links[0].click());
    expect(onClick).toHaveBeenCalledTimes(1);

    render('baixa-rt');
    expect(host.textContent).not.toContain('Ver documentos');
    render('defesa-auto-infracao');
    expect(host.textContent).not.toContain('Ver documentos');
  });

  it('embutido: sem cartão próprio e vídeo com preload="none" e capa', () => {
    render('defesa-auto-infracao', { embutido: true });
    expect(host.querySelector('.section-panel')).toBeNull();
    const video = host.querySelector('video')!;
    expect(video.getAttribute('preload')).toBe('none');
    expect(video.getAttribute('poster')).toBe('/images/tutoriais/defesa-auto-infracao-poster.webp');
  });

  it('fora do embutido o vídeo segue com preload="metadata"', () => {
    render('defesa-auto-infracao');
    expect(host.querySelector('.section-panel')).not.toBeNull();
    expect(host.querySelector('video')!.getAttribute('preload')).toBe('metadata');
  });

  it('ao ficar invisível (aba escondida), pausa o vídeo', () => {
    render('defesa-auto-infracao', { visivel: true });
    const pause = vi.mocked(HTMLMediaElement.prototype.pause);
    pause.mockClear();
    render('defesa-auto-infracao', { visivel: false });
    expect(pause).toHaveBeenCalled();
  });
});

