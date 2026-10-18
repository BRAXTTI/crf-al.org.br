import { useState, useEffect, useRef, type ComponentType, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import PageHero, { PageHeroAction } from '@/components/block/page-hero';
import { TRANSPARENCIA_URL } from '@/config/site';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Info,
  Landmark,
  Mail,
  MessageSquare,
  UserCircle,
  Users,
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
  id: string;
  nome: string;
  cargo: string;
  foto?: string;
  email?: string;
  bio?: string;
}

const diretoria: Membro[] = [
  {
    id: 'presidencia',
    nome: 'João Batista dos Santos Neto',
    cargo: 'Presidente',
    foto: '/images/presidente.webp',
    email: 'presidente@crf-al.org.br',
    bio: 'Com uma trajetória consolidada de dedicação à classe farmacêutica e à valorização do profissional em todas as suas frentes de atuação.',
  },
  {
    id: 'vice-presidencia',
    nome: 'Lyvia Quintela Cavalcante Trajano',
    cargo: 'Vice-Presidente',
    foto: '/images/vice.webp',
    email: 'vicepresidente@crf-al.org.br',
    bio: 'Com especializações nas áreas clínica, de prescrição e estética, possui uma trajetória consolidada de dedicação à classe e forte atuação em prol da valorização da categoria.',
  },
  {
    id: 'secretaria-geral',
    nome: 'Ana Renata de Almeida Lima',
    cargo: 'Secretária-Geral',
    foto: '/images/secretaria-geral.webp',
    email: 'secretaria@crf-al.org.br',
    bio: 'Sou farmacêutica, graduada pela Universidade Federal de Alagoas (UFAL), em 2006, mestre em Ensino na Saúde e Tecnologia pela Universidade Estadual de Ciências da Saúde de Alagoas (UNCISAL) e doutoranda em Ciências da Saúde pela Universidade de Pernambuco (UPE). Possuo pós-graduação em Farmacologia Clínica e em Farmácia Clínica e Hospitalar pela Facinter; Gestão Pública em Saúde pela UFAL; Gestão da Assistência Farmacêutica pela Universidade Federal de Santa Catarina (UFSC); além de MBA em Avaliação de Tecnologias em Saúde (ATS) pelo Hospital Alemão Oswaldo Cruz (HAOC). Atualmente, atuo na Prefeitura Municipal de Arapiraca e no Hospital de Emergência Dr. Daniel Houly, onde exerço a coordenação do Programa de Residência Multiprofissional em Saúde. Também atuo como docente no curso de Farmácia da UNINASSAU. Minha trajetória profissional é construída na interface entre Assistência Farmacêutica, gestão em saúde, avaliação de tecnologias em saúde, formação profissional e educação permanente, com atuação voltada ao fortalecimento do SUS e à qualificação do cuidado em saúde.',
  },
  {
    id: 'tesouraria',
    nome: 'Isadora Lyra Cavalcanti',
    cargo: 'Tesoureira',
    foto: '/images/tesoureira.webp',
    email: 'tesoureira@crf-al.org.br',
    bio: 'Essa experiência confere à sua gestão um olhar atento à transparência e à valorização do profissional em todas as suas frentes de atuação.',
  },
];

/**
 * Plenário (conselheiros efetivos e suplentes). Enquanto a composição oficial
 * não for publicada, as listas ficam vazias e a página mostra o aviso — nunca
 * nomes fictícios.
 */
const conselheiros: { titulo: string; membros: Membro[] }[] = [
  { titulo: 'Conselheiros efetivos', membros: [] },
  { titulo: 'Conselheiros suplentes', membros: [] },
];

const saibaMais: { href: string; title: string; description: string; Icon: ComponentType<{ className?: string }>; external?: boolean }[] = [
  { href: '/instituicao/sobre-conselho', title: 'Sobre o Conselho', description: 'História, missão e atribuições', Icon: BookOpen },
  { href: '/instituicao/plenarias', title: 'Plenárias', description: 'Agenda, pautas e atas', Icon: CalendarDays },
  { href: TRANSPARENCIA_URL, title: 'Portal da Transparência', description: 'Contas, contratos e licitações', Icon: Landmark, external: true },
  { href: '/contato', title: 'Fale Conosco', description: 'Canais e setores de atendimento', Icon: MessageSquare },
];

const goldLabel = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]';
const focusRing = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2';

function SectionHeader({ id, label, title, children }: { id: string; label: string; title: string; children?: ReactNode }) {
  return (
    <div className="max-w-2xl">
      <p className={goldLabel}>{label}</p>
      <h2 id={id} className="mt-2 text-2xl font-bold tracking-tight text-crfal-blue sm:text-3xl">{title}</h2>
      <span aria-hidden className="mt-3 block h-0.5 w-10 rounded-full bg-crfal-gold" />
      {children && <p className="mt-4 text-base leading-relaxed text-crfal-gray-600">{children}</p>}
    </div>
  );
}

function Foto({ membro, className }: { membro: Membro; className: string }) {
  return (
    <div className={`relative shrink-0 overflow-hidden bg-linear-to-br/srgb from-crfal-blue to-crfal-blue-dark ${className}`}>
      {membro.foto ? (
        <img
          src={membro.foto}
          alt={`Foto de ${membro.nome}`}
          width={209}
          height={244}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <UserCircle className="h-12 w-12 text-white/50" aria-hidden />
        </div>
      )}
    </div>
  );
}

function EmailLink({ email, nome }: { email: string; nome: string }) {
  return (
    <a
      href={`mailto:${email}`}
      className={`inline-flex min-h-11 min-w-0 items-center gap-2 rounded-lg text-sm font-medium text-crfal-blue transition-colors hover:text-crfal-blue-dark hover:underline motion-reduce:transition-none ${focusRing}`}
    >
      <Mail className="h-4 w-4 shrink-0 text-[#8A6A12]" aria-hidden />
      <span className="min-w-0 wrap-break-word">{email}</span>
      <span className="sr-only"> (enviar e-mail para {nome})</span>
    </a>
  );
}

function DirectorCard({ membro }: { membro: Membro }) {
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
    <Dialog>
      <article className="grid h-full grid-cols-[6rem_minmax(0,1fr)] grid-rows-[auto_1fr] gap-x-4 rounded-xl border border-crfal-gray-200 bg-white p-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-x-6 sm:p-5">
        <Foto membro={membro} className="aspect-[209/244] w-full self-start rounded-lg sm:row-span-2" />

        <div className="min-w-0">
          <p className={goldLabel}>{membro.cargo}</p>
          <h3 className="mt-1.5 text-lg font-bold leading-snug tracking-tight text-crfal-gray-900 sm:text-xl">{membro.nome}</h3>
          {membro.bio && (
            <p ref={bioRef} className="mt-2 line-clamp-3 text-sm leading-relaxed text-crfal-gray-600">
              {membro.bio}
            </p>
          )}
        </div>

        <div className="col-span-2 mt-3 flex flex-wrap items-center gap-x-5 border-t border-crfal-gray-200 pt-1 sm:col-span-1 sm:col-start-2 sm:mt-0 sm:self-end sm:border-0 sm:pt-2">
          {isClamped && (
            <DialogTrigger asChild>
              <button
                type="button"
                className={`group inline-flex min-h-11 items-center gap-1.5 rounded-lg text-sm font-semibold text-crfal-blue ${focusRing}`}
              >
                Ler minicurrículo
                <ArrowRight className="h-4 w-4 text-[#8A6A12] transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
                <span className="sr-only"> de {membro.nome}</span>
              </button>
            </DialogTrigger>
          )}
          {membro.email && <EmailLink email={membro.email} nome={membro.nome} />}
        </div>
      </article>

      <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-2xl *:data-[slot=dialog-close]:flex *:data-[slot=dialog-close]:h-11 *:data-[slot=dialog-close]:w-11 *:data-[slot=dialog-close]:items-center *:data-[slot=dialog-close]:justify-center">
        <DialogHeader className="shrink-0 flex-row items-center gap-4 border-b border-crfal-gray-200 border-t-2 border-t-crfal-gold p-5 pr-16 text-left sm:p-6 sm:pr-16">
          <Foto membro={membro} className="aspect-[209/244] w-16 rounded-lg" />
          <div className="min-w-0">
            <p className={goldLabel}>{membro.cargo}</p>
            <DialogTitle className="mt-1 text-lg font-bold leading-tight text-crfal-blue sm:text-xl">{membro.nome}</DialogTitle>
            <DialogDescription className="sr-only">Minicurrículo de {membro.nome}</DialogDescription>
          </div>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6">
          <p className="whitespace-pre-line text-sm leading-relaxed text-crfal-gray-700 sm:text-[15px]">{membro.bio}</p>
        </div>
        {membro.email && (
          <div className="shrink-0 border-t border-crfal-gray-200 px-5 py-2 sm:px-6">
            <EmailLink email={membro.email} nome={membro.nome} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function BoardPage() {
  const plenarioPublicado = conselheiros.some((grupo) => grupo.membros.length > 0);

  return (
    <div className="min-h-screen">
      <SEO
        title="Diretoria"
        description="Conheça a diretoria e os membros do Conselho Regional de Farmácia do Estado de Alagoas (CRFAL) — gestão atual e suas responsabilidades."
        path="/instituicao/diretoria"
      />

      <PageHero
        breadcrumb={[
          { label: 'Início', href: '/' },
          { label: 'Instituição', href: '/instituicao' },
          { label: 'Diretoria' },
        ]}
        title="Diretoria e Conselho"
        section="instituicao"
        lead="Quem compõe a Diretoria e o plenário de conselheiros do CRF-AL na gestão atual."
        meta={[
          { value: diretoria.length, label: 'diretores' },
          ...(plenarioPublicado
            ? [{ value: conselheiros.reduce((total, grupo) => total + grupo.membros.length, 0), label: 'conselheiros' }]
            : []),
        ]}
        actions={
          <>
            <PageHeroAction href="/contato#setores-title" icon={Mail}>Contatos da Diretoria</PageHeroAction>
            <PageHeroAction href="/instituicao/plenarias" variant="secondary">Plenárias</PageHeroAction>
          </>
        }
      />

      <div className="container-crfal space-y-3 py-6 sm:py-10">
        {/* ── DIRETORIA EXECUTIVA ──────────────────────────────────────── */}
        <section aria-labelledby="diretoria-title" className="section-panel">
          <SectionHeader id="diretoria-title" label="Gestão atual" title="Diretoria Executiva">
            Responsável pela gestão e administração do Conselho Regional de Farmácia do Estado de Alagoas.
          </SectionHeader>
          <ul className="mt-8 grid gap-3 sm:gap-4 lg:grid-cols-2">
            {diretoria.map((membro) => (
              <li key={membro.id}>
                <DirectorCard membro={membro} />
              </li>
            ))}
          </ul>
        </section>

        {/* ── PLENÁRIO ─────────────────────────────────────────────────── */}
        <section aria-labelledby="plenario-title" className="section-panel">
          <SectionHeader id="plenario-title" label="Plenário" title="Conselheiros">
            Os conselheiros efetivos e suplentes formam o plenário, que delibera e decide sobre os assuntos do Conselho nas reuniões plenárias.
          </SectionHeader>

          {plenarioPublicado ? (
            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              {conselheiros.map((grupo) => (
                <div key={grupo.titulo}>
                  <h3 className={goldLabel}>{grupo.titulo}</h3>
                  <ul className="mt-3 divide-y divide-crfal-gray-200 rounded-xl border border-crfal-gray-200">
                    {grupo.membros.map((membro) => (
                      <li key={membro.id} className="flex items-center gap-3 p-3 sm:p-4">
                        <Foto membro={membro} className="aspect-square w-11 rounded-full" />
                        <span className="min-w-0 font-semibold text-crfal-gray-900">{membro.nome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div role="note" className="mt-8 flex flex-col gap-4 rounded-xl border border-crfal-blue/15 bg-crfal-blue-lighter/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-crfal-blue" aria-hidden />
                <p className="text-sm leading-relaxed text-crfal-blue">
                  <strong className="font-bold">Composição em atualização.</strong> A lista de conselheiros efetivos e suplentes da gestão atual será publicada em breve.
                </p>
              </div>
              <Link
                to="/instituicao/plenarias"
                className={`group inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg text-sm font-semibold text-crfal-blue ${focusRing}`}
              >
                Ver reuniões plenárias
                <ArrowRight className="h-4 w-4 text-[#8A6A12] transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
              </Link>
            </div>
          )}

          <p className="mt-6 flex items-start gap-3 border-t border-crfal-gray-200 pt-6 text-sm leading-relaxed text-crfal-gray-600">
            <Users className="mt-0.5 h-5 w-5 shrink-0 text-[#8A6A12]" aria-hidden />
            A Diretoria e os conselheiros do CRF-AL são eleitos pelos profissionais farmacêuticos do estado de Alagoas, para mandatos conforme as normas do Conselho.
          </p>
        </section>

        {/* ── SAIBA MAIS ───────────────────────────────────────────────── */}
        <section aria-labelledby="saiba-mais-title" className="section-panel">
          <SectionHeader id="saiba-mais-title" label="Continue navegando" title="Conheça mais o CRF-AL" />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {saibaMais.map(({ href, title, description, Icon, external }) => {
              const cls = `group flex h-full items-center gap-4 rounded-xl border border-crfal-gray-200 bg-white p-4 transition-colors hover:border-crfal-blue/40 hover:bg-crfal-blue-lighter/50 motion-reduce:transition-none ${focusRing}`;
              const content = (
                <>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-crfal-blue-lighter ring-1 ring-crfal-gold/40">
                    <Icon className="h-5 w-5 text-crfal-blue" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-crfal-gray-900 sm:text-base">{title}</span>
                    <span className="block text-sm text-crfal-gray-600">{description}</span>
                  </span>
                  {external ? (
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-[#8A6A12] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
                  ) : (
                    <ArrowRight className="h-4 w-4 shrink-0 text-[#8A6A12] transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
                  )}
                </>
              );
              return (
                <li key={href}>
                  {external ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
                      {content}
                      <span className="sr-only"> (abre em nova aba)</span>
                    </a>
                  ) : (
                    <Link to={href} className={cls}>{content}</Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
