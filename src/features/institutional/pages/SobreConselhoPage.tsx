import { useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import PageHero, { PageHeroAction } from '@/components/block/page-hero';
import { TRANSPARENCIA_URL } from '@/config/site';
import {
  Target,
  Eye,
  Heart,
  Shield,
  BookOpen,
  GraduationCap,
  Users,
  Scale,
  Award,
  Building2,
  FileCheck,
  Music,
  ArrowRight,
  ArrowUpRight,
  Check,
  Landmark,
  CalendarDays,
  MessageSquare,
} from 'lucide-react';

/* ─── DATA ──────────────────────────────────────────────────────────── */

const FUNDACAO = 1960;

const milestones = [
  {
    year: '1960',
    title: 'A Lei Fundadora',
    description:
      'A Lei Federal nº 3.820, de 11 de novembro de 1960, criou o Conselho Federal de Farmácia e os Conselhos Regionais em todo o Brasil — incluindo o CRF-AL — marcando o nascimento da regulamentação do exercício profissional farmacêutico no país.',
    highlight: true,
  },
  {
    year: '1961',
    title: 'Instalação Oficial em Maceió',
    description:
      'O Conselho Regional de Farmácia do Estado de Alagoas é oficialmente instalado em Maceió, dando início à sua atuação na defesa, fiscalização e valorização do profissional farmacêutico no estado.',
    highlight: false,
  },
  {
    year: '1973',
    title: 'Lei das Farmácias e Drogarias',
    description:
      'A Lei nº 5.991/1973 amplia as competências do CRF-AL, reforçando a exigência do responsável técnico farmacêutico nas farmácias e drogarias e consolidando o papel central do profissional na saúde pública alagoana.',
    highlight: false,
  },
  {
    year: '2014',
    title: 'Nova Lei da Farmácia',
    description:
      'A Lei nº 13.021/2014 reconhece a farmácia como estabelecimento de saúde e o farmacêutico como profissional de saúde em tempo integral, elevando a profissão a um novo patamar de relevância social.',
    highlight: false,
  },
  {
    year: 'Hoje',
    title: 'Era Digital e Inovação',
    description:
      'O CRF-AL investe continuamente em modernização e tecnologia, oferecendo serviços digitais, atendimento online e programas de capacitação para farmacêuticos alagoanos — aproximando o Conselho de toda a classe.',
    highlight: false,
  },
];

const missaoVisao = [
  {
    id: 'missao',
    titulo: 'Missão',
    subtitulo: 'Nossa razão de existir',
    Icon: Target,
    descricao:
      'Promover a segurança no exercício profissional farmacêutico em toda a sua abrangência, de forma técnica, responsável, ética e legal, garantindo o farmacêutico como agente transformador do acesso aos medicamentos, insumos e serviços de saúde no estado de Alagoas.',
  },
  {
    id: 'visao',
    titulo: 'Visão',
    subtitulo: 'Onde queremos chegar',
    Icon: Eye,
    descricao:
      'Ser uma instituição facilitadora na regularização de serviços administrativos para farmacêuticos, técnicos e empresas, através de processos modernos e com excelência, buscando orientar, capacitar e valorizar a prestação de serviços farmacêuticos no estado de Alagoas.',
  },
];

const valores = [
  'Paixão pelo farmacêutico',
  'Resolutividade e inovação',
  'Gestão participativa',
  'Ética e transparência',
  'Qualidade de vida dos colaboradores',
  'Relação saudável com a comunidade',
];

/** Cada atribuição leva à página do site onde o serviço acontece. */
const atribuicoes = [
  {
    Icon: FileCheck,
    title: 'Registro Profissional',
    description:
      'Inscrição e habilitação de farmacêuticos e técnicos, com emissão de carteira de identidade profissional.',
    href: '/servicos/requerimentos?perfil=pessoa-fisica',
    cta: 'Requerimentos para farmacêuticos',
  },
  {
    Icon: Shield,
    title: 'Fiscalização',
    description:
      'Fiscalizar o exercício farmacêutico em farmácias, drogarias, laboratórios e distribuidoras de todo o estado.',
    href: '/fiscalizacao',
    cta: 'Conheça a Fiscalização',
  },
  {
    Icon: Scale,
    title: 'Ética Profissional',
    description:
      'Aplicar o Código de Ética Farmacêutica, processar e julgar infrações éticas dos profissionais inscritos.',
    href: '/legislacao',
    cta: 'Consultar a legislação',
  },
  {
    Icon: Building2,
    title: 'Autorização de Funcionamento',
    description:
      'Conceder e revogar autorização de funcionamento de estabelecimentos farmacêuticos em Alagoas.',
    href: '/servicos/requerimentos?perfil=pessoa-juridica',
    cta: 'Requerimentos para empresas',
  },
  {
    Icon: GraduationCap,
    title: 'Educação Continuada',
    description:
      'Promover cursos, seminários, congressos e eventos de capacitação para toda a classe farmacêutica.',
    href: '/eventos',
    cta: 'Ver eventos',
  },
  {
    Icon: Users,
    title: 'Representação da Classe',
    description:
      'Representar os farmacêuticos alagoanos perante órgãos públicos, entidades e a sociedade civil.',
    href: '/instituicao/diretoria',
    cta: 'Conheça a Diretoria',
  },
  {
    Icon: Award,
    title: 'Defesa Profissional',
    description:
      'Defender os direitos dos profissionais inscritos e coibir o exercício ilegal da farmácia.',
    href: '/servicos/ouvidoria',
    cta: 'Fazer uma denúncia',
  },
  {
    Icon: BookOpen,
    title: 'Orientação e Informação',
    description:
      'Orientar farmacêuticos, empresas e a sociedade sobre normas, regulações e boas práticas.',
    href: '/servicos/tutoriais',
    cta: 'Ver tutoriais',
  },
];

const hinoEstrofes = [
  {
    tipo: 'estrofe' as const,
    linhas: [
      'Salve, Farmácia, ciência fecunda,',
      'Que à humanidade dás saúde e paz!',
      'Tua glória o universo inunda,',
      'E teu nome imortal sempre será.',
    ],
  },
  {
    tipo: 'refrao' as const,
    linhas: [
      'Avante! Avante! Farmacêuticos,',
      'Com ciência, amor e dedicação!',
      'Avante! Avante! Farmacêuticos,',
      'A serviço de toda a nação!',
    ],
  },
  {
    tipo: 'estrofe' as const,
    linhas: [
      'Do Brasil inteiro, sentinelas,',
      'Guardamos a saúde com fervor,',
      'Nas farmácias, clínicas e belas',
      'Missões de vida, ciência e amor.',
    ],
  },
  {
    tipo: 'refrao' as const,
    linhas: [
      'Avante! Avante! Farmacêuticos,',
      'Com ciência, amor e dedicação!',
      'Avante! Avante! Farmacêuticos,',
      'A serviço de toda a nação!',
    ],
  },
  {
    tipo: 'estrofe' as const,
    linhas: [
      'Éticos na nossa conduta,',
      'Firmes no cumprimento do dever,',
      'Na profissão que se exalta',
      'Com o orgulho em nos ter.',
    ],
  },
  {
    tipo: 'refrao' as const,
    linhas: [
      'Avante! Avante! Farmacêuticos,',
      'Com ciência, amor e dedicação!',
      'Avante! Avante! Farmacêuticos,',
      'A serviço de toda a nação!',
    ],
  },
];

const sumario = [
  { id: 'historia', label: 'História' },
  { id: 'missao-visao-valores', label: 'Missão, Visão e Valores' },
  { id: 'atribuicoes', label: 'Atribuições' },
  { id: 'hino', label: 'Hino Farmacêutico' },
];

const saibaMais: { href: string; title: string; description: string; Icon: ComponentType<{ className?: string }>; external?: boolean }[] = [
  { href: '/instituicao/diretoria', title: 'Diretoria e Conselho', description: 'Quem compõe a gestão atual', Icon: Users },
  { href: '/instituicao/plenarias', title: 'Plenárias', description: 'Agenda, pautas e atas', Icon: CalendarDays },
  { href: TRANSPARENCIA_URL, title: 'Portal da Transparência', description: 'Contas, contratos e licitações', Icon: Landmark, external: true },
  { href: '/contato', title: 'Fale Conosco', description: 'Canais e setores de atendimento', Icon: MessageSquare },
];

/* ─── HELPERS ───────────────────────────────────────────────────────── */

const goldLabel = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]';
const focusRing = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2';
const anchorOffset = 'scroll-mt-[calc(var(--header-offset)+24px)]';

/**
 * Revela a seção ao entrar na tela. Com movimento reduzido (ou sem
 * IntersectionObserver), o conteúdo já começa visível.
 */
function useInView(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(
    () =>
      typeof window === 'undefined' ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (inView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [inView, threshold]);

  return { ref, inView };
}

const reveal = (inView: boolean) =>
  `transition-all duration-700 motion-reduce:transition-none ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`;

function SectionHeader({
  id,
  label,
  title,
  children,
  inverted = false,
  center = false,
}: {
  id: string;
  label: string;
  title: string;
  children?: ReactNode;
  inverted?: boolean;
  center?: boolean;
}) {
  return (
    <div className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      <p className={inverted ? 'text-[11px] font-semibold uppercase tracking-[0.14em] text-crfal-gold' : goldLabel}>{label}</p>
      <h2 id={id} className={`mt-2 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl ${inverted ? 'text-white' : 'text-crfal-blue'}`}>
        {title}
      </h2>
      <span aria-hidden className={`mt-3 block h-0.5 w-10 rounded-full bg-crfal-gold ${center ? 'mx-auto' : ''}`} />
      {children && (
        <p className={`mt-4 text-base leading-relaxed ${inverted ? 'text-white/80' : 'text-crfal-gray-600'}`}>{children}</p>
      )}
    </div>
  );
}

/* ─── COMPONENT ─────────────────────────────────────────────────────── */

export default function SobreConselhoPage() {
  const { ref: histRef, inView: histInView } = useInView();
  const { ref: mvvRef, inView: mvvInView } = useInView();
  const { ref: atribRef, inView: atribInView } = useInView();
  const { ref: hinoRef, inView: hinoInView } = useInView();
  const anos = new Date().getFullYear() - FUNDACAO;

  return (
    <div className="min-h-screen">
      <SEO
        title="Sobre o Conselho"
        description="Conheça a história e a trajetória do CRFAL — Conselho Regional de Farmácia do Estado de Alagoas, suas atribuições e papel na saúde pública alagoana."
        path="/instituicao/sobre-conselho"
      />

      <PageHero
        id="sobre-conselho"
        breadcrumb={[
          { label: 'Início', href: '/' },
          { label: 'Instituição', href: '/instituicao' },
          { label: 'Sobre o Conselho' },
        ]}
        title="Sobre o Conselho"
        section="instituicao"
        lead="A história, a missão e as atribuições do CRF-AL na defesa da profissão farmacêutica e da saúde pública em Alagoas."
        meta={[
          { value: anos, label: 'anos de história' },
          { value: atribuicoes.length, label: 'atribuições legais' },
          { value: 'Lei 3.820/1960', label: 'base legal' },
        ]}
        actions={
          <>
            <PageHeroAction href="/instituicao/diretoria" icon={Users}>Conheça a Diretoria</PageHeroAction>
            <PageHeroAction href="#atribuicoes" variant="secondary">O que o CRF-AL faz</PageHeroAction>
          </>
        }
      />

      <div className="container-crfal space-y-3 py-6 sm:py-10">
        {/* ── SUMÁRIO ──────────────────────────────────────────────────── */}
        <nav aria-label="Nesta página" className="flex flex-wrap items-center gap-2 pb-3 sm:pb-5">
          <span className={`${goldLabel} mr-1 w-full sm:w-auto`}>Nesta página</span>
          {sumario.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`inline-flex min-h-10 items-center rounded-full border border-crfal-gray-200 bg-white px-4 text-sm font-medium text-crfal-blue transition-colors hover:border-crfal-blue hover:bg-crfal-blue-lighter motion-reduce:transition-none ${focusRing}`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* ── HISTÓRIA ─────────────────────────────────────────────────── */}
        <section id="historia" aria-labelledby="historia-title" className={`section-panel ${anchorOffset}`}>
          <div ref={histRef} className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div className={`${reveal(histInView)} lg:sticky lg:top-[calc(var(--header-offset)+32px)] lg:self-start`}>
              <SectionHeader id="historia-title" label="Nossa trajetória" title="História do CRF-AL" />
              <p className="mt-5 text-base leading-relaxed text-crfal-gray-700 sm:text-lg">
                O <strong className="font-semibold text-crfal-blue">Conselho Regional de Farmácia do Estado de Alagoas — CRF-AL</strong> é a autarquia federal responsável pela fiscalização e regulamentação do exercício da profissão farmacêutica em Alagoas.
              </p>
              <p className="mt-4 text-base leading-relaxed text-crfal-gray-600">
                Ao longo de mais de seis décadas, fortaleceu sua presença como defensor da ética, da qualidade técnica e da valorização do farmacêutico alagoano, contribuindo para a saúde pública do estado.
              </p>
            </div>

            <ol className="relative space-y-4 pl-8 sm:pl-10">
              <span aria-hidden className="absolute left-[7px] top-3 bottom-3 w-px bg-linear-to-b/srgb from-crfal-gold via-crfal-blue/40 to-crfal-blue/10 sm:left-[11px]" />
              {milestones.map((m, i) => (
                <li
                  key={m.year}
                  className={`relative transition-all duration-700 motion-reduce:transition-none ${histInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}
                  style={{ transitionDelay: `${150 + i * 90}ms` }}
                >
                  <span
                    aria-hidden
                    className={`absolute -left-8 top-6 h-4 w-4 rounded-full border-2 sm:-left-10 sm:top-6 sm:ml-1 ${
                      m.highlight ? 'border-white bg-crfal-gold ring-4 ring-crfal-gold/25' : 'border-white bg-crfal-blue ring-1 ring-crfal-blue/20'
                    }`}
                  />
                  <article className={`rounded-xl border p-5 sm:p-6 ${m.highlight ? 'border-crfal-gold/40 bg-[#FBF7EC]' : 'border-crfal-gray-200 bg-white'}`}>
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <span className={`text-2xl font-bold leading-none tracking-tight sm:text-3xl ${m.highlight ? 'text-[#8A6A12]' : 'text-crfal-blue'}`}>
                        {m.year}
                      </span>
                      {m.highlight && (
                        <span className="rounded-full bg-crfal-gold/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8A6A12] ring-1 ring-crfal-gold/40">
                          Fundação
                        </span>
                      )}
                    </div>
                    <h3 className="mb-1.5 text-base font-semibold text-crfal-gray-900 sm:text-lg">{m.title}</h3>
                    <p className="text-sm leading-relaxed text-crfal-gray-600 sm:text-base">{m.description}</p>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── MISSÃO, VISÃO E VALORES ──────────────────────────────────── */}
        <section
          id="missao-visao-valores"
          aria-labelledby="mvv-title"
          className={`relative isolate overflow-hidden rounded-2xl border-t-2 border-crfal-gold bg-linear-to-br/srgb from-crfal-blue to-crfal-blue-dark px-4 py-9 text-white sm:rounded-3xl sm:px-6 sm:py-12 md:px-8 lg:px-12 lg:py-14 ${anchorOffset}`}
        >
          <Target className="pointer-events-none absolute -right-10 -top-10 -z-10 h-64 w-64 text-white opacity-[0.05]" aria-hidden />
          <div ref={mvvRef}>
            <div className={reveal(mvvInView)}>
              <SectionHeader id="mvv-title" label="Propósito e direção" title="Missão, Visão e Valores" inverted />
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {missaoVisao.map((item, i) => {
                const Icon = item.Icon;
                return (
                  <article
                    key={item.id}
                    className={`rounded-xl border border-white/15 bg-white/[0.07] p-5 transition-all duration-700 motion-reduce:transition-none sm:p-7 ${mvvInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${150 + i * 120}ms` }}
                  >
                    <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 ring-1 ring-crfal-gold/60">
                      <Icon className="h-5 w-5 text-white" aria-hidden />
                    </span>
                    <h3 className="text-xl font-bold sm:text-2xl">{item.titulo}</h3>
                    <p className="mb-4 mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">{item.subtitulo}</p>
                    <p className="text-sm leading-relaxed text-white/85 sm:text-base">{item.descricao}</p>
                  </article>
                );
              })}

              <article
                className={`rounded-xl border border-white/15 bg-white/[0.07] p-5 transition-all duration-700 motion-reduce:transition-none sm:p-7 md:col-span-2 lg:col-span-1 ${mvvInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: '390ms' }}
              >
                <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 ring-1 ring-crfal-gold/60">
                  <Heart className="h-5 w-5 text-white" aria-hidden />
                </span>
                <h3 className="text-xl font-bold sm:text-2xl">Valores</h3>
                <p className="mb-4 mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">Nossos princípios fundamentais</p>
                <ul className="grid gap-2.5 md:grid-cols-2 lg:grid-cols-1">
                  {valores.map((valor) => (
                    <li key={valor} className="flex items-start gap-2.5 text-sm leading-snug text-white/85 sm:text-base">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-crfal-gold" aria-hidden />
                      {valor}
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        {/* ── ATRIBUIÇÕES ──────────────────────────────────────────────── */}
        <section id="atribuicoes" aria-labelledby="atribuicoes-title" className={`section-panel ${anchorOffset}`}>
          <div ref={atribRef}>
            <div className={reveal(atribInView)}>
              <SectionHeader id="atribuicoes-title" label="Competências legais" title="Atribuições do CRF-AL">
                Com base na Lei Federal nº 3.820/1960 e legislações complementares, o CRF-AL exerce as seguintes competências em prol da sociedade e da classe farmacêutica alagoana.
              </SectionHeader>
            </div>

            <ul className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
              {atribuicoes.map((item, i) => {
                const Icon = item.Icon;
                return (
                  <li
                    key={item.title}
                    className={`transition-all duration-700 motion-reduce:transition-none ${atribInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                    style={{ transitionDelay: `${100 + i * 50}ms` }}
                  >
                    <Link
                      to={item.href}
                      className={`group flex h-full flex-col rounded-xl border border-crfal-gray-200 bg-white p-5 transition-[border-color,box-shadow] duration-300 hover:border-crfal-blue/40 hover:shadow-card motion-reduce:transition-none sm:p-6 ${focusRing}`}
                    >
                      <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-crfal-blue-lighter ring-1 ring-crfal-gold/40 transition-colors group-hover:bg-crfal-blue motion-reduce:transition-none">
                        <Icon className="h-5 w-5 text-crfal-blue transition-colors group-hover:text-white motion-reduce:transition-none" aria-hidden />
                      </span>
                      <h3 className="mb-1.5 text-base font-semibold text-crfal-gray-900">{item.title}</h3>
                      <p className="text-sm leading-relaxed text-crfal-gray-600">{item.description}</p>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-crfal-blue">
                        {item.cta}
                        <ArrowRight className="h-4 w-4 text-[#8A6A12] transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ── HINO FARMACÊUTICO ────────────────────────────────────────── */}
        <section id="hino" aria-labelledby="hino-title" className={`section-panel ${anchorOffset}`}>
          <div ref={hinoRef}>
            <div className={reveal(hinoInView)}>
              <SectionHeader id="hino-title" label="Tradição e orgulho" title="Hino Farmacêutico" center>
                Entoado nas solenidades da classe farmacêutica brasileira, o Hino Farmacêutico celebra a missão, os valores e o orgulho de uma profissão dedicada à vida.
              </SectionHeader>
            </div>

            <figure className={`relative mx-auto mt-10 max-w-2xl overflow-hidden rounded-xl border border-crfal-gold/40 bg-[#FBF7EC] p-6 sm:p-10 ${reveal(hinoInView)} delay-200`}>
              <Music className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40 text-[#8A6A12] opacity-[0.07]" aria-hidden />
              <figcaption className="relative mb-6 flex items-center gap-3 sm:mb-8">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-crfal-gold/15 ring-1 ring-crfal-gold/50">
                  <Music className="h-5 w-5 text-[#8A6A12]" aria-hidden />
                </span>
                <span className={goldLabel}>Letra · Tradição da classe farmacêutica brasileira</span>
              </figcaption>

              <div className="relative space-y-6">
                {hinoEstrofes.map((estrofe, i) => (
                  <div key={i} className={estrofe.tipo === 'refrao' ? 'border-l-2 border-crfal-gold pl-5' : ''}>
                    {estrofe.tipo === 'refrao' && <p className={`${goldLabel} mb-2`}>Refrão</p>}
                    <p className={`whitespace-pre-line leading-relaxed ${estrofe.tipo === 'refrao' ? 'text-sm font-semibold italic text-crfal-gray-900 sm:text-base' : 'text-sm text-crfal-gray-700 sm:text-base'}`}>
                      {estrofe.linhas.join('\n')}
                    </p>
                  </div>
                ))}
              </div>
            </figure>
          </div>
        </section>

        {/* ── SAIBA MAIS ───────────────────────────────────────────────── */}
        <section aria-labelledby="saiba-mais-title" className="section-panel">
          <SectionHeader id="saiba-mais-title" label="Continue navegando" title="Conheça mais o CRF-AL" />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
