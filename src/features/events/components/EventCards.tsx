import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Ban,
  Building2,
  Calendar,
  CalendarDays,
  ChevronRight,
  ExternalLink,
  MapPin,
  Monitor,
} from 'lucide-react';
import {
  MODALIDADE_ICONS,
  MODALIDADE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  formatarData,
  type Evento,
} from '../utils';

const IMG_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect width='400' height='200' fill='%23e5e7eb'%3E%3C/svg%3E";

/** Extrai dia e mês ("07", "SET") de "YYYY-MM-DD HH:mm:ss". */
function diaEMes(data: string): { dia: string; mes: string } | null {
  if (!data || data.length < 10) return null;
  const [ano, mes, dia] = data.slice(0, 10).split('-').map(Number);
  const nome = new Date(Date.UTC(ano, mes - 1, dia))
    .toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' })
    .replace('.', '');
  return { dia: String(dia).padStart(2, '0'), mes: nome.toUpperCase() };
}

export function SecaoTitulo({ id, titulo, contador }: { id: string; titulo: string; contador: number }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <h2 id={id} className="font-display text-xl font-semibold text-neutral-800  md:text-2xl">
        {titulo}
      </h2>
      <span className="rounded-full bg-crfal-blue-lighter px-2.5 py-1 text-xs font-bold text-crfal-blue  ">
        {contador}
      </span>
      <div
        aria-hidden
        className="hidden h-px flex-1 bg-linear-to-r/srgb from-crfal-gray-200 to-transparent  sm:block"
      />
    </div>
  );
}

export function BannerEvento({ evento, className = '' }: { evento: Evento; className?: string }) {
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
      className={`absolute inset-0 bg-linear-to-br/srgb from-crfal-blue via-crfal-blue-dark to-[#002a4a] transition-transform duration-700 ease-out group-hover:scale-105 ${className}`}
    >
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] bg-size-[22px_22px]" />
      <CalendarDays className="absolute right-5 top-5 h-16 w-16 text-white/15" />
    </div>
  );
}

export function EventoCard({ evento, index }: { evento: Evento; index: number }) {
  const statusConfig = STATUS_COLORS[evento.status];
  const StatusIcon = statusConfig.icon;
  const ModalidadeIcon = MODALIDADE_ICONS[evento.modalidade];
  const badge = diaEMes(evento.data);
  const inscricaoAberta =
    Boolean(evento.link) && evento.status !== 'cancelado' && evento.status !== 'encerrado';

  return (
    <article
      className="group relative flex animate-in flex-col overflow-hidden rounded-2xl border border-crfal-gray-200 bg-white shadow-card duration-500 fill-mode-backwards fade-in slide-in-from-bottom-3 transition-all hover:-translate-y-1.5 hover:border-crfal-blue/25 hover:shadow-card-hover  "
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="relative aspect-video overflow-hidden">
        <BannerEvento evento={evento} />
        {evento.status === 'cancelado' && (
          <div aria-hidden className="absolute inset-0 bg-white/40" />
        )}

        {badge && (
          <div className="absolute left-4 top-4 flex h-14 w-14 flex-col items-center justify-center rounded-xl border border-black/5 bg-white/95 shadow-lg backdrop-blur-xs">
            <span className="font-display text-xl font-bold leading-none text-crfal-blue">
              {badge.dia}
            </span>
            <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-crfal-gray-600">
              {badge.mes}
            </span>
          </div>
        )}

        <span
          className={`absolute right-4 top-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-xs ${statusConfig.bg} ${statusConfig.text}`}
        >
          <StatusIcon className="h-3 w-3" />
          {STATUS_LABELS[evento.status]}
        </span>

        <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur-xs">
          <ModalidadeIcon className="h-3.5 w-3.5" />
          {MODALIDADE_LABELS[evento.modalidade]}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col p-5">
        <h3
          className={`font-display text-lg font-semibold leading-snug transition-colors group-hover:text-crfal-blue  ${
            evento.status === 'cancelado'
              ? 'text-crfal-gray-400 line-through '
              : 'text-neutral-800 '
          }`}
        >
          <Link
            to={`/eventos/${evento.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue-light"
          >
            {evento.titulo}
          </Link>
        </h3>

        {evento.descricao && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-crfal-gray-600 ">
            {evento.descricao}
          </p>
        )}

        <div className="mt-4 space-y-2 border-t border-crfal-gray-100 pt-4 text-sm text-crfal-gray-600  ">
          <p className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-crfal-blue " />
            <span className="truncate">{formatarData(evento.data, evento.dataFim)}</span>
          </p>
          {evento.local && (
            <p className="flex items-center gap-2">
              {evento.modalidade === 'online' ? (
                <Monitor className="h-4 w-4 shrink-0 text-crfal-blue " />
              ) : (
                <MapPin className="h-4 w-4 shrink-0 text-crfal-blue " />
              )}
              <span className="truncate">{evento.local}</span>
            </p>
          )}
          {evento.publico && (
            <p className="flex items-center gap-2">
              <Building2 className="h-4 w-4 shrink-0 text-crfal-blue " />
              <span className="truncate">{evento.publico}</span>
            </p>
          )}
        </div>
      </div>

      <div className="relative flex items-center justify-between gap-3 border-t border-crfal-gray-100 px-5 py-3.5 ">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-crfal-blue transition-all group-hover:gap-2.5 ">
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

export function LinhaArquivo({ evento }: { evento: Evento }) {
  const badge = diaEMes(evento.data);
  const cancelado = evento.status === 'cancelado';

  return (
    <Link
      to={`/eventos/${evento.slug}`}
      className={`group relative flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-crfal-gray-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-crfal-blue-light  sm:px-5 ${
        cancelado ? 'opacity-80' : ''
      }`}
    >
      {badge && (
        <div
          className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border ${
            cancelado
              ? 'border-red-100 bg-red-50 text-red-400  '
              : 'border-crfal-gray-200 bg-crfal-gray-50 text-crfal-gray-600  '
          }`}
        >
          <span className="font-display text-base font-bold leading-none">{badge.dia}</span>
          <span className="text-[9px] font-bold uppercase tracking-wider">{badge.mes}</span>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-semibold transition-colors group-hover:text-crfal-blue  ${
            cancelado
              ? 'text-crfal-gray-400 line-through '
              : 'text-neutral-700 '
          }`}
        >
          {evento.titulo}
        </p>
        <p className="mt-0.5 truncate text-xs text-crfal-gray-500 ">
          {formatarData(evento.data, evento.dataFim)}
          {evento.local ? ` · ${evento.local}` : ''}
        </p>
      </div>

      <span
        className={`hidden shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex ${
          cancelado
            ? 'bg-red-50 text-red-600  '
            : 'bg-crfal-gray-100 text-crfal-gray-600  '
        }`}
      >
        {cancelado && <Ban className="h-3 w-3" />}
        {STATUS_LABELS[evento.status]}
      </span>

      <ChevronRight className="h-4 w-4 shrink-0 text-crfal-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-crfal-blue " />
    </Link>
  );
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-crfal-gray-200 bg-white  ">
      <div className="aspect-video animate-pulse bg-crfal-gray-100 " />
      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-crfal-gray-100 " />
        <div className="h-3.5 w-full animate-pulse rounded bg-crfal-gray-100 " />
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-crfal-gray-100 " />
        <div className="h-10 w-full animate-pulse rounded-lg bg-crfal-gray-100 " />
      </div>
    </div>
  );
}

