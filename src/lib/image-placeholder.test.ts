// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { IMAGE_PLACEHOLDER, handleImageError } from './image-placeholder';

const PREFIX = 'data:image/svg+xml,';

describe('IMAGE_PLACEHOLDER', () => {
  it('é um data URI SVG codificado', () => {
    expect(IMAGE_PLACEHOLDER.startsWith(PREFIX)).toBe(true);
    const payload = IMAGE_PLACEHOLDER.slice(PREFIX.length);
    expect(payload).not.toMatch(/[<>#"]/);
  });

  it('decodifica para um SVG bem formado, com dimensões e sem texto', () => {
    const svg = decodeURIComponent(IMAGE_PLACEHOLDER.slice(PREFIX.length));
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
    const root = doc.documentElement;
    expect(root.localName).toBe('svg');
    expect(root.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(Number(root.getAttribute('width'))).toBeGreaterThan(0);
    expect(Number(root.getAttribute('height'))).toBeGreaterThan(0);
    expect(root.getElementsByTagName('rect')).toHaveLength(1);
    expect(root.textContent?.trim()).toBe('');
  });

  it('o parser acusa o SVG antigo, com o rect sem fechar', () => {
    const antigo = "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200'><rect width='400' height='200' fill='#e5e7eb'></svg>";
    const doc = new DOMParser().parseFromString(antigo, 'image/svg+xml');
    expect(doc.getElementsByTagName('parsererror').length).toBeGreaterThan(0);
  });
});

describe('handleImageError', () => {
  it('troca a imagem quebrada pelo placeholder e para na segunda falha', () => {
    const img = document.createElement('img');
    img.setAttribute('src', 'https://exemplo.test/quebrada.jpg');
    img.setAttribute('srcset', 'https://exemplo.test/quebrada.jpg 300w');
    const evento = { currentTarget: img } as unknown as React.SyntheticEvent<HTMLImageElement>;
    handleImageError(evento);
    expect(img.getAttribute('src')).toBe(IMAGE_PLACEHOLDER);
    expect(img.hasAttribute('srcset')).toBe(false);
    let escritas = 0;
    const desc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')!;
    Object.defineProperty(img, 'src', { configurable: true, get: () => desc.get!.call(img), set: (v) => { escritas++; desc.set!.call(img, v); } });
    handleImageError(evento);
    expect(escritas).toBe(0);
  });
});
