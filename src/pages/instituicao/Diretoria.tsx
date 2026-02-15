import { useState, useEffect, useRef } from 'react';
import {
  ChevronRight,
  Users,
  Shield,
  Mail,
  Award,
  UserCircle,
  Briefcase,
} from 'lucide-react';

interface Membro {
  id: number;
  nome: string;
  cargo: string;
  foto?: string;
  email?: string;
}

interface Secao {
  id: string;
  titulo: string;
  descricao: string;
  icon: React.ElementType;
  membros: Membro[];
}

const secoes: Secao[] = [
  {
    id: 'diretoria',
    titulo: 'Diretoria Executiva',
    descricao: 'Membros responsáveis pela gestão e administração do Conselho Regional de Farmácia de Alagoas.',
    icon: Briefcase,
    membros: [
      {
        id: 1,
        nome: 'João Batista dos Santos Neto',
        cargo: 'Presidente',
        email: 'presidente@crf-al.org.br',
      },
      {
        id: 2,
        nome: 'Lyvia Quintela Cavalcante Trajano',
        cargo: 'Vice-Presidente',
        email: 'vicepresidente@crfal.org.br',
      },
      {
        id: 3,
        nome: 'Ana Renata de Almeida Lima',
        cargo: 'Secretária-Geral',
        email: 'secretaria@crf-al.org.br',
      },
      {
        id: 4,
        nome: 'Isadora Lyra Cavalcanti',
        cargo: 'Tesoureira',
        email: 'tesoureira@crf-al.org.br',
      },
    ],
  },
  {
    id: 'conselheiros-efetivos',
    titulo: 'Conselheiros Efetivos',
    descricao: 'Membros efetivos do plenário do CRFAL, responsáveis pelas deliberações e decisões do Conselho.',
    icon: Users,
    membros: [
      {
        id: 5,
        nome: 'Nome do(a) Conselheiro(a)',
        cargo: 'Conselheiro(a) Efetivo(a)', 
      },
      {
        id: 6,
        nome: 'Nome do(a) Conselheiro(a)',
        cargo: 'Conselheiro(a) Efetivo(a)',
      },
      {
        id: 7,
        nome: 'Nome do(a) Conselheiro(a)',
        cargo: 'Conselheiro(a) Efetivo(a)',
      },
      {
        id: 8,
        nome: 'Nome do(a) Conselheiro(a)',
        cargo: 'Conselheiro(a) Efetivo(a)',
      },
      {
        id: 9,
        nome: 'Nome do(a) Conselheiro(a)',
        cargo: 'Conselheiro(a) Efetivo(a)',
      },
    ],
  },
  {
    id: 'conselheiros-suplentes',
    titulo: 'Conselheiros Suplentes',
    descricao: 'Membros suplentes que substituem os conselheiros efetivos quando necessário.',
    icon: Shield,
    membros: [
      {
        id: 10,
        nome: 'Nome do(a) Conselheiro(a)',
        cargo: 'Conselheiro(a) Suplente',
      },
      {
        id: 11,
        nome: 'Nome do(a) Conselheiro(a)',
        cargo: 'Conselheiro(a) Suplente',
      },
      {
        id: 12,
        nome: 'Nome do(a) Conselheiro(a)',
        cargo: 'Conselheiro(a) Suplente',
      },
      {
        id: 13,
        nome: 'Nome do(a) Conselheiro(a)',
        cargo: 'Conselheiro(a) Suplente',
      },
      {
        id: 14,
        nome: 'Nome do(a) Conselheiro(a)',
        cargo: 'Conselheiro(a) Suplente',
      },
    ],
  },
];

export default function Diretoria() {
  const [secaoAtiva, setSecaoAtiva] = useState<string>('diretoria');
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

  const secaoSelecionada = secoes.find((s) => s.id === secaoAtiva) || secoes[0];

  return (
    <div className="min-h-screen bg-neutral-50">
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
            <span className="text-white">Diretoria</span>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                Diretoria e Conselho
              </h1>
              <p className="text-white/80 text-base sm:text-lg">
                Conheça os membros da diretoria executiva e os conselheiros que
                compõem o Conselho Regional de Farmácia de Alagoas.
              </p>
            </div>
            <div className="hidden md:flex justify-end">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                  <Briefcase className="w-8 h-8 text-white mb-2" />
                  <span className="text-2xl font-bold text-white block">
                    {secoes[0].membros.length}
                  </span>
                  <span className="text-sm text-white/70">Diretores</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                  <Users className="w-8 h-8 text-white mb-2" />
                  <span className="text-2xl font-bold text-white block">
                    {secoes[1].membros.length + secoes[2].membros.length}
                  </span>
                  <span className="text-sm text-white/70">Conselheiros</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-crfal py-10 md:py-16" ref={sectionRef}>
        {/* Section Tabs */}
        <div
          className={`flex flex-wrap gap-3 mb-10 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {secoes.map((secao) => {
            const Icon = secao.icon;
            return (
              <button
                key={secao.id}
                onClick={() => setSecaoAtiva(secao.id)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm rounded-full transition-all duration-200 ${
                  secaoAtiva === secao.id
                    ? 'bg-crfal-blue text-white shadow-md'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:border-crfal-blue/30 hover:text-crfal-blue'
                }`}
              >
                <Icon className="w-4 h-4" />
                {secao.titulo}
              </button>
            );
          })}
        </div>

        {/* Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Sidebar */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <div
                className={`transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}
              >
                <span className="inline-block px-4 py-1.5 bg-crfal-blue text-white text-sm font-semibold rounded-full mb-4">
                  {secaoSelecionada.titulo}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
                  {secaoSelecionada.id === 'diretoria'
                    ? 'Gestão do CRFAL'
                    : 'Plenário do CRFAL'}
                </h2>
                <p className="text-neutral-600 mb-6">
                  {secaoSelecionada.descricao}
                </p>
              </div>

              <div
                className={`mt-6 grid grid-cols-2 gap-4 transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '200ms' }}
              >
                <div className="bg-white rounded-2xl p-4 border border-neutral-200">
                  <span className="text-3xl font-bold text-crfal-blue">
                    {secaoSelecionada.membros.length}
                  </span>
                  <p className="text-sm text-neutral-600">Membros</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-neutral-200">
                  <span className="text-3xl font-bold text-crfal-blue">
                    {secoes.reduce((acc, s) => acc + s.membros.length, 0)}
                  </span>
                  <p className="text-sm text-neutral-600">Total Geral</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Member Cards */}
          <div className="lg:col-span-8">
            <div className="grid sm:grid-cols-2 gap-4">
              {secaoSelecionada.membros.map((membro, index) => (
                <div
                  key={membro.id}
                  className={`bg-white rounded-2xl border border-neutral-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-crfal-blue/20 hover:-translate-y-1 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{
                    transitionDelay: isVisible ? `${index * 80}ms` : '0ms',
                  }}
                >
                  {/* Card Header with gradient */}
                  <div className="bg-gradient-to-r from-crfal-blue to-crfal-blue-dark p-4">
                    <div className="flex items-center gap-3">
                      {membro.foto ? (
                        <img
                          src={membro.foto}
                          alt={membro.nome}
                          className="w-14 h-14 rounded-xl object-cover border-2 border-white/30"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                          <UserCircle className="w-8 h-8 text-white" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-sm truncate">
                          {membro.nome}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Award className="w-3.5 h-3.5 text-white/70" />
                          <span className="text-xs text-white/80">{membro.cargo}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Briefcase className="w-4 h-4 text-crfal-blue" />
                      <span>{membro.cargo}</span>
                    </div>
                    {membro.email && (
                      <div className="flex items-center gap-2 text-sm text-neutral-500 mt-2">
                        <Mail className="w-4 h-4 text-crfal-blue" />
                        <a
                          href={`mailto:${membro.email}`}
                          className="hover:text-crfal-blue transition-colors truncate"
                        >
                          {membro.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Info Notice */}
            <div
              className={`mt-8 bg-crfal-blue-lighter rounded-2xl border border-crfal-blue/10 p-6 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-crfal-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-crfal-blue" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-800 mb-1">
                    Gestão {new Date().getFullYear()}
                  </h4>
                  <p className="text-sm text-neutral-600">
                    A diretoria e os conselheiros do CRFAL são eleitos pelos profissionais
                    farmacêuticos do estado de Alagoas para mandatos conforme previsto
                    no estatuto do Conselho. Saiba mais consultando o{' '}
                    <a
                      href="/instituicao/estatuto"
                      className="text-crfal-blue hover:underline font-medium"
                    >
                      Estatuto do CRFAL
                    </a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
