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
        'Após a análise e aprovação em plenária, você receberá um email avisando a aprovação da sua inscrição',
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
        'Faça login no CRFAL em Casa',
        'Acesse "Meus Dados"',
        'Clique na caixa correspondendo ao dado que deseja alterar"',
        'Altere as informações necessárias',
        'Anexe documentos comprobatórios, se necessário',
        'Confirme as alterações clicando em "Salvar Protocolo"',
      ],
    },
  },
  {
    id: 3,
    icon: Copy,
    title: 'Baixa de Responsabilidade Técnica',
    description: 'Solicite a baixa do vínculo de responsabilidade técnica sem precisar anexar requerimento  .',
    tutorial: {
      steps: [
        'Acesse o CRF em Casa como Pessoa Física',
        'Clique em "Baixa de Contrato de Trabalho"',
        'Selecione o vínculo a ser encerrado (Responsabilidades Técnicas (Selecione a Empresa)"',
        'Selecione o motivo da baixa',
        'Coloque a Data do Contrato e a Data de Desligamento',
        'Em caso de problemas na hora da demissão: ANEXAR UMA DECLARAÇÃO EXPONDO OS MOTIVOS e/ou CÓPIA DA AÇÃO NA JUSTIÇA DO TRABALHO (SE ACONTECER).',
        'Clique em "Salvar Protocolo"',
      ],
    },
  },
  {
    id: 4,
    icon: FileCheck,
    title: 'Comunicado de Afastamento Provisório',
    description: 'Comunique seu afastamento provisório 100% online e evite autuações.',
    tutorial: {
      steps: [
        'Entre no CRFAL em Casa como Pessoa Física',
        'Clique em "Comunicado de Afastamento Provisório"',
        'Selecione a Responsabilidade Técnica (RT)',
        'Selecione o Motivo de Ausência',
        'Coloque a Data de Início e de Término do Afastamento',
        'Informe o horário de início e término do afastamento, caso o motivo permita',
        'Anexe um comprovante do motivo de ausência.',
        'Em caso de atestado médico, o farmacêutico deverá apresenta-lo presencialmente no CRFAL em até 10 dias.',
        'Clique em "Salvar Protocolo"',
        'Caso seja necessário, acompanhe o processo pelo menu de "Protocolos Web"',
      ],
    },
  },
  {
    id: 5,
    icon: Search,
    title: 'Justificativa de Ausência',
    description: 'Em caso de autuação ou qualquer outro motivo, você pode solicitar a justificativa de ausência para o CRFAL.',
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

export default function Servicos() {
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
    <section
      ref={sectionRef}
      id="servicos"
      className="py-16 sm:py-20 md:py-28 bg-neutral-50 relative overflow-x-clip"
    >
      <div className="container-crfal">
        {/* Mobile: stacked header / Desktop: side-by-side */}
        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <div
                className={`transition-all duration-700 ${
                  isVisible
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-8'
                }`}
              >
                <span className="inline-block px-4 py-1.5 bg-crfal-blue text-white text-sm font-semibold rounded-full mb-4">
                  Serviços
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-800 mb-3 sm:mb-4">
                  Nossos Serviços
                </h2>
                <p className="text-neutral-600 mb-6 text-sm sm:text-base">
                  Conheça todos os serviços disponíveis para farmacêuticos e
                  estabelecimentos. Clique em um serviço para ver o tutorial
                  passo a passo.
                </p>
                <a
                  href="#todos-servicos"
                  className="inline-flex items-center gap-2 btn-primary text-sm sm:text-base"
                >
                  Ver todos os serviços
                  <ChevronRight className="w-5 h-5" />
                </a>
              </div>

              {/* Stats - hidden on mobile (moved to hero), visible on desktop */}
              <div
                className={`mt-10 hidden lg:grid grid-cols-2 gap-4 transition-all duration-700 ${
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
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

          {/* Services list */}
          <div className="lg:col-span-8">
            <div className="space-y-3 sm:space-y-4">
              {services.map((service, index) => {
                const Icon = service.icon;
                const isExpanded = expandedService === service.id;

                return (
                  <div
                    key={service.id}
                    className={`bg-white rounded-2xl border border-neutral-200 overflow-hidden transition-all duration-300 ${
                      isExpanded ? 'shadow-card' : ''
                    } ${
                      isVisible
                        ? 'opacity-100 translate-x-0'
                        : 'opacity-0 translate-x-8'
                    }`}
                    style={{
                      transitionDelay: isVisible ? `${index * 60}ms` : '0ms',
                    }}
                  >
                    <button
                      onClick={() => handleServiceClick(service)}
                      className={`w-full flex items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 text-left transition-all duration-300 min-h-[64px] active:bg-neutral-50 ${
                        isExpanded
                          ? 'bg-crfal-blue-lighter'
                          : 'hover:bg-neutral-50'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                          isExpanded
                            ? 'bg-crfal-blue text-white'
                            : 'bg-crfal-blue-lighter text-crfal-blue'
                        }`}
                      >
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-neutral-800 text-sm sm:text-base leading-snug line-clamp-2 sm:line-clamp-none">
                          {service.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed hidden sm:block">
                          {service.description}
                        </p>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-crfal-blue flex-shrink-0 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Tutorial Content */}
                    <div
                      className={`overflow-hidden transition-all duration-500 ease-in-out ${
                        isExpanded ? 'max-h-[1400px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-crfal-gray-medium">
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-crfal-blue flex items-center gap-2 text-sm sm:text-base">
                              <Play className="w-4 h-4" />
                              Tutorial Passo a Passo
                            </h4>
                            <button
                              onClick={() => setShowVideoModal(true)}
                              className="text-xs sm:text-sm text-crfal-blue-light hover:underline flex items-center gap-1 min-h-[44px] px-2"
                            >
                              <Play className="w-4 h-4" />
                              <span className="hidden sm:inline">Assistir vídeo</span>
                              <span className="sm:hidden">Vídeo</span>
                            </button>
                          </div>

                          <ol className="space-y-2.5 sm:space-y-3">
                            {service.tutorial.steps.map((step, stepIndex) => (
                              <li
                                key={stepIndex}
                                className="flex items-start gap-3"
                              >
                                <span className="flex-shrink-0 w-6 h-6 bg-crfal-blue text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                                  {stepIndex + 1}
                                </span>
                                <span className="text-sm text-crfal-gray-dark leading-relaxed">
                                  {step}
                                </span>
                              </li>
                            ))}
                          </ol>

                          <div className="mt-5 flex flex-col sm:flex-row gap-3">
                            <a
                              href={`#${service.title
                                .toLowerCase()
                                .replace(/\s+/g, '-')}`}
                              className="btn-primary text-sm text-center"
                            >
                              Acessar Serviço
                            </a>
                            <a
                              href="#"
                              className="btn-outline text-sm text-center"
                            >
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

      {/* Video Modal */}
      {showVideoModal && selectedService && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70"
          onClick={() => setShowVideoModal(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl max-w-2xl w-full overflow-hidden max-h-[92svh] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-crfal-gray-medium">
              <h3 className="font-bold text-crfal-blue text-sm sm:text-base pr-2">
                Tutorial: {selectedService.title}
              </h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="p-2 hover:bg-crfal-gray rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-crfal-gray flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-crfal-blue mx-auto mb-4" />
                <p className="text-crfal-text-gray">
                  Vídeo tutorial em breve
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
