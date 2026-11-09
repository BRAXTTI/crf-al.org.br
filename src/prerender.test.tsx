// @vitest-environment jsdom
/**
 * Pré-render + hidratação das rotas estáticas: o HTML do build (entry-server) é hidratado pelo
 * mesmo código do navegador (client.tsx) sem erro recuperável nem aviso de hidratação.
 * O pré-render roda numa segunda-feira ao meio-dia e a visita acontece 11 dias depois, numa
 * sexta à noite, com perfil e checklist salvos: data, expediente, plenárias e localStorage mudam.
 * O conteúdo de dist/ (bundle SSR real, sem window) é conferido em scripts/test-prerender.mjs.
 */
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PAGE_METADATA } from '@/config/page-metadata';
import { PRERENDER_EXCLUDED, PRERENDER_ROUTES } from '@/config/prerender';
import { serviceProfiles } from '@/config/service-profiles';
import { TODOS_OS_REQUERIMENTOS } from '@/data/requerimentos';
import { canHydrate, mount, PRERENDER_AT_ATTR, PRERENDER_ATTR } from './client';
import { render, stripHoisted } from './entry-server';

const PRE_RENDER = new Date('2026-03-02T15:00:00Z'); // segunda, 12h em Maceió: expediente aberto
const VISITA = new Date('2026-03-14T02:30:00Z'); // sexta, 23h30 em Maceió: fechado

const HIDRATACAO = /hydrat|did not match|didn't match|server rendered|server HTML|Suspense boundary/i;

let erros: string[];
let recuperaveis: unknown[];
let desmontar: (() => void) | undefined;

class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}

beforeEach(() => {
  (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.useFakeTimers({ toFake: ['Date'] });
  window.matchMedia = vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();
  vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);
  // jsdom não tem ResizeObserver (a Diretoria usa para medir o minicurrículo).
  vi.stubGlobal('ResizeObserver', IntersectionObserverStub);
  // APIs nunca respondem: as seções com dados ficam no "carregando", como no build.
  vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
  Object.defineProperty(navigator, 'sendBeacon', { value: vi.fn(() => true), configurable: true });
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  erros = [];
  recuperaveis = [];
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => { erros.push(args.map(String).join(' ')); });
});

afterEach(() => {
  desmontar?.();
  desmontar = undefined;
  document.body.innerHTML = '';
  localStorage.clear();
  sessionStorage.clear();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** HTML do pré-render em #root, como o scripts/prerender.mjs grava no dist. */
async function preRenderizar(path: string, marca = path) {
  vi.setSystemTime(PRE_RENDER);
  const { html, status, instante } = await render(path);
  expect(status).toBe(200);
  document.body.innerHTML = `<div id="root" ${PRERENDER_ATTR}="${marca}" ${PRERENDER_AT_ATTR}="${instante}">${html}</div>`;
  // No navegador, o parser inicializa a propriedade `muted` pelo atributo (spec HTML, "media
  // element is created"); o jsdom não. O React hidrata comparando a propriedade.
  for (const video of document.querySelectorAll('video')) video.muted = video.hasAttribute('muted');
  return document.getElementById('root')!;
}

/** Abre `url` no navegador (visitante que volta, outro dia e hora) e monta o app. */
async function visitar(container: HTMLElement, url: string) {
  window.history.replaceState(null, '', url);
  vi.setSystemTime(VISITA);
  localStorage.setItem('crfal.perfilServico', serviceProfiles[2].id);
  for (const item of TODOS_OS_REQUERIMENTOS) localStorage.setItem(`crfal:requerimentos:checklist:${item.id}`, '[0]');
  let montado!: Awaited<ReturnType<typeof mount>>;
  await act(async () => {
    montado = await mount(container, { onRecoverableError: (error) => recuperaveis.push(error) });
  });
  desmontar = () => {
    act(() => montado.root.unmount());
    montado.router.dispose();
  };
  return montado;
}

describe('pré-render das rotas estáticas', () => {
  it('cobre PAGE_METADATA menos as rotas que dependem de API', () => {
    expect(PRERENDER_ROUTES).toContain('/');
    expect(PRERENDER_ROUTES).toContain('/instituicao');
    expect(PRERENDER_ROUTES).toContain('/contato');
    expect(PRERENDER_ROUTES.length + Object.keys(PRERENDER_EXCLUDED).length).toBe(Object.keys(PAGE_METADATA).length);
    for (const path of Object.keys(PRERENDER_EXCLUDED)) expect(PAGE_METADATA).toHaveProperty([path]);
  });

  it.each(PRERENDER_ROUTES)('%s: HTML com <h1> e hidratação sem divergência', async (path) => {
    const container = await preRenderizar(path);
    const h1 = container.querySelector('main h1');
    expect(h1?.textContent?.trim()).toBeTruthy();
    // title/meta/canonical ficam no <head>; <title> de SVG (ícones) é conteúdo.
    expect([...container.querySelectorAll('title')].filter((title) => !title.closest('svg'))).toEqual([]);
    expect(container.querySelector('meta, link[rel="canonical"]')).toBeNull();

    const montado = await visitar(container, path);
    expect(montado.hydrated).toBe(true);
    expect(recuperaveis).toEqual([]);
    expect(erros.filter((erro) => HIDRATACAO.test(erro))).toEqual([]);
    // Hidratou de verdade: o <h1> do HTML do build continua no DOM (não houve render do zero).
    expect(container.contains(h1)).toBe(true);
    expect(container.hasAttribute(PRERENDER_ATTR)).toBe(false);
  });

  it('o teste detecta divergência (HTML da home marcado como /contato)', async () => {
    const container = await preRenderizar('/', '/contato');
    await visitar(container, '/contato');
    expect(recuperaveis.length + erros.filter((erro) => HIDRATACAO.test(erro)).length).toBeGreaterThan(0);
  });

  it('fallback do SPA com a home em outra rota: render do zero, sem hidratar', async () => {
    const container = await preRenderizar('/');
    const h1Home = container.querySelector('main h1');
    const montado = await visitar(container, '/imprensa/noticias/alguma-noticia');
    expect(montado.hydrated).toBe(false);
    expect(container.contains(h1Home)).toBe(false);
    expect(recuperaveis).toEqual([]);
  });

  it('com query string ou hash, renderiza do zero (a página pode depender deles)', async () => {
    const container = await preRenderizar('/servicos/requerimentos');
    const montado = await visitar(container, '/servicos/requerimentos?q=certid');
    expect(montado.hydrated).toBe(false);
    expect(recuperaveis).toEqual([]);
  });

  it('canHydrate compara a rota normalizada e recusa query/hash', () => {
    const root = document.createElement('div');
    root.setAttribute(PRERENDER_ATTR, '/instituicao');
    expect(canHydrate(root, { pathname: '/instituicao', search: '', hash: '' })).toBe(true);
    expect(canHydrate(root, { pathname: '/instituicao/', search: '', hash: '' })).toBe(true);
    expect(canHydrate(root, { pathname: '/instituicao', search: '?utm_source=x', hash: '' })).toBe(false);
    expect(canHydrate(root, { pathname: '/instituicao', search: '', hash: '#topo' })).toBe(false);
    expect(canHydrate(root, { pathname: '/contato', search: '', hash: '' })).toBe(false);
    root.setAttribute(PRERENDER_ATTR, '/');
    expect(canHydrate(root, { pathname: '/', search: '', hash: '' })).toBe(true);
  });

  it('stripHoisted tira só as tags de <head> do início', () => {
    expect(stripHoisted('<title>X</title><meta name="a" content="b"/><link rel="canonical" href="/contato"/><div><svg><title>Ícone</title></svg></div>'))
      .toBe('<div><svg><title>Ícone</title></svg></div>');
  });
});
