// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { corporateMenu, individualMenu } from '@/data/requerimentos';
import RequirementsPage from './RequirementsPage';

let root: Root;
let host: HTMLElement;

function Destino() {
  const { pathname, search } = useLocation();
  return <p data-testid="destino">{`${pathname}${search}`}</p>;
}

function renderizar(entrada: string) {
  act(() => {
    root.render(
      <HelmetProvider>
        <MemoryRouter key={entrada} initialEntries={[entrada]}>
          <Routes>
            <Route path="/servicos/requerimentos" element={<RequirementsPage />} />
            <Route path="/servicos/requerimentos/:slug" element={<Destino />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>,
    );
  });
}

const cards = () => [...host.querySelectorAll<HTMLAnchorElement>('ul a[href^="/servicos/requerimentos/"]')];
const card = (id: string) => cards().find((a) => a.getAttribute('href') === `/servicos/requerimentos/${id}`)!;

function buscar(termo: string) {
  const input = host.querySelector<HTMLInputElement>('#busca-requerimento')!;
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  act(() => {
    setter.call(input, termo);
    input.dispatchEvent(new Event('input', { bubbles: true }));
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
});

describe('RequirementsPage: lista como índice', () => {
  it('cada card é um link para a página do requerimento e não há modal', () => {
    renderizar('/servicos/requerimentos');
    const total = individualMenu.reduce((soma, cat) => soma + cat.items.length, 0);
    expect(cards()).toHaveLength(total);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it('perfil e categoria da URL continuam filtrando', () => {
    renderizar('/servicos/requerimentos?perfil=pessoa-juridica&categoria=fiscalizacao-recursos');
    const categoria = corporateMenu.find((cat) => cat.id === 'fiscalizacao-recursos')!;
    expect(cards().map((a) => a.getAttribute('href'))).toEqual(
      categoria.items.map((item) => `/servicos/requerimentos/${item.id}`),
    );
  });

  it('selos "Vídeo" e "Formulário" só quando há vídeo ou formulário', () => {
    renderizar('/servicos/requerimentos?perfil=pessoa-juridica');
    expect(card('defesa-auto-infracao').textContent).toContain('Vídeo');
    expect(card('defesa-auto-infracao').textContent).toContain('Formulário');
    expect(card('registro-novo-pj').textContent).not.toContain('Vídeo');
    expect(card('registro-novo-pj').textContent).not.toContain('Formulário');
  });

  it('a busca considera os sinônimos do tutorial vinculado', () => {
    renderizar('/servicos/requerimentos?perfil=pessoa-juridica');
    buscar('autuação');
    expect(cards().map((a) => a.getAttribute('href'))).toEqual(['/servicos/requerimentos/defesa-auto-infracao']);
  });

  it('?item= válido vai para a página (mantém utm); inválido volta à lista limpa', () => {
    renderizar('/servicos/requerimentos?perfil=pessoa-juridica&item=defesa-auto-infracao&utm_source=email');
    expect(host.querySelector('[data-testid="destino"]')?.textContent).toBe(
      '/servicos/requerimentos/defesa-auto-infracao?utm_source=email',
    );

    renderizar('/servicos/requerimentos?item=../../contato');
    expect(host.querySelector('[data-testid="destino"]')).toBeNull();
    expect(cards().length).toBeGreaterThan(0);
  });
});
