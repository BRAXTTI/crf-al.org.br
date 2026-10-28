// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IMAGE_PLACEHOLDER } from '@/lib/image-placeholder';
import { CapaEvento } from './EventCards';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

const capa = { src: 'https://exemplo.test/evento-1024.jpg', srcSet: 'https://exemplo.test/evento-300.jpg 300w, https://exemplo.test/evento-1024.jpg 1024w', width: 1080, height: 1350, alt: '' };

function montar() {
  act(() => root.render(<CapaEvento capa={capa} titulo="Simpósio" />));
  return host.querySelector('figure img') as HTMLImageElement;
}

describe('CapaEvento', () => {
  it('mostra a arte inteira, com dimensões reservadas e alt de fallback', () => {
    const img = montar();
    expect(img.getAttribute('src')).toBe(capa.src);
    expect(img.getAttribute('srcset')).toBe(capa.srcSet);
    expect(img.getAttribute('width')).toBe('1080');
    expect(img.getAttribute('height')).toBe('1350');
    expect(img.alt).toBe('Arte de divulgação do evento «Simpósio»');
    expect(img.className).not.toMatch(/object-cover/);
  });

  it('troca a capa quebrada pelo placeholder na mesma caixa da arte, mantendo o alt', () => {
    const quebrada = montar();
    act(() => { quebrada.dispatchEvent(new Event('error')); });
    const imgs = host.querySelectorAll('figure img');
    expect(imgs).toHaveLength(1);
    const img = imgs[0] as HTMLImageElement;
    expect(img.getAttribute('src')).toBe(IMAGE_PLACEHOLDER);
    expect(img.hasAttribute('srcset')).toBe(false);
    expect(img.alt).toBe('Arte de divulgação do evento «Simpósio»');
    expect(img.style.aspectRatio).toMatch(/^0\.8\b/);
    expect(img.style.width).toContain('800px');
  });

  it('volta a tentar quando a capa muda', () => {
    const quebrada = montar();
    act(() => { quebrada.dispatchEvent(new Event('error')); });
    act(() => root.render(<CapaEvento capa={{ ...capa, src: 'https://exemplo.test/outra.jpg', srcSet: undefined }} titulo="Simpósio" />));
    expect(host.querySelector('figure img')!.getAttribute('src')).toBe('https://exemplo.test/outra.jpg');
  });
});
