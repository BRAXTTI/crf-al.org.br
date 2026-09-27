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
 * Proporção da imagem de fundo (`backgroundImage` / `backgroundImageMobile`):
 *  - Desktop (≥ 768px): 2,5:1 a 3:1 — recomendado ~2,67:1 (ex.: 1920×720 px)
 *  - Mobile  (< 768px): 0,8:1 a 1:1 — recomendado ~0,9:1  (ex.: 1080×1200 px)
 *  - A altura varia com o conteúdo (título/descrição/estatísticas), então a
 *    imagem entra com `object-cover` + overlay azul. Mantenha o essencial no
 *    centro (~70% da largura / 60% da altura) e sem texto junto às bordas.
 */

export interface PageHeroBreadcrumb {
  label: string;
  /** Se ausente, o item é renderizado como texto (página atual). */
  href?: string;
}

export interface PageHeroProps {
  /** Ancora opcional (ex.: `#sobre-conselho`). */
  id?: string;
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
  /** Imagem de fundo (mobile). Se ausente, usa `backgroundImage`. */
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

const DEFAULT_DECORATION = (
  <div className="absolute inset-0 opacity-10" aria-hidden>
    <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-white blur-3xl" />
    <div className="absolute bottom-0 right-20 h-96 w-96 rounded-full bg-crfal-blue-light blur-3xl" />
  </div>
);

export default function PageHero({
  id,
  title,
  description,
  breadcrumb,
  eyebrow,
  eyebrowIcon,
  children,
  aside,
  backgroundImage = DEFAULT_BACKGROUND_IMAGE,
  backgroundImageMobile,
  decoration,
  className,
}: PageHeroProps) {
  const EyebrowIcon = eyebrowIcon;
  const hasAside = Boolean(aside);

  return (
    <section
      id={id}
      className={`relative overflow-hidden bg-gradient-to-br from-crfal-blue via-crfal-blue-dark to-[#002a4a] pb-14 pt-28 md:pb-20 lg:pt-44 ${className ?? ''}`}
    >
      {backgroundImage && (
        <>
          <picture
            className={`absolute inset-0 ${backgroundImageMobile ? 'block' : 'hidden md:block'}`}
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

      <div className="container-crfal relative z-10">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-2 text-xs text-white/60 sm:text-sm"
          >
            {breadcrumb.map((item, index) => (
              <Fragment key={`${item.label}-${index}`}>
                {index > 0 && <ChevronRight className="h-4 w-4" aria-hidden />}
                {item.href ? (
                  <Link to={item.href} className="transition-colors hover:text-white">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-white">{item.label}</span>
                )}
              </Fragment>
            ))}
          </nav>
        )}

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

          {aside && <div className="hidden md:flex md:justify-end">{aside}</div>}
        </div>
      </div>
    </section>
  );
}
