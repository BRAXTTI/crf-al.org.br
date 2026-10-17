// Caminho relativo: o middleware (Pages Function) também lê esta lista para o preload do 1º banner.
import { CRF_EM_CASA_URL, OUVIDORIA_URL } from '../config/site';

/**
 * Banners do topo da home (hero).
 *
 * TROCA DE BANNER (sem mexer em código além desta lista):
 *  1. Coloque os arquivos em `public/images/banners/`.
 *  2. Adicione um objeto abaixo (ex.: image: '/images/banners/evento.webp').
 *  3. Commit/push — o deploy cuida do resto.
 *
 * Formato das artes (obrigatório, para não cortar):
 *  - `image`       → 16:5 paisagem — 1920×600 px (exibido em telas ≥ 768px)
 *  - `imageMobile` → 4:5 retrato   — 1080×1350 ou 1122×1402 px (telas < 768px)
 *    Para outra resolução, informe `imageMobileWidth` e `imageMobileHeight`.
 *  - `imageMobileSmall` → a mesma arte mobile em 720×900 px (60–80 KB), para celulares
 *    (ex.: cwebp -q 80 -resize 720 900 arte.webp -o arte-720.webp)
 *
 * Regras:
 *  - Artes desktop antigas são exibidas inteiras, com faixas laterais de fundo.
 *    Use a nova proporção 16:5 para preencher toda a largura.
 *  - Mantenha o conteúdo importante no centro (~70% da largura / 60% da altura).
 *  - Se a arte já tem texto, NÃO preencha `title`/`subtitle`/`ctaLabel`.
 *  - Se quiser texto sobreposto pelo site, preencha `title` (e opcionalmente
 *    `subtitle` e `ctaLabel`) — a arte vira só o fundo.
 *  - `alt` é obrigatório (acessibilidade).
 */

export interface Banner {
  /** Arte desktop 16:5 (1920×600). Caminho em /public. */
  image: string;
  /** Arte mobile 4:5 (1080×1350). Opcional, mas recomendada. */
  imageMobile?: string;
  /** Dimensões reais da arte mobile, quando diferentes de 1080×1350. */
  imageMobileWidth?: number;
  imageMobileHeight?: number;
  /** Arte mobile reduzida 720×900 (opcional). */
  imageMobileSmall?: string;
  /** Descrição acessível da arte. */
  alt: string;
  /** Destino ao clicar no banner. Interno (`/...`) ou externo (`https://...`). */
  href?: string;
  /** Abrir link externo em nova aba. */
  external?: boolean;
  /** Texto sobreposto (opcional). Se vazio, a arte é exibida como está. */
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
}

export const banners: Banner[] = [
  {
    image: '/images/banners/banner-5-nova-proporcao-desktop.webp',
    imageMobile: '/images/banners/banner5-mobile.webp',
    imageMobileSmall: '/images/banners/banner5-mobile-720.webp',
    alt: 'CRF/AL em Casa. Seus requerimentos de forma simples, rápida e 100% online. Acesse o CRF AL em Casa.',
    href: CRF_EM_CASA_URL,
    external: true,
  },
  {
    image: '/images/banners/banner-golpe-nova-resolucao-desktop.webp',
    imageMobile: '/images/banners/banner-golpe-mobile.webp',
    imageMobileSmall: '/images/banners/banner-golpe-mobile-720.webp',
    imageMobileWidth: 1122,
    imageMobileHeight: 1402,
    alt: 'Alerta: golpe da anuidade. Desconfie de boletos e links falsos, confira sempre o beneficiário e emita só pelo site oficial. Em caso de dúvida, fale com o CRF/AL pelos canais oficiais.',
    href: '/imprensa/noticias/crf-al-alerta-farmaceuticos-sobre-golpes-envolvendo-cobrancas-de-anuidades-pelo-whatsapp',
  },
  {
    image: '/images/banners/banner-4-nova-resolucao-final-desktop.webp',
    imageMobile: '/images/banners/banner4-mobile.webp',
    imageMobileSmall: '/images/banners/banner4-mobile-720.webp',
    alt: 'Há mais de seis décadas na defesa do âmbito profissional dos farmacêuticos alagoanos. Conheça o CRF/AL.',
    href: '/instituicao/sobre-conselho',
  },
  {
    image: '/images/banners/banner6-nova-proporcao-desktop.webp',
    imageMobile: '/images/banners/banner6-mobile.webp',
    imageMobileSmall: '/images/banners/banner6-mobile-720.webp',
    alt: 'Ouvidoria do CRF/AL: sua voz faz parte. Um canal direto entre você e o Conselho para sugestões, elogios, solicitações, reclamações e denúncias. Valorizando a profissão. Protegendo a sociedade.',
    href: OUVIDORIA_URL,
    external: true,
  },
];

/** `sizes` da arte mobile: largura do container (100vw menos o padding de 16px). */
export const BANNER_MOBILE_SIZES = 'calc(100vw - 2rem)';

/** Condições complementares, inclusive para larguras fracionárias (zoom). */
export const BANNER_MOBILE_MEDIA = '(width < 768px)';
export const BANNER_DESKTOP_MEDIA = '(width >= 768px)';

/** srcset mobile (720w e largura real da arte principal). Compartilhado com o preload. */
export function bannerMobileSrcSet(banner: Banner): string | undefined {
  if (!banner.imageMobile) return undefined;
  return banner.imageMobileSmall ? `${banner.imageMobileSmall} 720w, ${banner.imageMobile} ${banner.imageMobileWidth ?? 1080}w` : banner.imageMobile;
}
