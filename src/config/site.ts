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
