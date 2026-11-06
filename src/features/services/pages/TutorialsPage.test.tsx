// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TUTORIAIS_ESPELHO_REQUERIMENTO } from '@/config/redirects-servicos';
import { tutoriais } from '@/data/servicos';
import TutorialDetailPage from './TutorialDetailPage';
import TutorialsPage from './TutorialsPage';

let root: Root;
let host: HTMLElement;

function Destino() {
  const { pathname, search, hash } = useLocation();
  return <p data-testid="destino">{`${pathname}${search}${hash}`}</p>;
}

function renderizar(entrada: string) {
  act(() => {
    root.render(
      <HelmetProvider>
        <MemoryRouter key={entrada} initialEntries={[entrada]}>
          <Routes>
            <Route path="/servicos/tutoriais" element={<TutorialsPage />} />
            <Route path="/servicos/tutoriais/:id" element={<TutorialDetailPage />} />
            <Route path="/servicos/requerimentos/:slug" element={<Destino />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>,
    );
  });
}

const destino = () => host.querySelector('[data-testid="destino"]')?.textContent;
const ESPELHO = Object.entries(TUTORIAIS_ESPELHO_REQUERIMENTO);

beforeEach(() => {
  (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  host = document.body.appendChild(document.createElement('div'));
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

describe('TutorialsPage: fusão dos 4 tutoriais espelho', () => {
  it('o hub segue com as 11 tarefas; os 4 espelho levam à aba Passo a passo do requerimento', () => {
    renderizar('/servicos/tutoriais');
    const linhas = [...host.querySelectorAll<HTMLAnchorElement>('#todas-tarefas ~ div a')];
    expect(linhas).toHaveLength(tutoriais.length);
    const hrefs = [...host.querySelectorAll<HTMLAnchorElement>('a')].map((a) => a.getAttribute('href'));
    for (const [tutId, reqId] of ESPELHO) {
      expect(hrefs, tutId).toContain(`/servicos/requerimentos/${reqId}#passo-a-passo`);
      expect(hrefs, tutId).not.toContain(`/servicos/tutoriais/${tutId}`);
    }
    expect(hrefs).toContain('/servicos/tutoriais/baixa-rt');
  });

  it('?tutorial= de um espelho vai direto para a página do requerimento, com utm', () => {
    renderizar('/servicos/tutoriais?tutorial=defesa-auto-infracao&perfil=pessoa-juridica&utm_source=x');
    expect(destino()).toBe('/servicos/requerimentos/defesa-auto-infracao?utm_source=x#passo-a-passo');
  });

  it('/servicos/tutoriais/<espelho> vira a página do requerimento (#passo-a-passo)', () => {
    for (const [tutId, reqId] of ESPELHO) {
      renderizar(`/servicos/tutoriais/${tutId}`);
      expect(destino(), tutId).toBe(`/servicos/requerimentos/${reqId}#passo-a-passo`);
    }
  });

  it('as 7 tarefas que não são requerimento continuam na página de tutorial', () => {
    renderizar('/servicos/tutoriais/justificativa-de-ausencia');
    expect(destino()).toBeUndefined();
    expect(host.querySelector('h1')?.textContent).toBe('Justificar ausência');
  });
});

describe('TutorialsPage: tutorial removido (consulta-rt)', () => {
  it('sai do hub e da busca', () => {
    renderizar('/servicos/tutoriais');
    const hrefs = [...host.querySelectorAll<HTMLAnchorElement>('a')].map((a) => a.getAttribute('href'));
    expect(hrefs).not.toContain('/servicos/tutoriais/consulta-rt');
    expect(host.textContent).not.toContain('Consultar meus vínculos de RT');
    expect(tutoriais.some((t) => t.id === 'consulta-rt')).toBe(false);
  });

  it('/servicos/tutoriais/consulta-rt e ?tutorial=consulta-rt voltam ao hub, sem 404', () => {
    for (const entrada of ['/servicos/tutoriais/consulta-rt', '/servicos/tutoriais?tutorial=consulta-rt']) {
      renderizar(entrada);
      expect(host.querySelector('#todas-tarefas'), entrada).not.toBeNull();
      expect(host.textContent, entrada).not.toContain('Consultar meus vínculos de RT');
    }
  });
});
