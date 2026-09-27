import { CRF_EM_CASA_URL } from '@/config/site';

/**
 * Banners do topo da home (hero).
 *
 * TROCA DE BANNER (sem mexer em código além desta lista):
 *  1. Coloque os arquivos em `public/images/banners/`.
 *  2. Adicione um objeto abaixo (ex.: image: '/images/banners/evento.webp').
 *  3. Commit/push — o deploy cuida do resto.
 *
 * Formato das artes (obrigatório, para não cortar):
 *  - `image`       → 2,5:1 paisagem — 1920×768 px (exibido em telas ≥ 768px)
 *  - `imageMobile` → 4:5 retrato   — 1080×1350 px (exibido em telas < 768px)
 *
 * Regras:
 *  - Mantenha o conteúdo importante no centro (~70% da largura / 60% da altura).
 *  - Se a arte já tem texto, NÃO preencha `title`/`subtitle`/`ctaLabel`.
 *  - Se quiser texto sobreposto pelo site, preencha `title` (e opcionalmente
 *    `subtitle` e `ctaLabel`) — a arte vira só o fundo.
 *  - `alt` é obrigatório (acessibilidade).
 */

export interface Banner {
  /** Arte desktop 2,5:1 (1920×768). Caminho em /public. */
  image: string;
  /** Arte mobile 4:5 (1080×1350). Opcional, mas recomendada. */
  imageMobile?: string;
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
    image: '/images/banners/banner4.jpg',
    imageMobile: '/images/banners/banner4-mobile.jpg',
    alt: 'Há mais de seis décadas na defesa do âmbito profissional dos farmacêuticos alagoanos. Vantagens de ser inscrito no Conselho Regional de Farmácia: garantia do exercício legal, capacitações gratuitas com certificação, orientação técnica e eventos.',
    href: '/instituicao/sobre-conselho',
  },
  {
    image: '/images/banners/banner5.jpg',
    imageMobile: '/images/banners/banner5-mobile.jpg',
    alt: 'Seus requerimentos no CRF/AL em Casa de forma simples, rápida e 100% online: primeira inscrição, renovação de registro, alteração de dados cadastrais, certidões e declarações e cancelamento de registro.',
    href: CRF_EM_CASA_URL,
    external: true,
  },
];
