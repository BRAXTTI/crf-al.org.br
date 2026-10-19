import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { ArrowFillButton } from '@/components/block/arrow-fill-button';
import { banners as defaultBanners, bannerMobileSrcSet, BANNER_MOBILE_SIZES, BANNER_MOBILE_MEDIA, type Banner } from '@/data/banners';

const AUTOPLAY_MS = 6000;

interface HeroSliderProps {
  /** Lista de banners. Padrão: `src/data/banners.ts`. */
  items?: Banner[];
}

/**
 * Carrossel do topo da home.
 *
 * Proporção fixa (no desktop, a arte inteira é preservada):
 *  - < 768px  → 4:5   (arte mobile 1080×1350)
 *  - ≥ 768px  → 16:5 (arte desktop 1920×600)
 *
 * Sem dependência do WordPress: os banners vêm de `src/data/banners.ts`.
 */
export default function HeroSlider({ items = defaultBanners }: HeroSliderProps) {
  const slides = useMemo(() => items.filter((banner) => banner.image), [items]);

  const [current, setCurrent] = useState(0);
  // Pausa enquanto o ponteiro ou o foco estão no carrossel (WCAG 2.2.2).
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  // Com movimento reduzido, começa pausado; o botão de reprodução ainda permite iniciar.
  const [isPaused, setIsPaused] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (index: number) => {
      if (slides.length === 0) return;
      setCurrent(((index % slides.length) + slides.length) % slides.length);
    },
    [slides.length]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  const activeIndex = slides.length > 0 ? current % slides.length : 0;
  const nextIndex = slides.length > 0 ? (activeIndex + 1) % slides.length : 0;

  // Só baixa o slide ativo e o próximo; os já exibidos continuam montados para o fade.
  const [shown, setShown] = useState(() => new Set([0]));
  // Registra cada novo índice antes do commit, inclusive quando `items` muda.
  if (!shown.has(activeIndex)) {
    setShown(new Set(shown).add(activeIndex));
  }

  useEffect(() => {
    if (isPaused || isHovered || hasFocus || slides.length <= 1) {
      clearInterval(intervalRef.current ?? undefined);
      return;
    }
    intervalRef.current = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(intervalRef.current ?? undefined);
  }, [current, isPaused, isHovered, hasFocus, next, slides.length]);

  const isRotating = !isPaused && !isHovered && !hasFocus && slides.length > 1;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    },
    [prev, next]
  );

  if (slides.length === 0) return null;

  return (
    <section
      className="w-full"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setHasFocus(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHasFocus(false);
      }}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Destaques"
    >
      {/* Anuncia a troca só quando o usuário controla o carrossel, não durante a rotação automática. */}
      <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-crfal-blue-dark md:aspect-16/5" aria-live={isRotating ? 'off' : 'polite'}>
      {slides.map((slide, index) => {
        const isActive = index === activeIndex;
        const hasOverlay = Boolean(slide.title || slide.subtitle || slide.ctaLabel);
        const isExternal = Boolean(slide.href && !slide.href.startsWith('/'));

        return (
          <div
            key={slide.image}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out motion-reduce:transition-none"
            style={{ opacity: isActive ? 1 : 0, zIndex: isActive ? 1 : 0 }}
            // Slides escondidos saem da ordem de tabulação e da árvore de acessibilidade.
            inert={!isActive}
            {...(isActive
              ? { role: 'group', 'aria-roledescription': 'slide', 'aria-label': `Slide ${index + 1} de ${slides.length}` }
              : {})}
          >
            {(isActive || shown.has(index) || index === nextIndex) && (
              <picture className="absolute inset-0 block">
                {slide.imageMobile && (
                  <source
                    media={BANNER_MOBILE_MEDIA}
                    srcSet={bannerMobileSrcSet(slide)}
                    sizes={slide.imageMobileSmall ? BANNER_MOBILE_SIZES : undefined}
                    width={slide.imageMobileWidth ?? 1080}
                    height={slide.imageMobileHeight ?? 1350}
                  />
                )}
                <img
                  src={slide.image}
                  alt={slide.href ? '' : slide.alt}
                  width={1920}
                  height={600}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  decoding={index === 0 ? undefined : 'async'}
                  className="h-full w-full object-cover md:object-contain"
                />
              </picture>
            )}

            {hasOverlay && (
              <>
                <div className="absolute inset-0 bg-linear-to-r/srgb from-black/80 via-crfal-blue/65 to-crfal-blue/25" />
                <div className="container-crfal relative z-10 flex h-full items-center">
                  <div className="max-w-2xl">
                    {slide.title && (
                      <h2 className="font-display mb-3 text-2xl font-semibold leading-[1.08] tracking-tight text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.45)] sm:text-3xl lg:text-[2.5rem]">
                        <span className="animate-slide-up inline-block">{slide.title}</span>
                      </h2>
                    )}

                    {slide.subtitle && (
                      <p className="mb-6 max-w-xl text-sm leading-relaxed text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.35)] sm:text-base">
                        {slide.subtitle}
                      </p>
                    )}

                    {slide.ctaLabel && slide.href && (
                      <ArrowFillButton
                        {...(slide.href.startsWith('/')
                          ? { as: Link, to: slide.href }
                          : {
                              href: slide.href,
                              target: isExternal ? '_blank' : undefined,
                              rel: isExternal ? 'noopener noreferrer' : undefined,
                            })}
                        bgColor="#ffffff"
                        textColor="#003366"
                        fillBgColor="#C59B27"
                        fillTextColor="#0B192C"
                      >
                        {slide.ctaLabel}
                        {isExternal && <span className="sr-only"> (abre em nova aba)</span>}
                      </ArrowFillButton>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Arte sem texto: o banner inteiro vira link. */}
            {!hasOverlay && slide.href && (
              <a
                href={slide.href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                aria-label={isExternal ? `${slide.alt} (abre em nova aba)` : slide.alt}
                className="absolute inset-0 z-10 rounded-xl focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-crfal-gold"
              />
            )}
          </div>
        );
      })}

      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center glass-light rounded-full text-crfal-blue shadow-card transition-all duration-300 hover:scale-110 hover:bg-white motion-reduce:transition-none motion-reduce:hover:scale-100 md:flex focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            onClick={next}
            className="absolute right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center glass-light rounded-full text-crfal-blue shadow-card transition-all duration-300 hover:scale-110 hover:bg-white motion-reduce:transition-none motion-reduce:hover:scale-100 md:flex focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2"
            aria-label="Próximo slide"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>

        </>
      )}
      </div>
      {slides.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="flex items-center gap-1">
              {slides.map((slide, index) => (
                <button
                  key={slide.image}
                  onClick={() => goTo(index)}
                  className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-crfal-blue-lighter focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2"
                  aria-current={index === activeIndex ? "true" : undefined}
                  aria-label={`Ir para slide ${index + 1} de ${slides.length}`}
                >
                  <span aria-hidden="true" className={`h-2.5 rounded-full transition-all ${index === activeIndex ? "w-7 bg-crfal-blue" : "w-2.5 bg-crfal-gray-400"}`} />
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                // Retomar vale mesmo com o foco ou o ponteiro no carrossel.
                if (isRotating) {
                  setIsPaused(true);
                } else {
                  setIsPaused(false);
                  setHasFocus(false);
                  setIsHovered(false);
                }
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full text-crfal-blue transition-colors hover:bg-crfal-blue-lighter focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2"
              aria-label={isRotating ? 'Pausar reprodução' : 'Retomar reprodução'}
            >
              {!isRotating ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
            </button>
          </div>
      )}
    </section>
  );
}
