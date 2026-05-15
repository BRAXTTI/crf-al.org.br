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
  Play,
  X,
  BookOpen,
  Clock,
  Filter,
  Download,
} from 'lucide-react';

interface Tutorial {
  id: number;
  icon: React.ElementType;
  title: string;
  description: string;
  category: string;
  duration: string;
  steps: string[];
  videoUrl?: string;
}

const categories = ['Todos', 'Inscrição', 'Certidões', 'Consultas', 'Estabelecimentos'];

const tutorials: Tutorial[] = [
  {
    id: 1,
    icon: FileText,
    title: 'Como fazer sua Inscrição no CRFAL',
    description: 'Aprenda passo a passo como realizar sua primeira inscrição no Conselho Regional de Farmácia de Alagoas.',
    category: 'Inscrição',
    duration: '5 min',
    steps: [
      'Acesse o portal CRF em Casa pelo site oficial do CRFAL',
      'Clique em "Nova Inscrição" no menu principal',
      'Preencha o formulário com seus dados pessoais completos',
      'Informe os dados profissionais e acadêmicos',
      'Anexe os documentos solicitados (diploma, RG, CPF, etc.)',
      'Revise todas as informações e confirme o envio',
      'Gere o boleto da taxa de inscrição',
      'Efetue o pagamento e acompanhe pelo portal',
    ],
  },
  {
    id: 2,
    icon: Edit3,
    title: 'Como Alterar seus Dados Cadastrais',
    description: 'Saiba como atualizar suas informações pessoais e profissionais de forma rápida e segura.',
    category: 'Inscrição',
    duration: '3 min',
    steps: [
      'Faça login no portal CRF em Casa',
      'Acesse o menu "Meus Dados"',
      'Clique em "Editar Dados"',
      'Altere as informações desejadas',
      'Anexe documentos comprobatórios, se necessário',
      'Confirme as alterações clicando em "Salvar"',
    ],
  },
  {
    id: 3,
    icon: Copy,
    title: 'Como Solicitar 2ª Via de Certidões',
    description: 'Tutorial completo para solicitar a segunda via de certidões e documentos emitidos pelo CRFAL.',
    category: 'Certidões',
    duration: '4 min',
    steps: [
      'Acesse o portal CRF em Casa',
      'Navegue até a seção "Certidões"',
      'Selecione o tipo de documento desejado',
      'Informe o número da sua inscrição',
      'Pague a taxa de emissão, se aplicável',
      'Baixe o documento em formato PDF',
    ],
  },
  {
    id: 4,
    icon: FileCheck,
    title: 'Como Emitir Certidão de Regularidade',
    description: 'Aprenda a emitir sua certidão de regularidade de forma online e instantânea.',
    category: 'Certidões',
    duration: '2 min',
    steps: [
      'Acesse o portal CRF em Casa',
      'Vá em "Certidões" > "Certidão de Regularidade"',
      'Verifique se não há pendências financeiras',
      'Clique em "Emitir Certidão"',
      'O documento será gerado automaticamente em PDF',
      'Imprima ou salve o arquivo',
    ],
  },
  {
    id: 5,
    icon: Search,
    title: 'Como Consultar Inscrição de Farmacêutico',
    description: 'Veja como verificar a situação cadastral de qualquer farmacêutico registrado.',
    category: 'Consultas',
    duration: '2 min',
    steps: [
      'Acesse a página de consulta pública no site do CRFAL',
      'Digite o CPF ou o número de inscrição do profissional',
      'Clique em "Consultar"',
      'Visualize os dados e a situação cadastral',
      'Verifique se a inscrição está ativa e regular',
    ],
  },
  {
    id: 6,
    icon: Building2,
    title: 'Como Consultar Autorização de Funcionamento',
    description: 'Verifique a regularidade de estabelecimentos farmacêuticos junto ao CRFAL.',
    category: 'Estabelecimentos',
    duration: '3 min',
    steps: [
      'Acesse a consulta de estabelecimentos no site',
      'Informe o CNPJ ou nome da farmácia',
      'Selecione o estado (Alagoas) e a cidade',
      'Clique em "Consultar"',
      'Visualize os dados do estabelecimento',
      'Confirme a autorização de funcionamento',
    ],
  },
  {
    id: 7,
    icon: UserCheck,
    title: 'Como Consultar Responsabilidade Técnica',
    description: 'Consulte os vínculos de responsabilidade técnica ativos no CRFAL.',
    category: 'Estabelecimentos',
    duration: '3 min',
    steps: [
      'Acesse a consulta de Responsabilidade Técnica',
      'Digite o CPF do farmacêutico',
      'Ou informe o CNPJ do estabelecimento',
      'Clique em "Consultar"',
      'Visualize os vínculos ativos e o histórico',
    ],
  },
  {
    id: 8,
    icon: Stamp,
    title: 'Como Validar Documentos do CRFAL',
    description: 'Aprenda a verificar a autenticidade de documentos emitidos pelo Conselho.',
    category: 'Consultas',
    duration: '2 min',
    steps: [
      'Acesse o validador de documentos no site do CRFAL',
      'Digite o código de validação presente no documento',
      'Ou faça upload do QR Code',
      'Clique em "Validar"',
      'Visualize o resultado e confirme a autenticidade',
    ],
  },
];

export default function TutorialsPage() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [expandedTutorial, setExpandedTutorial] = useState<number | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
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

  const filteredTutorials =
    activeCategory === 'Todos'
      ? tutorials
      : tutorials.filter((t) => t.category === activeCategory);

  const handleTutorialClick = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    setExpandedTutorial(expandedTutorial === tutorial.id ? null : tutorial.id);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="relative bg-gradient-to-br from-crfal-blue via-crfal-blue-dark to-[#002a4a] pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-crfal-blue-light rounded-full blur-3xl" />
        </div>
        <div className="container-crfal relative z-10">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
            <a href="/" className="hover:text-white transition-colors">Início</a>
            <ChevronRight className="w-4 h-4" />
            <span>Serviços</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Tutoriais</span>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Tutoriais</h1>
              <p className="text-white/80 text-lg">
                Aprenda a utilizar todos os serviços do CRFAL com nossos
                tutoriais passo a passo. Simples, rápido e direto ao ponto.
              </p>
            </div>
            <div className="hidden md:flex justify-end">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                  <BookOpen className="w-8 h-8 text-white mb-2" />
                  <span className="text-2xl font-bold text-white block">{tutorials.length}</span>
                  <span className="text-sm text-white/70">Tutoriais</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                  <Clock className="w-8 h-8 text-white mb-2" />
                  <span className="text-2xl font-bold text-white block">2-5</span>
                  <span className="text-sm text-white/70">Min. cada</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-crfal py-10 md:py-16" ref={sectionRef}>
        <div
          className={`flex flex-wrap gap-2 mb-10 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex items-center gap-2 mr-2 text-neutral-500">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtrar:</span>
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setExpandedTutorial(null);
              }}
              className={`px-4 py-2 text-sm rounded-full transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-crfal-blue text-white shadow-md'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:border-crfal-blue/30 hover:text-crfal-blue'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <div
                className={`transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}
              >
                <span className="inline-block px-4 py-1.5 bg-crfal-blue text-white text-sm font-semibold rounded-full mb-4">
                  Tutoriais
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
                  Aprenda com Nossos Tutoriais
                </h2>
                <p className="text-neutral-600 mb-6">
                  Selecione um tutorial para ver o passo a passo detalhado.
                  Cada tutorial inclui todas as informações necessárias para
                  você utilizar nossos serviços com facilidade.
                </p>
                <a
                  href="https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 btn-primary"
                >
                  Acessar Portal
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
                  <span className="text-3xl font-bold text-crfal-blue">{filteredTutorials.length}</span>
                  <p className="text-sm text-neutral-600">
                    {activeCategory === 'Todos' ? 'Tutoriais Disponíveis' : `em ${activeCategory}`}
                  </p>
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
              {filteredTutorials.map((tutorial, index) => {
                const Icon = tutorial.icon;
                const isExpanded = expandedTutorial === tutorial.id;

                return (
                  <div
                    key={tutorial.id}
                    className={`bg-white rounded-2xl border border-neutral-200 overflow-hidden transition-all duration-300 ${
                      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                    }`}
                    style={{ transitionDelay: isVisible ? `${index * 80}ms` : '0ms' }}
                  >
                    <button
                      onClick={() => handleTutorialClick(tutorial)}
                      className={`w-full flex items-center gap-4 p-5 text-left transition-all duration-300 ${
                        isExpanded ? 'bg-crfal-blue-lighter' : 'hover:bg-neutral-50'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isExpanded ? 'bg-crfal-blue text-white' : 'bg-crfal-blue-lighter text-crfal-blue'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 bg-crfal-blue-lighter text-crfal-blue rounded-full font-medium">
                            {tutorial.category}
                          </span>
                          <span className="text-xs text-neutral-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {tutorial.duration}
                          </span>
                        </div>
                        <h3 className="font-bold text-neutral-800">{tutorial.title}</h3>
                        <p className="text-sm text-neutral-600 line-clamp-1">{tutorial.description}</p>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-crfal-blue transition-transform duration-300 flex-shrink-0 ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-500 ${
                        isExpanded ? 'max-h-[800px]' : 'max-h-0'
                      }`}
                    >
                      <div className="p-5 pt-0 border-t border-neutral-200">
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-crfal-blue flex items-center gap-2">
                              <Play className="w-4 h-4" />
                              Tutorial Passo a Passo
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTutorial(tutorial);
                                setShowVideoModal(true);
                              }}
                              className="text-sm text-crfal-blue-light hover:underline flex items-center gap-1"
                            >
                              <Play className="w-4 h-4" />
                              Assistir vídeo
                            </button>
                          </div>

                          <ol className="space-y-3">
                            {tutorial.steps.map((step, stepIndex) => (
                              <li key={stepIndex} className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-crfal-blue text-white text-xs font-bold rounded-full flex items-center justify-center">
                                  {stepIndex + 1}
                                </span>
                                <span className="text-sm text-neutral-700 pt-0.5">{step}</span>
                              </li>
                            ))}
                          </ol>

                          <div className="mt-5 flex flex-wrap gap-3">
                            <a
                              href="https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-primary text-sm"
                            >
                              Acessar Serviço
                            </a>
                            <button className="btn-outline text-sm flex items-center gap-2">
                              <Download className="w-4 h-4" />
                              Baixar Tutorial
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredTutorials.length === 0 && (
                <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
                  <Search className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-neutral-700 mb-2">Nenhum tutorial encontrado</h3>
                  <p className="text-neutral-500 text-sm">Não há tutoriais na categoria selecionada.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showVideoModal && selectedTutorial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setShowVideoModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h3 className="font-bold text-crfal-blue">Tutorial: {selectedTutorial.title}</h3>
              <button onClick={() => setShowVideoModal(false)} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-neutral-100 flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-crfal-blue mx-auto mb-4" />
                <p className="text-neutral-500">Vídeo tutorial em breve</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
