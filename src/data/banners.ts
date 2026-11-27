// Caminho relativo: o middleware (Pages Function) também lê esta lista para o preload do 1º banner.
import { CRF_EM_CASA_URL, OUVIDORIA_URL } from '../config/site';

/**
 * Banners do topo da home (hero).
 *
 * Cada banner é uma FOTO real de fundo (sem texto na imagem) com título, frase,
 * nota e botão em HTML/CSS, renderizados pelo `HeroSlider` sobre um véu azul-marinho
 * (#003366) que garante contraste WCAG AA no texto branco.
 *
 * TROCA DE BANNER (sem mexer em código além desta lista):
 *  1. Coloque as fotos em `public/images/banners/` (créditos em `docs/creditos-fotos.md`).
 *  2. Adicione um objeto abaixo com `image`, `imageMobile`, `title` e `ctaLabel`/`href`.
 *  3. Commit/push — o deploy cuida do resto.
 *
 * Formato das fotos (WebP, sem texto embutido):
 *  - `image`       → paisagem ≈16:5 — 2244×701 px (telas ≥ 768px)
 *  - `imageMobile` → retrato 4:5    — 1080×1350 px (telas < 768px)
 *  - `imageMobileSmall` → a mesma foto mobile em 720×900 px, para celulares
 *  - Desktop: o texto fica à esquerda; deixe o assunto da foto no centro/direita.
 *    Mobile: o texto fica no terço inferior.
 *  - Slides com `highlights` (layout em painel): a pessoa fica entre 60% e 95% da largura
 *    da foto desktop, sobre fundo claro de estúdio, e no topo da foto mobile (rosto acima de 40%).
 */

export interface Banner {
  /** Foto desktop ≈16:5 (2244×701). Caminho em /public. */
  image: string;
  /** Foto mobile 4:5 (1080×1350). Opcional, mas recomendada. */
  imageMobile?: string;
  /** Dimensões reais da foto mobile, quando diferentes de 1080×1350. */
  imageMobileWidth?: number;
  imageMobileHeight?: number;
  /** Foto mobile reduzida 720×900 (opcional). */
  imageMobileSmall?: string;
  /** Rótulo curto acima do título, só quando informa (ex.: “Alerta”, nome do canal). */
  label?: string;
  /** Título do banner (h2). */
  title: string;
  /** Frase de apoio, até 2 linhas no desktop. */
  subtitle?: string;
  /** Linha final menor (assinatura ou orientação). Só a partir de 1024px. */
  note?: string;
  /** Texto do botão. */
  ctaLabel?: string;
  /** Destino do botão. Interno (`/...`) ou externo (`https://...`, abre em nova aba). */
  href?: string;
  /**
   * Itens com ícone (3–4) num bloco estruturado. Com eles, o slide usa o layout em painel:
   * painel azul à esquerda (título + bloco) e a pessoa da foto visível à direita.
   * Sem eles, o slide usa o layout de foto com véu.
   */
  highlights?: BannerHighlight[];
  /** Título curto do bloco de itens (ex.: “O que você pode registrar”). */
  highlightsTitle?: string;
}

/** Ícones disponíveis para os itens (mapeados para lucide-react no `HeroSlider`). */
export type BannerIcon = 'denuncia' | 'reclamacao' | 'solicitacao' | 'sugestao' | 'documento' | 'protocolo' | 'boleto' | 'certidao';

export interface BannerHighlight {
  icon: BannerIcon;
  /** Texto curto (até ~22 caracteres), cabe em 2 colunas no celular. */
  title: string;
}

// Ordem: o CRF AL em Casa já está no card logo acima do slider, então fica por último na rotação.
export const banners: Banner[] = [
  {
    image: '/images/banners/foto-golpe-desktop.webp',
    imageMobile: '/images/banners/foto-golpe-mobile.webp',
    imageMobileSmall: '/images/banners/foto-golpe-mobile-720.webp',
    label: 'Alerta: cobrança falsa',
    title: 'Golpe da anuidade',
    subtitle: 'Desconfie de boletos e links falsos. Confira sempre o beneficiário e emita só pelo site oficial.',
    note: 'Em caso de dúvida, fale com o CRF/AL pelos canais oficiais.',
    ctaLabel: 'Saiba como se proteger',
    href: '/imprensa/noticias/crf-al-alerta-farmaceuticos-sobre-golpes-envolvendo-cobrancas-de-anuidades-pelo-whatsapp',
  },
  {
    image: '/images/banners/foto-ouvidoria-atendente-desktop.webp',
    imageMobile: '/images/banners/foto-ouvidoria-atendente-mobile.webp',
    imageMobileSmall: '/images/banners/foto-ouvidoria-atendente-mobile-720.webp',
    label: 'Ouvidoria do CRF/AL',
    title: 'Sua voz faz parte',
    subtitle: 'Um canal direto entre você e o Conselho. Registre sua manifestação online.',
    highlightsTitle: 'O que você pode registrar',
    highlights: [
      { icon: 'denuncia', title: 'Denúncias' },
      { icon: 'reclamacao', title: 'Reclamações' },
      { icon: 'solicitacao', title: 'Solicitações' },
      { icon: 'sugestao', title: 'Sugestões e elogios' },
    ],
    ctaLabel: 'Acessar a Ouvidoria',
    href: OUVIDORIA_URL,
  },
  {
    image: '/images/banners/foto-crf-em-casa-tablet-desktop.webp',
    imageMobile: '/images/banners/foto-crf-em-casa-tablet-mobile.webp',
    imageMobileSmall: '/images/banners/foto-crf-em-casa-tablet-mobile-720.webp',
    title: 'CRF AL em Casa',
    subtitle: 'Seus requerimentos de forma simples, rápida e 100% online.',
    highlightsTitle: 'Pelo sistema você pode',
    // Serviços descritos no manual do sistema (`src/data/manual-crf-em-casa.ts`).
    highlights: [
      { icon: 'documento', title: 'Enviar requerimentos' },
      { icon: 'protocolo', title: 'Acompanhar protocolos' },
      { icon: 'boleto', title: 'Emitir boletos' },
      { icon: 'certidao', title: 'Imprimir certidão' },
    ],
    ctaLabel: 'Acessar o CRF AL em Casa',
    href: CRF_EM_CASA_URL,
  },
];

/** `sizes` da foto mobile: largura do container (100vw menos o padding de 16px). */
export const BANNER_MOBILE_SIZES = 'calc(100vw - 2rem)';

/** Condições complementares, inclusive para larguras fracionárias (zoom). */
export const BANNER_MOBILE_MEDIA = '(width < 768px)';
export const BANNER_DESKTOP_MEDIA = '(width >= 768px)';

/** srcset mobile (720w e largura real da foto principal). Compartilhado com o preload. */
export function bannerMobileSrcSet(banner: Banner): string | undefined {
  if (!banner.imageMobile) return undefined;
  return banner.imageMobileSmall ? `${banner.imageMobileSmall} 720w, ${banner.imageMobile} ${banner.imageMobileWidth ?? 1080}w` : banner.imageMobile;
}
