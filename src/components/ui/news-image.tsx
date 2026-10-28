import { useState } from 'react';
import type { ImageSet } from '@/services/wordpress/image-set';
import { IMAGE_PLACEHOLDER } from '@/lib/image-placeholder';

interface NewsImageProps {
  image?: ImageSet;
  sizes?: string;
  /** Caixa: deve fixar a proporção (ex.: `aspect-16/10`) para não haver deslocamento de layout. */
  className?: string;
  imgClassName?: string;
  alt?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
}

/**
 * Imagem inteira (as artes têm texto e proporções variadas) sobre um fundo desfocado da própria imagem.
 * A cópia desfocada usa a mesma URL (sem download extra) e nunca recebe prioridade.
 * Sem imagem, ou se ela falhar, o placeholder ocupa a caixa inteira (não há arte a preservar).
 */
export function NewsImage({ image, sizes, className = '', imgClassName = '', alt = '', loading = 'lazy', fetchPriority }: NewsImageProps) {
  const [failedSrc, setFailedSrc] = useState<string>();
  if (!image?.src || failedSrc === image.src) {
    return (
      <div data-news-image className={`relative overflow-hidden bg-crfal-blue-lighter ${className}`}>
        <img src={IMAGE_PLACEHOLDER} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
      </div>
    );
  }
  const { src, srcSet } = image;
  const imgSizes = srcSet ? sizes : undefined;
  const onError = () => setFailedSrc(src);
  return (
    <div data-news-image className={`relative isolate overflow-hidden bg-crfal-blue-dark ${className}`}>
      <img src={src} srcSet={srcSet} sizes={imgSizes} alt={alt} loading={loading} fetchPriority={fetchPriority} decoding="async" onError={onError} className={`h-full w-full object-contain ${imgClassName}`} />
      <img src={src} srcSet={srcSet} sizes={imgSizes} alt="" aria-hidden="true" loading={loading} decoding="async" onError={onError} className="absolute inset-0 -z-10 h-full w-full scale-150 object-cover opacity-60 blur-2xl" />
    </div>
  );
}
