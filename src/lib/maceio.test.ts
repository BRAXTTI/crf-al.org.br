import { describe, expect, it } from 'vitest';
import { statusAtendimento } from './maceio';

// Maceió fica em UTC-3 o ano todo.
const em = (dataHora: string) => new Date(`${dataHora}:00-03:00`);

describe('statusAtendimento', () => {
  describe('dia normal', () => {
    it('antes, durante e depois do expediente', () => {
      expect(statusAtendimento(em('2026-10-27T08:59')).texto).toBe('Fechado · abre hoje às 9h');
      expect(statusAtendimento(em('2026-10-27T09:00'))).toEqual({ aberto: true, texto: 'Aberto agora · fecha às 17h' });
      expect(statusAtendimento(em('2026-10-27T17:00')).texto).toBe('Fechado · abre amanhã às 9h');
    });

    it('fim de semana abre na segunda', () => {
      expect(statusAtendimento(em('2026-11-06T18:00')).texto).toBe('Fechado · abre segunda às 9h');
      expect(statusAtendimento(em('2026-11-07T10:00')).texto).toBe('Fechado · abre segunda às 9h');
      expect(statusAtendimento(em('2026-11-08T10:00')).texto).toBe('Fechado · abre segunda às 9h');
    });
  });

  describe('sexta e segunda fechadas (30/10 e 2/11/2026)', () => {
    it('fica fechado a sexta toda, com o motivo, e abre na terça', () => {
      for (const hora of ['08:00', '10:00', '18:00']) {
        expect(statusAtendimento(em(`2026-10-30T${hora}`))).toEqual({ aberto: false, texto: 'Fechado hoje · Dia do Servidor Público · abre terça às 9h' });
      }
    });

    it('a véspera não diz "abre amanhã"', () => {
      expect(statusAtendimento(em('2026-10-29T10:00')).aberto).toBe(true);
      expect(statusAtendimento(em('2026-10-29T17:30')).texto).toBe('Fechado · abre terça às 9h');
    });

    it('o fim de semana abre na terça', () => {
      expect(statusAtendimento(em('2026-10-31T10:00')).texto).toBe('Fechado · abre terça às 9h');
      expect(statusAtendimento(em('2026-11-01T10:00')).texto).toBe('Fechado · abre terça às 9h');
    });

    it('a segunda de Finados fica fechada e abre amanhã', () => {
      expect(statusAtendimento(em('2026-11-02T10:00'))).toEqual({ aberto: false, texto: 'Fechado hoje · Finados · abre amanhã às 9h' });
    });

    it('usa a data de Maceió, não a de UTC', () => {
      expect(statusAtendimento(new Date('2026-10-30T02:00:00Z')).texto).toBe('Fechado · abre terça às 9h'); // 23h de quinta em Maceió
      expect(statusAtendimento(new Date('2026-10-31T02:00:00Z')).texto).toBe('Fechado hoje · Dia do Servidor Público · abre terça às 9h'); // 23h de sexta em Maceió
    });
  });

  describe('dia fechado no meio da semana', () => {
    const quarta = [{ data: '2026-11-11' }];

    it('sem motivo, mostra só "Fechado hoje" e abre amanhã', () => {
      expect(statusAtendimento(em('2026-11-11T10:00'), quarta)).toEqual({ aberto: false, texto: 'Fechado hoje · abre amanhã às 9h' });
    });

    it('a véspera pula para o próximo dia com expediente', () => {
      expect(statusAtendimento(em('2026-11-10T18:00'), quarta).texto).toBe('Fechado · abre quinta às 9h');
    });

    it('segunda fechada empurra a abertura do fim de semana para terça', () => {
      const segunda = [{ data: '2026-11-09', motivo: 'Feriado' }];
      expect(statusAtendimento(em('2026-11-06T18:00'), segunda).texto).toBe('Fechado · abre terça às 9h');
      expect(statusAtendimento(em('2026-11-09T10:00'), segunda).texto).toBe('Fechado hoje · Feriado · abre amanhã às 9h');
    });

    it('recesso de uma semana ou mais informa a data de volta', () => {
      const recesso = ['2026-12-21', '2026-12-22', '2026-12-23', '2026-12-24', '2026-12-25', '2026-12-28'].map((data) => ({ data }));
      expect(statusAtendimento(em('2026-12-18T18:00'), recesso).texto).toBe('Fechado · abre em 29/12 às 9h');
    });
  });
});
