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
    image: '/images/banners/banner1.jpg',
    imageMobile: '/images/banners/banner1-mobile.jpg',
    alt: 'Conselho Regional de Farmácia do Estado de Alagoas',
    href: '/servicos/requerimentos',
    title: 'Conselho Regional de Farmácia do Estado de Alagoas',
    subtitle:
      'Fiscalização, registro e valorização do exercício profissional farmacêutico em todo o estado.',
    ctaLabel: 'Conheça nossos serviços',
  },
  {
    image: '/images/banners/banner2.jpg',
    imageMobile: '/images/banners/banner2-mobile.jpg',
    alt: 'Inscrição e regularização profissional',
    href: '/servicos/requerimentos',
    title: 'Inscrição e regularização profissional',
    subtitle:
      'Realize sua inscrição, renove seu cadastro e mantenha-se em dia com o Conselho — tudo online.',
    ctaLabel: 'Fazer inscrição',
  },
  {
    image: '/images/banners/banner3.jpg',
    imageMobile: '/images/banners/banner3-mobile.jpg',
    alt: 'Fiscalização farmacêutica em Alagoas',
    href: '/fiscalizacao',
    title: 'Fiscalização farmacêutica em Alagoas',
    subtitle:
      'Garantindo a qualidade e a segurança da assistência farmacêutica nos 102 municípios alagoanos.',
    ctaLabel: 'Saiba mais',
  },
];
