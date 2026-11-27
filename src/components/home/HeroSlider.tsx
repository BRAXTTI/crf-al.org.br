import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { ArrowFillButton } from '@/components/block/arrow-fill-button';
import { REDUCED_MOTION_QUERY, useMediaQuery } from '@/lib/hydration';
import { banners as defaultBanners, bannerMobileSrcSet, BANNER_MOBILE_SIZES, BANNER_MOBILE_MEDIA, type Banner } from '@/data/banners';

const AUTOPLAY_MS = 6000;

interface HeroSliderProps {
  /** Lista de banners. Padrão: `src/data/banners.ts`. */
  items?: Banner[];
}

/**
 * Carrossel do topo da home.
 *
 * Foto real de fundo + texto em HTML (título, frase, nota e botão) sobre véu azul-marinho.
 * Proporção fixa:
 *  - < 768px  → 4:5  (foto mobile 1080×1350; texto no terço inferior)
 *  - ≥ 768px  → 16:5 (foto desktop 2244×701; texto à esquerda)
 *
 * Sem dependência do WordPress: os banners vêm de `src/data/banners.ts`.
 */
export default function HeroSlider({ items = defaultBanners }: HeroSliderProps) {
  const slides = useMemo(() => items.filter((banner) => banner.image && banner.title), [items]);

  const [current, setCurrent] = useState(0);
  // Pausa enquanto o ponteiro ou o foco estão no carrossel (WCAG 2.2.2).
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  // Com movimento reduzido, começa pausado; o botão de reprodução ainda permite iniciar.
  // Media query segura para hidratação: o HTML do build sai sem pausa e o navegador corrige logo depois.
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const [pausedByUser, setIsPaused] = useState<boolean>();
  const isPaused = pausedByUser ?? reducedMotion;
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
                {/* Foto decorativa: todo o conteúdo do banner está no texto ao lado. */}
                <img
                  src={slide.image}
                  alt=""
                  width={2244}
                  height={701}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  decoding={index === 0 ? undefined : 'async'}
                  className="h-full w-full object-cover"
                />
              </picture>
            )}

            {/* Véu azul-marinho sob o texto (contraste AA): de baixo para cima no celular, da esquerda para a direita a partir de 768px. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-t/srgb from-crfal-blue-dark from-35% via-crfal-blue/85 via-60% to-crfal-blue/5 md:bg-linear-to-r/srgb md:from-crfal-blue-dark/95 md:from-25% md:via-crfal-blue/85 md:via-50% md:to-crfal-blue/0"
            />

            <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-7 sm:px-10 sm:pb-10 md:justify-center md:py-6 md:pl-20 md:pr-6 lg:pl-24 xl:pl-28">
              <div className="max-w-md lg:max-w-lg xl:max-w-xl">
                {slide.label && <p className="mb-2 text-13 font-medium text-white/85 md:text-sm">{slide.label}</p>}
                <h2 className="text-3xl font-medium text-white md:text-2xl lg:text-3xl xl:text-4xl">{slide.title}</h2>
                {slide.subtitle && (
                  <p className="mt-3 text-15 text-white/90 md:mt-2 md:line-clamp-2 md:text-sm lg:mt-3 lg:text-base xl:text-lg">{slide.subtitle}</p>
                )}
                {slide.note && <p className="mt-2 hidden text-13 text-white/75 lg:block">{slide.note}</p>}

                {slide.ctaLabel && slide.href && (
                  <ArrowFillButton
                    {...(isExternal
                      ? { href: slide.href, target: '_blank', rel: 'noopener noreferrer' }
                      : { as: Link, to: slide.href })}
                    className="mt-5 md:mt-4 lg:mt-6"
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
