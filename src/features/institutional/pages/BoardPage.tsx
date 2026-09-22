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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Membro {
  id: number;
  nome: string;
  cargo: string;
  foto?: string;
  email?: string;
  bio?: string;
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
    descricao: 'Membros responsáveis pela gestão e administração do Conselho Regional de Farmácia do Estado de Alagoas.',
    icon: Briefcase,
    membros: [
      {
        id: 1,
        nome: 'João Batista dos Santos Neto',
        cargo: 'Presidente',
        foto: '/images/presidente.png',
        email: 'presidente@crf-al.org.br',
        bio: 'Com uma trajetória consolidada de dedicação à classe farmacêutica e à valorização do profissional em todas as suas frentes de atuação.',
      },
      {
        id: 2,
        nome: 'Lyvia Quintela Cavalcante Trajano',
        cargo: 'Vice-Presidente',
        foto: '/images/vice.png',
        email: 'vicepresidente@crf-al.org.br',
        bio: 'Com especializações nas áreas clínica, de prescrição e estética, possui uma trajetória consolidada de dedicação à classe e forte atuação em prol da valorização da categoria.',
      },
      {
        id: 3,
        nome: 'Ana Renata de Almeida Lima',
        cargo: 'Secretária-Geral',
        foto: '/images/secretaria-geral.png',
        email: 'secretaria@crf-al.org.br',
        bio: 'Sou farmacêutica, graduada pela Universidade Federal de Alagoas (UFAL), em 2006, mestre em Ensino na Saúde e Tecnologia pela Universidade Estadual de Ciências da Saúde de Alagoas (UNCISAL) e doutoranda em Ciências da Saúde pela Universidade de Pernambuco (UPE). Possuo pós-graduação em Farmacologia Clínica e em Farmácia Clínica e Hospitalar pela Facinter; Gestão Pública em Saúde pela UFAL; Gestão da Assistência Farmacêutica pela Universidade Federal de Santa Catarina (UFSC); além de MBA em Avaliação de Tecnologias em Saúde (ATS) pelo Hospital Alemão Oswaldo Cruz (HAOC). Atualmente, atuo na Prefeitura Municipal de Arapiraca e no Hospital de Emergência Dr. Daniel Houly, onde exerço a coordenação do Programa de Residência Multiprofissional em Saúde. Também atuo como docente no curso de Farmácia da UNINASSAU. Minha trajetória profissional é construída na interface entre Assistência Farmacêutica, gestão em saúde, avaliação de tecnologias em saúde, formação profissional e educação permanente, com atuação voltada ao fortalecimento do SUS e à qualificação do cuidado em saúde.',
      },
      {
        id: 4,
        nome: 'Isadora Lyra Cavalcanti',
        cargo: 'Tesoureira',
        foto: '/images/tesoureira.png',
        email: 'tesoureira@crf-al.org.br',
        bio: 'Essa experiência confere à sua gestão um olhar atento à transparência e à valorização do profissional em todas as suas frentes de atuação.',
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

function BioModal({
  membro,
  open,
  onOpenChange,
}: {
  membro: Membro;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-crfal-gray-200 p-5 pr-12 text-left sm:p-6 sm:pr-14">
          <span className="mb-2 inline-flex w-fit items-center rounded-md bg-red-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-red-600  ">
            {membro.cargo}
          </span>
          <DialogTitle className="font-display text-lg font-bold uppercase leading-tight text-crfal-blue-dark  sm:text-xl">
            {membro.nome}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Minicurrículo de {membro.nome}
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto p-5 sm:p-6">
          <p className="whitespace-pre-line text-sm leading-relaxed text-crfal-gray-600  sm:text-[15px]">
            {membro.bio}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DirectorCard({ membro, flip }: { membro: Membro; flip: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const bioRef = useRef<HTMLParagraphElement>(null);
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    const el = bioRef.current;
    if (!el) return;
    const check = () => setIsClamped(el.scrollHeight > el.clientHeight + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [membro.bio]);

  return (
    <>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-shadow duration-300 hover:shadow-card-hover ">
        <div
          className={`absolute inset-y-0 z-10 hidden w-1.5 bg-gradient-to-b from-red-600 via-crfal-blue to-crfal-blue-dark sm:block ${
            flip ? 'right-0' : 'left-0'
          }`}
          aria-hidden
        />
        <div className={`flex flex-1 flex-col sm:flex-row ${flip ? 'sm:flex-row-reverse' : ''}`}>
          <div className="relative aspect-[4/4.4] w-full shrink-0 bg-gradient-to-br from-crfal-blue to-crfal-blue-dark sm:aspect-auto sm:h-auto sm:min-h-[240px] sm:w-[190px] lg:w-[210px]">
            {membro.foto ? (
              <img
                src={membro.foto}
                alt={membro.nome}
                className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <UserCircle className="h-20 w-20 text-white/50" />
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col p-5 sm:p-7">
            <span className="mb-3 inline-flex w-fit items-center rounded-md bg-red-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-red-600  ">
              {membro.cargo}
            </span>
            <h3 className="mb-3 font-display text-xl font-bold uppercase leading-tight text-crfal-blue-dark  sm:text-2xl">
              {membro.nome}
            </h3>
            {membro.bio && (
              <>
                <p
                  ref={bioRef}
                  className="line-clamp-4 text-sm leading-relaxed text-crfal-gray-600  sm:text-[15px]"
                >
                  {membro.bio}
                </p>
                {isClamped && (
                  <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="mt-3 inline-flex w-fit items-center gap-1 text-sm font-semibold text-crfal-blue transition-colors duration-300 hover:text-crfal-blue-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2  "
                  >
                    Ler mais
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </>
            )}
            {membro.email && (
              <a
                href={`mailto:${membro.email}`}
                className="mt-auto inline-flex w-fit items-center gap-2 pt-4 text-sm text-crfal-gray-500 transition-colors duration-300 hover:text-crfal-blue  "
              >
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{membro.email}</span>
              </a>
            )}
          </div>
        </div>
      </article>
      <BioModal membro={membro} open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

function MemberCard({ membro, index, isVisible }: { membro: Membro; index: number; isVisible: boolean }) {
  return (
    <article
      className={`group overflow-hidden rounded-xl border border-crfal-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-crfal-blue/30 hover:shadow-card-hover    ${
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
        <h3 className="text-base font-bold leading-snug text-neutral-800 transition-colors duration-300 group-hover:text-crfal-blue  sm:text-lg">
          {membro.nome}
        </h3>
        {membro.email && (
          <a
            href={`mailto:${membro.email}`}
            className="mt-2.5 inline-flex items-center gap-2 text-sm text-crfal-gray-500 transition-colors duration-300 hover:text-crfal-blue  "
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
  const isDiretoria = secaoSelecionada.id === 'diretoria';

  return (
    <div className="min-h-screen bg-white ">
      <SEO
        title="Diretoria"
        description="Conheça a diretoria e os membros do Conselho Regional de Farmácia do Estado de Alagoas (CRFAL) — gestão atual e suas responsabilidades."
        path="/instituicao/diretoria"
      />

      <div className="relative overflow-hidden bg-crfal-blue-dark pb-16 pt-28 md:pb-20 lg:pt-44">
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
                Conheça os membros da diretoria executiva e os conselheiros que compõem o Conselho Regional de Farmácia do Estado de Alagoas.
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
                    ? 'cursor-not-allowed bg-crfal-gray-100 text-crfal-gray-400 opacity-60  '
                    : secaoAtiva === secao.id
                      ? 'bg-crfal-blue text-white shadow-sm'
                      : 'bg-crfal-gray-100 text-crfal-gray-600 hover:bg-neutral-200   '
                }`}
              >
                <Icon className="h-4 w-4" />
                {secao.titulo}
              </button>
            );
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className={isDiretoria ? 'lg:col-span-12' : 'lg:col-span-4'}>
            <div className="lg:sticky lg:top-28">
              <div className={`transition-all duration-700 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
                <span className="mb-4 inline-block rounded-full bg-crfal-blue-lighter px-4 py-1.5 text-sm font-semibold text-crfal-blue  ">
                  {secaoSelecionada.titulo}
                </span>
                <h2 className="mb-3 text-2xl font-bold text-neutral-800  sm:text-3xl">
                  {secaoSelecionada.id === 'diretoria' ? 'Gestão do CRFAL' : 'Plenário do CRFAL'}
                </h2>
                <p className="text-sm leading-relaxed text-crfal-gray-600  sm:text-base">
                  {secaoSelecionada.descricao}
                </p>
              </div>

              <div
                className={`mt-8 grid grid-cols-2 gap-4 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                style={{ transitionDelay: '200ms' }}
              >
                <div className="rounded-xl border border-crfal-gray-200 bg-white p-4  ">
                  <span className="font-display text-3xl font-light text-crfal-blue ">{secaoSelecionada.membros.length}</span>
                  <p className="mt-1 text-xs uppercase tracking-wider text-crfal-gray-500 ">Membros</p>
                </div>
                <div className="rounded-xl border border-crfal-gray-200 bg-white p-4  ">
                  <span className="font-display text-3xl font-light text-crfal-blue ">{secoes.reduce((acc, s) => acc + s.membros.length, 0)}</span>
                  <p className="mt-1 text-xs uppercase tracking-wider text-crfal-gray-500 ">Total Geral</p>
                </div>
              </div>
            </div>
          </div>

          <div className={isDiretoria ? 'lg:col-span-12' : 'lg:col-span-8'}>
            <div className={`grid gap-6 ${isDiretoria ? 'md:grid-cols-2' : ''}`}>
              {secaoSelecionada.membros.map((membro, index) =>
                membro.bio ? (
                  <div
                    key={membro.id}
                    className={`h-full transition-all duration-700 ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}
                    style={{ transitionDelay: isVisible ? `${index * 100}ms` : '0ms' }}
                  >
                    <DirectorCard membro={membro} flip={index % 2 === 1} />
                  </div>
                ) : (
                  <div key={membro.id} className="sm:grid sm:grid-cols-2 sm:gap-5">
                    <MemberCard membro={membro} index={index} isVisible={isVisible} />
                  </div>
                )
              )}
            </div>

            <div
              className={`mt-8 rounded-xl border border-crfal-blue/15 bg-crfal-blue-lighter/60 p-6 transition-all duration-700   ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-crfal-blue text-white  ">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="mb-1 font-bold text-neutral-800 ">
                    Gestão {new Date().getFullYear()}
                  </h4>
                  <p className="text-sm leading-relaxed text-crfal-gray-600 ">
                    A diretoria e os conselheiros do CRFAL são eleitos pelos profissionais farmacêuticos do estado de Alagoas para mandatos conforme previsto no estatuto do Conselho. Saiba mais consultando o{' '}
                    <a href="/instituicao/estatuto" className="font-semibold text-crfal-blue transition-colors hover:underline ">
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
