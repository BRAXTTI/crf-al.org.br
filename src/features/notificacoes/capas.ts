import type { NotificationImage } from '@/components/ui/live-notification-feed';
import { mediaImageSet } from '@/services/wordpress/image-set';
import type { WPMedia } from '@/services/wordpress/types';

/*
  Capas reais das notificações, nos tamanhos que o próprio WordPress já gera (sem
  Cloudflare Images): `src`/`srcSet` para a capa larga do painel e o recorte quadrado
  `thumbnail` (150×150) para a foto dos toasts. Funções puras, testadas em Node.
*/

const THUMBNAIL = 150;

/** Capa de notícia a partir da mídia embutida (`_embed`). */
export function capaDaMidia(media: WPMedia | undefined): NotificationImage | undefined {
  const set = mediaImageSet(media);
  if (!set) return undefined;
  // Só o recorte de 150×150 (pelas dimensões do `media_details`): os toasts nunca pedem nada maior.
  const thumbnail = media?.media_details?.sizes?.thumbnail;
  const miniatura = thumbnail?.source_url && thumbnail.width === THUMBNAIL && thumbnail.height === THUMBNAIL ? thumbnail.source_url : undefined;
  // `set.src` pode ser uma variante (ex.: `large`); a URL original da API fica como última tentativa do painel.
  const original = media?.source_url && media.source_url !== set.src ? media.source_url : undefined;
  return { src: set.src, srcSet: set.srcSet, thumb: miniatura, ...(original && { original }) };
}

/**
 * Capa de evento a partir do `banner` da API (uma única URL, em geral o tamanho `large`).
 * A lista `/crfal/v1/events` não traz o anexo nem seus `sizes`, então nenhuma variante é
 * deduzida pelo nome do arquivo (evita 404 previsíveis): o painel usa o próprio banner, sem
 * `srcSet`, e o toast fica com o ícone do tipo (sem `thumb`, nunca baixa a imagem grande).
 */
export function capaDoBanner(banner: string | null | undefined): NotificationImage | undefined {
  if (!banner) return undefined;
  try {
    return new URL(banner).protocol === 'https:' ? { src: banner } : undefined;
  } catch {
    return undefined;
  }
}
