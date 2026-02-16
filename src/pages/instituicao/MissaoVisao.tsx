import { useEffect, useRef, useState } from 'react';
import { ChevronRight, Target, Eye, Heart } from 'lucide-react';

interface SecaoMVV {
  id: string;
  titulo: string;
  subtitulo: string;
  icon: React.ElementType;
  descricao: string;
}

const secoes: SecaoMVV[] = [
  {
    id: 'missao',
    titulo: 'Missão',
    subtitulo: 'Nossa razão de existir',
    icon: Target,
    descricao: 'Promover a segurança no exercício profissional farmacêutico em toda a sua abrangência, de forma técnica, responsável, ética e legal, garantindo o farmacêutico como agente transformador do acesso aos medicamentos, insumos e serviços de saúde no estado de Alagoas.',
  },
  {
    id: 'visao',
    titulo: 'Visão',
    subtitulo: 'Onde queremos chegar',
    icon: Eye,
    descricao: 'Ser uma instituição facilitadora na regularização de serviços administrativos para farmacêuticos, técnicos e empresas, através de processos modernos e com excelência, buscando orientar, capacitar e valorizar a prestação de serviços farmacêuticos no estado de Alagoas.',
  },
  {
    id: 'valores',
    titulo: 'Valores',
    subtitulo: 'Nossos princípios fundamentais',
    icon: Heart,
    descricao: 'Paixão pelo farmacêutico. Resolutividade e inovação. Gestão participativa. Ética e transparência. Qualidade de vida dos colaboradores. Relação saudável com a comunidade.',
  },
];

export default function MissaoVisao() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-slate-950">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-crfal-blue via-crfal-blue-dark to-[#002a4a] pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-crfal-blue-light rounded-full blur-3xl" />
        </div>
        <div className="container-crfal relative z-10">
          <div className="flex flex-wrap items-center gap-2 text-white/60 text-xs sm:text-sm mb-4">
            <a href="/" className="hover:text-white transition-colors">Início</a>
            <ChevronRight className="w-4 h-4" />
            <span>Instituição</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Missão, Visão e Valores</span>
          </div>
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Missão, Visão e Valores
            </h1>
            <p className="text-white/80 text-base sm:text-lg">
              Conheça os princípios fundamentais que guiam o Conselho Regional
              de Farmácia de Alagoas em sua atuação.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-crfal py-10 md:py-16" ref={sectionRef}>
        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {secoes.map((secao, index) => {
            const Icon = secao.icon;
            return (
              <div
                key={secao.id}
                className={`group bg-white dark:bg-slate-900/90 rounded-2xl border border-neutral-200 dark:border-slate-700/70 overflow-hidden transition-all duration-500 hover:shadow-card-hover hover:border-crfal-blue/20 hover:-translate-y-1 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: isVisible ? `${index * 150}ms` : '0ms',
                }}
              >
                {/* Card Header with gradient */}
                <div className="bg-gradient-to-r from-crfal-blue to-crfal-blue-dark p-6">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">{secao.titulo}</h2>
                  <p className="text-white/70 text-sm mt-1">{secao.subtitulo}</p>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <p className="text-neutral-600 leading-relaxed">
                    {secao.descricao}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info Section */}
        <div
          className={`mt-12 bg-crfal-blue-lighter rounded-2xl border border-crfal-blue/10 p-6 md:p-8 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-crfal-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-crfal-blue" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-800 mb-2">
                Compromisso com a Profissão Farmacêutica
              </h3>
              <p className="text-neutral-600">
                O CRFAL atua com base em princípios éticos e profissionais,
                buscando sempre a excelência no exercício da farmácia e a
                valorização do farmacêutico em Alagoas. Nossa missão, visão e
                valores refletem o compromisso com a sociedade e com a classe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
