import { useState, useEffect, useRef } from 'react';
import SEO from '@/components/SEO';
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
        foto: '/images/presidente.png',
        email: 'presidente@crf-al.org.br',
      },
      {
        id: 2,
        nome: 'Lyvia Quintela Cavalcante Trajano',
        cargo: 'Vice-Presidente',
        foto: '/images/vice.png',
        email: 'vicepresidente@crfal.org.br',
      },
      {
        id: 3,
        nome: 'Ana Renata de Almeida Lima',
        cargo: 'Secretária-Geral',
        foto: '/images/secretaria-geral.png',
        email: 'secretaria@crf-al.org.br',
      },
      {
        id: 4,
        nome: 'Isadora Lyra Cavalcanti',
        cargo: 'Tesoureira',
        foto: '/images/tesoureira.png',
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
      { id: 5, nome: 'Nome do(a) Conselheiro(a)', cargo: 'Conselheiro(a) Efetivo(a)' },
      { id: 6, nome: 'Nome do(a) Conselheiro(a)', cargo: 'Conselheiro(a) Efetivo(a)' },
      { id: 7, nome: 'Nome do(a) Conselheiro(a)', cargo: 'Conselheiro(a) Efetivo(a)' },
      { id: 8, nome: 'Nome do(a) Conselheiro(a)', cargo: 'Conselheiro(a) Efetivo(a)' },
      { id: 9, nome: 'Nome do(a) Conselheiro(a)', cargo: 'Conselheiro(a) Efetivo(a)' },
    ],
  },
  {
    id: 'conselheiros-suplentes',
    titulo: 'Conselheiros Suplentes',
    descricao: 'Membros suplentes que substituem os conselheiros efetivos quando necessário.',
    icon: Shield,
    membros: [
      { id: 10, nome: 'Nome do(a) Conselheiro(a)', cargo: 'Conselheiro(a) Suplente' },
      { id: 11, nome: 'Nome do(a) Conselheiro(a)', cargo: 'Conselheiro(a) Suplente' },
      { id: 12, nome: 'Nome do(a) Conselheiro(a)', cargo: 'Conselheiro(a) Suplente' },
      { id: 13, nome: 'Nome do(a) Conselheiro(a)', cargo: 'Conselheiro(a) Suplente' },
      { id: 14, nome: 'Nome do(a) Conselheiro(a)', cargo: 'Conselheiro(a) Suplente' },
    ],
  },
];

function MemberCard({ membro, index, isVisible }: { membro: Membro; index: number; isVisible: boolean }) {
  return (
    <article
      className={`group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-crfal-blue/30 hover:shadow-card-hover dark:border-slate-700/70 dark:bg-slate-900 dark:hover:border-crfal-blue/40 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
      style={{ transitionDelay: isVisible ? `${index * 80}ms` : '0ms' }}
    >
      <div className="relative aspect-[4/4.4] overflow-hidden bg-gradient-to-br from-crfal-blue to-crfal-blue-dark">
        {membro.foto ? (
          <img
            src={membro.foto}
            alt={membro.nome}
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UserCircle className="h-20 w-20 text-white/50" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-4 pt-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
            <Award className="h-3 w-3" />
            {membro.cargo}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="text-base font-bold leading-snug text-neutral-800 transition-colors duration-300 group-hover:text-crfal-blue dark:text-white sm:text-lg">
          {membro.nome}
        </h3>
        {membro.email && (
          <a
            href={`mailto:${membro.email}`}
            className="mt-2.5 inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors duration-300 hover:text-crfal-blue dark:text-neutral-400 dark:hover:text-crfal-blue-light"
          >
            <Mail className="h-4 w-4 shrink-0" />
            <span className="truncate">{membro.email}</span>
          </a>
        )}
      </div>
    </article>
  );
}

export default function BoardPage() {
  const [secaoAtiva, setSecaoAtiva] = useState<string>('diretoria');
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); }
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const secaoSelecionada = secoes.find((s) => s.id === secaoAtiva) || secoes[0];
  const secoesDesativadas = ['conselheiros-efetivos', 'conselheiros-suplentes'];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SEO
        title="Diretoria"
        description="Conheça a diretoria e os membros do Conselho Regional de Farmácia de Alagoas (CRFAL) — gestão atual e suas responsabilidades."
        path="/instituicao/diretoria"
      />

      <div className="relative overflow-hidden bg-crfal-blue-dark pb-16 pt-28 md:pb-20 md:pt-36">
        <div className="absolute inset-0 bg-gradient-to-br from-crfal-blue-dark via-crfal-blue/90 to-crfal-blue-dark" />
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }} aria-hidden />

        <div className="container-crfal relative z-10">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-white/60 sm:text-sm" aria-label="Breadcrumb">
            <a href="/" className="transition-colors hover:text-white">Início</a>
            <ChevronRight className="h-4 w-4" />
            <span>Instituição</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">Diretoria</span>
          </nav>

          <div className="grid items-end gap-8 md:grid-cols-2">
            <div>
              <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
                Governança
              </span>
              <h1 className="mb-4 text-3xl font-bold tracking-tight text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.3)] sm:text-4xl md:text-5xl">
                Diretoria e Conselho
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
                Conheça os membros da diretoria executiva e os conselheiros que compõem o Conselho Regional de Farmácia de Alagoas.
              </p>
            </div>

            <div className="hidden justify-end md:flex">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                  <Briefcase className="mb-2 h-7 w-7 text-white" />
                  <span className="block font-display text-3xl font-light text-white">{secoes[0].membros.length}</span>
                  <span className="text-xs uppercase tracking-wider text-white/70">Diretores</span>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                  <Users className="mb-2 h-7 w-7 text-white" />
                  <span className="block font-display text-3xl font-light text-white">{secoes[1].membros.length + secoes[2].membros.length}</span>
                  <span className="text-xs uppercase tracking-wider text-white/70">Conselheiros</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-crfal py-10 md:py-16" ref={sectionRef}>
        <div className={`mb-10 flex flex-wrap gap-2.5 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          {secoes.map((secao) => {
            const Icon = secao.icon;
            const isDisabled = secoesDesativadas.includes(secao.id);
            return (
              <button
                key={secao.id}
                type="button"
                disabled={isDisabled}
                onClick={() => setSecaoAtiva(secao.id)}
                aria-disabled={isDisabled}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 active:scale-95 ${
                  isDisabled
                    ? 'cursor-not-allowed bg-neutral-100 text-neutral-400 opacity-60 dark:bg-slate-800/70 dark:text-slate-600'
                    : secaoAtiva === secao.id
                      ? 'bg-crfal-blue text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-slate-800 dark:text-neutral-300 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {secao.titulo}
              </button>
            );
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <div className={`transition-all duration-700 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
                <span className="mb-4 inline-block rounded-full bg-crfal-blue-lighter px-4 py-1.5 text-sm font-semibold text-crfal-blue dark:bg-crfal-blue/10 dark:text-crfal-blue-light">
                  {secaoSelecionada.titulo}
                </span>
                <h2 className="mb-3 text-2xl font-bold text-neutral-800 dark:text-white sm:text-3xl">
                  {secaoSelecionada.id === 'diretoria' ? 'Gestão do CRFAL' : 'Plenário do CRFAL'}
                </h2>
                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-base">
                  {secaoSelecionada.descricao}
                </p>
              </div>

              <div
                className={`mt-8 grid grid-cols-2 gap-4 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                style={{ transitionDelay: '200ms' }}
              >
                <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-slate-700/70 dark:bg-slate-900">
                  <span className="font-display text-3xl font-light text-crfal-blue dark:text-crfal-blue-light">{secaoSelecionada.membros.length}</span>
                  <p className="mt-1 text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Membros</p>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-slate-700/70 dark:bg-slate-900">
                  <span className="font-display text-3xl font-light text-crfal-blue dark:text-crfal-blue-light">{secoes.reduce((acc, s) => acc + s.membros.length, 0)}</span>
                  <p className="mt-1 text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Total Geral</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="grid gap-5 sm:grid-cols-2">
              {secaoSelecionada.membros.map((membro, index) => (
                <MemberCard key={membro.id} membro={membro} index={index} isVisible={isVisible} />
              ))}
            </div>

            <div
              className={`mt-8 rounded-xl border border-crfal-blue/15 bg-crfal-blue-lighter/60 p-6 transition-all duration-700 dark:border-crfal-blue/25 dark:bg-crfal-blue/10 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-crfal-blue text-white dark:bg-crfal-blue dark:text-white">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="mb-1 font-bold text-neutral-800 dark:text-white">
                    Gestão {new Date().getFullYear()}
                  </h4>
                  <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    A diretoria e os conselheiros do CRFAL são eleitos pelos profissionais farmacêuticos do estado de Alagoas para mandatos conforme previsto no estatuto do Conselho. Saiba mais consultando o{' '}
                    <a href="/instituicao/estatuto" className="font-semibold text-crfal-blue transition-colors hover:underline dark:text-crfal-blue-light">
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
