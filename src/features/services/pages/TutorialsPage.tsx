import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  ChevronRight,
  Layers,
  ListChecks,
  PillBottle,
  Play,
  Search,
  X,
} from 'lucide-react';
import SEO from '@/components/SEO';
import PageHero, { PageHeroAction } from '@/components/block/page-hero';
import { CRF_EM_CASA_URL } from '@/config/site';
import { tutoriais, type Tutorial, type TutorialPerfil } from '@/data/servicos';
import TopDestaques from '@/features/services/components/TopDestaques';
import { getYouTubeEmbedUrl } from '@/lib/youtube';
import TutorialDetail from '../components/TutorialDetail';
import { PERFIS } from '../tutorial-profiles';
import { useIsDesktop } from '../use-is-desktop';

const goldLabel = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]';
const focusRing = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2';
const motion = 'transition duration-200 motion-reduce:transition-none';

type Filtro = 'todos' | TutorialPerfil;

const FILTROS: { id: Filtro; label: string; icon?: typeof PillBottle }[] = [
  { id: 'todos', label: 'Todos', icon: Layers },
  { id: 'pessoa-fisica', ...PERFIS['pessoa-fisica'] },
  { id: 'pessoa-juridica', ...PERFIS['pessoa-juridica'] },
];

const temVideo = (t: Tutorial) => Boolean(t.motion || getYouTubeEmbedUrl(t.videoUrl));
const doPerfil = (t: Tutorial, filtro: Filtro) => filtro === 'todos' || t.perfil === filtro || t.perfil === 'ambos';

const TOTAL_VIDEOS = tutoriais.filter(temVideo).length;

function normalizar(texto: string) {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export default function TutorialsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isDesktop = useIsDesktop();

  const [filtro, setFiltro] = useState<Filtro>(() => {
    const perfil = searchParams.get('perfil');
    return perfil === 'pessoa-fisica' || perfil === 'pessoa-juridica' ? perfil : 'todos';
  });
  const [busca, setBusca] = useState('');
  const selecionadoId = searchParams.get('tutorial');

  const termo = normalizar(busca.trim());
  const visiveis = useMemo(
    () =>
      tutoriais.filter(
        (t) =>
          doPerfil(t, filtro) &&
          (termo === '' || normalizar(`${t.title} ${t.description} ${t.category} ${t.steps.join(' ')}`).includes(termo))
      ),
    [filtro, termo]
  );

  const grupos = useMemo(() => {
    const mapa = new Map<string, Tutorial[]>();
    for (const t of visiveis) mapa.set(t.category, [...(mapa.get(t.category) ?? []), t]);
    return Array.from(mapa, ([categoria, itens]) => ({ categoria, itens }));
  }, [visiveis]);

  const contagem = (id: Filtro) => (id === 'todos' ? tutoriais.length : tutoriais.filter((t) => doPerfil(t, id)).length);

  // No desktop o painel ao lado sempre mostra um tutorial; no celular, só o que foi aberto.
  const selecionado =
    visiveis.find((t) => t.id === selecionadoId) ?? (isDesktop ? visiveis[0] ?? null : null);

  const selecionar = useCallback(
    (id: string | null) => {
      setSearchParams(
        (anterior) => {
          const next = new URLSearchParams(anterior);
          if (id) next.set('tutorial', id);
          else next.delete('tutorial');
          return next;
        },
        { replace: true, preventScrollReset: true }
      );
    },
    [setSearchParams]
  );

  const alterarFiltro = (id: Filtro) => {
    setFiltro(id);
    setSearchParams(
      (anterior) => {
        const next = new URLSearchParams(anterior);
        if (id === 'todos') next.delete('perfil');
        else next.set('perfil', id);
        return next;
      },
      { replace: true, preventScrollReset: true }
    );
  };

  const limparFiltros = () => {
    setBusca('');
    alterarFiltro('todos');
  };

  // Vindo de um reel: mostra o tutorial com todos os filtros limpos e rola até ele.
  const verTutorialDoReel = (id: string) => {
    setBusca('');
    setFiltro('todos');
    setSearchParams(
      (anterior) => {
        const next = new URLSearchParams(anterior);
        next.delete('perfil');
        next.set('tutorial', id);
        return next;
      },
      { replace: true, preventScrollReset: true }
    );
    window.setTimeout(() => {
      const alvo = document.getElementById(isDesktop ? 'painel-tutorial' : `tutorial-${id}`);
      alvo?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Tutoriais"
        description="Passo a passo dos serviços do CRF AL em Casa para farmacêuticos e empresas: inscrição, responsabilidade técnica, certidões, anuidade e mais, com vídeos."
        path="/servicos/tutoriais"
      />
      <PageHero
        breadcrumb={[
          { label: 'Início', href: '/' },
          { label: 'Serviços', href: '/servicos/requerimentos' },
          { label: 'Tutoriais' },
        ]}
        title="Tutoriais"
        section="servicos"
        lead="Passo a passo dos serviços do CRF AL em Casa, com as mesmas instruções da Central de Requerimentos."
        meta={[
          { value: tutoriais.length, label: tutoriais.length === 1 ? 'tutorial' : 'tutoriais' },
          { value: TOTAL_VIDEOS, label: 'com vídeo' },
        ]}
        actions={<PageHeroAction href={CRF_EM_CASA_URL}>Acessar CRF AL em Casa</PageHeroAction>}
      />

      <div className="container-crfal py-8 md:py-12">
        <TopDestaques onVerTutorial={verTutorialDoReel} />

        {/* Perfil e busca */}
        <div className="sticky top-(--header-offset) z-30 glass-light flex flex-col gap-2 rounded-2xl border border-white/70 p-2 shadow-[0_12px_32px_-16px_rgba(11,25,44,0.35)] ring-1 ring-crfal-gray-200/70 sm:gap-3 sm:p-3 lg:flex-row lg:items-center lg:p-4">
          <div role="group" aria-label="Filtrar por perfil" className="flex gap-2 overflow-x-auto scrollbar-none [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)] [&::-webkit-scrollbar]:hidden sm:[mask-image:none]">
            {FILTROS.map((f) => {
              const ativo = filtro === f.id;
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => alterarFiltro(f.id)}
                  aria-pressed={ativo}
                  className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-semibold ${motion} ${focusRing} ${
                    ativo
                      ? 'border-crfal-blue bg-crfal-blue text-white shadow-xs'
                      : 'border-crfal-gray-200 bg-white text-crfal-gray-700 hover:border-crfal-blue/40 hover:text-crfal-blue'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />}
                  {f.label}
                  <span className={`rounded-full px-1.5 text-[11px] font-bold ${ativo ? 'bg-white/20 text-white' : 'bg-crfal-gray-100 text-crfal-gray-600'}`}>
                    {contagem(f.id)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative lg:ml-auto lg:max-w-sm lg:flex-1">
            <label htmlFor="busca-tutorial" className="sr-only">Buscar tutorial</label>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-crfal-gray-400" aria-hidden="true" />
            <input
              id="busca-tutorial"
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar tutorial, ex.: afastamento"
              className="min-h-11 w-full appearance-none rounded-full border border-crfal-gray-200 lg:min-h-12 bg-white py-2.5 pl-11 pr-11 text-sm text-crfal-blue-dark transition-colors placeholder:text-crfal-gray-400 focus:border-crfal-blue-light focus:outline-hidden focus:ring-2 focus:ring-crfal-blue-light/40 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {busca && (
              <button type="button" onClick={() => setBusca('')} aria-label="Limpar busca" className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-crfal-gray-400 transition-colors hover:bg-crfal-gray-100 hover:text-crfal-gray-600 ${focusRing}`}>
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 md:mt-10" aria-live="polite">
          {termo && (
            <p className="mb-6 text-sm text-crfal-gray-600">
              <strong className="text-crfal-blue-dark">{visiveis.length}</strong> {visiveis.length === 1 ? 'tutorial encontrado' : 'tutoriais encontrados'}
            </p>
          )}

          {visiveis.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-crfal-gray-300 bg-white px-6 py-14 text-center">
              <Search className="mx-auto mb-3 h-10 w-10 text-crfal-gray-300" aria-hidden="true" />
              <h2 className="text-lg font-bold text-crfal-blue-dark">
                {busca.trim() ? <>Nenhum tutorial para “{busca.trim()}”{filtro !== 'todos' && <> em {PERFIS[filtro].label}</>}</> : 'Nenhum tutorial encontrado'}
              </h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-crfal-gray-600">Tente outra palavra, como “inscrição” ou “anuidade”. Os documentos de todos os pedidos estão na Central de Requerimentos.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={filtro !== 'todos' ? () => alterarFiltro('todos') : limparFiltros} className={`inline-flex min-h-[44px] items-center gap-2 rounded-full bg-crfal-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-crfal-blue-dark ${focusRing}`}>
                  {filtro !== 'todos' ? 'Buscar em todos os perfis' : 'Limpar busca'}
                </button>
                <Link to="/servicos/requerimentos" className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border border-crfal-gray-300 px-5 py-2.5 text-sm font-semibold text-crfal-blue hover:border-crfal-blue ${focusRing}`}>
                  Central de Requerimentos <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
              {/* Lista */}
              <div className="space-y-10 lg:col-span-5">
                {grupos.map(({ categoria, itens }) => {
                  const headingId = `cat-${normalizar(categoria).replace(/\s+/g, '-')}`;
                  return (
                    <section key={categoria} aria-labelledby={headingId}>
                      <p className={goldLabel}>{itens.length} {itens.length === 1 ? 'tutorial' : 'tutoriais'}</p>
                      <h2 id={headingId} className="mt-1 text-[22px] font-bold leading-tight tracking-tight text-crfal-blue sm:text-[24px]">{categoria}</h2>
                      <span aria-hidden="true" className="mb-4 mt-2.5 block h-0.5 w-10 rounded-full bg-crfal-gold" />

                      <ul className="divide-y divide-crfal-gray-200 overflow-hidden rounded-xl border border-crfal-gray-200 bg-white shadow-xs">
                        {itens.map((tutorial) => {
                          const ativo = selecionado?.id === tutorial.id;
                          return (
                            <li key={tutorial.id}>
                              <TutorialRow
                                tutorial={tutorial}
                                ativo={ativo}
                                expandivel={!isDesktop}
                                onClick={() => selecionar(ativo && !isDesktop ? null : tutorial.id)}
                              />
                              {ativo && !isDesktop && (
                                <div id={`tutorial-${tutorial.id}`} className="scroll-mt-[calc(var(--header-offset)+8.5rem)] border-t border-crfal-gray-200">
                                  <TutorialDetail key={tutorial.id} tutorial={tutorial} embutido />
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  );
                })}
              </div>

              {/* Painel do tutorial (desktop) */}
              {isDesktop && selecionado && (
                <div id="painel-tutorial" className="scroll-mt-[calc(var(--header-offset)+6.5rem)] lg:col-span-7">
                  <div className="sticky top-[calc(var(--header-offset)+6.5rem)] max-h-[calc(100dvh-var(--header-offset)-8rem)] overflow-y-auto rounded-2xl scrollbar-thin">
                    <TutorialDetail key={selecionado.id} tutorial={selecionado} />
                  </div>
                </div>
              )}
            </div>
          )}

          <aside className="mt-12 flex flex-col items-start gap-4 rounded-xl bg-linear-to-br/srgb from-crfal-blue to-crfal-blue-dark p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-crfal-gold">Não encontrou seu serviço?</p>
              <p className="mt-1 text-lg font-bold">Documentos e formulários de todos os pedidos estão na Central de Requerimentos.</p>
              <p className="mt-1 text-sm text-white/75">
                Dúvidas sobre o sistema: <a href="mailto:tecnologia@crf-al.org.br" className="rounded font-semibold text-white underline underline-offset-4 hover:text-crfal-gold focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/60">tecnologia@crf-al.org.br</a>
              </p>
            </div>
            <Link to="/servicos/requerimentos" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-bold transition-colors hover:border-white hover:bg-white hover:text-crfal-blue focus-visible:outline-white">
              Ir para a Central de Requerimentos <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

function TutorialRow({
  tutorial,
  ativo,
  expandivel,
  onClick,
}: {
  tutorial: Tutorial;
  ativo: boolean;
  expandivel: boolean;
  onClick: () => void;
}) {
  const Icon = tutorial.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      {...(expandivel
        ? { 'aria-expanded': ativo, 'aria-controls': `tutorial-${tutorial.id}` }
        : { 'aria-current': ativo ? ('true' as const) : undefined })}
      className={`group relative flex w-full items-center gap-4 p-4 text-left sm:p-5 ${motion} focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-crfal-blue ${
        ativo ? 'bg-crfal-blue-lighter/70' : 'hover:bg-crfal-blue-lighter/40'
      }`}
    >
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-[3px] bg-crfal-gold ${motion} ${ativo ? 'opacity-100' : 'opacity-0'}`} />
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-1 ${motion} ${
          ativo
            ? 'bg-crfal-blue text-white ring-crfal-gold/50'
            : 'bg-crfal-blue-lighter text-crfal-blue ring-crfal-blue/10 group-hover:bg-crfal-blue group-hover:text-white group-hover:ring-crfal-gold/50'
        }`}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-[15px] font-bold leading-snug sm:text-base ${ativo ? 'text-crfal-blue' : 'text-crfal-blue-dark group-hover:text-crfal-blue'}`}>
          {tutorial.title}
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-crfal-gray-600">
          <span>{PERFIS[tutorial.perfil].label}</span>
          <span className="inline-flex items-center gap-1">
            <ListChecks className="h-3.5 w-3.5 text-[#8A6A12]" aria-hidden="true" />
            {tutorial.steps.length} {tutorial.steps.length === 1 ? 'passo' : 'passos'}
          </span>
          {temVideo(tutorial) && (
            <span className="inline-flex items-center gap-1">
              <Play className="h-3.5 w-3.5 text-[#8A6A12]" aria-hidden="true" />
              Vídeo
            </span>
          )}
        </span>
      </span>
      <ChevronRight
        className={`h-5 w-5 shrink-0 ${motion} ${
          ativo ? `text-[#8A6A12] ${expandivel ? 'rotate-90' : 'translate-x-1'}` : 'text-crfal-gray-400 group-hover:translate-x-1 group-hover:text-[#8A6A12]'
        }`}
        aria-hidden="true"
      />
    </button>
  );
}

