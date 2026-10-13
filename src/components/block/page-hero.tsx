import { Fragment, useEffect, useRef, type ComponentType, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { SECTION_NAV, type SectionKey, type SectionNavLink } from '@/config/section-nav';

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

export interface PageHeroMetaItem {
  value: ReactNode;
  label: string;
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
  /** Conteúdo lateral, alinhado à direita no desktop. */
  aside?: ReactNode;
  /** Frase de apoio abaixo do título: diz em uma linha para que serve a página. */
  lead?: ReactNode;
  /** Dados curtos em linha (ex.: "30 dias para resposta"). */
  meta?: PageHeroMetaItem[];
  /** Ações principais (use `PageHeroAction`). */
  actions?: ReactNode;
  /** Seção do site: define o rótulo dourado e as abas na base do cabeçalho. */
  section?: SectionKey;
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
  variant = 'compact',
  title,
  description,
  breadcrumb,
  eyebrow,
  eyebrowIcon,
  children,
  aside,
  backgroundImage = variant === 'compact' ? '/images/page-hero-desktop-v3.jpg' : DEFAULT_BACKGROUND_IMAGE,
  backgroundImageMobile = variant === 'compact' ? '/images/page-hero-mobile-v3.jpg' : DEFAULT_BACKGROUND_IMAGE_MOBILE,
  decoration,
  className,
  lead,
  meta,
  actions,
  section,
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
      <CompactHero
        id={id}
        title={title}
        breadcrumb={breadcrumb}
        eyebrow={eyebrow}
        lead={lead ?? description}
        meta={meta}
        actions={actions}
        aside={aside}
        section={section}
        backgroundImage={backgroundImage}
        className={className}
      >
        {children}
      </CompactHero>
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


/* -------------------------------------------------------------------------- */
/* Cabeçalho editorial (variante compact)                                      */
/* -------------------------------------------------------------------------- */

const GRID_TEXTURE =
  'bg-[linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:48px_48px]';

function isLinkActive(link: SectionNavLink, pathname: string) {
  if (link.external) return false;
  if (pathname === link.href) return true;
  return Boolean(link.matchPrefix) && pathname.startsWith(`${link.href}/`);
}

function CompactHero({
  id,
  title,
  breadcrumb,
  eyebrow,
  lead,
  meta,
  actions,
  aside,
  section,
  backgroundImage,
  className,
  children,
}: {
  id?: string;
  title?: ReactNode;
  breadcrumb?: PageHeroBreadcrumb[];
  eyebrow?: ReactNode;
  lead?: ReactNode;
  meta?: PageHeroMetaItem[];
  actions?: ReactNode;
  aside?: ReactNode;
  section?: SectionKey;
  backgroundImage?: string;
  className?: string;
  children?: ReactNode;
}) {
  const { pathname } = useLocation();
  const sectionNav = section ? SECTION_NAV[section] : undefined;
  const eyebrowText = eyebrow ?? sectionNav?.label ?? (breadcrumb && breadcrumb.length > 2 ? breadcrumb[1].label : undefined);
  const backLink = breadcrumb ? [...breadcrumb].slice(0, -1).reverse().find((item) => item.href) : undefined;
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const active = tabsRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    if (active && tabsRef.current) {
      const container = tabsRef.current;
      container.scrollLeft = active.offsetLeft - container.clientWidth / 2 + active.clientWidth / 2;
    }
  }, [pathname]);

  return (
    <section id={id} className={`relative isolate mt-[var(--page-header-offset)] overflow-hidden bg-crfal-blue-dark text-white ${className ?? ''}`}>
      {/* Fundo: gradiente, textura fina, brilho e arte da taça como assinatura discreta. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A2A4F] via-crfal-blue-dark to-[#071222]" />
        <div className={`absolute inset-0 ${GRID_TEXTURE} [mask-image:radial-gradient(ellipse_at_top_right,black_10%,transparent_70%)]`} />
        <div className="absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full bg-crfal-blue-light/25 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/4 h-72 w-72 rounded-full bg-crfal-gold/10 blur-[110px]" />
        {backgroundImage && (
          <img
            src={backgroundImage}
            alt=""
            decoding="async"
            className="absolute inset-y-0 right-0 hidden h-full w-[52%] object-contain object-right opacity-35 [mask-image:linear-gradient(to_right,transparent,black_45%)] lg:block"
          />
        )}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-crfal-gold/60 to-transparent" />
      </div>

      <div className="container-crfal relative">
        <div className={`grid gap-6 pt-7 sm:pt-9 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-10 lg:pt-12 ${sectionNav ? 'pb-6 lg:pb-8' : 'pb-8 lg:pb-12'}`}>
          <div className="min-w-0">
            {breadcrumb && breadcrumb.length > 0 && (
              <>
                {backLink && (
                  <Link to={backLink.href!} className="mb-4 inline-flex min-h-8 items-center gap-1.5 rounded text-[13px] font-medium text-white/70 hover:text-white focus-visible:outline-white sm:hidden">
                    <ArrowLeft className="h-3.5 w-3.5 text-crfal-gold" aria-hidden />
                    {backLink.label}
                  </Link>
                )}
                <nav aria-label="Breadcrumb" className="mb-5 hidden sm:block">
                  <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-white/60">
                    {breadcrumb.map((item, index) => (
                      <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                        {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-crfal-gold/70" aria-hidden />}
                        {item.href ? (
                          <Link to={item.href} className="rounded transition-colors hover:text-white focus-visible:outline-white">{item.label}</Link>
                        ) : (
                          <span aria-current={index === breadcrumb.length - 1 ? 'page' : undefined} className={index === breadcrumb.length - 1 ? 'text-white/90' : undefined}>{item.label}</span>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              </>
            )}

            <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500">
              {eyebrowText && (
                <p className="mb-2.5 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-crfal-gold">
                  <span aria-hidden className="h-px w-6 bg-crfal-gold/70" />
                  {eyebrowText}
                </p>
              )}
              {title && <h1 className="max-w-4xl text-[30px] font-bold leading-[1.08] tracking-[-0.02em] text-white sm:text-[40px] lg:text-[48px]">{title}</h1>}
              {lead && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/75 sm:mt-4 sm:text-[17px]">{lead}</p>}
              {meta && meta.length > 0 && <PageHeroMeta items={meta} className="mt-5" />}
              {children && <div className="mt-5">{children}</div>}
              {actions && <div className="mt-6 flex flex-wrap gap-3 lg:hidden">{actions}</div>}
            </div>
          </div>

          {(actions || aside) && (
            <div className="hidden min-w-0 flex-col items-end gap-4 lg:flex">
              {aside}
              {actions && <div className="flex flex-wrap justify-end gap-3">{actions}</div>}
            </div>
          )}
          {aside && <div className="min-w-0 lg:hidden">{aside}</div>}
        </div>

        {sectionNav && (
          <nav aria-label={`Páginas de ${sectionNav.label}`} className="border-t border-white/10">
            <div ref={tabsRef} className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
              {sectionNav.links.map((link: SectionNavLink) => {
                const active = isLinkActive(link, pathname);
                const cls = `relative inline-flex min-h-12 shrink-0 items-center gap-1.5 whitespace-nowrap px-3 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70 first:pl-0 sm:text-sm ${
                  active
                    ? 'text-white after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-crfal-gold first:after:left-0'
                    : 'text-white/60 hover:text-white'
                }`;
                return link.external ? (
                  <a key={link.href + link.label} href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-70" aria-hidden />
                    <span className="sr-only">(abre em uma nova aba)</span>
                  </a>
                ) : (
                  <Link key={link.href} to={link.href} aria-current={active ? 'page' : undefined} className={cls}>
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </section>
  );
}

/** Dados curtos em linha, separados por pontos dourados. */
export function PageHeroMeta({ items, className = '' }: { items: PageHeroMetaItem[]; className?: string }) {
  return (
    <dl className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-sm ${className}`}>
      {items.map((item, index) => (
        <div key={item.label} className="flex items-baseline gap-1.5">
          {index > 0 && <span aria-hidden className="mr-3.5 hidden h-1 w-1 -translate-y-0.5 self-center rounded-full bg-crfal-gold/70 sm:block" />}
          <dd className="text-base font-bold tabular-nums text-white">{item.value}</dd>
          <dt className="text-white/65">{item.label}</dt>
        </div>
      ))}
    </dl>
  );
}

/** Compatibilidade: estatísticas antigas agora são exibidas como dados em linha. */
export function PageHeroStats({ items }: { items: PageHeroMetaItem[] }) {
  return <PageHeroMeta items={items} />;
}

/** Botão de ação do cabeçalho. `primary` em branco; `secondary` vazado. */
export function PageHeroAction({
  href,
  children,
  variant = 'primary',
  external,
  icon: Icon,
}: {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  external?: boolean;
  icon?: ComponentType<{ className?: string }>;
}) {
  const isExternal = external ?? /^(https?:|mailto:|tel:)/.test(href);
  const cls = `group inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-crfal-blue-dark motion-reduce:transition-none ${
    variant === 'primary' ? 'bg-white text-crfal-blue hover:bg-crfal-blue-lighter' : 'border border-white/30 text-white hover:border-white hover:bg-white/10'
  }`;
  const content = (
    <>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
      {isExternal && !href.startsWith('mailto:') && !href.startsWith('tel:') ? (
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
      ) : (
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
      )}
    </>
  );
  return isExternal ? (
    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} className={cls}>
      {content}
      {href.startsWith('http') && <span className="sr-only">(abre em uma nova aba)</span>}
    </a>
  ) : (
    <Link to={href} className={cls}>{content}</Link>
  );
}
