import { useState, useEffect, useRef } from 'react';
import SEO from '@/components/SEO';
import PageHero from '@/components/block/page-hero';
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
  DialogTrigger,
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
  children,
}: {
  membro: Membro;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-2xl [&>[data-slot=dialog-close]]:flex [&>[data-slot=dialog-close]]:h-11 [&>[data-slot=dialog-close]]:w-11 [&>[data-slot=dialog-close]]:items-center [&>[data-slot=dialog-close]]:justify-center">
        <DialogHeader className="shrink-0 border-b border-crfal-gray-200 p-5 pr-16 text-left sm:p-6 sm:pr-16">
          <span className="mb-2 inline-flex w-fit items-center rounded-md bg-red-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-red-700 lg:text-red-600">
            {membro.cargo}
          </span>
          <DialogTitle className="font-display text-lg font-bold uppercase leading-tight text-crfal-blue-dark  sm:text-xl">
            {membro.nome}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Minicurrículo de {membro.nome}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6">
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
    <BioModal membro={membro} open={isOpen} onOpenChange={setIsOpen}>
      <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-shadow duration-300 hover:shadow-card-hover max-lg:border max-lg:border-crfal-gray-200">
        <div
          className={`absolute inset-y-0 z-10 hidden w-1.5 bg-gradient-to-b from-red-600 via-crfal-blue to-crfal-blue-dark lg:block ${
            flip ? 'right-0' : 'left-0'
          }`}
          aria-hidden
        />
        <div className={`grid flex-1 grid-cols-[80px_minmax(0,1fr)] items-start gap-x-4 gap-y-4 p-4 lg:flex lg:items-stretch lg:gap-0 lg:p-0 ${flip ? 'lg:flex-row-reverse' : ''}`}>
          <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-crfal-blue to-crfal-blue-dark lg:aspect-auto lg:min-h-[240px] lg:w-[210px] lg:rounded-none">
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

          <div className="contents lg:flex lg:min-w-0 lg:flex-1 lg:flex-col lg:p-7">
            <div className="min-w-0 self-center lg:contents">
              <span className="mb-2 inline-flex w-fit items-center rounded-md bg-red-50 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-red-700 lg:mb-3 lg:px-3 lg:py-1.5 lg:tracking-wider lg:text-red-600">
                {membro.cargo}
              </span>
              <h3 className="font-display text-base font-bold uppercase leading-snug text-crfal-blue-dark lg:mb-3 lg:text-2xl lg:leading-tight">
                {membro.nome}
              </h3>
            </div>
            {membro.bio && (
              <>
                <p
                  ref={bioRef}
                  className="col-span-2 line-clamp-3 text-sm leading-relaxed text-crfal-gray-600 lg:line-clamp-4 lg:text-[15px]"
                >
                  {membro.bio}
                </p>
                {isClamped && (
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      aria-label={`Ler mais sobre ${membro.nome}`}
                      className="col-span-2 -my-2 inline-flex min-h-11 w-fit items-center gap-1 rounded-md text-sm font-semibold text-crfal-blue transition-colors duration-300 hover:text-crfal-blue-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2 lg:my-0 lg:mt-3"
                    >
                      Ler mais
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </DialogTrigger>
                )}
              </>
            )}
            {membro.email && (
              <a
                href={`mailto:${membro.email}`}
                className="col-span-2 mt-auto inline-flex min-h-11 min-w-0 items-center gap-2 rounded-lg bg-crfal-blue-lighter/60 px-3 py-2.5 text-sm font-medium text-crfal-blue transition-colors duration-300 hover:bg-crfal-blue-lighter focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2 lg:w-fit lg:rounded-none lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-4 lg:font-normal lg:text-crfal-gray-500 lg:hover:bg-transparent lg:hover:text-crfal-blue"
              >
                <Mail className="h-4 w-4 shrink-0" />
                <span className="min-w-0 break-words">{membro.email}</span>
              </a>
            )}
          </div>
        </div>
      </article>
    </BioModal>
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

      <PageHero
        breadcrumb={[
          { label: 'Início', href: '/' },
          { label: 'Instituição' },
          { label: 'Diretoria' },
        ]}
        eyebrow="Governança"
        title="Diretoria e Conselho"
        description="Conheça os membros da diretoria executiva e os conselheiros que compõem o Conselho Regional de Farmácia do Estado de Alagoas."
        aside={
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <Briefcase className="mb-2 h-7 w-7 text-white" />
              <span className="block font-display text-3xl font-light text-white">
                {secoes[0].membros.length}
              </span>
              <span className="text-xs uppercase tracking-wider text-white/70">Diretores</span>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <Users className="mb-2 h-7 w-7 text-white" />
              <span className="block font-display text-3xl font-light text-white">
                {secoes[1].membros.length + secoes[2].membros.length}
              </span>
              <span className="text-xs uppercase tracking-wider text-white/70">Conselheiros</span>
            </div>
          </div>
        }
      />

      <div className="container-crfal py-6 lg:py-16" ref={sectionRef}>
        <div role="group" aria-label="Seções da Diretoria e Conselho" className={`mb-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:mb-10 lg:gap-2.5 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
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
                aria-pressed={secaoAtiva === secao.id}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors duration-300 lg:rounded-full lg:px-5 lg:text-sm ${
                  isDisabled
                    ? 'cursor-not-allowed bg-crfal-gray-100 text-crfal-gray-600 lg:text-crfal-gray-400 lg:opacity-60'
                    : secaoAtiva === secao.id
                      ? 'col-span-2 bg-crfal-blue text-white shadow-sm'
                      : 'bg-crfal-gray-100 text-crfal-gray-600 hover:bg-neutral-200   '
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {secao.titulo}
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-12">
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
                className={`mt-5 grid grid-cols-2 gap-3 lg:mt-8 lg:gap-4 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                style={{ transitionDelay: '200ms' }}
              >
                <div className="flex items-center gap-2.5 rounded-xl border border-crfal-gray-200 bg-white px-3 py-2.5 lg:block lg:p-4">
                  <span className="font-display text-3xl font-light text-crfal-blue ">{secaoSelecionada.membros.length}</span>
                  <p className="text-xs uppercase tracking-wider text-crfal-gray-600 lg:mt-1 lg:text-crfal-gray-500">Membros</p>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl border border-crfal-gray-200 bg-white px-3 py-2.5 lg:block lg:p-4">
                  <span className="font-display text-3xl font-light text-crfal-blue ">{secoes.reduce((acc, s) => acc + s.membros.length, 0)}</span>
                  <p className="text-xs uppercase tracking-wider text-crfal-gray-600 lg:mt-1 lg:text-crfal-gray-500">Total Geral</p>
                </div>
              </div>
            </div>
          </div>

          <div className={isDiretoria ? 'lg:col-span-12' : 'lg:col-span-8'}>
            <div className={`grid gap-4 lg:gap-6 ${isDiretoria ? 'md:grid-cols-2' : ''}`}>
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
              className={`mt-6 rounded-xl border border-crfal-blue/15 bg-crfal-blue-lighter/60 p-4 lg:mt-8 lg:p-6 transition-all duration-700 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              <div className="flex flex-col items-start gap-3 lg:flex-row lg:gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-crfal-blue text-white  ">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="mb-1 font-bold text-neutral-800 ">
                    Gestão {new Date().getFullYear()}
                  </h4>
                  <p className="text-sm leading-relaxed text-crfal-gray-700 lg:text-crfal-gray-600">
                    A diretoria e os conselheiros do CRFAL são eleitos pelos profissionais farmacêuticos do estado de Alagoas para mandatos conforme previsto no estatuto do Conselho. Saiba mais consultando o{' '}
                    <a href="/instituicao/estatuto" className="inline-flex min-h-11 items-center font-semibold text-crfal-blue transition-colors hover:underline lg:inline">
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
