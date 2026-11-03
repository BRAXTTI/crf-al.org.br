// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import AfastamentoProvisorioPage from './AfastamentoProvisorioPage';

let root: Root;
let host: HTMLElement;

beforeEach(() => {
  (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.body.appendChild(document.createElement('div'));
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

describe('AfastamentoProvisorioPage', () => {
  it('orienta fazer tudo pelo CRF AL em Casa, linka o tutorial e não menciona protocolo por e-mail nem requerimento avulso', () => {
    act(() =>
      root.render(
        <HelmetProvider>
          <MemoryRouter initialEntries={['/fiscalizacao/afastamento-provisorio']}>
            <AfastamentoProvisorioPage />
          </MemoryRouter>
        </HelmetProvider>,
      ),
    );

    const artigo = host.querySelector('article')!;
    expect(artigo).not.toBeNull();
    expect(artigo.textContent).toContain('CRF AL em Casa');
    expect(artigo.textContent).toContain('sem necessidade de baixar requerimento avulso ou enviar pedido por e-mail');
    expect(artigo.textContent).not.toContain('seção de Requerimentos');
    expect(artigo.textContent).not.toContain('mediante requerimento próprio');
    expect(artigo.textContent).not.toContain('fiscalizacao@crf-al.org.br');

    const linksTutorial = [...artigo.querySelectorAll<HTMLAnchorElement>('a')].filter(
      (a) => a.getAttribute('href') === '/servicos/tutoriais/afastamento-provisorio',
    );
    expect(linksTutorial.length).toBeGreaterThanOrEqual(1);
  });
});
