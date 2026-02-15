import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: '/images/banner1.jpg',
    title: 'Bem-vindo ao CRFAL',
    subtitle: 'Conselho Regional de Farmácia do Estado de Alagoas',
    cta: 'Conheça nossos serviços',
    href: '#servicos',
  },
  {
    id: 2,
    image: '/images/banner2.jpg',
    title: 'Inscrição 2024',
    subtitle: 'Renove sua inscrição e mantenha-se regularizado',
    cta: 'Faça sua inscrição',
    href: '#inscricao',
  },
  {
    id: 3,
    image: '/images/banner3.jpg',
    title: 'Fiscalização',
    subtitle: 'Garantindo a qualidade e segurança da assistência farmacêutica',
    cta: 'Saiba mais',
    href: '#fiscalizacao',
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const goToSlide = useCallback((index: number, dir: 'next' | 'prev') => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(dir);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 800);
  }, [isAnimating]);

  const nextSlide = useCallback(() => {
    const next = (currentSlide + 1) % slides.length;
    goToSlide(next, 'next');
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    goToSlide(prev, 'prev');
  }, [currentSlide, goToSlide]);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-crfal-gray">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          const isPrev = index === (currentSlide - 1 + slides.length) % slides.length;
          const isNext = index === (currentSlide + 1) % slides.length;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-800 ease-out ${
                isActive
                  ? 'opacity-100 z-10'
                  : isPrev && direction === 'next'
                  ? 'opacity-0 -translate-x-full z-0'
                  : isNext && direction === 'prev'
                  ? 'opacity-0 translate-x-full z-0'
                  : 'opacity-0 z-0'
              }`}
              style={{
                transform: isActive
                  ? 'translateX(0) scale(1)'
                  : isPrev && direction === 'next'
                  ? 'translateX(-100%) scale(0.95)'
                  : isNext && direction === 'prev'
                  ? 'translateX(100%) scale(0.95)'
                  : 'translateX(0) scale(1)',
              }}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms]"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                }}
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-crfal-blue/90 via-crfal-blue/70 to-transparent" />

              {/* Content */}
              <div className="relative z-10 h-full flex items-center">
                <div className="container-crfal">
                  <div className="max-w-2xl">
                    <h1
                      className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight transition-all duration-700 ${
                        isActive
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-8'
                      }`}
                      style={{ transitionDelay: isActive ? '200ms' : '0ms' }}
                    >
                      {slide.title}
                    </h1>
                    <p
                      className={`text-lg md:text-xl text-white/90 mb-8 transition-all duration-700 ${
                        isActive
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-8'
                      }`}
                      style={{ transitionDelay: isActive ? '400ms' : '0ms' }}
                    >
                      {slide.subtitle}
                    </p>
                    <a
                      href={slide.href}
                      className={`inline-flex items-center gap-2 px-8 py-4 bg-white text-crfal-blue font-semibold rounded-lg hover:bg-crfal-blue-lighter transition-all duration-500 hover:-translate-y-1 hover:shadow-lg ${
                        isActive
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-8'
                      }`}
                      style={{ transitionDelay: isActive ? '600ms' : '0ms' }}
                    >
                      {slide.cta}
                      <ChevronRight className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        disabled={isAnimating}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-crfal-blue shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-50"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        disabled={isAnimating}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-crfal-blue shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-50"
        aria-label="Próximo slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index, index > currentSlide ? 'next' : 'prev')}
            className={`transition-all duration-300 ${
              index === currentSlide
                ? 'w-8 h-3 bg-white rounded-full'
                : 'w-3 h-3 bg-white/50 hover:bg-white/80 rounded-full'
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
        <div
          className="h-full bg-white transition-all duration-300"
          style={{
            width: `${((currentSlide + 1) / slides.length) * 100}%`,
          }}
        />
      </div>
    </section>
  );
}
