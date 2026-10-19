import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '@/components/SEO';
import { ArrowFillButton } from '@/components/block/arrow-fill-button';
import PageHero, { PageHeroAction } from '@/components/block/page-hero';
import { getYouTubeEmbedUrl } from '@/lib/youtube';
import TopDestaques from '@/features/services/components/TopDestaques';
import { tutoriais, type Tutorial, type TutorialMotion, type TutorialPerfil } from '@/data/servicos';
import { getRequerimento } from '@/data/requerimentos';
import {
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  Clock,
  Layers,
  Link2,
  ListChecks,
  PillBottle,
  Play,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';

const CRF_EM_CASA_URL = 'https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf';

const goldLabel = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]';
const focusRing = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2';
const motion = 'transition duration-200 motion-reduce:transition-none';

type Filtro = 'todos' | TutorialPerfil;

const PERFIS: Record<Tutorial['perfil'], { label: string; icon: typeof PillBottle }> = {
  'pessoa-fisica': { label: 'Farmacêuticos', icon: PillBottle },
  'pessoa-juridica': { label: 'Empresas', icon: Building2 },
  ambos: { label: 'Farmacêuticos e empresas', icon: Layers },
};

const FILTROS: { id: Filtro; label: string; icon?: typeof PillBottle }[] = [
  { id: 'todos', label: 'Todos', icon: Layers },
  { id: 'pessoa-fisica', ...PERFIS['pessoa-fisica'] },
  { id: 'pessoa-juridica', ...PERFIS['pessoa-juridica'] },
];

const temVideo = (t: Tutorial) => Boolean(t.motion || getYouTubeEmbedUrl(t.videoUrl));
const doPerfil = (t: Tutorial, filtro: Filtro) => filtro === 'todos' || t.perfil === filtro || t.perfil === 'ambos';

const TOTAL_VIDEOS = tutoriais.filter(temVideo).length;

function normalizar(texto: string) {
  return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const DESKTOP_QUERY = '(min-width: 1024px)';

function useIsDesktop() {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(DESKTOP_QUERY);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => true
  );
}

function linkDoRequerimento(tutorial: Tutorial) {
  return `/servicos/requerimentos?perfil=${tutorial.perfil}&item=${tutorial.requerimentoId}`;
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
      alvo?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Tutoriais"
        description="Tutoriais e guias passo a passo para os serviços do CRFAL — aprenda como realizar seus registros, renovações e demais serviços online de forma simples."
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
        <div className="sticky top-(--header-offset) z-30 glass-light flex flex-col gap-3 rounded-2xl border border-white/70 p-3 shadow-[0_12px_32px_-16px_rgba(11,25,44,0.35)] ring-1 ring-crfal-gray-200/70 sm:p-4 lg:flex-row lg:items-center">
          <div role="group" aria-label="Filtrar por perfil" className="flex gap-2 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
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
              className="min-h-[48px] w-full appearance-none rounded-full border border-crfal-gray-200 bg-white py-2.5 pl-11 pr-11 text-sm text-crfal-blue-dark transition-colors placeholder:text-crfal-gray-400 focus:border-crfal-blue-light focus:outline-hidden focus:ring-2 focus:ring-crfal-blue-light/40 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {busca && (
              <button type="button" onClick={() => setBusca('')} aria-label="Limpar busca" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-crfal-gray-400 transition-colors hover:bg-crfal-gray-100 hover:text-crfal-gray-600">
                <X className="h-4 w-4" />
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
              <h2 className="text-lg font-bold text-crfal-blue-dark">Nenhum tutorial encontrado</h2>
              <p className="mt-1 text-sm text-crfal-gray-600">Tente outro termo ou veja todos os requerimentos.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={limparFiltros} className={`inline-flex min-h-[44px] items-center gap-2 rounded-full bg-crfal-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-crfal-blue-dark ${focusRing}`}>
                  Limpar filtros
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
                                <div id={`tutorial-${tutorial.id}`} className="scroll-mt-[calc(var(--header-offset)+13rem)] border-t border-crfal-gray-200">
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
              <p className="mt-1 text-sm text-white/75">Dúvidas sobre o sistema: tecnologia@crf-al.org.br</p>
            </div>
            <Link to="/servicos/requerimentos" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-bold transition-colors hover:border-white hover:bg-white hover:text-crfal-blue focus-visible:outline-white">
              Ver requerimentos <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
            {tutorial.steps.length} passos
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

function TutorialDetail({ tutorial, embutido = false }: { tutorial: Tutorial; embutido?: boolean }) {
  const Icon = tutorial.icon;
  const PerfilIcon = PERFIS[tutorial.perfil].icon;
  const videoEmbedUrl = getYouTubeEmbedUrl(tutorial.videoUrl);
  const requerimento = tutorial.requerimentoId ? getRequerimento(tutorial.requerimentoId) : undefined;

  const [tocando, setTocando] = useState(false);
  const [feitos, setFeitos] = useState<number[]>([]);
  const [linkCopiado, setLinkCopiado] = useState(false);

  useEffect(() => {
    if (!linkCopiado) return;
    const timer = window.setTimeout(() => setLinkCopiado(false), 2500);
    return () => window.clearTimeout(timer);
  }, [linkCopiado]);

  const alternarPasso = (index: number) =>
    setFeitos((atual) => (atual.includes(index) ? atual.filter((i) => i !== index) : [...atual, index]));

  const copiarLink = async () => {
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('tutorial', tutorial.id);
    try {
      await navigator.clipboard.writeText(url.toString());
      setLinkCopiado(true);
    } catch {
      window.prompt('Copie o link do tutorial:', url.toString());
    }
  };

  const total = tutorial.steps.length;
  const progresso = total ? Math.round((feitos.length / total) * 100) : 0;
  const titleId = `tutorial-titulo-${tutorial.id}`;

  return (
    <article
      aria-labelledby={titleId}
      className={`overflow-hidden bg-white motion-safe:animate-fade-in ${embutido ? '' : 'rounded-2xl border border-crfal-gray-200 shadow-[0_24px_48px_-28px_rgba(11,25,44,0.45)]'}`}
    >
      {/* Cabeçalho */}
      <header className="relative isolate overflow-hidden border-t-2 border-crfal-gold bg-linear-to-br/srgb from-crfal-blue to-crfal-blue-dark p-5 sm:p-6">
        <Icon className="pointer-events-none absolute -bottom-8 -right-6 -z-10 h-40 w-40 text-white opacity-[0.06]" strokeWidth={1} aria-hidden="true" />
        <button
          type="button"
          onClick={copiarLink}
          aria-label={linkCopiado ? 'Link copiado' : 'Copiar link deste tutorial'}
          title="Copiar link"
          className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full p-2 text-xs font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/60"
        >
          {linkCopiado ? <Check className="h-5 w-5 text-crfal-gold" /> : <Link2 className="h-5 w-5" />}
          <span className="hidden sm:inline" aria-hidden="true">{linkCopiado ? 'Copiado' : 'Copiar link'}</span>
        </button>

        <div className="flex items-start gap-4 pr-12 sm:pr-32">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/5 ring-1 ring-crfal-gold/40 sm:h-14 sm:w-14">
            <Icon className="h-6 w-6 text-white sm:h-7 sm:w-7" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-crfal-gold">Tutorial · {tutorial.category}</p>
            <h2 id={titleId} className="mt-0.5 text-lg font-bold leading-snug tracking-tight text-white sm:text-[22px]">{tutorial.title}</h2>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-white/80">{tutorial.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
            <PerfilIcon className="h-3.5 w-3.5 text-crfal-gold" aria-hidden="true" /> {PERFIS[tutorial.perfil].label}
          </span>
          {tutorial.prazo && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
              <Clock className="h-3.5 w-3.5 text-crfal-gold" aria-hidden="true" /> Prazo: {tutorial.prazo}
            </span>
          )}
        </div>
      </header>

      {tutorial.motion && <MotionVideo motion={tutorial.motion} titulo={tutorial.title} />}

      {/* Vídeo: o YouTube só carrega depois do clique */}
      {!tutorial.motion && videoEmbedUrl && (
        <div className="aspect-video bg-crfal-blue-dark">
          {tocando ? (
            <iframe
              src={`${videoEmbedUrl}&autoplay=1`}
              title={`Vídeo tutorial: ${tutorial.title}`}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setTocando(true)}
              className="group relative flex h-full w-full flex-col items-center justify-center gap-4 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,rgba(0,102,204,0.35),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(197,155,39,0.14),transparent_55%)] text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-crfal-gold"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-size-[48px_48px] mask-[radial-gradient(ellipse_at_center,black,transparent_75%)]"
              />
              <span className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-white text-crfal-blue shadow-xl ring-4 ring-crfal-gold/40 group-hover:scale-105 group-hover:ring-crfal-gold/70 sm:h-20 sm:w-20 ${motion}`}>
                <Play className="ml-1 h-7 w-7 fill-current sm:h-8 sm:w-8" aria-hidden="true" />
              </span>
              <span className="relative text-center">
                <span className="block text-sm font-bold sm:text-base">Assistir ao tutorial em vídeo</span>
                <span className="mt-0.5 block text-xs text-white/65">O vídeo do YouTube carrega ao clicar</span>
              </span>
            </button>
          )}
        </div>
      )}

      {/* Passo a passo */}
      <div className="p-5 sm:p-6">
        {requerimento && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-crfal-gray-200 bg-crfal-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <ListChecks className="mt-0.5 h-5 w-5 shrink-0 text-[#8A6A12]" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-crfal-gray-700">
                <strong className="text-crfal-blue-dark">Antes de começar,</strong> reúna os {requerimento.documentos.length}{' '}
                {requerimento.documentos.length === 1 ? 'documento exigido' : 'documentos exigidos'} no requerimento.
              </p>
            </div>
            <Link to={linkDoRequerimento(tutorial)} className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 self-start rounded-full px-1 text-sm font-semibold text-crfal-blue underline-offset-4 hover:underline sm:self-auto ${focusRing}`}>
              Ver documentos <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className={goldLabel}>Passo a passo</p>
            <p className="mt-1 text-sm font-semibold text-crfal-blue-dark">
              {feitos.length > 0 ? `${feitos.length} de ${total} passos concluídos` : `${total} passos · marque conforme avança`}
            </p>
            <div
              className="mt-1.5 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-crfal-gray-100"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={feitos.length}
              aria-label="Passos concluídos"
            >
              <div className="h-full rounded-full bg-crfal-gold transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${progresso}%` }} />
            </div>
          </div>
          {feitos.length > 0 && (
            <button type="button" onClick={() => setFeitos([])} className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-crfal-gray-600 hover:bg-crfal-gray-100 hover:text-crfal-blue ${focusRing}`}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Recomeçar
            </button>
          )}
        </div>

        <ol>
          {tutorial.steps.map((passo, index) => {
            const feito = feitos.includes(index);
            const ultimo = index === total - 1;
            return (
              <li key={index}>
                <label className="group/passo flex cursor-pointer gap-4">
                  <input type="checkbox" checked={feito} onChange={() => alternarPasso(index)} className="peer sr-only" />
                  <span className="flex flex-col items-center [&>span:first-child]:peer-focus-visible:ring-crfal-blue">
                    <span
                      aria-hidden="true"
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-2 ${motion} ${
                        feito ? 'bg-crfal-gold text-crfal-blue-dark ring-crfal-gold/40' : 'bg-crfal-blue text-white ring-crfal-gold/30 group-hover/passo:ring-crfal-gold/70'
                      }`}
                    >
                      {feito ? <Check className="h-4 w-4" strokeWidth={3} /> : index + 1}
                    </span>
                    {!ultimo && <span aria-hidden="true" className={`mt-1 block h-full w-px ${feito ? 'bg-crfal-gold/60' : 'bg-crfal-gray-200'}`} />}
                  </span>
                  <span className={`block pt-1 text-sm leading-relaxed ${ultimo ? '' : 'pb-5'} ${feito ? 'text-crfal-gray-500 line-through decoration-crfal-gray-300' : 'text-crfal-gray-700'}`}>
                    <span className="sr-only">Passo {index + 1}: </span>
                    {passo}
                  </span>
                </label>
              </li>
            );
          })}
        </ol>

      </div>

      <div className="flex flex-wrap gap-3 border-t border-crfal-gray-200 bg-crfal-gray-50 p-4 sm:p-5">
        <ArrowFillButton href={tutorial.acesso?.url ?? CRF_EM_CASA_URL} target="_blank" rel="noopener noreferrer">
          {tutorial.acesso?.label ?? 'Acessar CRF AL em Casa'}
          <span className="sr-only"> (abre em uma nova aba)</span>
        </ArrowFillButton>
      </div>
    </article>
  );
}

type VideoComFullscreenWebkit = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

/**
 * Vídeo vertical em motion. No desktop toca dentro de uma moldura de iPhone;
 * no celular o toque já abre o vídeo em tela cheia.
 */
function MotionVideo({ motion: video, titulo }: { motion: TutorialMotion; titulo: string }) {
  const ref = useRef<VideoComFullscreenWebkit>(null);
  const isDesktop = useIsDesktop();
  const [tocando, setTocando] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Ao sair da tela cheia no celular o vídeo pausa, em vez de seguir tocando na miniatura.
    if (isDesktop) return;
    const aoSair = () => {
      if (document.fullscreenElement) return;
      el.pause();
      setTocando(false);
    };
    el.addEventListener('fullscreenchange', aoSair);
    el.addEventListener('webkitendfullscreen', aoSair);
    return () => {
      el.removeEventListener('fullscreenchange', aoSair);
      el.removeEventListener('webkitendfullscreen', aoSair);
    };
  }, [isDesktop]);

  const assistir = () => {
    const el = ref.current;
    if (!el) return;
    setTocando(true);
    const reproducao = el.play();
    if (!isDesktop) {
      // Precisa acontecer dentro do gesto do usuário: Android usa a API padrão, iPhone a do WebKit.
      try {
        if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
        else el.webkitEnterFullscreen?.();
      } catch {
        // Sem tela cheia disponível, o vídeo segue tocando na miniatura.
      }
    }
    reproducao.catch(() => setTocando(false));
  };

  const legenda = `Tutorial em vídeo: ${titulo}`;

  const elementoVideo = (className: string) => (
    <video
      ref={ref}
      src={video.src}
      poster={video.poster}
      preload="metadata"
      playsInline
      controls={tocando}
      onEnded={() => setTocando(false)}
      aria-label={legenda}
      className={className}
    />
  );

  const botaoPlay = (grande: boolean) => (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-white text-crfal-blue shadow-xl ring-4 ring-crfal-gold/40 group-hover:scale-105 group-hover:ring-crfal-gold/70 ${motion} ${grande ? 'h-16 w-16' : 'h-11 w-11'}`}>
      <Play className={`ml-0.5 fill-current ${grande ? 'h-7 w-7' : 'h-5 w-5'}`} aria-hidden="true" />
    </span>
  );

  return (
    <div className="relative isolate overflow-hidden bg-crfal-blue-dark bg-[radial-gradient(ellipse_at_top_right,rgba(0,102,204,0.35),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(197,155,39,0.14),transparent_55%)]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-size-[48px_48px] mask-[radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />

      {isDesktop ? (
        // Desktop: o vídeo toca dentro da moldura de iPhone, imitando a tela do celular.
        <div className="flex justify-center px-6 py-8">
          <div className="relative w-[260px] xl:w-[280px]">
            <div className="absolute left-[5%] top-[3.488%] h-[93.023%] w-[90%] overflow-hidden bg-black rounded-[12.22%/6.875%]">
              {elementoVideo('block h-full w-full object-cover')}
            </div>
            <img
              src="/images/tutoriais/iphone-frame.svg"
              alt=""
              aria-hidden="true"
              className="pointer-events-none relative block w-full drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)]"
            />
            {!tocando && (
              <button
                type="button"
                onClick={assistir}
                aria-label={`Assistir ao vídeo (${video.duracao})`}
                className="group absolute inset-[3.5%_5%] flex flex-col items-center justify-center gap-3 rounded-[12%/7%] text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-gold"
              >
                {botaoPlay(true)}
                <span className="rounded-full bg-crfal-blue-dark/80 px-3 py-1 text-xs font-semibold backdrop-blur-xs">{video.duracao}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        // Celular: a miniatura abre o vídeo direto em tela cheia.
        <div className="flex items-center gap-4 p-4 sm:p-5">
          {/* Toque na miniatura também abre o vídeo; o botão ao lado é o alvo acessível. */}
          <div onClick={tocando ? undefined : assistir} className="w-[84px] shrink-0 cursor-pointer overflow-hidden rounded-xl bg-black ring-1 ring-white/20">
            {elementoVideo('block aspect-9/16 w-full object-cover')}
          </div>
          <button
            type="button"
            onClick={assistir}
            className="group flex min-h-[44px] flex-1 items-center gap-3 text-left text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-gold"
          >
            {botaoPlay(false)}
            <span>
              <span className="block text-sm font-bold">Assistir ao vídeo</span>
              <span className="mt-0.5 block text-xs text-white/65">{video.duracao} · abre em tela cheia</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
