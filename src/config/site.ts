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

/** Perfil do Instagram (usado no botão de fallback do carrossel). */
export const INSTAGRAM_PROFILE_URL =
  import.meta.env.VITE_INSTAGRAM_PROFILE_URL ?? 'https://www.instagram.com/crfal/';

/** Link de acesso ao sistema CRF AL em Casa (autenticação do profissional). */
export const CRF_EM_CASA_URL =
  'https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf';

/** Portal de transparência (Implanta), usado em várias seções do site. */
export const TRANSPARENCIA_URL =
  'https://crf-al.implanta.net.br/portalTransparencia/#publico/inicio';

/**
 * Redes sociais oficiais do CRF-AL — todas sob o identificador `crfal`.
 * Fonte única para o cabeçalho e o rodapé.
 */
export const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/crfal' },
  { label: 'YouTube', href: 'https://www.youtube.com/@crfal' },
  { label: 'Facebook', href: 'https://www.facebook.com/crfal' },
  { label: 'X', href: 'https://x.com/crfal' },
] as const;
