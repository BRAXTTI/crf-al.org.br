import { describe, expect, it } from 'vitest';
import { fimDoPrazo, popupDaVez, popupNoAr, popups, type Popup } from './popups';

const base: Popup = { id: 'teste', image: '/x.webp', alt: 'Teste', ate: '2026-10-30' };

describe('prazo dos popups (fuso de Maceió)', () => {
  it('fica no ar até 30/10 23:59:59 em Maceió', () => {
    expect(popupNoAr(base, new Date('2026-10-28T12:00:00-03:00'))).toBe(true);
    expect(popupNoAr(base, new Date('2026-10-30T23:59:00-03:00'))).toBe(true);
    expect(popupNoAr(base, new Date('2026-10-30T23:59:59.999-03:00'))).toBe(true);
  });

  it('sai do ar em 31/10 00:00 em Maceió', () => {
    expect(popupNoAr(base, new Date('2026-10-31T00:00:00-03:00'))).toBe(false);
    expect(popupNoAr(base, new Date('2026-11-15T10:00:00-03:00'))).toBe(false);
  });

  it('usa o dia de Maceió, não o UTC nem o fuso do visitante', () => {
    // 02:30 UTC de 31/10 ainda é 30/10 23:30 em Maceió.
    expect(popupNoAr(base, new Date('2026-10-31T02:30:00Z'))).toBe(true);
    // 03:00 UTC de 31/10 já é 31/10 00:00 em Maceió.
    expect(popupNoAr(base, new Date('2026-10-31T03:00:00Z'))).toBe(false);
  });

  it('sem `ate` não expira; `active: false` nunca vai ao ar', () => {
    expect(popupNoAr({ ...base, ate: undefined }, new Date('2030-01-01T00:00:00Z'))).toBe(true);
    expect(popupNoAr({ ...base, active: false }, new Date('2026-10-28T12:00:00-03:00'))).toBe(false);
  });

  it('o popup do simpósio Einstein aparece até 30/10 e some em 31/10', () => {
    expect(popupDaVez(popups, new Date('2026-10-28T12:00:00-03:00'))?.id).toBe('simposio-einstein-2026-10');
    expect(popupDaVez(popups, new Date('2026-10-30T23:59:00-03:00'))?.id).toBe('simposio-einstein-2026-10');
    expect(popupDaVez(popups, new Date('2026-10-31T00:00:00-03:00'))).toBeNull();
  });

  it('fimDoPrazo aponta para 31/10 00:00 em Maceió', () => {
    expect(fimDoPrazo(base)).toBe(Date.parse('2026-10-31T03:00:00Z'));
    expect(popupNoAr(base, new Date(fimDoPrazo(base)! - 1))).toBe(true);
    expect(popupNoAr(base, new Date(fimDoPrazo(base)!))).toBe(false);
    expect(fimDoPrazo({ ...base, ate: undefined })).toBeNull();
  });
});
