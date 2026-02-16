import { useEffect, useRef, useState, useCallback } from 'react';
import { Home, GraduationCap, PlayCircle, UserCircle, ArrowRight, ExternalLink } from 'lucide-react';

interface QuickAccessItem {
  id: number;
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  color: string;
  iconBg: string;
  target?: string;
}

const quickAccessItems: QuickAccessItem[] = [
  {
    id: 1,
    icon: Home,
    title: 'CRF AL em Casa',
    description: 'Todos os serviços do Conselho em um só lugar, totalmente acessíveis e online.',
    href: 'https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf',
    target: '_blank',
    color: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-500/10 text-blue-600 group-hover:bg-blue-500 group-hover:text-white',
  },
  {
    id: 2,
    icon: GraduationCap,
    title: 'Academia Virtual de Farmácia',
    description: 'Cursos e capacitação profissional oferecidos pelo CRFSP.',
    href: 'https://ecat.crfsp.org.br/',
    target: '_blank',
    color: 'from-cyan-500 to-cyan-600',
    iconBg: 'bg-cyan-500/10 text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white',
  },
  {
    id: 3,
    icon: PlayCircle,
    title: 'Tutoriais',
    description: 'Guias passo a passo para realizar os serviços oferecidos pelo CRFAL.',
    href: '/servicos/tutoriais',
    color: 'from-teal-500 to-teal-600',
    iconBg: 'bg-teal-500/10 text-teal-600 group-hover:bg-teal-500 group-hover:text-white',
  },
  {
    id: 4,
    icon: UserCircle,
    title: 'Portal da Transparência',
    description: 'Transparência e acesso a informações do Conselho.',
    href: 'https://crf-al.implanta.net.br/portalTransparencia/#publico/inicio',
    target: '_blank',
    color: 'from-indigo-500 to-indigo-600',
    iconBg: 'bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white',
  },
];

const CARD_WIDTH = 296; // 280px card + 16px gap

export default function AcessoRapido() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Trigger pulse-border animation after entry animation completes
  useEffect(() => {
    if (isVisible) {
      const delay = 200 + quickAccessItems.length * 80 + 400;
      const timer = setTimeout(() => setShowPulse(true), delay);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Stop pulse after animation completes (2 iterations × 1.5s = 3s)
  useEffect(() => {
    if (showPulse) {
      const timer = setTimeout(() => setShowPulse(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showPulse]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const index = Math.round(scrollRef.current.scrollLeft / CARD_WIDTH);
    setActiveIndex(Math.min(index, quickAccessItems.length - 1));
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-20 md:py-28 bg-white dark:bg-slate-950 relative overflow-hidden"
    >
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-crfal-blue/[0.02] rounded-full translate-x-1/2 -translate-y-1/2" aria-hidden />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-crfal-blue/[0.02] rounded-full -translate-x-1/2 translate-y-1/2" aria-hidden />

      <div className="container-crfal relative z-10">
        <div
          className={`text-center mb-10 sm:mb-14 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="inline-block px-4 py-1.5 bg-crfal-blue-lighter text-crfal-blue text-sm font-semibold rounded-full mb-4">
            Acesso Rápido
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-800 mb-3 sm:mb-4">
            Serviços em Destaque
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto text-base sm:text-lg">
            Acesse rapidamente os principais serviços e recursos disponíveis para você
          </p>
        </div>

        {/* Mobile: horizontal scroll / Desktop: grid */}
        <div className="sm:hidden -mx-4 px-4">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {quickAccessItems.map((item, index) => {
              const Icon = item.icon;
              const isExternal = item.target === '_blank';
              return (
                <a
                  key={item.id}
                  href={item.href}
                  target={item.target}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className={`group flex-shrink-0 w-[280px] snap-start bg-white dark:bg-slate-900/90 rounded-2xl p-5 border border-neutral-200 dark:border-slate-700/70 hover:border-crfal-blue/30 shadow-sm active:scale-[0.98] transition-all duration-300 ${
                    isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  } ${showPulse ? 'animate-pulse-border' : ''}`}
                  style={{
                    transitionDelay: isVisible ? `${200 + index * 80}ms` : '0ms',
                  }}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${item.iconBg}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-neutral-800 mb-1.5 group-hover:text-crfal-blue transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-sm text-neutral-500 mb-4 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex items-center text-crfal-blue font-medium text-sm">
                    <span className="group-hover:mr-2 transition-all duration-300">
                      Acessar
                    </span>
                    {isExternal ? (
                      <ExternalLink className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    ) : (
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    )}
                  </div>
                </a>
              );
            })}
          </div>
          {/* Scroll indicator dots */}
          <div className="flex justify-center gap-1.5 mt-2">
            {quickAccessItems.map((item, index) => (
              <div
                key={item.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? 'w-3 bg-crfal-blue'
                    : 'w-1.5 bg-neutral-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {quickAccessItems.map((item, index) => {
            const Icon = item.icon;
            const isExternal = item.target === '_blank';
            return (
              <a
                key={item.id}
                href={item.href}
                target={item.target}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className={`group relative bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-neutral-200 dark:border-slate-700/70 hover:border-crfal-blue/30 hover:shadow-lg active:scale-[0.98] transition-all duration-300 overflow-hidden ${
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                } ${showPulse ? 'animate-pulse-border' : ''}`}
                style={{
                  transitionDelay: isVisible ? `${200 + index * 80}ms` : '0ms',
                }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300`}
                />
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 ${item.iconBg}`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-neutral-800 mb-2 group-hover:text-crfal-blue transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-500 mb-4 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center text-crfal-blue font-medium text-sm">
                  <span className="group-hover:mr-2 transition-all duration-300">
                    Acessar
                  </span>
                  {isExternal ? (
                    <ExternalLink className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  ) : (
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
