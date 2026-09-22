import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { ArrowFillButton } from '@/components/block/arrow-fill-button';
import { banners as defaultBanners, type Banner } from '@/data/banners';

const AUTOPLAY_MS = 6000;

interface HeroSliderProps {
  /** Lista de banners. Padrão: `src/data/banners.ts`. */
  items?: Banner[];
}

/**
 * Carrossel do topo da home.
 *
 * Proporção fixa (a arte nunca é cortada):
 *  - < 640px  → 9:10  (arte mobile 1080×1200)
 *  - ≥ 640px  → 2,5:1 (arte desktop 1920×768)
 *
 * Sem dependência do WordPress: os banners vêm de `src/data/banners.ts`.
 */
export default function HeroSlider({ items = defaultBanners }: HeroSliderProps) {
  const slides = useMemo(() => items.filter((banner) => banner.image), [items]);

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isReducedMotion] = useState(
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

  useEffect(() => {
    if (isReducedMotion || isPaused || slides.length <= 1) {
      clearInterval(intervalRef.current ?? undefined);
      return;
    }
    intervalRef.current = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(intervalRef.current ?? undefined);
  }, [current, isPaused, isReducedMotion, next, slides.length]);

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
      className="relative aspect-[9/10] w-full overflow-hidden bg-crfal-blue-dark sm:aspect-[5/2]"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Destaques"
    >
      {/* H1 fixo da home (as artes podem ou não ter texto). */}
      <h1 className="sr-only">Conselho Regional de Farmácia do Estado de Alagoas</h1>

      {slides.map((slide, index) => {
        const isActive = index === activeIndex;
        const hasOverlay = Boolean(slide.title || slide.subtitle || slide.ctaLabel);
        const isExternal = Boolean(slide.href && !slide.href.startsWith('/'));

        return (
          <div
            key={slide.image}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: isActive ? 1 : 0, zIndex: isActive ? 1 : 0 }}
            aria-hidden={!isActive}
            {...(isActive
              ? { role: 'group', 'aria-roledescription': 'slide', 'aria-label': `Slide ${index + 1} de ${slides.length}` }
              : {})}
          >
            <picture className="absolute inset-0 block">
              {slide.imageMobile && <source media="(max-width: 639px)" srcSet={slide.imageMobile} />}
              <img
                src={slide.image}
                alt={slide.href ? '' : slide.alt}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                decoding="async"
                className="h-full w-full object-cover"
              />
            </picture>

            {hasOverlay && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-crfal-blue/65 to-crfal-blue/25" />
                <div className="container-crfal relative z-10 flex h-full items-center pt-20 lg:pt-0">
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
                aria-label={slide.alt}
                className="absolute inset-0 z-10"
              />
            )}
          </div>
        );
      })}

      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-crfal-blue shadow-card backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white md:flex"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={next}
            className="absolute right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-crfal-blue shadow-card backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white md:flex"
            aria-label="Próximo slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 sm:bottom-6">
            <div className="flex items-center gap-2.5">
              {slides.map((slide, index) => (
                <button
                  key={slide.image}
                  onClick={() => goTo(index)}
                  className={`rounded-full transition-all duration-300 ${
                    index === activeIndex ? 'h-2.5 w-8 bg-white shadow-card' : 'h-2.5 w-2.5 bg-white/45 hover:bg-white/70'
                  }`}
                  aria-label={`Ir para slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="ml-2 flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:text-white/90"
              aria-label={isPaused ? 'Retomar reprodução' : 'Pausar reprodução'}
            >
              {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
