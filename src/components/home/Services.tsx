import { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Edit3,
  Copy,
  FileCheck,
  Search,
  Building2,
  UserCheck,
  Stamp,
  ChevronRight,
  ChevronDown,
  Play,
  X,
} from 'lucide-react';

interface Service {
  id: number;
  icon: React.ElementType;
  title: string;
  description: string;
  tutorial: {
    steps: string[];
    videoUrl?: string;
  };
}

const services: Service[] = [
  {
    id: 1,
    icon: FileText,
    title: 'Primeira Inscrição - Pessoa Física',
    description: 'Destinado a farmacêuticos que nunca estiveram inscritos em nenhum Conselho Regional de Farmácia.',
    tutorial: {
      steps: [
        'Acesse o portal do CRF em Casa',
        'Clique em "Pré Inscrição Pessoa Física"',
        'Preencha o formulário atentamente',
        'Anexe os documentos necessários',
        'Realize o pagamento da taxa',
        'Aguarde a análise da sua documentação',
        'Apos a analise e aprovação em plenaria, você receberá um email avisando a aprovação da sua inscrição',
      ],
    },
  },
  {
    id: 2,
    icon: Edit3,
    title: 'Alteração de Dados',
    description: 'Atualize suas informações cadastrais de forma rápida e segura.',
    tutorial: {
      steps: [
        'Faça login no sistema',
        'Acesse "Meus Dados"',
        'Clique em "Editar"',
        'Altere as informações necessárias',
        'Anexe documentos comprobatórios',
        'Confirme as alterações',
      ],
    },
  },
  {
    id: 3,
    icon: Copy,
    title: '2ª Via de Certidões',
    description: 'Solicite a segunda via de certidões e documentos.',
    tutorial: {
      steps: [
        'Acesse a área de certidões',
        'Selecione o tipo de documento',
        'Informe o número da inscrição',
        'Pague a taxa de emissão',
        'Baixe o documento em PDF',
      ],
    },
  },
  {
    id: 4,
    icon: FileCheck,
    title: 'Certidões Negativas',
    description: 'Emita certidões negativas de débito e regularidade.',
    tutorial: {
      steps: [
        'Entre no sistema de certidões',
        'Escolha o tipo de certidão',
        'Verifique se não há pendências',
        'Gere o documento automaticamente',
        'Imprima ou salve em PDF',
      ],
    },
  },
  {
    id: 5,
    icon: Search,
    title: 'Consultar Inscrição',
    description: 'Consulte a situação cadastral de qualquer farmacêutico.',
    tutorial: {
      steps: [
        'Acesse a consulta pública',
        'Digite o CPF ou número de inscrição',
        'Clique em "Consultar"',
        'Visualize os dados do profissional',
        'Verifique a situação atual',
      ],
    },
  },
  {
    id: 6,
    icon: Building2,
    title: 'Consulta a Autorização de Funcionamento',
    description: 'Verifique a regularidade de estabelecimentos farmacêuticos.',
    tutorial: {
      steps: [
        'Acesse a consulta de estabelecimentos',
        'Informe o CNPJ ou nome da farmácia',
        'Selecione o estado e cidade',
        'Visualize os dados do estabelecimento',
        'Confirme a autorização de funcionamento',
      ],
    },
  },
  {
    id: 7,
    icon: UserCheck,
    title: 'Consulta a Responsabilidade Técnica',
    description: 'Consulte os vínculos de responsabilidade técnica.',
    tutorial: {
      steps: [
        'Acesse a consulta de RT',
        'Digite o CPF do farmacêutico',
        'Ou informe o CNPJ do estabelecimento',
        'Visualize os vínculos ativos',
        'Verifique o histórico de RT',
      ],
    },
  },
  {
    id: 8,
    icon: Stamp,
    title: 'Validar Documentos',
    description: 'Valide a autenticidade de documentos emitidos pelo CRFAL.',
    tutorial: {
      steps: [
        'Acesse o validador de documentos',
        'Digite o código de validação',
        'Ou faça upload do QR Code',
        'Clique em "Validar"',
        'Visualize o resultado da validação',
      ],
    },
  },
];

export default function Services() {
  const [expandedService, setExpandedService] = useState<number | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
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
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setExpandedService(expandedService === service.id ? null : service.id);
  };

  return (
    <section ref={sectionRef} id="servicos" className="py-20 md:py-28 bg-neutral-50 relative">
      <div className="container-crfal">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <div
                className={`transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}
              >
                <span className="inline-block px-4 py-1.5 bg-crfal-blue text-white text-sm font-semibold rounded-full mb-4">
                  Serviços
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
                  Nossos Serviços
                </h2>
                <p className="text-neutral-600 mb-6">
                  Conheça todos os serviços disponíveis para farmacêuticos e
                  estabelecimentos. Clique em um serviço para ver o tutorial
                  passo a passo.
                </p>
                <a href="#todos-servicos" className="inline-flex items-center gap-2 btn-primary">
                  Ver todos os serviços
                  <ChevronRight className="w-5 h-5" />
                </a>
              </div>

              <div
                className={`mt-10 grid grid-cols-2 gap-4 transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '200ms' }}
              >
                <div className="bg-white rounded-2xl p-4 border border-neutral-200">
                  <span className="text-3xl font-bold text-crfal-blue">8+</span>
                  <p className="text-sm text-neutral-600">Serviços Online</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-neutral-200">
                  <span className="text-3xl font-bold text-crfal-blue">24h</span>
                  <p className="text-sm text-neutral-600">Disponibilidade</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="space-y-4">
              {services.map((service, index) => {
                const Icon = service.icon;
                const isExpanded = expandedService === service.id;

                return (
                  <div
                    key={service.id}
                    className={`bg-white rounded-2xl border border-neutral-200 overflow-hidden transition-all duration-300 ${
                      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                    }`}
                    style={{ transitionDelay: isVisible ? `${index * 80}ms` : '0ms' }}
                  >
                    <button
                      onClick={() => handleServiceClick(service)}
                      className={`w-full flex items-center gap-4 p-5 text-left transition-all duration-300 ${
                        isExpanded ? 'bg-crfal-blue-lighter' : 'hover:bg-neutral-50'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isExpanded
                            ? 'bg-crfal-blue text-white'
                            : 'bg-crfal-blue-lighter text-crfal-blue'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-neutral-800">{service.title}</h3>
                        <p className="text-sm text-neutral-600">{service.description}</p>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-crfal-blue transition-transform duration-300 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-500 ${
                        isExpanded ? 'max-h-[800px]' : 'max-h-0'
                      }`}
                    >
                      <div className="p-5 pt-0 border-t border-crfal-gray-medium">
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-crfal-blue flex items-center gap-2">
                              <Play className="w-4 h-4" />
                              Tutorial Passo a Passo
                            </h4>
                            <button
                              onClick={() => setShowVideoModal(true)}
                              className="text-sm text-crfal-blue-light hover:underline flex items-center gap-1"
                            >
                              <Play className="w-4 h-4" />
                              Assistir vídeo
                            </button>
                          </div>

                          <ol className="space-y-3">
                            {service.tutorial.steps.map((step, stepIndex) => (
                              <li key={stepIndex} className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-crfal-blue text-white text-xs font-bold rounded-full flex items-center justify-center">
                                  {stepIndex + 1}
                                </span>
                                <span className="text-sm text-crfal-gray-dark pt-0.5">{step}</span>
                              </li>
                            ))}
                          </ol>

                          <div className="mt-5 flex gap-3">
                            <a
                              href={`#${service.title.toLowerCase().replace(/\s+/g, '-')}`}
                              className="btn-primary text-sm"
                            >
                              Acessar Serviço
                            </a>
                            <a href="#" className="btn-outline text-sm">
                              Baixar Tutorial
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showVideoModal && selectedService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setShowVideoModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-crfal-gray-medium">
              <h3 className="font-bold text-crfal-blue">Tutorial: {selectedService.title}</h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="p-2 hover:bg-crfal-gray rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-crfal-gray flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-crfal-blue mx-auto mb-4" />
                <p className="text-crfal-text-gray">Vídeo tutorial em breve</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
