// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IMAGE_PLACEHOLDER } from '@/lib/image-placeholder';
import { NewsImage } from './news-image';

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

const imagem = { src: 'https://exemplo.test/arte-1024.jpg', srcSet: 'https://exemplo.test/arte-300.jpg 300w, https://exemplo.test/arte-1024.jpg 1024w', alt: 'Arte da notícia' };

function montar(props: Parameters<typeof NewsImage>[0]) {
  act(() => root.render(<NewsImage {...props} />));
  const box = host.firstElementChild as HTMLDivElement;
  const [principal, fundo] = Array.from(box.querySelectorAll('img'));
  return { box, principal, fundo };
}

describe('NewsImage', () => {
  it('mostra a arte inteira sobre a cópia desfocada, numa caixa de proporção fixa', () => {
    const { box, principal, fundo } = montar({ image: imagem, sizes: '100vw', alt: imagem.alt, className: 'aspect-16/10 w-full' });
    expect(box.className).toContain('aspect-16/10');
    expect(box.className).toContain('overflow-hidden');
    expect(principal.className).toContain('object-contain');
    expect(principal.className).not.toContain('object-cover');
    expect(principal.alt).toBe('Arte da notícia');
    expect(fundo.getAttribute('aria-hidden')).toBe('true');
    expect(fundo.alt).toBe('');
    expect(fundo.className).toContain('blur-2xl');
    expect(fundo.getAttribute('src')).toBe(principal.getAttribute('src'));
    expect(fundo.getAttribute('srcset')).toBe(principal.getAttribute('srcset'));
  });

  it('só a imagem principal recebe prioridade', () => {
    const { principal, fundo } = montar({ image: imagem, sizes: '100vw', fetchPriority: 'high', loading: 'eager' });
    expect(principal.getAttribute('fetchpriority')).toBe('high');
    expect(fundo.getAttribute('fetchpriority')).toBeNull();
  });

  it('sem imagem, o placeholder ocupa a caixa sozinho, sem srcset/sizes', () => {
    const { box } = montar({ sizes: '100vw', className: 'aspect-16/10' });
    const imgs = box.querySelectorAll('img');
    expect(imgs).toHaveLength(1);
    expect(imgs[0].getAttribute('src')).toBe(IMAGE_PLACEHOLDER);
    expect(imgs[0].hasAttribute('srcset')).toBe(false);
    expect(imgs[0].hasAttribute('sizes')).toBe(false);
    expect(box.className).toContain('aspect-16/10');
  });

  it('ao falhar, troca pelo placeholder e mantém a caixa', () => {
    const { principal } = montar({ image: imagem, sizes: '100vw', alt: imagem.alt, className: 'aspect-4/3 w-28' });
    act(() => { principal.dispatchEvent(new Event('error')); });
    const box = host.firstElementChild as HTMLDivElement;
    const imgs = box.querySelectorAll('img');
    expect(imgs).toHaveLength(1);
    expect(imgs[0].getAttribute('src')).toBe(IMAGE_PLACEHOLDER);
    expect(imgs[0].alt).toBe('Arte da notícia');
    expect(imgs[0].hasAttribute('srcset')).toBe(false);
    expect(box.className).toContain('aspect-4/3');
  });

  it('a falha da cópia desfocada também cai no placeholder', () => {
    const { fundo } = montar({ image: imagem, sizes: '100vw' });
    act(() => { fundo.dispatchEvent(new Event('error')); });
    const imgs = host.querySelectorAll('img');
    expect(imgs).toHaveLength(1);
    expect(imgs[0].getAttribute('src')).toBe(IMAGE_PLACEHOLDER);
  });

  it('uma nova imagem volta a ser exibida depois de uma falha', () => {
    const { principal } = montar({ image: imagem, sizes: '100vw' });
    act(() => { principal.dispatchEvent(new Event('error')); });
    const outra = { ...imagem, src: 'https://exemplo.test/outra.jpg', srcSet: undefined };
    act(() => root.render(<NewsImage image={outra} sizes="100vw" />));
    const imgs = host.querySelectorAll('img');
    expect(imgs).toHaveLength(2);
    expect(imgs[0].getAttribute('src')).toBe(outra.src);
  });
});
