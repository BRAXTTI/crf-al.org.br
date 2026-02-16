import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, ExternalLink, GraduationCap, Home, PlayCircle, UserCircle } from 'lucide-react';

interface QuickAccessItem {
  id: number;
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  target?: string;
  visualLight: string;
  visualDark: string;
  iconShell: string;
}

const quickAccessItems: QuickAccessItem[] = [
  {
    id: 1,
    icon: Home,
    title: 'CRF AL em Casa',
    description: 'Todos os serviços do Conselho em um só lugar, totalmente acessíveis e online.',
    href: 'https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf',
    target: '_blank',
    visualLight:
      'radial-gradient(140px 90px at 18% 86%, rgba(255,188,136,0.78), rgba(255,188,136,0) 65%), radial-gradient(180px 90px at 68% 42%, rgba(112,187,255,0.78), rgba(112,187,255,0) 70%), radial-gradient(120px 70px at 84% 18%, rgba(255,230,196,0.72), rgba(255,230,196,0) 70%), linear-gradient(135deg,#08193f 0%,#132f78 45%,#0a1440 100%)',
    visualDark:
      'radial-gradient(150px 90px at 20% 84%, rgba(255,173,122,0.38), rgba(255,173,122,0) 70%), radial-gradient(180px 95px at 70% 40%, rgba(91,161,255,0.45), rgba(91,161,255,0) 72%), radial-gradient(120px 70px at 84% 18%, rgba(255,242,225,0.32), rgba(255,242,225,0) 70%), linear-gradient(135deg,#020617 0%,#0b1f52 46%,#030712 100%)',
    iconShell: 'bg-white/18 text-white ring-1 ring-white/55 shadow-sm dark:bg-slate-900/72 dark:text-sky-100 dark:ring-white/20',
  },
  {
    id: 2,
    icon: GraduationCap,
    title: 'Academia Virtual de Farmácia',
    description: 'Cursos e capacitação profissional oferecidos pelo CRFSP.',
    href: 'https://ecat.crfsp.org.br/',
    target: '_blank',
    visualLight:
      'radial-gradient(145px 95px at 16% 82%, rgba(255,177,126,0.78), rgba(255,177,126,0) 67%), radial-gradient(185px 90px at 66% 44%, rgba(102,221,255,0.72), rgba(102,221,255,0) 72%), radial-gradient(120px 70px at 82% 20%, rgba(255,210,235,0.72), rgba(255,210,235,0) 72%), linear-gradient(135deg,#071b3f 0%,#17327b 44%,#11123f 100%)',
    visualDark:
      'radial-gradient(150px 95px at 18% 84%, rgba(255,165,109,0.38), rgba(255,165,109,0) 70%), radial-gradient(190px 95px at 68% 42%, rgba(89,209,255,0.46), rgba(89,209,255,0) 72%), radial-gradient(120px 70px at 82% 20%, rgba(255,188,224,0.28), rgba(255,188,224,0) 72%), linear-gradient(135deg,#020617 0%,#0a255a 44%,#111133 100%)',
    iconShell: 'bg-white/18 text-white ring-1 ring-white/55 shadow-sm dark:bg-slate-900/72 dark:text-cyan-100 dark:ring-white/20',
  },
  {
    id: 3,
    icon: PlayCircle,
    title: 'Tutoriais',
    description: 'Guias passo a passo para realizar os serviços oferecidos pelo CRFAL.',
    href: '/servicos/tutoriais',
    visualLight:
      'radial-gradient(145px 95px at 18% 84%, rgba(255,178,132,0.78), rgba(255,178,132,0) 66%), radial-gradient(185px 90px at 69% 42%, rgba(123,180,255,0.76), rgba(123,180,255,0) 72%), radial-gradient(115px 66px at 84% 18%, rgba(255,208,238,0.72), rgba(255,208,238,0) 72%), linear-gradient(135deg,#081a43 0%,#14307c 44%,#121547 100%)',
    visualDark:
      'radial-gradient(150px 95px at 20% 84%, rgba(255,168,115,0.38), rgba(255,168,115,0) 70%), radial-gradient(190px 95px at 70% 42%, rgba(106,168,255,0.46), rgba(106,168,255,0) 72%), radial-gradient(118px 66px at 84% 18%, rgba(255,184,226,0.28), rgba(255,184,226,0) 72%), linear-gradient(135deg,#030712 0%,#0b245d 44%,#15133b 100%)',
    iconShell: 'bg-white/18 text-white ring-1 ring-white/55 shadow-sm dark:bg-slate-900/72 dark:text-blue-100 dark:ring-white/20',
  },
  {
    id: 4,
    icon: UserCircle,
    title: 'Portal da Transparência',
    description: 'Transparência e acesso a informações do Conselho.',
    href: 'https://crf-al.implanta.net.br/portalTransparencia/#publico/inicio',
    target: '_blank',
    visualLight:
      'radial-gradient(140px 90px at 18% 84%, rgba(255,176,132,0.78), rgba(255,176,132,0) 66%), radial-gradient(180px 90px at 67% 44%, rgba(121,168,255,0.76), rgba(121,168,255,0) 70%), radial-gradient(112px 66px at 84% 18%, rgba(255,223,198,0.72), rgba(255,223,198,0) 72%), linear-gradient(135deg,#081943 0%,#15307a 46%,#10153f 100%)',
    visualDark:
      'radial-gradient(145px 90px at 19% 84%, rgba(255,164,112,0.36), rgba(255,164,112,0) 70%), radial-gradient(185px 92px at 69% 43%, rgba(110,163,255,0.45), rgba(110,163,255,0) 72%), radial-gradient(112px 66px at 84% 18%, rgba(255,226,196,0.28), rgba(255,226,196,0) 72%), linear-gradient(135deg,#020617 0%,#0b2459 46%,#0f142f 100%)',
    iconShell: 'bg-white/18 text-white ring-1 ring-white/55 shadow-sm dark:bg-slate-900/72 dark:text-indigo-100 dark:ring-white/20',
  },
];

function QuickAccessCard({
  item,
  index,
  isVisible,
  isActive = false,
  isDark = false,
  isMobile = false,
}: {
  item: QuickAccessItem;
  index: number;
  isVisible: boolean;
  isActive?: boolean;
  isDark?: boolean;
  isMobile?: boolean;
}) {
  const Icon = item.icon;
  const isExternal = item.target === '_blank';

  return (
    <a
      href={item.href}
      target={item.target}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={`group relative flex h-full flex-col rounded-xl border p-3.5 shadow-[0_8px_22px_rgba(15,23,42,0.08)] transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      } ${
        isActive
          ? 'border-sky-300/70 ring-1 ring-sky-300/60 shadow-[0_14px_30px_rgba(14,165,233,0.24)] dark:border-sky-300/40 dark:ring-sky-300/40'
          : 'border-slate-200/80 dark:border-slate-700/70 hover:-translate-y-1 hover:scale-[1.01] hover:border-sky-300/75 hover:shadow-[0_18px_34px_rgba(14,165,233,0.22)] dark:hover:border-sky-300/45 dark:hover:shadow-[0_16px_32px_rgba(56,189,248,0.2)]'
      } ${isMobile && !isActive ? 'scale-[0.975] opacity-75 saturate-75' : ''}`}
      style={{
        transitionDelay: isVisible ? `${100 + index * 70}ms` : '0ms',
        background: isDark ? item.visualDark : item.visualLight,
      }}
    >
      <div className={`relative mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110 ${item.iconShell}`}>
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="relative mb-1.5 text-[15px] font-bold leading-tight text-white transition-colors duration-300 sm:text-base">
        {item.title}
      </h3>
      <p className="relative mb-3.5 line-clamp-2 min-h-[40px] text-xs leading-relaxed text-white/85 sm:text-sm">
        {item.description}
      </p>

      <div className="relative mt-auto flex justify-end">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300 sm:text-sm ${
          isActive
            ? 'bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-900'
            : 'bg-slate-950 text-white group-hover:bg-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:group-hover:bg-slate-50'
        }`}>
          Acessar
          {isExternal ? (
            <ExternalLink className="h-3.5 w-3.5" />
          ) : (
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          )}
        </span>
      </div>
    </a>
  );
}

export default function AcessoRapido() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDark, setIsDark] = useState(false);

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

  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const updateActiveByViewport = useCallback(() => {
    if (!scrollRef.current) return;
    const cards = Array.from(scrollRef.current.children) as HTMLElement[];
    if (cards.length === 0) return;

    const containerRect = scrollRef.current.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;

    let nearest = 0;
    let minDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, idx) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(cardCenter - centerX);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = idx;
      }
    });

    setActiveIndex(nearest);
  }, []);

  useEffect(() => {
    updateActiveByViewport();
    window.addEventListener('resize', updateActiveByViewport);
    return () => window.removeEventListener('resize', updateActiveByViewport);
  }, [updateActiveByViewport]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-16 sm:py-20 md:py-28"
      style={{
        background: isDark
          ? 'radial-gradient(1000px 440px at 12% -10%, rgba(30,58,138,0.16) 0%, rgba(2,6,23,1) 60%), radial-gradient(900px 380px at 88% 120%, rgba(56,189,248,0.1) 0%, rgba(2,6,23,1) 62%), #020617'
          : 'radial-gradient(1100px 420px at 12% -10%, #eaf4ff 0%, #ffffff 56%), radial-gradient(1000px 440px at 88% 120%, #f3f8ff 0%, #ffffff 60%)',
      }}
    >
      <div className="absolute right-0 top-0 h-[500px] w-[500px] translate-x-1/2 -translate-y-1/2 rounded-full bg-crfal-blue/[0.02]" aria-hidden />
      <div className="absolute bottom-0 left-0 h-[300px] w-[300px] -translate-x-1/2 translate-y-1/2 rounded-full bg-crfal-blue/[0.02]" aria-hidden />

      <div className="container-crfal relative z-10">
        <div
          className={`mb-10 text-center transition-all duration-500 sm:mb-14 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <span className="mb-4 inline-block rounded-full bg-crfal-blue-lighter px-4 py-1.5 text-sm font-semibold text-crfal-blue">
            Acesso Rápido
          </span>
          <h2 className="mb-3 text-2xl font-bold text-neutral-800 dark:text-white sm:mb-4 sm:text-3xl md:text-4xl">
            Serviços em Destaque
          </h2>
          <p className="mx-auto max-w-2xl text-base text-neutral-600 dark:text-neutral-400 sm:text-lg">
            Acesse rapidamente os principais serviços e recursos disponíveis para você
          </p>
        </div>

        <div className="sm:hidden -mx-4 px-4">
          <div
            ref={scrollRef}
            onScroll={updateActiveByViewport}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {quickAccessItems.map((item, index) => (
              <div key={item.id} className="w-[248px] flex-shrink-0 snap-center">
                <QuickAccessCard
                  item={item}
                  index={index}
                  isVisible={isVisible}
                  isActive={index === activeIndex}
                  isDark={isDark}
                  isMobile
                />
              </div>
            ))}
          </div>

          <div className="mt-2 flex justify-center gap-1.5">
            {quickAccessItems.map((item, index) => (
              <div
                key={item.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? 'w-5 bg-crfal-blue'
                    : 'w-1.5 bg-neutral-300 dark:bg-neutral-600'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="hidden grid-cols-2 gap-5 sm:grid lg:grid-cols-4 lg:gap-6">
          {quickAccessItems.map((item, index) => (
            <QuickAccessCard key={item.id} item={item} index={index} isVisible={isVisible} isDark={isDark} />
          ))}
        </div>
      </div>
    </section>
  );
}
