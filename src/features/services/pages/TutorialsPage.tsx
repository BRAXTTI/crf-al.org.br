import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronRight, Layers, Play, Search, X, type LucideIcon } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHero from '@/components/block/page-hero';
import { PAGE_METADATA } from '@/config/page-metadata';
import { caminhoDoTutorial, resolverRedirectTutorial } from '@/config/redirects-servicos';
import { CATEGORIAS_TUTORIAIS, MAIS_PROCURADOS, tutoriais, type Tutorial } from '@/data/servicos';
import { REELS_DESTAQUE } from '@/data/tutoriais-destaque';
import { GUIAS } from '@/data/tutoriais-guias';
import { medidorDeVideo, medir, medirBuscaVazia } from '@/lib/medir';
import { combinaBusca, doPerfil, type Filtro } from '../tutorial-busca';
import { PERFIS } from '../tutorial-profiles';

const PATH = '/servicos/tutoriais';
const goldLabel = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]';
const focusRing = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2';
const motion = 'transition duration-200 motion-reduce:transition-none';
const linkTexto = `rounded font-semibold text-crfal-blue underline decoration-crfal-blue/30 underline-offset-4 hover:decoration-crfal-blue ${focusRing}`;

const FILTROS: { id: Filtro; label: string; icon: LucideIcon }[] = [
  { id: 'todos', label: 'Todos', icon: Layers },
  { id: 'pessoa-fisica', ...PERFIS['pessoa-fisica'] },
  { id: 'pessoa-juridica', ...PERFIS['pessoa-juridica'] },
];

const SNCR = REELS_DESTAQUE.find((reel) => reel.id === 'sncr');

function CardProcurado({ tutorial }: { tutorial: Tutorial }) {
  const video = GUIAS[tutorial.id].video;
  const Icon = tutorial.icon;
  return (
    <Link to={caminhoDoTutorial(tutorial.id)} className={`group flex h-full items-center gap-3 overflow-hidden rounded-xl border border-crfal-gray-200 bg-white p-2.5 shadow-xs hover:border-crfal-blue/40 sm:block sm:p-0 ${motion} ${focusRing}`}>
      <span className="relative block aspect-4/3 w-24 shrink-0 overflow-hidden rounded-lg bg-crfal-blue-lighter sm:w-full sm:rounded-none">
        {video ? (
          <>
            <img src={video.poster} alt="" width={960} height={720} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            <span className="absolute bottom-1 right-1 inline-flex items-center gap-1 rounded-full bg-crfal-blue-dark/85 px-2 py-0.5 text-[11px] font-semibold text-white sm:bottom-2 sm:right-2">
              <Play className="h-3 w-3 fill-current" aria-hidden />
              <span className="sr-only">Vídeo de </span>{video.duracao}
            </span>
          </>
        ) : (
          <span className="flex h-full items-center justify-center text-crfal-blue"><Icon className="h-8 w-8 sm:h-12 sm:w-12" strokeWidth={1.5} aria-hidden /></span>
        )}
      </span>
      <span className="flex min-w-0 flex-1 items-center justify-between gap-2 sm:p-4">
        <span className="text-[15px] font-bold leading-snug text-crfal-blue-dark group-hover:text-crfal-blue sm:text-base">{tutorial.titulo}</span>
        <ChevronRight className={`h-5 w-5 shrink-0 text-crfal-gray-400 group-hover:translate-x-0.5 group-hover:text-[#8A6A12] ${motion}`} aria-hidden />
      </span>
    </Link>
  );
}

function LinhaTarefa({ tutorial }: { tutorial: Tutorial }) {
  return (
    <Link to={caminhoDoTutorial(tutorial.id)} className={`group flex min-h-12 items-center gap-3 px-4 py-2.5 hover:bg-crfal-blue-lighter/40 ${motion} focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-crfal-blue`}>
      <span className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-crfal-blue-dark group-hover:text-crfal-blue">{tutorial.titulo}</span>
      {GUIAS[tutorial.id].video && (
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-crfal-gray-600">
          <Play className="h-3.5 w-3.5 text-[#8A6A12]" aria-hidden /> Vídeo
        </span>
      )}
      <ChevronRight className={`h-5 w-5 shrink-0 text-crfal-gray-400 group-hover:translate-x-0.5 group-hover:text-[#8A6A12] ${motion}`} aria-hidden />
    </Link>
  );
}

function GrupoTarefas({ categoria, itens }: { categoria: string; itens: Tutorial[] }) {
  return (
    <section className="mb-6 break-inside-avoid">
      <h3 className="mb-2 text-[15px] font-bold text-crfal-blue">{categoria}</h3>
      <ul className="divide-y divide-crfal-gray-200 overflow-hidden rounded-xl border border-crfal-gray-200 bg-white">
        {itens.map((tutorial) => <li key={tutorial.id}><LinhaTarefa tutorial={tutorial} /></li>)}
      </ul>
    </section>
  );
}

function VideosDeOrientacao() {
  const [medidor] = useState(() => medidorDeVideo('sncr'));
  if (!SNCR) return null;
  return (
    <section aria-labelledby="videos-orientacao" className="mt-2 max-w-2xl">
      <h3 id="videos-orientacao" className="mb-2 text-[15px] font-bold text-crfal-blue">Vídeos de orientação</h3>
      <details className="group overflow-hidden rounded-xl border border-crfal-gray-200 bg-white">
        <summary className={`flex min-h-12 cursor-pointer list-none items-center gap-3 px-4 py-2.5 text-[15px] font-semibold text-crfal-blue-dark [&::-webkit-details-marker]:hidden ${focusRing}`}>
          <span className="min-w-0 flex-1">{SNCR.title}: {SNCR.subtitle} ({SNCR.duracao})</span>
          <ChevronDown className={`h-5 w-5 shrink-0 text-crfal-gray-400 group-open:rotate-180 ${motion}`} aria-hidden />
        </summary>
        <div className="px-4 pb-4">
          <video src={SNCR.src} poster={SNCR.poster} controls playsInline preload="none" aria-label={SNCR.title} onPlay={medidor.aoTocar} onTimeUpdate={(e) => medidor.aoAvancar(e.currentTarget)} className="aspect-9/16 w-full max-w-60 rounded-xl bg-crfal-blue-dark" />
        </div>
      </details>
    </section>
  );
}

function Hub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const perfil = searchParams.get('perfil');
  const filtro: Filtro = perfil === 'pessoa-fisica' || perfil === 'pessoa-juridica' ? perfil : 'todos';
  const [busca, setBusca] = useState('');
  const termo = busca.trim();

  const visiveis = useMemo(() => tutoriais.filter((t) => doPerfil(t, filtro) && combinaBusca(t, termo)), [filtro, termo]);
  const procurados = MAIS_PROCURADOS.map((id) => visiveis.find((t) => t.id === id)).filter((t): t is Tutorial => Boolean(t));
  const grupos = CATEGORIAS_TUTORIAIS.map((categoria) => ({ categoria, itens: visiveis.filter((t) => t.category === categoria) })).filter((g) => g.itens.length > 0);

  // Espera a pessoa parar de digitar, para não contar cada letra como busca.
  const semResultado = termo !== '' && visiveis.length === 0;
  useEffect(() => {
    if (!semResultado) return;
    const timer = window.setTimeout(() => medirBuscaVazia(termo), 1500);
    return () => window.clearTimeout(timer);
  }, [semResultado, termo]);

  const alterarFiltro = (id: Filtro) => {
    setSearchParams((anterior) => {
      const next = new URLSearchParams(anterior);
      if (id === 'todos') next.delete('perfil');
      else next.set('perfil', id);
      return next;
    }, { replace: true, preventScrollReset: true });
  };

  return (
    <div className="min-h-screen">
      <SEO {...PAGE_METADATA[PATH]} path={PATH} />
      <PageHero
        breadcrumb={[
          { label: 'Início', href: '/' },
          { label: 'Serviços', href: '/servicos/requerimentos' },
          { label: 'Tutoriais' },
        ]}
        title="Tutoriais"
        section="servicos"
        lead="O que você precisa fazer? Veja em vídeo e siga os passos."
      />

      <div className="container-crfal py-5 md:py-8">
        <div className="mx-auto max-w-3xl">
          <div className="relative">
            <label htmlFor="busca-tutorial" className="sr-only">Buscar tarefa</label>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-crfal-gray-500" aria-hidden />
            <input
              id="busca-tutorial"
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar: boleto, baixa de RT, afastamento..."
              className="min-h-12 w-full appearance-none rounded-full border border-crfal-gray-300 bg-white py-2.5 pl-12 pr-12 text-[15px] text-crfal-blue-dark shadow-xs placeholder:text-crfal-gray-500 focus:border-crfal-blue-light focus:outline-hidden focus:ring-2 focus:ring-crfal-blue-light/40 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {busca && (
              <button type="button" onClick={() => setBusca('')} aria-label="Limpar busca" className={`absolute right-1 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-crfal-gray-500 hover:bg-crfal-gray-100 ${focusRing}`}>
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
          <div role="group" aria-label="Filtrar por perfil" className="mt-3 flex flex-wrap justify-center gap-2">
            {FILTROS.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => alterarFiltro(id)} aria-pressed={filtro === id} className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold ${motion} ${focusRing} ${filtro === id ? 'border-crfal-blue bg-crfal-blue text-white' : 'border-crfal-gray-200 bg-white text-crfal-gray-700 hover:border-crfal-blue/40 hover:text-crfal-blue'}`}>
                <Icon className="hidden h-4 w-4 min-[400px]:block" strokeWidth={1.75} aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div aria-live="polite">
          {semResultado ? (
            <div className="mt-8 rounded-2xl border border-dashed border-crfal-gray-300 bg-white px-6 py-12 text-center">
              <h2 className="text-lg font-bold text-crfal-blue-dark">Nenhuma tarefa para “{termo}”{filtro !== 'todos' && <> em {PERFIS[filtro].label}</>}</h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-crfal-gray-600">Tente outra palavra, como “inscrição” ou “anuidade”.</p>
              <div className="mt-5 flex justify-center">
                <button type="button" onClick={() => (filtro !== 'todos' ? alterarFiltro('todos') : setBusca(''))} className={`inline-flex min-h-11 items-center rounded-full bg-crfal-blue px-5 text-sm font-semibold text-white hover:bg-crfal-blue-dark ${focusRing}`}>
                  {filtro !== 'todos' ? 'Buscar em todos os perfis' : 'Limpar busca'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {!termo && (
                <section aria-labelledby="mais-procurados" className="mt-8">
                  <h2 id="mais-procurados" className={goldLabel}>Mais procurados</h2>
                  <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
                    {procurados.map((tutorial) => <li key={tutorial.id}><CardProcurado tutorial={tutorial} /></li>)}
                  </ul>
                </section>
              )}
              <section aria-labelledby="todas-tarefas" className="mt-8 md:mt-10">
                <h2 id="todas-tarefas" className={goldLabel}>{termo ? 'Resultado da busca' : 'Todas as tarefas'}</h2>
                <div className="mt-3 gap-6 lg:columns-2">
                  {grupos.map(({ categoria, itens }) => <GrupoTarefas key={categoria} categoria={categoria} itens={itens} />)}
                </div>
                {!termo && <VideosDeOrientacao />}
              </section>
            </>
          )}
        </div>

        <p className="mt-8 text-[15px] text-crfal-gray-700">
          Não encontrou?{' '}
          <Link to="/servicos/requerimentos" className={linkTexto}>Central de Requerimentos</Link>
          {' · '}
          <Link to="/contato" onClick={() => medir('contato')} className={linkTexto}>Fale Conosco <ArrowRight className="inline h-3.5 w-3.5" aria-hidden /></Link>
        </p>
      </div>
    </div>
  );
}

/**
 * `?tutorial=<id>` é o link antigo: o middleware responde 301; aqui cobre a navegação dentro do site.
 * Os 4 espelho vão direto para a página do requerimento (#passo-a-passo).
 */
export default function TutorialsPage() {
  const [searchParams] = useSearchParams();
  const legado = searchParams.get('tutorial');
  if (legado !== null) {
    return <Navigate to={resolverRedirectTutorial(legado, `?${searchParams}`, (id) => tutoriais.some((t) => t.id === id))} replace />;
  }
  return <Hub />;
}
