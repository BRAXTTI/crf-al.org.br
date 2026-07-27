import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Pause, Play } from 'lucide-react';

interface Slide {
  image: string;
  tagline: string;
  title: string;
  subtitle: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
}

const slides: Slide[] = [
  {
    image: '/images/banner1.jpg',
    tagline: 'Autarquia Federal · Alagoas',
    title: 'Conselho Regional de Farmácia de Alagoas',
    subtitle: 'Fiscalização, registro e valorização do exercício profissional farmacêutico em todo o estado.',
    ctaPrimary: { label: 'Conheça nossos serviços', href: '#servicos' },
    ctaSecondary: { label: 'Nossa instituição', href: '/instituicao/sobre-conselho#sobre-conselho' },
  },
  {
    image: '/images/banner2.jpg',
    tagline: 'Serviços Digitais',
    title: 'Inscrição e regularização profissional',
    subtitle: 'Realize sua inscrição, renove seu cadastro e mantenha-se em dia com o Conselho — tudo online.',
    ctaPrimary: { label: 'Fazer inscrição', href: '/servicos/requerimentos' },
    ctaSecondary: { label: 'Ver tutoriais', href: '/servicos/tutoriais' },
  },
  {
    image: '/images/banner3.jpg',
    tagline: 'Atuação institucional',
    title: 'Fiscalização farmacêutica em Alagoas',
    subtitle: 'Garantindo a qualidade e a segurança da assistência farmacêutica nos 102 municípios alagoanos.',
    ctaPrimary: { label: 'Saiba mais', href: '/fiscalizacao' },
    ctaSecondary: { label: 'Ver Relatórios', href: '/fiscalizacao/relatorios' },
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    const wrapped = ((index % slides.length) + slides.length) % slides.length;
    setCurrent(wrapped);
  }, []);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (isReducedMotion || isPaused) {
      clearInterval(intervalRef.current ?? undefined);
      return;
    }
    intervalRef.current = setInterval(next, 6000);
    return () => clearInterval(intervalRef.current ?? undefined);
  }, [current, isPaused, isReducedMotion, next]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    },
    [prev, next]
  );

  return (
    <section
      className="relative flex h-[100svh] min-h-[560px] flex-col items-center justify-center overflow-hidden bg-crfal-blue-dark"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Destaques"
    >
      {slides.map((slide, index) => {
        const isActive = index === current;
        return (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: isActive ? 1 : 0, zIndex: isActive ? 1 : 0 }}
            aria-hidden={!isActive}
            {...(isActive ? { role: 'group', 'aria-roledescription': 'slide', 'aria-label': `Slide ${index + 1} de ${slides.length}` } : {})}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[12s] ease-out"
              style={{
                backgroundImage: `url(${slide.image})`,
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-crfal-blue/65 to-crfal-blue/25" />

            <div className="container-crfal relative z-10 flex h-full items-center">
              <div className="max-w-2xl">
                <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.28em] text-white/70 sm:text-sm">
                  {slide.tagline}
                </span>

                <h1 className="mb-4 text-[2rem] font-bold leading-[1.08] tracking-tight text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.45)] sm:text-5xl lg:text-6xl">
                  {isActive ? (
                    <span className="animate-slide-up inline-block">{slide.title}</span>
                  ) : (
                    slide.title
                  )}
                </h1>

                <p className="mb-8 max-w-xl text-base leading-relaxed text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.35)] sm:text-lg">
                  {slide.subtitle}
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <a
                    href={slide.ctaPrimary.href}
                    className="group inline-flex items-center justify-center gap-2 rounded-lg bg-[#ffffff] px-7 py-3.5 text-sm font-semibold text-crfal-blue transition-all duration-300 hover:bg-crfal-blue-lighter active:scale-[0.98] sm:text-base"
                  >
                    {slide.ctaPrimary.label}
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                  <a
                    href={slide.ctaSecondary.href}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-white/50 hover:bg-white/20 active:scale-[0.98] sm:text-base"
                  >
                    {slide.ctaSecondary.label}
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-crfal-blue shadow-card backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white md:flex"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={next}
        className="absolute right-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-crfal-blue shadow-card backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white md:flex"
        aria-label="Próximo slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4">
        <div className="flex items-center gap-2.5">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`rounded-full transition-all duration-300 ${
                index === current
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
