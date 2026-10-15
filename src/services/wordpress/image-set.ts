import type { WPMedia } from './types';

/** `sizes` da capa da notícia. O preload do middleware usa o mesmo valor do `<img>`. */
export const NEWS_COVER_SIZES = '(max-width: 1024px) 100vw, 66vw';

export interface ImageSet {
  src: string;
  srcSet?: string;
  width?: number;
  height?: number;
  alt: string;
}

/**
 * Monta src/srcset a partir dos tamanhos gerados pelo WordPress (largura >= 300, crescente).
 * Recortes com proporção diferente da original (ex.: thumbnail quadrado) ficam de fora.
 * Função pura: usada pelo SPA e pela Pages Function (preload), que precisam escolher a mesma imagem.
 */
export function mediaImageSet(media: WPMedia | undefined): ImageSet | undefined {
  if (!media?.source_url) return undefined;
  const details = media.media_details;
  const ratio = details?.width && details.height ? details.width / details.height : undefined;
  const byWidth = new Map<number, { source_url: string; width: number; height: number }>();
  for (const size of Object.values(details?.sizes ?? {})) {
    if (!size?.source_url || !(size.width >= 300) || !(size.height > 0)) continue;
    if (ratio && Math.abs(size.width / size.height - ratio) / ratio > 0.02) continue;
    if (!byWidth.has(size.width)) byWidth.set(size.width, size);
  }
  const candidates = [...byWidth.values()].sort((a, b) => a.width - b.width);
  const largeUrl = details?.sizes?.large?.source_url;
  const chosen = candidates.find(size => size.source_url === largeUrl) ?? candidates.at(-1);
  const escapeUrl = (url: string) => url.replace(/ /g, '%20').replace(/,/g, '%2C');
  return {
    src: chosen?.source_url ?? media.source_url,
    srcSet: candidates.length > 1 ? candidates.map(size => `${escapeUrl(size.source_url)} ${size.width}w`).join(', ') : undefined,
    width: chosen?.width ?? details?.width,
    height: chosen?.height ?? details?.height,
    alt: media.alt_text ?? '',
  };
}
