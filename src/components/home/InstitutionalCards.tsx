import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Building2,
  ClipboardList,
  FileText,
  Gavel,
  Scale,
  ShieldCheck,
} from 'lucide-react';

interface CardItem {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  external?: boolean;
}

const cards: CardItem[] = [
  {
    title: 'Serviços Online',
    description: 'Requerimentos, tutoriais, ouvidoria e atendimento digital para farmacêuticos e estabelecimentos.',
    href: '#servicos',
    icon: ClipboardList,
  },
  {
    title: 'Transparência',
    description: 'Acesso às informações, prestação de contas e portal da transparência do CRFAL.',
    href: 'https://crf-al.implanta.net.br/portalTransparencia/#publico/inicio',
    icon: Building2,
    external: true,
  },
  {
    title: 'Ouvidoria',
    description: 'Canal para receber manifestações, reclamações, denúncias e sugestões da sociedade.',
    href: '/servicos/ouvidoria',
    icon: ShieldCheck,
  },
  {
    title: 'Fiscalização',
    description: 'Atuação fiscalizadora em todo o estado, relatórios, processos e instrumentos de fiscalização.',
    href: '/fiscalizacao',
    icon: Scale,
  },
  {
    title: 'Legislação',
    description: 'Acesse a legislação, normas e resoluções que regem o exercício da profissão.',
    href: '/legislacao',
    icon: Gavel,
  },
  {
    title: 'Publicações',
    description: 'Notícias, comunicados, publicações oficiais e conteúdo institucional do Conselho.',
    href: '#publicacoes',
    icon: FileText,
  },
];

function Card({ item, index }: { item: CardItem; index: number }) {
  const Icon = item.icon;
  return (
    <a
      href={item.href}
      {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-crfal-blue/30 hover:shadow-card-hover"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-crfal-blue-lighter text-crfal-blue transition-all duration-300 group-hover:bg-crfal-blue group-hover:text-white dark:bg-slate-800 dark:text-crfal-blue-light dark:group-hover:bg-crfal-blue dark:group-hover:text-white">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-neutral-800 transition-colors duration-300 group-hover:text-crfal-blue dark:text-white">
        {item.title}
      </h3>
      <p className="mb-5 flex-1 text-sm leading-relaxed text-crfal-gray-600 dark:text-crfal-gray-400">
        {item.description}
      </p>

      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-crfal-blue transition-all duration-300 group-hover:gap-2.5 dark:text-crfal-blue-light">
        Acessar
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </span>
    </a>
  );
}

export default function InstitutionalCards() {
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
      { threshold: 0.12 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-[#F8FAFC] py-16 sm:py-20 md:py-28"
    >
      <div className="container-crfal">
        <div
          className={`mb-10 text-center transition-all duration-700 sm:mb-14 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <span className="mb-4 inline-block rounded-full bg-crfal-blue-lighter px-4 py-1.5 text-sm font-semibold text-crfal-blue dark:bg-crfal-blue/10 dark:text-crfal-blue-light">
            Navegação Rápida
          </span>
          <h2 className="mb-3 text-2xl font-bold text-neutral-800 dark:text-white sm:text-3xl md:text-4xl">
            Conheça o CRFAL
          </h2>
          <p className="mx-auto max-w-2xl text-base text-crfal-gray-600 dark:text-crfal-gray-400 sm:text-lg">
            Acesse os principais serviços e informações do Conselho Regional de Farmácia de Alagoas.
          </p>
        </div>

        <div
          className={`grid gap-5 transition-all duration-700 sm:grid-cols-2 lg:grid-cols-3 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
          style={{ transitionDelay: '120ms' }}
        >
          {cards.map((item, index) => (
            <Card key={item.title} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
