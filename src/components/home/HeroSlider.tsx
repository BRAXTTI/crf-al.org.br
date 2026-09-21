import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Pause, Play } from 'lucide-react';
import { useBanners } from '@/services/wordpress/hooks';

interface Slide {
  image: string;
  title: string;
  subtitle: string;
  cta?: { label: string; href: string; target?: string };
}

/** Rótulo do botão usado nos slides vindos do MetaSlider (que não possui campo de label). */
const DEFAULT_CTA_LABEL = 'Saiba mais';

/** Conteúdo de reserva exibido enquanto a API de banners não responde. */
const fallbackSlides: Slide[] = [
  {
    image: '/images/banner1.jpg',
    title: 'Conselho Regional de Farmácia do Estado de Alagoas',
    subtitle: 'Fiscalização, registro e valorização do exercício profissional farmacêutico em todo o estado.',
    cta: { label: 'Conheça nossos serviços', href: '/servicos/requerimentos' },
  },
  {
    image: '/images/banner2.jpg',
    title: 'Inscrição e regularização profissional',
    subtitle: 'Realize sua inscrição, renove seu cadastro e mantenha-se em dia com o Conselho — tudo online.',
    cta: { label: 'Fazer inscrição', href: '/servicos/requerimentos' },
  },
  {
    image: '/images/banner3.jpg',
    title: 'Fiscalização farmacêutica em Alagoas',
    subtitle: 'Garantindo a qualidade e a segurança da assistência farmacêutica nos 102 municípios alagoanos.',
    cta: { label: 'Saiba mais', href: '/fiscalizacao' },
  },
];

export default function HeroSlider() {
  const { data: banners } = useBanners();

  const slides = useMemo<Slide[]>(() => {
    const apiSlides = (banners ?? [])
      .filter((banner) => banner.image)
      .map((banner) => ({
        image: banner.image as string,
        title: banner.title,
        subtitle: banner.subtitle,
        cta: banner.url
          ? { label: DEFAULT_CTA_LABEL, href: banner.url, target: banner.target }
          : undefined,
      }));

    return apiSlides.length > 0 ? apiSlides : fallbackSlides;
  }, [banners]);

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    const wrapped = ((index % slides.length) + slides.length) % slides.length;
    setCurrent(wrapped);
  }, [slides.length]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  const activeIndex = slides.length > 0 ? current % slides.length : 0;

  useEffect(() => {
    if (isReducedMotion || isPaused || slides.length <= 1) {
      clearInterval(intervalRef.current ?? undefined);
      return;
    }
    intervalRef.current = setInterval(next, 6000);
    return () => clearInterval(intervalRef.current ?? undefined);
  }, [current, isPaused, isReducedMotion, next, slides.length]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    },
    [prev, next]
  );

  return (
    <section
      className="relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden bg-crfal-blue-dark pt-28 pb-20 sm:min-h-[460px] md:pt-32 lg:min-h-[520px]"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Destaques"
    >
      {slides.map((slide, index) => {
        const isActive = index === activeIndex;
        return (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: isActive ? 1 : 0, zIndex: isActive ? 1 : 0 }}
            aria-hidden={!isActive}
            {...(isActive ? { role: 'group', 'aria-roledescription': 'slide', 'aria-label': `Slide ${index + 1} de ${slides.length}` } : {})}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform [transition-duration:12000ms] ease-out"
              style={{
                backgroundImage: `url(${slide.image})`,
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-crfal-blue/65 to-crfal-blue/25" />

            <div className="container-crfal relative z-10 flex h-full items-center">
              <div className="max-w-2xl">
                <h1 className="font-display mb-3 text-[1.75rem] font-semibold leading-[1.08] tracking-tight text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.45)] sm:text-4xl lg:text-[2.75rem]">
                  {isActive ? (
                    <span className="animate-slide-up inline-block">{slide.title}</span>
                  ) : (
                    slide.title
                  )}
                </h1>

                <p className="mb-6 max-w-xl text-sm leading-relaxed text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.35)] sm:text-base">
                  {slide.subtitle}
                </p>

                {slide.cta && (
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                    <a
                      href={slide.cta.href}
                      target={slide.cta.target}
                      rel={slide.cta.target === '_blank' ? 'noopener noreferrer' : undefined}
                      className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#ffffff] px-6 py-3 text-sm font-semibold text-crfal-blue transition-all duration-300 hover:bg-crfal-blue-lighter active:scale-[0.98] sm:text-base"
                    >
                      {slide.cta.label}
                      <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

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

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4">
        <div className="flex items-center gap-2.5">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? 'h-2.5 w-8 bg-white shadow-card'
                  : 'h-2.5 w-2.5 bg-white/45 hover:bg-white/70'
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
    </section>
  );
}
