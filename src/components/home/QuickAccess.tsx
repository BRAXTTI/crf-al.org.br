import { useEffect, useRef, useState } from 'react';
import { Home, GraduationCap, PlayCircle, UserCircle, ArrowRight } from 'lucide-react';

interface QuickAccessItem {
  id: number;
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  color: string;
  target?: string;
}

const quickAccessItems: QuickAccessItem[] = [
  {
    id: 1,
    icon: Home,
    title: 'CRF AL em Casa',
    description: 'Todos os serviços do Conselho em um só lugar, totalmente acessiveis e online.',
    href: 'https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf',
    target: '_blank',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 2,
    icon: GraduationCap,
    title: 'Academia Virtual de Farmacia - CRFSP',
    description: 'Cursos e capacitação profissional',
    href: 'https://ecat.crfsp.org.br/',
    target: '_blank',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    id: 3,
    icon: PlayCircle,
    title: 'Tutoriais',
    description: 'Guias passo a passo para realizar os serviços oferecidos pelo CRFAL ',
    href: '#tutoriais',
    color: 'from-teal-500 to-teal-600',
  },
  {
    id: 4,
    icon: UserCircle,
    title: 'Portal da Transparência',
    description: 'Transparência e acesso a informações do Conselho',
    href: 'https://crf-al.implanta.net.br/portalTransparencia/#publico/inicio',
    target: '_blank',
    color: 'from-indigo-500 to-indigo-600',
  },
];

export default function QuickAccess() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28 bg-white relative overflow-hidden"
    >
      <div className="container-crfal relative z-10">
        <div
          className={`text-center mb-14 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="inline-block px-4 py-1.5 bg-crfal-blue-lighter text-crfal-blue text-sm font-semibold rounded-full mb-4">
            Acesso Rápido
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
            Serviços em Destaque
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto text-lg">
            Acesse rapidamente os principais serviços e recursos disponíveis para você
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickAccessItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href={item.href}
                target={item.target}
                className={`group relative bg-neutral-50 rounded-2xl p-6 border border-neutral-200 hover:border-crfal-blue/30 hover:shadow-lg transition-all duration-300 overflow-hidden ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: isVisible ? `${200 + index * 80}ms` : '0ms',
                }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300`}
                />
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-neutral-800 mb-2 group-hover:text-crfal-blue transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-600 mb-4">{item.description}</p>
                <div className="flex items-center text-crfal-blue font-medium text-sm">
                  <span className="group-hover:mr-2 transition-all duration-300">Acessar</span>
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
