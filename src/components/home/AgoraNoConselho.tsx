import { useState, type ElementType, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CalendarDays, Clock, Landmark } from 'lucide-react';
import { BorderBeam } from '@/components/ui/border-beam';
import { useInView } from '@/hooks/useInView';
import { plenaryYears } from '@/config/plenarias';
import { mapEvent, formatarData } from '@/features/events/utils';
import { countdown, daysUntil, formatDate, todayInMaceio, useStatusAtendimento, weekday } from '@/lib/maceio';
import { useEvents } from '@/services/wordpress/event-hooks';

const BEAM_LENGTH = 0.22; // rastro do feixe, em fração do perímetro medido do painel
const BEAM_SPEED = 935; // px/s constantes: ~3s por volta no painel de ~1216×209px do desktop (perímetro ~2806px; a altura varia com o conteúdo)

const focusRing = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2';
const actionClass = `group inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-semibold text-crfal-blue transition-colors hover:text-crfal-blue-light motion-reduce:transition-none ${focusRing}`;

function Item({ icon: Icon, label, children, actions }: { icon: ElementType; label: ReactNode; children: ReactNode; actions?: ReactNode }) {
  return (
    <li className="flex gap-4 py-5 first:pt-0 last:pb-0 lg:px-7 lg:py-0 lg:first:pl-0 lg:last:pr-0">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-crfal-blue-lighter text-crfal-blue">
        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-crfal-gray-600">{label}</p>
        <div className="mt-0.5 text-[15px] font-bold leading-snug text-crfal-blue-dark">{children}</div>
        {actions && <div className="-mb-2 mt-1 flex flex-wrap gap-x-5">{actions}</div>}
      </div>
    </li>
  );
}

function InternalAction({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className={actionClass}>
      {children}
      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
    </Link>
  );
}

function ExternalAction({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={actionClass}>
      {children}
      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  );
}

function Atendimento() {
  const status = useStatusAtendimento();
  return (
    <Item icon={Clock} label="Atendimento" actions={<InternalAction to="/contato">Fale Conosco</InternalAction>}>
      <span className="inline-flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
          {status.aberto && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:hidden" />}
          <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${status.aberto ? 'bg-emerald-600' : 'bg-crfal-gray-400'}`} />
        </span>
        {status.texto}
      </span>
      <span className="block text-sm font-normal text-crfal-gray-600">Seg. a sex., das 9h às 17h</span>
    </Item>
  );
}

function Plenaria({ today }: { today: string }) {
  const meetings = plenaryYears.flatMap((year) => year.meetings).sort((a, b) => a.date.localeCompare(b.date));
  const next = meetings.find((meeting) => meeting.date >= today);
  const last = [...meetings].reverse().find((meeting) => meeting.date < today);
  const meeting = next ?? last;
  if (!meeting) return null;

  const video = meeting.videoUrls?.[0];
  return (
    <Item
      icon={Landmark}
      label={next ? 'Próxima plenária' : 'Última plenária'}
      actions={
        <>
          {meeting.agendaUrl && <ExternalAction href={meeting.agendaUrl}>Pauta do dia</ExternalAction>}
          {video && <ExternalAction href={video}>Assistir</ExternalAction>}
          <InternalAction to="/instituicao/plenarias">Plenárias</InternalAction>
        </>
      }
    >
      <time dateTime={meeting.date}>{weekday(meeting.date)}, {formatDate(meeting.date, { day: 'numeric', month: 'long' })}</time>
      <span className="block text-sm font-normal text-crfal-gray-600">{meeting.title}{next && ` · ${countdown(daysUntil(meeting.date, today)).toLowerCase()}`}</span>
    </Item>
  );
}

function Evento() {
  const { data, isLoading, isError } = useEvents();

  if (isLoading) {
    return (
      <li className="flex gap-4 py-5 last:pb-0 lg:px-7 lg:py-0 lg:last:pr-0" aria-hidden="true">
        <span className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-crfal-gray-100 motion-reduce:animate-none" />
        <div className="flex-1 space-y-2 pt-1">
          <span className="block h-3 w-28 animate-pulse rounded bg-crfal-gray-100 motion-reduce:animate-none" />
          <span className="block h-4 w-4/5 animate-pulse rounded bg-crfal-gray-100 motion-reduce:animate-none" />
          <span className="block h-3 w-24 animate-pulse rounded bg-crfal-gray-100 motion-reduce:animate-none" />
        </div>
      </li>
    );
  }
  if (isError || !data) return null;

  const evento = data
    .map(mapEvent)
    .filter((e) => e.status === 'em-andamento' || e.status === 'em-breve')
    .sort((a, b) => a.data.localeCompare(b.data))[0];

  if (!evento) {
    return (
      <Item icon={CalendarDays} label="Eventos" actions={<InternalAction to="/eventos">Ver eventos</InternalAction>}>
        Nenhum evento agendado no momento
      </Item>
    );
  }

  return (
    <Item
      icon={CalendarDays}
      label={evento.status === 'em-andamento' ? 'Evento em andamento' : 'Próximo evento'}
      actions={<InternalAction to={`/eventos/${evento.slug}`}>Ver evento</InternalAction>}
    >
      <span className="line-clamp-2">{evento.titulo}</span>
      <span className="block text-sm font-normal text-crfal-gray-600">
        {formatarData(evento.data, evento.dataFim)}{evento.local && ` · ${evento.local}`}
      </span>
    </Item>
  );
}

/** Sinais do Conselho em funcionamento: expediente, plenária e evento, só com dados reais. */
export default function AgoraNoConselho() {
  const today = todayInMaceio();
  // Feixe de uma volta só, na primeira vez que o painel entra na tela; ao terminar, sai de vez.
  const { ref, inView } = useInView<HTMLDivElement>();
  const [beamDone, setBeamDone] = useState(
    () => typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  return (
    <section aria-labelledby="agora-title" className="pb-2 sm:pb-3">
      <div className="container-crfal">
        <div ref={ref} className="relative rounded-2xl border border-crfal-gray-200/80 bg-white px-5 py-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_48px_-32px_rgba(11,25,44,0.18)] sm:rounded-3xl sm:px-6 sm:py-7 md:px-8 lg:grid lg:grid-cols-[11rem_1fr] lg:items-start lg:gap-10 lg:px-12 lg:py-8">
          {inView && !beamDone && (
            <BorderBeam length={BEAM_LENGTH} speed={BEAM_SPEED} colorFrom="#ed3237" colorTo="#0092d5" onComplete={() => setBeamDone(true)} />
          )}
          <div className="mb-5 lg:mb-0">
            <h2 id="agora-title" className="text-xl font-bold tracking-tight text-crfal-blue sm:text-[22px]">Agora no CRF-AL</h2>
            <p className="mt-1 text-sm text-crfal-gray-600">
              <time dateTime={today}>{weekday(today)}, {formatDate(today, { day: 'numeric', month: 'long' })}</time>
            </p>
          </div>
          <ul className="divide-y divide-crfal-gray-200 lg:grid lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            <Atendimento />
            <Plenaria today={today} />
            <Evento />
          </ul>
        </div>
      </div>
    </section>
  );
}
