import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  CalendarDays,
  CalendarPlus,
  ChevronRight,
  Clock,
  ExternalLink,
  MapPin,
  Monitor,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import SEO from '@/components/SEO';
import PageHero from '@/components/block/page-hero';
import { useEvents } from '@/services/wordpress/event-hooks';
import {
  BannerEvento,
  CardSkeleton,
  EventoCard,
  LinhaArquivo,
  SecaoTitulo,
} from '../components/EventCards';
import {
  MODALIDADE_ICONS,
  MODALIDADE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  formatarData,
  mapEvent,
  rotuloContagem,
  type Evento,
  type ModalidadeEvento,
  type StatusEvento,
} from '../utils';

type FiltroStatus = StatusEvento | 'todos';
type FiltroModalidade = ModalidadeEvento | 'todas';

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export default function EventosPage() {
  const { data, isLoading, isError, refetch } = useEvents();
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todos');
  const [filtroModalidade, setFiltroModalidade] = useState<FiltroModalidade>('todas');
  const [busca, setBusca] = useState('');
  const [mostraArquivo, setMostraArquivo] = useState(false);

  const eventos = useMemo(() => (data ?? []).map(mapEvent), [data]);

  const ativos = useMemo(
    () =>
      eventos
        .filter((e) => e.status === 'em-breve' || e.status === 'em-andamento')
        .sort((a, b) => a.data.localeCompare(b.data)),
    [eventos]
  );

  const arquivo = useMemo(
    () =>
      eventos
        .filter((e) => e.status === 'encerrado' || e.status === 'cancelado')
        .sort((a, b) => b.data.localeCompare(a.data)),
    [eventos]
  );

  const termo = normalizar(busca.trim());
  const emLanding = filtroStatus === 'todos' && filtroModalidade === 'todas' && termo === '';

  const passaFiltros = useCallback(
    (e: Evento): boolean =>
      (filtroStatus === 'todos' || e.status === filtroStatus) &&
      (filtroModalidade === 'todas' || e.modalidade === filtroModalidade) &&
      (termo === '' ||
        normalizar(`${e.titulo} ${e.descricao} ${e.local} ${e.publico ?? ''}`).includes(termo)),
    [filtroStatus, filtroModalidade, termo]
  );

  const destaque = emLanding ? ativos.find((e) => e.status === 'em-breve') : undefined;
  const ativosVisiveis = useMemo(
    () => (emLanding ? ativos.filter((e) => e.id !== destaque?.id) : ativos.filter(passaFiltros)),
    [ativos, emLanding, destaque, passaFiltros]
  );
  const arquivoFiltrado = useMemo(() => arquivo.filter(passaFiltros), [arquivo, passaFiltros]);
  const totalResultados = ativosVisiveis.length + arquivoFiltrado.length;

  const filtros: { value: FiltroStatus; label: string; count: number }[] = [
    { value: 'todos', label: 'Todos', count: eventos.length },
    { value: 'em-andamento', label: 'Em andamento', count: eventos.filter((e) => e.status === 'em-andamento').length },
    { value: 'em-breve', label: 'Em breve', count: eventos.filter((e) => e.status === 'em-breve').length },
    { value: 'encerrado', label: 'Encerrados', count: eventos.filter((e) => e.status === 'encerrado').length },
    { value: 'cancelado', label: 'Cancelados', count: eventos.filter((e) => e.status === 'cancelado').length },
  ];

  const modalidades: { value: FiltroModalidade; label: string }[] = [
    { value: 'todas', label: 'Todas as modalidades' },
    { value: 'presencial', label: 'Presencial' },
    { value: 'online', label: 'Online' },
    { value: 'hibrido', label: 'Híbrido' },
  ];

  const limparFiltros = () => {
    setFiltroStatus('todos');
    setFiltroModalidade('todas');
    setBusca('');
  };

  const rotuloContagemDestaque = destaque ? rotuloContagem(destaque.data) : null;

  return (
    <div className="min-h-screen ">
      <SEO
        title="Eventos"
        description="Confira a agenda de eventos do CRF-AL — Conselho Regional de Farmácia do Estado de Alagoas. Congressos, palestras, capacitações e ações sociais."
        path="/eventos"
        noindex
      />

      {/* Hero */}
      <PageHero
        breadcrumb={[{ label: 'Início', href: '/' }, { label: 'Imprensa' }, { label: 'Eventos' }]}
        section="imprensa"
        lead="Congressos, palestras, capacitações e ações do CRF-AL para farmacêuticos e para a sociedade."
        title="Agenda de Eventos"
        meta={[{ value: ativos.length, label: 'próximos' }, { value: ativos.filter((e) => e.modalidade === 'online').length, label: 'online' }, { value: ativos.filter((e) => e.modalidade !== 'online').length, label: 'presenciais' }]}
      />

      <div className="container-crfal py-8 md:py-12">
        <a href="/api/events?format=ics" className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-crfal-blue px-5 py-2.5 text-sm font-semibold text-crfal-blue hover:bg-crfal-blue hover:text-white focus-visible:ring-2 focus-visible:ring-crfal-gold"><CalendarPlus className="h-4 w-4" aria-hidden />Baixar calendário de eventos (.ics)</a>
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-8 text-center  ">
            <p className="mb-4 text-red-600 ">Não foi possível carregar os eventos agora.</p>
            <p className="mb-6 text-sm text-crfal-gray-500 ">
              Verifique sua conexão ou tente novamente em instantes.
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-crfal-blue px-5 py-2.5 text-sm font-semibold text-crfal-blue transition-colors hover:bg-crfal-blue hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </button>
          </div>
        ) : eventos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-crfal-gray-300 bg-white py-16 text-center  ">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-crfal-blue-lighter ">
              <CalendarDays className="h-8 w-8 text-crfal-blue " />
            </div>
            <h2 className="font-display text-xl font-semibold text-neutral-800 ">
              Nenhum evento cadastrado
            </h2>
            <p className="mt-2 text-crfal-gray-500 ">
              Novos eventos serão publicados em breve. Volte novamente mais tarde.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Destaque: próximo evento */}
            {destaque && (
              <section aria-labelledby="destaque-titulo">
                <SecaoTitulo id="destaque-titulo" titulo="Próximo evento" contador={1} />
                <article className="group relative grid overflow-hidden rounded-2xl border border-crfal-gray-200 bg-white shadow-card transition-all duration-500 hover:shadow-card-hover   md:grid-cols-2">
                  <div className="relative aspect-16/10 overflow-hidden sm:aspect-16/8 md:aspect-video">
                    <BannerEvento evento={destaque} />
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-crfal-gold px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                      <Sparkles className="h-3.5 w-3.5" />
                      Destaque
                    </span>
                    {rotuloContagemDestaque && (
                      <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-sm font-bold text-crfal-blue shadow-lg backdrop-blur-xs">
                        <Clock className="h-4 w-4" />
                        {rotuloContagemDestaque}
                      </span>
                    )}
                  </div>

                  <div className="relative flex flex-col justify-center gap-4 p-6 md:p-10">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_COLORS[destaque.status].bg} ${STATUS_COLORS[destaque.status].text}`}
                      >
                        {STATUS_LABELS[destaque.status]}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-crfal-blue-lighter px-2.5 py-1 text-[11px] font-semibold text-crfal-blue  ">
                        {(() => {
                          const MIcon = MODALIDADE_ICONS[destaque.modalidade];
                          return <MIcon className="h-3 w-3" />;
                        })()}
                        {MODALIDADE_LABELS[destaque.modalidade]}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl font-semibold leading-tight text-neutral-800  md:text-3xl">
                      <Link
                        to={`/eventos/${destaque.slug}`}
                        className="after:absolute after:inset-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue-light"
                      >
                        {destaque.titulo}
                      </Link>
                    </h3>

                    {destaque.descricao && (
                      <p className="line-clamp-3 text-sm leading-relaxed text-crfal-gray-600  md:text-base">
                        {destaque.descricao}
                      </p>
                    )}

                    <div className="space-y-1.5 text-sm text-crfal-gray-600 ">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0 text-crfal-blue " />
                        {formatarData(destaque.data, destaque.dataFim)}
                      </p>
                      {destaque.local && (
                        <p className="flex items-center gap-2">
                          {destaque.modalidade === 'online' ? <Monitor className="h-4 w-4 shrink-0 text-crfal-blue" aria-hidden /> : <MapPin className="h-4 w-4 shrink-0 text-crfal-blue" aria-hidden />}
                          {destaque.local}
                        </p>
                      )}
                    </div>

                    <div className="relative z-10 mt-2 flex flex-wrap gap-3">
                      {destaque.link && (
                        <a
                          href={destaque.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-crfal-blue px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-crfal-blue-dark active:scale-95"
                        >
                          Inscreva-se
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <Link
                        to={`/eventos/${destaque.slug}`}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-crfal-blue px-6 py-2.5 text-sm font-semibold text-crfal-blue transition-all hover:bg-crfal-blue hover:text-white active:scale-95"
                      >
                        Ver detalhes
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              </section>
            )}

            {/* Barra de filtros */}
            <div className="sticky top-(--header-offset) z-30 glass-light rounded-2xl border border-white/70 p-3 shadow-[0_12px_32px_-16px_rgba(11,25,44,0.35)] ring-1 ring-crfal-gray-200/70 sm:p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative lg:max-w-xs lg:flex-1">
                  <label htmlFor="busca-evento" className="sr-only">Buscar evento</label>
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-crfal-gray-400" />
                  <input
                    id="busca-evento"
                    type="search"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar evento..."
                    className="w-full min-h-[44px] rounded-full border border-crfal-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-neutral-800 transition-colors placeholder:text-crfal-gray-400 focus:border-crfal-blue-light focus:outline-hidden focus:ring-2 focus:ring-crfal-blue-light/40   "
                  />
                  {busca && (
                    <button
                      onClick={() => setBusca('')}
                      aria-label="Limpar busca"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-crfal-gray-400 transition-colors hover:bg-crfal-gray-100 hover:text-crfal-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div
                  role="group"
                  aria-label="Filtrar por status"
                  className="flex gap-1.5 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
                >
                  {filtros.map((filtro) => (
                    <button
                      key={filtro.value}
                      onClick={() => setFiltroStatus(filtro.value)}
                      aria-pressed={filtroStatus === filtro.value}
                      className={`inline-flex min-h-[44px] shrink-0 snap-start items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue-light ${
                        filtroStatus === filtro.value
                          ? 'bg-crfal-blue text-white shadow-md'
                          : 'bg-crfal-gray-100 text-crfal-gray-600 hover:bg-crfal-gray-200 hover:text-crfal-blue   '
                      }`}
                    >
                      {filtro.label}
                      <span
                        className={`rounded-full px-1.5 text-[11px] font-bold ${
                          filtroStatus === filtro.value
                            ? 'bg-white/20 text-white'
                            : 'bg-white text-crfal-gray-500  '
                        }`}
                      >
                        {filtro.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div
                  role="group"
                  aria-label="Filtrar por modalidade"
                  className="flex gap-1.5 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden lg:ml-auto"
                >
                  {modalidades.map((modalidade) => {
                    const ativo = filtroModalidade === modalidade.value;
                    const MIcon =
                      modalidade.value === 'todas' ? null : MODALIDADE_ICONS[modalidade.value];
                    return (
                      <button
                        key={modalidade.value}
                        onClick={() => setFiltroModalidade(modalidade.value)}
                        aria-pressed={ativo}
                        className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue-light ${
                          ativo
                            ? 'border-crfal-blue bg-crfal-blue text-white'
                            : 'border-crfal-gray-200 bg-white text-crfal-gray-600 hover:border-crfal-blue/40 hover:text-crfal-blue   '
                        }`}
                      >
                        {MIcon && <MIcon className="h-3.5 w-3.5" />}
                        {modalidade.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {!emLanding && (
                <p className="mt-3 flex items-center gap-2 border-t border-crfal-gray-100 pt-3 text-xs text-crfal-gray-500  ">
                  {totalResultados} resultado{totalResultados !== 1 ? 's' : ''} encontrado
                  {totalResultados !== 1 ? 's' : ''}
                  <button
                    onClick={limparFiltros}
                    className="ml-auto inline-flex min-h-[32px] items-center gap-1 font-semibold text-crfal-blue transition-colors hover:underline "
                  >
                    <X className="h-3.5 w-3.5" />
                    Limpar filtros
                  </button>
                </p>
              )}
            </div>

            {totalResultados === 0 && !destaque ? (
              <div className="rounded-2xl border border-dashed border-crfal-gray-300 bg-white py-14 text-center  ">
                <Search className="mx-auto mb-3 h-10 w-10 text-crfal-gray-300 " />
                <h2 className="font-display text-lg font-semibold text-neutral-800 ">
                  Nenhum evento encontrado
                </h2>
                <p className="mt-1 text-sm text-crfal-gray-500 ">
                  Tente ajustar a busca ou os filtros selecionados.
                </p>
                <button
                  onClick={limparFiltros}
                  className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-crfal-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-crfal-blue-dark"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <>
                {ativosVisiveis.length > 0 && (
                  <section aria-labelledby="proximos-titulo">
                    <SecaoTitulo id="proximos-titulo" titulo="Próximos e em andamento" contador={ativosVisiveis.length} />
                    <div
                      key={`${filtroStatus}|${filtroModalidade}`}
                      className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
                    >
                      {ativosVisiveis.map((evento, index) => (
                        <EventoCard key={evento.id} evento={evento} index={index} />
                      ))}
                    </div>
                  </section>
                )}

                {arquivoFiltrado.length > 0 && (
                  <section aria-labelledby="arquivo-titulo">
                    <SecaoTitulo id="arquivo-titulo" titulo="Encerrados e cancelados" contador={arquivoFiltrado.length} />
                    <div className="divide-y divide-crfal-gray-100 overflow-hidden rounded-2xl border border-crfal-gray-200 bg-white   ">
                      {(mostraArquivo ? arquivoFiltrado : arquivoFiltrado.slice(0, 4)).map((evento) => (
                        <LinhaArquivo key={evento.id} evento={evento} />
                      ))}
                    </div>
                    {arquivoFiltrado.length > 4 && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => setMostraArquivo((atual) => !atual)}
                          aria-expanded={mostraArquivo}
                          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-crfal-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-crfal-gray-600 transition-all hover:border-crfal-blue/40 hover:text-crfal-blue    "
                        >
                          {mostraArquivo
                            ? 'Mostrar menos'
                            : `Ver todos (${arquivoFiltrado.length})`}
                          <ChevronRight
                            className={`h-4 w-4 transition-transform ${mostraArquivo ? 'rotate-90' : ''}`}
                          />
                        </button>
                      </div>
                    )}
                  </section>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
