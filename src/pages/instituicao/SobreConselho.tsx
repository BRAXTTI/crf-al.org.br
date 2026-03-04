import { useEffect, useRef, useState } from 'react';
import {
  ChevronRight,
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
} from 'lucide-react';

/* ─── DATA ──────────────────────────────────────────────────────────── */

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
      'O Conselho Regional de Farmácia de Alagoas é oficialmente instalado em Maceió, dando início à sua atuação na defesa, fiscalização e valorização do profissional farmacêutico no estado.',
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

const mvv = [
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
  {
    id: 'valores',
    titulo: 'Valores',
    subtitulo: 'Nossos princípios fundamentais',
    Icon: Heart,
    descricao:
      'Paixão pelo farmacêutico. Resolutividade e inovação. Gestão participativa. Ética e transparência. Qualidade de vida dos colaboradores. Relação saudável com a comunidade.',
  },
];

const atribuicoes = [
  {
    Icon: FileCheck,
    num: '01',
    title: 'Registro Profissional',
    description:
      'Inscrição e habilitação de farmacêuticos e técnicos, com emissão de carteira de identidade profissional.',
  },
  {
    Icon: Shield,
    num: '02',
    title: 'Fiscalização',
    description:
      'Fiscalizar o exercício farmacêutico em farmácias, drogarias, laboratórios e distribuidoras de todo o estado.',
  },
  {
    Icon: Scale,
    num: '03',
    title: 'Ética Profissional',
    description:
      'Aplicar o Código de Ética Farmacêutica, processar e julgar infrações éticas dos profissionais inscritos.',
  },
  {
    Icon: Building2,
    num: '04',
    title: 'Autorização de Funcionamento',
    description:
      'Conceder e revogar autorização de funcionamento de estabelecimentos farmacêuticos em Alagoas.',
  },
  {
    Icon: GraduationCap,
    num: '05',
    title: 'Educação Continuada',
    description:
      'Promover cursos, seminários, congressos e eventos de capacitação para toda a classe farmacêutica.',
  },
  {
    Icon: Users,
    num: '06',
    title: 'Representação da Classe',
    description:
      'Representar os farmacêuticos alagoanos perante órgãos públicos, entidades e a sociedade civil.',
  },
  {
    Icon: Award,
    num: '07',
    title: 'Defesa Profissional',
    description:
      'Defender os direitos dos profissionais inscritos e coibir o exercício ilegal da farmácia.',
  },
  {
    Icon: BookOpen,
    num: '08',
    title: 'Orientação e Informação',
    description:
      'Orientar farmacêuticos, empresas e a sociedade sobre normas, regulações e boas práticas.',
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

/* ─── HOOK ──────────────────────────────────────────────────────────── */

function useInView(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
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
  }, []);

  return { ref, inView };
}

/* ─── COMPONENT ─────────────────────────────────────────────────────── */

export default function SobreConselho() {
  const histRef = useInView();
  const mvvRef = useInView();
  const atribRef = useInView();
  const hinoRef = useInView();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-slate-950">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-crfal-blue via-crfal-blue-dark to-[#002a4a] pt-28 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        {/* Giant year watermark */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none select-none"
          aria-hidden
        >
          <span className="absolute -bottom-4 right-0 font-display font-bold text-white/[0.055] text-[22vw] leading-none whitespace-nowrap">
            1960
          </span>
        </div>
        {/* Blur blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-8 left-8 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-16 w-96 h-96 bg-crfal-blue-light/10 rounded-full blur-3xl" />
        </div>

        <div className="container-crfal relative z-10">
          <nav
            className="flex flex-wrap items-center gap-2 text-white/55 text-xs sm:text-sm mb-6"
            aria-label="Breadcrumb"
          >
            <a href="/" className="hover:text-white transition-colors">
              Início
            </a>
            <ChevronRight className="w-4 h-4" />
            <span>Instituição</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Sobre o Conselho</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-[11px] font-bold tracking-[0.18em] uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              Desde 1960
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-5 leading-[1.1]">
              Sobre o<br className="hidden sm:block" /> Conselho
            </h1>
            <p className="text-white/75 text-base sm:text-lg max-w-2xl leading-relaxed">
              Conheça a história, a missão e os valores do Conselho Regional de
              Farmácia do Estado de Alagoas — guardião da profissão farmacêutica
              alagoana há mais de seis décadas.
            </p>
          </div>
        </div>
      </div>

      {/* ── HISTÓRIA ─────────────────────────────────────────────────── */}
      <section className="relative py-16 md:py-24 bg-white dark:bg-slate-900 overflow-hidden">
        {/* Background watermark */}
        <div
          className="absolute inset-0 flex items-center justify-end overflow-hidden pointer-events-none select-none"
          aria-hidden
        >
          <span className="font-display font-bold text-crfal-blue/[0.04] dark:text-white/[0.03] text-[26vw] leading-none pr-4">
            AL
          </span>
        </div>

        <div ref={histRef.ref} className="container-crfal relative z-10">
          {/* Section header */}
          <div
            className={`mb-10 transition-all duration-700 ${
              histRef.inView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6'
            }`}
          >
            <p className="text-amber-600 dark:text-amber-400 text-[11px] font-bold tracking-[0.22em] uppercase mb-3">
              Nossa Trajetória
            </p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-crfal-blue dark:text-crfal-blue-light leading-tight">
              História do CRF-AL
            </h2>
            <div className="mt-4 w-14 h-1 bg-amber-500 rounded-full" />
          </div>

          {/* Intro paragraph */}
          <div
            className={`max-w-3xl mb-14 transition-all duration-700 delay-150 ${
              histRef.inView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6'
            }`}
          >
            <p className="text-neutral-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
              O{' '}
              <strong className="text-crfal-blue dark:text-crfal-blue-light">
                Conselho Regional de Farmácia do Estado de Alagoas — CRF-AL
              </strong>{' '}
              é a autarquia federal responsável pela fiscalização e
              regulamentação do exercício da profissão farmacêutica em Alagoas.
              Ao longo de mais de seis décadas, fortaleceu sua presença como
              defensor intransigente da ética, da qualidade técnica e da
              valorização do farmacêutico alagoano, contribuindo decisivamente
              para a saúde pública do estado.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative pl-10 sm:pl-14 md:pl-20">
            {/* Vertical gradient line */}
            <div className="absolute left-3 sm:left-5 md:left-8 top-3 bottom-3 w-px bg-gradient-to-b from-amber-400 via-crfal-blue/60 to-crfal-blue/10" />

            <div className="space-y-7">
              {milestones.map((m, i) => (
                <div
                  key={m.year}
                  className={`relative transition-all duration-700 ${
                    histRef.inView
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-8'
                  }`}
                  style={{ transitionDelay: `${280 + i * 110}ms` }}
                >
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-[28px] sm:-left-[37px] md:-left-[48px] top-5 w-4 h-4 rounded-full border-2 z-10 transition-transform duration-300 ${
                      m.highlight
                        ? 'bg-amber-400 border-amber-500 shadow-[0_0_14px_rgba(245,158,11,0.55)]'
                        : 'bg-crfal-blue dark:bg-crfal-blue-light border-white dark:border-slate-900'
                    }`}
                  />

                  {/* Card */}
                  <div
                    className={`bg-white dark:bg-slate-800 border rounded-2xl p-5 sm:p-6 hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-300 ${
                      m.highlight
                        ? 'border-amber-200 dark:border-amber-700/40'
                        : 'border-neutral-200 dark:border-slate-700/70'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-3 mb-2.5">
                      <span
                        className={`font-display text-2xl sm:text-3xl font-bold leading-none ${
                          m.highlight
                            ? 'text-amber-500 dark:text-amber-400'
                            : 'text-crfal-blue dark:text-crfal-blue-light'
                        }`}
                      >
                        {m.year}
                      </span>
                      {m.highlight && (
                        <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-600/60 rounded-full px-2.5 py-0.5">
                          Fundação
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-neutral-800 dark:text-slate-100 text-base sm:text-lg mb-2">
                      {m.title}
                    </h3>
                    <p className="text-neutral-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
                      {m.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MISSÃO, VISÃO E VALORES ──────────────────────────────────── */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-crfal-blue via-crfal-blue-dark to-[#002a4a] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 right-0 w-80 h-80 bg-crfal-blue-light/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div ref={mvvRef.ref} className="container-crfal relative z-10">
          <div
            className={`mb-12 transition-all duration-700 ${
              mvvRef.inView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6'
            }`}
          >
            <p className="text-amber-400 text-[11px] font-bold tracking-[0.22em] uppercase mb-3">
              Propósito e Direção
            </p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              Missão, Visão e Valores
            </h2>
            <div className="mt-4 w-14 h-1 bg-amber-400 rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-5 lg:gap-7">
            {mvv.map((item, i) => {
              const Icon = item.Icon;
              return (
                <div
                  key={item.id}
                  className={`group relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 sm:p-7 hover:bg-white/[0.15] hover:-translate-y-1 transition-all duration-500 ${
                    mvvRef.inView
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${200 + i * 140}ms` }}
                >
                  {/* Amber accent line on top */}
                  <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

                  <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="font-display text-2xl font-bold text-white mb-1">
                    {item.titulo}
                  </h3>
                  <p className="text-white/45 text-[11px] font-bold uppercase tracking-widest mb-4">
                    {item.subtitulo}
                  </p>
                  <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                    {item.descricao}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ATRIBUIÇÕES ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-neutral-50 dark:bg-slate-950">
        <div ref={atribRef.ref} className="container-crfal">
          <div
            className={`mb-12 transition-all duration-700 ${
              atribRef.inView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6'
            }`}
          >
            <p className="text-amber-600 dark:text-amber-400 text-[11px] font-bold tracking-[0.22em] uppercase mb-3">
              Competências Legais
            </p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-crfal-blue dark:text-crfal-blue-light leading-tight">
              Atribuições do CRF-AL
            </h2>
            <div className="mt-4 w-14 h-1 bg-amber-500 rounded-full" />
            <p className="mt-5 max-w-2xl text-neutral-600 dark:text-slate-400 text-base leading-relaxed">
              Com base na Lei Federal nº 3.820/1960 e legislações
              complementares, o CRF-AL exerce as seguintes competências em prol
              da sociedade e da classe farmacêutica alagoana.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {atribuicoes.map((item, i) => {
              const Icon = item.Icon;
              return (
                <div
                  key={item.num}
                  className={`group bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-700/70 rounded-2xl p-5 sm:p-6 hover:border-crfal-blue/30 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-500 ${
                    atribRef.inView
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${120 + i * 65}ms` }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-crfal-blue/10 dark:bg-crfal-blue/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-crfal-blue group-hover:scale-110 transition-all duration-300">
                      <Icon className="w-5 h-5 text-crfal-blue dark:text-crfal-blue-light group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="font-display text-3xl font-bold text-neutral-100 dark:text-slate-800 leading-none select-none">
                      {item.num}
                    </span>
                  </div>
                  <h3 className="font-semibold text-neutral-800 dark:text-slate-100 text-sm sm:text-base mb-2">
                    {item.title}
                  </h3>
                  <p className="text-neutral-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HINO FARMACÊUTICO ────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-900 overflow-hidden">
        <div ref={hinoRef.ref} className="container-crfal">
          <div
            className={`text-center mb-12 transition-all duration-700 ${
              hinoRef.inView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6'
            }`}
          >
            <p className="text-amber-600 dark:text-amber-400 text-[11px] font-bold tracking-[0.22em] uppercase mb-3">
              Tradição e Orgulho
            </p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-crfal-blue dark:text-crfal-blue-light leading-tight">
              Hino Farmacêutico
            </h2>
            <div className="mt-4 mx-auto w-14 h-1 bg-amber-500 rounded-full" />
            <p className="mt-5 max-w-xl mx-auto text-neutral-600 dark:text-slate-400 text-base leading-relaxed">
              Entoado nas solenidades da classe farmacêutica brasileira, o Hino
              Farmacêutico celebra a missão, os valores e o orgulho de uma
              profissão dedicada à vida.
            </p>
          </div>

          <div
            className={`max-w-2xl mx-auto transition-all duration-700 delay-300 ${
              hinoRef.inView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="relative bg-gradient-to-br from-amber-50 via-orange-50/60 to-amber-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800/60 border border-amber-200/70 dark:border-amber-700/25 rounded-3xl p-8 sm:p-10 overflow-hidden shadow-xl">
              {/* Music staff lines (decorative) */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.045] dark:opacity-[0.06]"
                aria-hidden
              >
                {[18, 26, 34, 42, 50, 58, 66, 74, 82].map((top) => (
                  <div
                    key={top}
                    className="absolute left-0 right-0 h-px bg-amber-900 dark:bg-amber-300"
                    style={{ top: `${top}%` }}
                  />
                ))}
              </div>

              {/* Large decorative note */}
              <div
                className="absolute -bottom-6 -right-6 opacity-[0.07] pointer-events-none"
                aria-hidden
              >
                <Music className="w-40 h-40 text-amber-800 dark:text-amber-300" />
              </div>

              {/* Card header */}
              <div className="flex items-center gap-4 mb-8 relative">
                <div className="w-12 h-12 bg-amber-500/20 dark:bg-amber-400/15 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Music className="w-6 h-6 text-amber-700 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-amber-900 dark:text-amber-300">
                    Hino Farmacêutico
                  </h3>
                  <p className="text-amber-700/55 dark:text-amber-400/50 text-xs sm:text-sm">
                    Tradição da Classe Farmacêutica Brasileira
                  </p>
                </div>
              </div>

              {/* Verses */}
              <div className="space-y-6 relative">
                {hinoEstrofes.map((estrofe, i) => (
                  <div
                    key={i}
                    className={`transition-all duration-500 ${
                      hinoRef.inView
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    } ${
                      estrofe.tipo === 'refrao'
                        ? 'pl-5 border-l-2 border-amber-400 dark:border-amber-500'
                        : ''
                    }`}
                    style={{ transitionDelay: `${400 + i * 90}ms` }}
                  >
                    {estrofe.tipo === 'refrao' && (
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 mb-2">
                        Refrão
                      </p>
                    )}
                    {estrofe.linhas.map((linha, j) => (
                      <p
                        key={j}
                        className={`leading-relaxed ${
                          estrofe.tipo === 'refrao'
                            ? 'text-amber-900 dark:text-amber-200 font-semibold text-sm sm:text-base italic'
                            : 'text-neutral-700 dark:text-slate-300 text-sm sm:text-base'
                        }`}
                      >
                        {linha}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
