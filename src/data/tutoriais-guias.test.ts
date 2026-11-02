import { describe, expect, it } from 'vitest';
import { PAGE_METADATA } from '@/config/page-metadata';
import { VIDEOS_URL } from '@/config/site';
import { TAREFAS } from '@/config/tutoriais-medicao';
import { CATEGORIAS_TUTORIAIS, MAIS_PROCURADOS, tutoriais } from '@/data/servicos';
import { combinaBusca } from '@/features/services/tutorial-busca';
import { GUIAS } from './tutoriais-guias';

const IMAGENS_PUBLICAS = Object.keys(import.meta.glob('/public/images/tutoriais/*'));
const buscar = (termo: string) => tutoriais.filter((t) => combinaBusca(t, termo)).map((t) => t.id);

describe('tutoriais', () => {
  it('tem 12 tarefas, cada uma com guia, metadados e medição', () => {
    expect(tutoriais).toHaveLength(12);
    for (const { id, titulo, category } of tutoriais) {
      expect(GUIAS[id], id).toBeDefined();
      expect(PAGE_METADATA[`/servicos/tutoriais/${id}`]?.title, id).toBe(titulo);
      expect(TAREFAS as readonly string[], id).toContain(id);
      expect(CATEGORIAS_TUTORIAIS, id).toContain(category);
    }
    expect(Object.keys(GUIAS).sort()).toEqual(tutoriais.map((t) => t.id).sort());
    expect(MAIS_PROCURADOS).toHaveLength(6);
    for (const id of MAIS_PROCURADOS) expect(GUIAS[id], id).toBeDefined();
  });

  it('mantém o texto curto', () => {
    for (const [id, guia] of Object.entries(GUIAS)) {
      expect(guia.antes.length, id).toBeGreaterThan(0);
      expect(guia.antes.length, id).toBeLessThanOrEqual(3);
      expect(guia.problemas.length, id).toBeGreaterThanOrEqual(1);
      expect(guia.problemas.length, id).toBeLessThanOrEqual(3);
      const palavras = guia.passos.map((p) => p.titulo.split(/\s+/).length);
      expect(palavras.reduce((a, b) => a + b, 0) / palavras.length, id).toBeLessThanOrEqual(8);
      if (guia.proxima) expect(GUIAS[guia.proxima], id).toBeDefined();
    }
  });

  it('tem os 5 vídeos curtos no R2, com tempos contíguos e crescentes por passo', () => {
    const comVideo = Object.entries(GUIAS).filter(([, guia]) => guia.video);
    expect(comVideo.map(([id]) => id).sort()).toEqual(['afastamento-provisorio', 'baixa-rt', 'emitir-boletos', 'imprimir-crt', 'situacao-protocolos']);
    for (const [id, guia] of comVideo) {
      expect(guia.video!.src.startsWith(`${VIDEOS_URL}/`), id).toBe(true);
      expect(guia.passos[0].inicio, id).toBe(0);
      guia.passos.forEach((passo, i) => {
        expect(passo.fim!, id).toBeGreaterThan(passo.inicio!);
        if (i > 0) expect(passo.inicio, id).toBe(guia.passos[i - 1].fim);
      });
    }
  });

  it('tem capa provisória só nas tarefas sem vídeo curto, com arquivo e alt', () => {
    const comCapa = Object.entries(GUIAS).filter(([, guia]) => guia.capaProvisoria);
    expect(comCapa.map(([id]) => id).sort()).toEqual(['primeira-inscricao']);
    for (const [id, guia] of comCapa) {
      expect(guia.video, id).toBeUndefined();
      expect(IMAGENS_PUBLICAS, id).toContain(`/public${guia.capaProvisoria!.src}`);
      expect(guia.capaProvisoria!.alt, id).toMatch(/^Ilustração /);
    }
  });

  it('só cita vídeo completo quando há link do YouTube', () => {
    for (const t of tutoriais) if (GUIAS[t.id].videoCompleto) expect(t.videoUrl, t.id).toBeTruthy();
  });

  it('encontra pelas palavras de quem usa', () => {
    expect(buscar('sair da farmácia')).toEqual(['baixa-rt']);
    expect(buscar('anuidade')).toEqual(['emitir-boletos']);
    expect(buscar('certidão')).toContain('imprimir-crt');
    expect(buscar('zzz')).toEqual([]);
    expect(buscar('')).toHaveLength(12);
  });
});
