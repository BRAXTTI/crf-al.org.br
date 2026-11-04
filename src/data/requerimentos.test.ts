import { describe, expect, it } from 'vitest';
import { PAGE_METADATA } from '@/config/page-metadata';
import {
  ABA_PASSO_A_PASSO_HASH,
  ehIdRequerimentoValido,
  IDS_REQUERIMENTOS,
  REDIRECTS_TUTORIAIS_PARA_REQUERIMENTOS,
  REQUERIMENTOS_PATH,
  resolverRedirectRequerimentoItem,
  resolverRedirectTutorial,
  TUTORIAIS_ESPELHO_REQUERIMENTO,
  TUTORIAIS_PATH,
} from '@/config/redirects-servicos';
import { PRE_INSCRICAO_PF_URL, PRE_INSCRICAO_PJ_URL } from '@/config/site';
import {
  caminhoDoRequerimento,
  corporateMenu,
  getRequerimento,
  individualMenu,
  perfilDoRequerimento,
  TODOS_OS_REQUERIMENTOS,
} from '@/data/requerimentos';
import { tutoriais } from '@/data/servicos';
import { GUIAS } from '@/data/tutoriais-guias';
import routerSource from '@/router/app-router.tsx?raw';

const IMAGENS_PUBLICAS = Object.keys(import.meta.glob('/public/images/**/*'));

describe('requerimentos: modelo de dados e regras da seção 3', () => {
  it('tem 21 requerimentos com ids únicos no formato slug e funções de consulta/caminho', () => {
    expect(TODOS_OS_REQUERIMENTOS).toHaveLength(21);
    expect(individualMenu.flatMap((c) => c.items)).toHaveLength(8);
    expect(corporateMenu.flatMap((c) => c.items)).toHaveLength(13);

    const vistos = new Set<string>();
    for (const item of TODOS_OS_REQUERIMENTOS) {
      expect(item.id).toMatch(/^[a-z0-9-]+$/);
      expect(vistos.has(item.id), `id duplicado: ${item.id}`).toBe(false);
      vistos.add(item.id);

      expect(item.title.trim().length, item.id).toBeGreaterThan(0);
      expect(item.description.trim().length, item.id).toBeGreaterThan(0);
      expect(item.documentos.length, item.id).toBeGreaterThan(0);
      expect(item.instrucoes.length, item.id).toBeGreaterThan(0);
      expect(getRequerimento(item.id)).toBe(item);
      expect(caminhoDoRequerimento(item.id)).toBe(`/servicos/requerimentos/${item.id}`);
    }
    expect(getRequerimento('inexistente')).toBeUndefined();
  });

  it('deriva o perfil pela posição nos menus PF e PJ sem duplicar no item', () => {
    for (const cat of individualMenu) {
      for (const item of cat.items) {
        expect(perfilDoRequerimento(item.id), item.id).toBe('pessoa-fisica');
      }
    }
    for (const cat of corporateMenu) {
      for (const item of cat.items) {
        expect(perfilDoRequerimento(item.id), item.id).toBe('pessoa-juridica');
      }
    }
  });

  it('mantém vínculo bidirecional entre tutorialId, GUIAS e servicos.ts nos 4 requerimentos espelho', () => {
    const comTutorial = TODOS_OS_REQUERIMENTOS.filter((item) => item.tutorialId);
    expect(comTutorial.map((item) => [item.id, item.tutorialId])).toEqual([
      ['primeira-inscricao-profissional-provisoria', 'primeira-inscricao'],
      ['inscricao-profissional-definitiva', 'inscricao-definitiva'],
      ['contratacao-rt-pj', 'contratacao-rt'],
      ['defesa-auto-infracao', 'defesa-auto-infracao'],
    ]);

    for (const item of comTutorial) {
      const tutorialId = item.tutorialId!;
      expect(GUIAS[tutorialId], `${item.id} -> GUIAS[${tutorialId}]`).toBeDefined();
      const tutorial = tutoriais.find((t) => t.id === tutorialId);
      expect(tutorial, `${item.id} -> servicos.ts (${tutorialId})`).toBeDefined();
      expect(tutorial?.requerimentoId, item.id).toBe(item.id);
    }

    for (const tutorial of tutoriais.filter((t) => t.requerimentoId)) {
      const req = getRequerimento(tutorial.requerimentoId!);
      expect(req, tutorial.id).toBeDefined();
      expect(req?.tutorialId, tutorial.id).toBe(tutorial.id);
    }
  });

  it('exige https:// em downloadUrl, acesso, videoUrl e baseLegal, e valida campos opcionais', () => {
    const idsValidos = new Set([
      ...TODOS_OS_REQUERIMENTOS.map((r) => r.id),
      ...tutoriais.map((t) => t.id),
    ]);

    for (const item of TODOS_OS_REQUERIMENTOS) {
      if (item.downloadUrl !== undefined) {
        expect(item.downloadUrl, item.id).toMatch(/^https:\/\/.+\.docx$/);
      }
      if (item.acesso !== undefined) {
        expect(item.acesso.url, item.id).toMatch(/^https:\/\//);
        expect(item.acesso.label.trim().length, item.id).toBeGreaterThan(0);
      }
      if (item.videoUrl !== undefined) {
        expect(item.videoUrl, item.id).toMatch(/^https:\/\//);
      }
      if (item.fluxogramaUrl !== undefined) {
        expect(IMAGENS_PUBLICAS, item.id).toContain(`/public${item.fluxogramaUrl}`);
      }
      if (item.baseLegal !== undefined) {
        expect(item.baseLegal.label.trim().length, item.id).toBeGreaterThan(0);
        expect(item.baseLegal.url, item.id).toMatch(/^https:\/\//);
      }
      if (item.paraQueServe !== undefined) {
        expect(item.paraQueServe.length, item.id).toBeGreaterThan(0);
        for (const p of item.paraQueServe) expect(p.trim().length, item.id).toBeGreaterThan(0);
      }
      if (item.quemPodeSolicitar !== undefined) {
        expect(item.quemPodeSolicitar.trim().length, item.id).toBeGreaterThan(0);
      }
      if (item.sinonimos !== undefined) {
        for (const termo of item.sinonimos) {
          expect(termo.trim().length, item.id).toBeGreaterThan(0);
          expect(termo, item.id).toBe(termo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase());
        }
      }
      if (item.relacionados !== undefined) {
        for (const rel of item.relacionados) {
          expect(rel, item.id).not.toBe(item.id);
          expect(idsValidos.has(rel), `${item.id} -> relacionado inexistente ${rel}`).toBe(true);
        }
      }
    }
  });

  it('aplica as decisões aprovadas de dados (#9 pré-inscrição PJ, #10 e #13 sem download quebrado/errado, taxa e base legal vazias)', () => {
    const req1 = getRequerimento('primeira-inscricao-profissional-provisoria')!;
    expect(req1.acesso).toEqual({ url: PRE_INSCRICAO_PF_URL, label: 'Fazer pré-inscrição' });
    expect(req1.downloadUrl).toBeUndefined();

    const req9 = getRequerimento('registro-novo-pj')!;
    expect(req9.acesso).toEqual({
      url: PRE_INSCRICAO_PJ_URL,
      label: 'Fazer pré-inscrição',
    });
    expect(req9.acesso?.url).toBe(
      'https://crfal-emcasa.cisantec.com.br/crf-em-casa/precadastro/estabelecimento/inicial.jsf',
    );
    expect(req9.downloadUrl).toBeUndefined();

    const req10 = getRequerimento('registro-inicial-servico-publico')!;
    expect(req10).toBeDefined();
    expect(req10.downloadUrl).toBeUndefined();

    const req13 = getRequerimento('contratacao-rt-servico-publico')!;
    expect(req13).toBeDefined();
    expect(req13.downloadUrl).toBeUndefined();

    for (const item of TODOS_OS_REQUERIMENTOS) {
      expect(item.taxaAplicavel, item.id).toBeUndefined();
      expect(item.baseLegal, item.id).toBeUndefined();
    }
  });

  it('mantém a tabela única de redirects sincronizada com requerimentos.ts e servicos.ts', () => {
    expect([...IDS_REQUERIMENTOS]).toEqual(TODOS_OS_REQUERIMENTOS.map((r) => r.id));
    for (const item of TODOS_OS_REQUERIMENTOS) {
      expect(ehIdRequerimentoValido(item.id)).toBe(true);
    }
    expect(ehIdRequerimentoValido('inexistente')).toBe(false);
    expect(ehIdRequerimentoValido('')).toBe(false);
    expect(ehIdRequerimentoValido(null)).toBe(false);

    const esperadoEspelho = Object.fromEntries(
      TODOS_OS_REQUERIMENTOS.filter((item) => item.tutorialId).map((item) => [item.tutorialId!, item.id]),
    );
    expect(TUTORIAIS_ESPELHO_REQUERIMENTO).toEqual(esperadoEspelho);

    const esperadoPaths = Object.fromEntries(
      Object.entries(esperadoEspelho).map(([tutId, reqId]) => [
        `${TUTORIAIS_PATH}/${tutId}`,
        `${caminhoDoRequerimento(reqId)}${ABA_PASSO_A_PASSO_HASH}`,
      ]),
    );
    expect(REDIRECTS_TUTORIAIS_PARA_REQUERIMENTOS).toEqual(esperadoPaths);

    expect(
      resolverRedirectRequerimentoItem(
        'defesa-auto-infracao',
        '?perfil=pessoa-juridica&categoria=fiscalizacao-recursos&item=defesa-auto-infracao&utm_source=email',
      ),
    ).toBe('/servicos/requerimentos/defesa-auto-infracao?utm_source=email');
    expect(
      resolverRedirectRequerimentoItem('id-inexistente', '?item=id-inexistente&perfil=pessoa-fisica'),
    ).toBe(REQUERIMENTOS_PATH);
    expect(resolverRedirectRequerimentoItem('../../contato', '?item=../../contato')).toBe(
      REQUERIMENTOS_PATH,
    );

    const idsTutoriais = new Set(tutoriais.map((t) => t.id));
    const isTutValido = (id: string) => idsTutoriais.has(id);

    expect(
      resolverRedirectTutorial(
        'primeira-inscricao',
        '?tutorial=primeira-inscricao&perfil=pessoa-fisica&utm_source=insta',
        isTutValido,
      ),
    ).toBe(
      '/servicos/requerimentos/primeira-inscricao-profissional-provisoria?utm_source=insta#passo-a-passo',
    );
    expect(
      resolverRedirectTutorial('baixa-rt', '?tutorial=baixa-rt&utm_source=x', isTutValido),
    ).toBe('/servicos/tutoriais/baixa-rt?utm_source=x');
    expect(resolverRedirectTutorial('inexistente', '?tutorial=inexistente', isTutValido)).toBe(
      TUTORIAIS_PATH,
    );
  });

  it('exige entrada em PAGE_METADATA para a página de cada requerimento', () => {
    const entradasRequerimento = Object.keys(PAGE_METADATA).filter((path) =>
      path.startsWith(`${REQUERIMENTOS_PATH}/`),
    );

    for (const path of entradasRequerimento) {
      const slug = path.slice(`${REQUERIMENTOS_PATH}/`.length);
      const item = getRequerimento(slug);
      expect(item, `PAGE_METADATA contém requerimento inexistente: ${path}`).toBeDefined();
      expect(PAGE_METADATA[path].title, path).toBe(item!.title);
      expect(PAGE_METADATA[path].description.trim().length, path).toBeGreaterThan(0);
    }

    // A rota existe desde a Fase 2: sem entrada, o middleware devolve 404 em produção.
    expect(routerSource).toMatch(/path: 'servicos\/requerimentos\/:slug'/);
    expect(entradasRequerimento).toHaveLength(TODOS_OS_REQUERIMENTOS.length);
    for (const item of TODOS_OS_REQUERIMENTOS) {
      const path = caminhoDoRequerimento(item.id);
      expect(PAGE_METADATA[path], `Falta ${path} em PAGE_METADATA`).toBeDefined();
      expect(PAGE_METADATA[path].title, path).toBe(item.title);
      expect(PAGE_METADATA[path].description.trim().length, path).toBeGreaterThan(0);
    }
  });
});
