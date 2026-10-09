import { Fragment, type ComponentType, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Cabeçalho padrão das páginas internas ("page hero" / banner interno).
 *
 * Responsabilidade: fundo azul (com gradiente, decoração e imagem opcional),
 * container, breadcrumb, "eyebrow", título e descrição — com tamanhos
 * padronizados no mobile e no desktop. Cada página injeta seus extras
 * (estatísticas, badges, cards) via `children` ou `aside`.
 *
 * Fundo e proporção:
 *  - Desktop (≥ 1280px / `xl`): a seção tem proporção FIXA de 8:3 (2,667:1) e a
 *    arte entra sem corte. Exporte em 1920×720 px (múltiplos: 2400×900,
 *    2560×960).
 *  - No mobile, a arte ocupa um quadro fixo de 9:10 (ex.: 1080×1200). A seção
 *    tem essa altura mínima, mas pode crescer para acomodar conteúdo longo sem
 *    cortá-lo; nesse caso, o fundo em gradiente continua abaixo do quadro.
 *  - Entre 768px e 1279px, mantém-se o fundo azul em gradiente.
 *  - Overlay em gradiente horizontal: escurece a esquerda (texto) e revela a
 *    arte à direita.
 */

export interface PageHeroBreadcrumb {
  label: string;
  /** Se ausente, o item é renderizado como texto (página atual). */
  href?: string;
}

export interface PageHeroProps {
  /** Ancora opcional (ex.: `#sobre-conselho`). */
  id?: string;
  /** Cabeçalho reduzido para centrais de serviços. */
  variant?: 'default' | 'compact';
  title?: ReactNode;
  description?: ReactNode;
  breadcrumb?: PageHeroBreadcrumb[];
  /** Texto curto acima do título (renderizado como "pill"). */
  eyebrow?: ReactNode;
  /** Ícone opcional exibido dentro da "pill" do eyebrow. */
  eyebrowIcon?: ComponentType<{ className?: string }>;
  /** Conteúdo extra em fluxo, abaixo da descrição (ex.: estatísticas). */
  children?: ReactNode;
  /** Conteúdo lateral, alinhado à direita no desktop (ex.: cards de números). */
  aside?: ReactNode;
  /** Imagem de fundo (desktop). */
  backgroundImage?: string;
  /** Imagem de fundo (mobile). Padrão: `/images/page-hero-mobile.webp`. */
  backgroundImageMobile?: string;
  /** Substitui a decoração padrão (círculos desfocados). */
  decoration?: ReactNode;
  /** Classes extras no elemento raiz. */
  className?: string;
}

const TITLE_CLASSES =
  'font-display text-3xl font-semibold leading-[1.1] tracking-tight text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.3)] sm:text-4xl md:text-5xl';

/** Imagem de fundo padrão do hero (desktop). Ver proporção no topo do arquivo. */
const DEFAULT_BACKGROUND_IMAGE = '/images/page-hero.jpg';
const DEFAULT_BACKGROUND_IMAGE_MOBILE = '/images/page-hero-mobile.webp';

const DEFAULT_DECORATION = (
  <div className="absolute inset-0 opacity-10" aria-hidden>
    <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-white blur-3xl" />
    <div className="absolute bottom-0 right-20 h-96 w-96 rounded-full bg-crfal-blue-light blur-3xl" />
  </div>
);

export default function PageHero({
  id,
  variant = 'default',
  title,
  description,
  breadcrumb,
  eyebrow,
  eyebrowIcon,
  children,
  aside,
  backgroundImage = DEFAULT_BACKGROUND_IMAGE,
  backgroundImageMobile = DEFAULT_BACKGROUND_IMAGE_MOBILE,
  decoration,
  className,
}: PageHeroProps) {
  const EyebrowIcon = eyebrowIcon;
  const hasAside = Boolean(aside);

  const breadcrumbNav = breadcrumb && breadcrumb.length > 0 ? (
          <nav
            aria-label="Breadcrumb"
            className={`flex flex-wrap items-center gap-2 text-xs sm:text-sm ${variant === 'compact' ? 'mb-3 text-white/85' : 'mb-6 text-white/60'}`}
          >
            {breadcrumb.map((item, index) => (
              <Fragment key={`${item.label}-${index}`}>
                {index > 0 && <ChevronRight className="h-4 w-4" aria-hidden />}
                {item.href ? (
                  <Link to={item.href} className="transition-colors hover:text-white">
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={index === breadcrumb.length - 1 ? 'page' : undefined} className={variant === 'compact' && index < breadcrumb.length - 1 ? 'text-white/85' : 'text-white'}>{item.label}</span>
                )}
              </Fragment>
            ))}
          </nav>
        ) : null;

  if (variant === 'compact') {
    return (
      <section id={id} className={`relative overflow-hidden mt-[var(--header-offset)] bg-crfal-blue-dark py-10 lg:py-[60px] ${className ?? ''}`}>
        {backgroundImage && (
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[length:auto_140%] bg-right bg-no-repeat opacity-[0.15]" style={{ backgroundImage: `url("${backgroundImage}")` }} />
        )}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-crfal-blue-dark via-crfal-blue-dark/90 to-crfal-blue/70" />
        <div className="container-crfal relative z-10 flex w-full flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-5">
          <div className="min-w-0">
            {breadcrumbNav}
            {title && <h1 className="font-display text-[clamp(28px,3vw,40px)] font-semibold leading-[1.15] tracking-tight text-white lg:whitespace-nowrap">{title}</h1>}
          </div>
          {aside && <div className="w-full min-w-0 lg:w-auto lg:shrink-0 lg:translate-y-4">{aside}</div>}
        </div>
      </section>
    );
  }

  return (
    <section
      id={id}
      className={`relative overflow-hidden bg-gradient-to-br from-crfal-blue via-crfal-blue-dark to-[#002a4a] pb-14 pt-28 md:pb-20 lg:pt-44 xl:flex xl:aspect-[8/3] xl:flex-col xl:justify-center ${backgroundImageMobile ? 'min-h-[111.111vw] md:min-h-0' : ''} ${className ?? ''}`}
    >
      {backgroundImage && (
        <>
          <picture
            className={
              backgroundImageMobile
                ? 'absolute inset-x-0 top-0 block aspect-[9/10] overflow-hidden md:hidden xl:inset-0 xl:aspect-auto xl:block'
                : 'absolute inset-0 hidden xl:block'
            }
          >
            {backgroundImageMobile && (
              <source media="(max-width: 767px)" srcSet={backgroundImageMobile} />
            )}
            <img
              src={backgroundImage}
              alt=""
              decoding="async"
              className="h-full w-full object-cover"
            />
          </picture>
          {/* Overlay: escurece a esquerda (texto) e revela a arte à direita. */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-crfal-blue-dark/95 via-crfal-blue-dark/85 to-crfal-blue-dark/35"
            aria-hidden
          />
        </>
      )}

      {decoration ?? DEFAULT_DECORATION}

      <div className="container-crfal relative z-10 w-full">
        {breadcrumbNav}

        <div className={hasAside ? 'grid items-center gap-8 md:grid-cols-2' : undefined}>
          <div>
            {eyebrow && (
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
                {EyebrowIcon && <EyebrowIcon className="h-3.5 w-3.5" />}
                {eyebrow}
              </span>
            )}

            {title && <h1 className={TITLE_CLASSES}>{title}</h1>}

            {description && (
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/80 sm:text-lg">
                {description}
              </p>
            )}

            {children && <div className="mt-8">{children}</div>}
          </div>

          {aside && <div className="md:flex md:justify-end">{aside}</div>}
        </div>
      </div>
    </section>
  );
}
