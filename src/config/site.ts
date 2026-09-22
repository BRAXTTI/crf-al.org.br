/**
 * Configuração central de URL do site.
 * Defina `VITE_SITE_URL` no build (Cloudflare Pages) para trocar o domínio
 * sem alterar código. O padrão é o subdomínio institucional.
 */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL ?? 'https://institucional.crf-al.org.br'
).replace(/\/$/, '');

export const SITE_NAME = 'CRFAL - Conselho Regional de Farmácia do Estado de Alagoas';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/logo-crf-azul.png`;

/**
 * Página do WordPress (novo) que renderiza o feed do Instagram via Smash Balloon.
 * O React não interpreta shortcodes, então o feed é exibido em um iframe.
 */
export const INSTAGRAM_FEED_URL =
  import.meta.env.VITE_INSTAGRAM_FEED_URL ?? 'https://wordpress.crf-al.org.br/instagram/';
