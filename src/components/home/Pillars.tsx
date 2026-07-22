import { ArrowUpRight } from 'lucide-react';
import Reveal from './Reveal';

interface Pillar {
  index: string;
  title: string;
  description: string;
  href: string;
  external?: boolean;
}

const pillars: Pillar[] = [
  {
    index: '01',
    title: 'Fiscalização',
    description:
      'Inspeções, processos administrativos e instrumentos normativos que garantem o exercício seguro da profissão em todo o estado.',
    href: '/fiscalizacao',
  },
  {
    index: '02',
    title: 'Registro e Cadastro',
    description:
      'Inscrição de farmacêuticos e estabelecimentos, certidões e requerimentos — integralmente disponíveis em meio digital.',
    href: '/servicos/requerimentos',
  },
  {
    index: '03',
    title: 'Educação Farmacêutica',
    description:
      'Capacitação continuada, cursos e tutoriais que elevam o padrão técnico e ético da farmácia alagoana.',
    href: '/servicos/tutoriais',
  },
  {
    index: '04',
    title: 'Transparência',
    description:
      'Prestação de contas, publicações oficiais e acesso público às informações do Conselho.',
    href: 'https://crf-al.implanta.net.br/portalTransparencia/#publico/inicio',
    external: true,
  },
];

export default function Pillars() {
  return (
    <section className="relative bg-neutral-50 py-16 dark:bg-slate-950 sm:py-20 md:py-28">
      <div className="container-crfal">
        <Reveal>
          <div className="mb-12 flex flex-col gap-6 sm:mb-16 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <span className="mb-4 inline-block rounded-full bg-crfal-blue-lighter px-4 py-1.5 text-sm font-semibold text-crfal-blue dark:bg-crfal-blue/10 dark:text-crfal-blue-light">
                Atuação Institucional
              </span>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-white sm:text-3xl md:text-4xl">
                Os quatro pilares do{' '}
                <em className="font-display font-light italic text-crfal-blue dark:text-crfal-blue-light">
                  Conselho
                </em>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-base">
              Tudo o que o CRFAL faz se organiza em quatro frentes permanentes de
              trabalho. Explore cada uma delas.
            </p>
          </div>
        </Reveal>

        <div className="pillars-list border-t border-neutral-200 dark:border-slate-800">
          {pillars.map((pillar, i) => (
            <Reveal key={pillar.index} delay={i * 80}>
              <a
                href={pillar.href}
                {...(pillar.external
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
                className="pillar-row group flex items-center gap-5 border-b border-neutral-200 py-7 dark:border-slate-800 sm:gap-10 sm:py-9"
              >
                <span className="font-display w-10 shrink-0 text-sm italic text-neutral-400 dark:text-neutral-500 sm:w-14 sm:text-base">
                  {pillar.index}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="pillar-title block text-xl font-bold tracking-tight text-neutral-800 transition-colors duration-300 group-hover:text-crfal-blue dark:text-white dark:group-hover:text-crfal-blue-light sm:text-3xl">
                    {pillar.title}
                  </span>
                  <span className="mt-1.5 hidden max-w-2xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 sm:block">
                    {pillar.description}
                  </span>
                </span>
                <span
                  className="pillar-arrow flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 group-hover:border-crfal-blue group-hover:bg-crfal-blue group-hover:text-white dark:border-slate-700 dark:text-neutral-400 dark:group-hover:border-crfal-blue-light dark:group-hover:bg-crfal-blue-light dark:group-hover:text-slate-950 sm:h-12 sm:w-12"
                  aria-hidden
                >
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
