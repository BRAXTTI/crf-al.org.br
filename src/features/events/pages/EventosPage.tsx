import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Ban,
  Building2,
  Calendar,
  CalendarDays,
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
import { useEvents } from '@/services/wordpress/hooks';
import {
  MODALIDADE_ICONS,
  MODALIDADE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  formatarData,
  mapEvent,
  parseWPDateTime,
  type Evento,
  type ModalidadeEvento,
  type StatusEvento,
} from '../utils';

const IMG_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect width='400' height='200' fill='%23e5e7eb'%3E%3C/svg%3E";

type FiltroStatus = StatusEvento | 'todos';
type FiltroModalidade = ModalidadeEvento | 'todas';

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Extrai dia e mês ("07", "SET") de "YYYY-MM-DD HH:mm:ss". */
function diaEMes(data: string): { dia: string; mes: string } | null {
  if (!data || data.length < 10) return null;
  const [ano, mes, dia] = data.slice(0, 10).split('-').map(Number);
  const nome = new Date(Date.UTC(ano, mes - 1, dia))
    .toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' })
    .replace('.', '');
  return { dia: String(dia).padStart(2, '0'), mes: nome.toUpperCase() };
}

/** Rótulo de contagem regressiva ("É hoje!", "Amanhã", "Em X dias"). */
function rotuloContagem(data: string): string | null {
  const ts = parseWPDateTime(data);
  if (ts === null) return null;
  const inicio = new Date(ts);
  const hoje = new Date();
  if (
    inicio.getFullYear() === hoje.getFullYear() &&
    inicio.getMonth() === hoje.getMonth() &&
    inicio.getDate() === hoje.getDate()
  ) {
    return 'É hoje!';
  }
  const diffDias = Math.round(
    (new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate()).getTime() -
      new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime()) /
      86_400_000
  );
  if (diffDias === 1) return 'Amanhã';
  if (diffDias > 1) return `Em ${diffDias} dias`;
  return null;
}

function SecaoTitulo({ id, titulo, contador }: { id: string; titulo: string; contador: number }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <h2 id={id} className="font-display text-xl font-semibold text-neutral-800 dark:text-slate-100 md:text-2xl">
        {titulo}
      </h2>
      <span className="rounded-full bg-crfal-blue-lighter px-2.5 py-1 text-xs font-bold text-crfal-blue dark:bg-crfal-blue/20 dark:text-sky-300">
        {contador}
      </span>
      <div
        aria-hidden
        className="hidden h-px flex-1 bg-gradient-to-r from-crfal-gray-200 to-transparent dark:from-slate-700 sm:block"
      />
    </div>
  );
}

function BannerEvento({ evento, className = '' }: { evento: Evento; className?: string }) {
  if (evento.banner) {
    return (
      <img
        src={evento.banner}
        alt=""
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = IMG_FALLBACK;
        }}
        className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${className}`}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={`absolute inset-0 bg-gradient-to-br from-crfal-blue via-crfal-blue-dark to-[#002a4a] transition-transform duration-700 ease-out group-hover:scale-105 ${className}`}
    >
      <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:22px_22px]" />
      <CalendarDays className="absolute right-5 top-5 h-16 w-16 text-white/15" />
    </div>
  );
}

function EventoCard({ evento, index }: { evento: Evento; index: number }) {
  const statusConfig = STATUS_COLORS[evento.status];
  const StatusIcon = statusConfig.icon;
  const ModalidadeIcon = MODALIDADE_ICONS[evento.modalidade];
  const badge = diaEMes(evento.data);
  const inscricaoAberta =
    Boolean(evento.link) && evento.status !== 'cancelado' && evento.status !== 'encerrado';

  return (
    <article
      className="group relative flex animate-in flex-col overflow-hidden rounded-2xl border border-crfal-gray-200 bg-white shadow-card duration-500 fill-mode-backwards fade-in slide-in-from-bottom-3 transition-all hover:-translate-y-1.5 hover:border-crfal-blue/25 hover:shadow-card-hover dark:border-slate-700 dark:bg-slate-900"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <BannerEvento evento={evento} />
        {evento.status === 'cancelado' && (
          <div aria-hidden className="absolute inset-0 bg-white/40" />
        )}

        {badge && (
          <div className="absolute left-4 top-4 flex h-14 w-14 flex-col items-center justify-center rounded-xl border border-black/5 bg-white/95 shadow-lg backdrop-blur-sm">
            <span className="font-display text-xl font-bold leading-none text-crfal-blue">
              {badge.dia}
            </span>
            <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-crfal-gray-600">
              {badge.mes}
            </span>
          </div>
        )}

        <span
          className={`absolute right-4 top-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${statusConfig.bg} ${statusConfig.text}`}
        >
          <StatusIcon className="h-3 w-3" />
          {STATUS_LABELS[evento.status]}
        </span>

        <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          <ModalidadeIcon className="h-3.5 w-3.5" />
          {MODALIDADE_LABELS[evento.modalidade]}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col p-5">
        <h3
          className={`font-display text-lg font-semibold leading-snug transition-colors group-hover:text-crfal-blue dark:group-hover:text-sky-300 ${
            evento.status === 'cancelado'
              ? 'text-crfal-gray-400 line-through dark:text-slate-500'
              : 'text-neutral-800 dark:text-slate-100'
          }`}
        >
          <Link
            to={`/eventos/${evento.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue-light"
          >
            {evento.titulo}
          </Link>
        </h3>

        {evento.descricao && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-crfal-gray-600 dark:text-slate-400">
            {evento.descricao}
          </p>
        )}

        <div className="mt-4 space-y-2 border-t border-crfal-gray-100 pt-4 text-sm text-crfal-gray-600 dark:border-slate-800 dark:text-slate-400">
          <p className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-crfal-blue dark:text-sky-400" />
            <span className="truncate">{formatarData(evento.data, evento.dataFim)}</span>
          </p>
          {evento.local && (
            <p className="flex items-center gap-2">
              {evento.modalidade === 'online' ? (
                <Monitor className="h-4 w-4 shrink-0 text-crfal-blue dark:text-sky-400" />
              ) : (
                <MapPin className="h-4 w-4 shrink-0 text-crfal-blue dark:text-sky-400" />
              )}
              <span className="truncate">{evento.local}</span>
            </p>
          )}
          {evento.publico && (
            <p className="flex items-center gap-2">
              <Building2 className="h-4 w-4 shrink-0 text-crfal-blue dark:text-sky-400" />
              <span className="truncate">{evento.publico}</span>
            </p>
          )}
        </div>
      </div>

      <div className="relative flex items-center justify-between gap-3 border-t border-crfal-gray-100 px-5 py-3.5 dark:border-slate-800">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-crfal-blue transition-all group-hover:gap-2.5 dark:text-sky-300">
          Ver detalhes
          <ArrowRight className="h-4 w-4" />
        </span>
        {inscricaoAberta && (
          <a
            href={evento.link}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 inline-flex min-h-[36px] items-center rounded-full bg-crfal-blue px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-crfal-blue-dark active:scale-95"
          >
            Inscrever-se
            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </article>
  );
}

function LinhaArquivo({ evento }: { evento: Evento }) {
  const badge = diaEMes(evento.data);
  const cancelado = evento.status === 'cancelado';

  return (
    <Link
      to={`/eventos/${evento.slug}`}
      className={`group relative flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-crfal-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-crfal-blue-light dark:hover:bg-slate-800/60 sm:px-5 ${
        cancelado ? 'opacity-80' : ''
      }`}
    >
      {badge && (
        <div
          className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border ${
            cancelado
              ? 'border-red-100 bg-red-50 text-red-400 dark:border-red-900/40 dark:bg-red-900/20'
              : 'border-crfal-gray-200 bg-crfal-gray-50 text-crfal-gray-600 dark:border-slate-700 dark:bg-slate-800'
          }`}
        >
          <span className="font-display text-base font-bold leading-none">{badge.dia}</span>
          <span className="text-[9px] font-bold uppercase tracking-wider">{badge.mes}</span>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-semibold transition-colors group-hover:text-crfal-blue dark:group-hover:text-sky-300 ${
            cancelado
              ? 'text-crfal-gray-400 line-through dark:text-slate-500'
              : 'text-neutral-700 dark:text-slate-200'
          }`}
        >
          {evento.titulo}
        </p>
        <p className="mt-0.5 truncate text-xs text-crfal-gray-500 dark:text-slate-400">
          {formatarData(evento.data, evento.dataFim)}
          {evento.local ? ` · ${evento.local}` : ''}
        </p>
      </div>

      <span
        className={`hidden shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex ${
          cancelado
            ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
            : 'bg-crfal-gray-100 text-crfal-gray-600 dark:bg-slate-800 dark:text-slate-400'
        }`}
      >
        {cancelado && <Ban className="h-3 w-3" />}
        {STATUS_LABELS[evento.status]}
      </span>

      <ChevronRight className="h-4 w-4 shrink-0 text-crfal-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-crfal-blue dark:text-slate-600" />
    </Link>
  );
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-crfal-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="aspect-[16/9] animate-pulse bg-crfal-gray-100 dark:bg-slate-800" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-crfal-gray-100 dark:bg-slate-800" />
        <div className="h-3.5 w-full animate-pulse rounded bg-crfal-gray-100 dark:bg-slate-800" />
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-crfal-gray-100 dark:bg-slate-800" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-crfal-gray-100 dark:bg-slate-800" />
      </div>
    </div>
  );
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
    <div className="min-h-screen bg-crfal-gray-50 dark:bg-slate-950">
      <SEO
        title="Eventos"
        description="Confira a agenda de eventos do CRF-AL — Conselho Regional de Farmácia de Alagoas. Congressos, palestras, capacitações e ações sociais."
        path="/eventos"
      />

      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-crfal-blue via-crfal-blue-dark to-[#002a4a]">
        <div aria-hidden className="absolute inset-0">
          <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:26px_26px]" />
          <div className="absolute -left-24 -top-24 h-96 w-96 animate-float rounded-full bg-crfal-blue-light/25 blur-3xl" />
          <div className="absolute -bottom-32 right-0 h-[26rem] w-[26rem] rounded-full bg-[#0066CC]/20 blur-3xl" />
          <div className="absolute right-1/4 top-10 h-40 w-40 rounded-full bg-crfal-gold/20 blur-3xl" />
        </div>

        <div className="container-crfal relative z-10 pb-14 pt-28 md:pb-20 md:pt-36">
          <nav aria-label="Trilha de navegação" className="mb-6 flex items-center gap-2 text-sm text-white/60">
            <Link to="/" className="transition-colors hover:text-white">Início</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">Eventos</span>
          </nav>

          <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
            <Sparkles className="h-4 w-4 text-crfal-gold" />
            Agenda oficial · CRF-AL
          </p>

          <h1 className="max-w-3xl font-display text-[2.25rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Agenda de{' '}
            <span className="bg-gradient-to-r from-[#8FC1F2] to-crfal-gold bg-clip-text text-transparent">
              Eventos
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
            Congressos, palestras, capacitações e ações sociais promovidos pelo
            Conselho Regional de Farmácia de Alagoas. Inscreva-se e participe.
          </p>

          <dl className="mt-9 grid max-w-lg grid-cols-3 gap-3">
            {[
              { valor: ativos.length, rotulo: 'Próximos' },
              { valor: ativos.filter((e) => e.modalidade === 'online').length, rotulo: 'Online' },
              {
                valor: ativos.filter((e) => e.modalidade !== 'online').length,
                rotulo: 'Presenciais',
              },
            ].map((item) => (
              <div
                key={item.rotulo}
                className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm"
              >
                <dd className="font-display text-2xl font-bold text-white sm:text-3xl">{item.valor}</dd>
                <dt className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-white/70">
                  {item.rotulo}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <main className="container-crfal py-8 md:py-12">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-8 text-center dark:border-red-900/30 dark:bg-slate-900">
            <p className="mb-4 text-red-600 dark:text-red-400">Não foi possível carregar os eventos agora.</p>
            <p className="mb-6 text-sm text-crfal-gray-500 dark:text-slate-400">
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
          <div className="rounded-2xl border border-dashed border-crfal-gray-300 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-crfal-blue-lighter dark:bg-crfal-blue/10">
              <CalendarDays className="h-8 w-8 text-crfal-blue dark:text-sky-400" />
            </div>
            <h2 className="font-display text-xl font-semibold text-neutral-800 dark:text-slate-100">
              Nenhum evento cadastrado
            </h2>
            <p className="mt-2 text-crfal-gray-500 dark:text-slate-400">
              Novos eventos serão publicados em breve. Volte novamente mais tarde.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Destaque: próximo evento */}
            {destaque && (
              <section aria-labelledby="destaque-titulo">
                <SecaoTitulo id="destaque-titulo" titulo="Próximo evento" contador={1} />
                <article className="group relative grid overflow-hidden rounded-2xl border border-crfal-gray-200 bg-white shadow-card transition-all duration-500 hover:shadow-card-hover dark:border-slate-700 dark:bg-slate-900 md:grid-cols-2">
                  <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[16/8] md:aspect-auto md:min-h-[340px]">
                    <BannerEvento evento={destaque} />
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-crfal-gold px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                      <Sparkles className="h-3.5 w-3.5" />
                      Destaque
                    </span>
                    {rotuloContagemDestaque && (
                      <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-sm font-bold text-crfal-blue shadow-lg backdrop-blur-sm">
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
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-crfal-blue-lighter px-2.5 py-1 text-[11px] font-semibold text-crfal-blue dark:bg-crfal-blue/20 dark:text-sky-300">
                        {(() => {
                          const MIcon = MODALIDADE_ICONS[destaque.modalidade];
                          return <MIcon className="h-3 w-3" />;
                        })()}
                        {MODALIDADE_LABELS[destaque.modalidade]}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl font-semibold leading-tight text-neutral-800 dark:text-slate-100 md:text-3xl">
                      <Link
                        to={`/eventos/${destaque.slug}`}
                        className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue-light"
                      >
                        {destaque.titulo}
                      </Link>
                    </h3>

                    {destaque.descricao && (
                      <p className="line-clamp-3 text-sm leading-relaxed text-crfal-gray-600 dark:text-slate-400 md:text-base">
                        {destaque.descricao}
                      </p>
                    )}

                    <div className="space-y-1.5 text-sm text-crfal-gray-600 dark:text-slate-400">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0 text-crfal-blue dark:text-sky-400" />
                        {formatarData(destaque.data, destaque.dataFim)}
                      </p>
                      {destaque.local && (
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0 text-crfal-blue dark:text-sky-400" />
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
            <div className="sticky top-[72px] z-30 rounded-2xl border border-crfal-gray-200/80 bg-white/85 p-3 shadow-card backdrop-blur-lg dark:border-slate-700/80 dark:bg-slate-900/85 sm:p-4">
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
                    className="w-full min-h-[44px] rounded-full border border-crfal-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-neutral-800 transition-colors placeholder:text-crfal-gray-400 focus:border-crfal-blue-light focus:outline-none focus:ring-2 focus:ring-crfal-blue-light/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
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
                  className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {filtros.map((filtro) => (
                    <button
                      key={filtro.value}
                      onClick={() => setFiltroStatus(filtro.value)}
                      aria-pressed={filtroStatus === filtro.value}
                      className={`inline-flex min-h-[44px] shrink-0 snap-start items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue-light ${
                        filtroStatus === filtro.value
                          ? 'bg-crfal-blue text-white shadow-md'
                          : 'bg-crfal-gray-100 text-crfal-gray-600 hover:bg-crfal-gray-200 hover:text-crfal-blue dark:bg-slate-800 dark:text-slate-300 dark:hover:text-sky-300'
                      }`}
                    >
                      {filtro.label}
                      <span
                        className={`rounded-full px-1.5 text-[11px] font-bold ${
                          filtroStatus === filtro.value
                            ? 'bg-white/20 text-white'
                            : 'bg-white text-crfal-gray-500 dark:bg-slate-700 dark:text-slate-400'
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
                  className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:ml-auto"
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
                        className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue-light ${
                          ativo
                            ? 'border-crfal-blue bg-crfal-blue text-white'
                            : 'border-crfal-gray-200 bg-white text-crfal-gray-600 hover:border-crfal-blue/40 hover:text-crfal-blue dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
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
                <p className="mt-3 flex items-center gap-2 border-t border-crfal-gray-100 pt-3 text-xs text-crfal-gray-500 dark:border-slate-800 dark:text-slate-400">
                  {totalResultados} resultado{totalResultados !== 1 ? 's' : ''} encontrado
                  {totalResultados !== 1 ? 's' : ''}
                  <button
                    onClick={limparFiltros}
                    className="ml-auto inline-flex min-h-[32px] items-center gap-1 font-semibold text-crfal-blue transition-colors hover:underline dark:text-sky-300"
                  >
                    <X className="h-3.5 w-3.5" />
                    Limpar filtros
                  </button>
                </p>
              )}
            </div>

            {totalResultados === 0 ? (
              <div className="rounded-2xl border border-dashed border-crfal-gray-300 bg-white py-14 text-center dark:border-slate-700 dark:bg-slate-900">
                <Search className="mx-auto mb-3 h-10 w-10 text-crfal-gray-300 dark:text-slate-600" />
                <h2 className="font-display text-lg font-semibold text-neutral-800 dark:text-slate-100">
                  Nenhum evento encontrado
                </h2>
                <p className="mt-1 text-sm text-crfal-gray-500 dark:text-slate-400">
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
                    <div className="divide-y divide-crfal-gray-100 overflow-hidden rounded-2xl border border-crfal-gray-200 bg-white dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-900">
                      {(mostraArquivo ? arquivoFiltrado : arquivoFiltrado.slice(0, 4)).map((evento) => (
                        <LinhaArquivo key={evento.id} evento={evento} />
                      ))}
                    </div>
                    {arquivoFiltrado.length > 4 && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => setMostraArquivo((atual) => !atual)}
                          aria-expanded={mostraArquivo}
                          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-crfal-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-crfal-gray-600 transition-all hover:border-crfal-blue/40 hover:text-crfal-blue dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-sky-300"
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
      </main>
    </div>
  );
}
