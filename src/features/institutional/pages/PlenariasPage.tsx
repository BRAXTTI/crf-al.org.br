import { useSearchParams, Link } from 'react-router-dom';
import { CalendarDays, CalendarClock, Clock3, MapPin, FileText, FileSignature, ExternalLink, ArrowUpRight, Video, ArrowRight, Info, CircleCheck, CircleSlash } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHero from '@/components/block/page-hero';
import { PAGE_METADATA } from '@/config/page-metadata';
import { plenaryYears, type PlenaryMeeting } from '@/config/plenarias';
import { SOCIAL_LINKS, TRANSPARENCIA_URL } from '@/config/site';
import { countdown, daysUntil, formatDate, todayInMaceio, weekday } from '@/lib/maceio';

const goldLabel = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]';
const focusRing = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2';
const externalLinkClass = `inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-crfal-blue transition-colors hover:text-crfal-blue-dark hover:underline ${focusRing}`;

function DocumentLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className={externalLinkClass}>{children}<ExternalLink className="h-3.5 w-3.5" aria-hidden /><span className="sr-only"> (abre em nova aba)</span></a>;
}

/** Espaço fixo de documento: link quando publicado, situação quando ainda não. */
function DocumentSlot({ label, icon: Icon, href, pendingText, meetingName }: { label: string; icon: typeof FileText; href?: string; pendingText: string; meetingName: string }) {
  if (href) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={`group flex min-h-16 items-center gap-3 rounded-xl border border-crfal-gray-200 bg-white px-4 py-3 transition-colors hover:border-crfal-blue hover:bg-crfal-blue-lighter/40 ${focusRing}`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-crfal-blue text-white"><Icon className="h-5 w-5" aria-hidden /></span>
      <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-crfal-gray-900">{label}<span className="sr-only"> da reunião de {meetingName}</span></span><span className="block text-xs text-crfal-gray-600">Abrir documento<span className="sr-only"> (abre em nova aba)</span></span></span>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-crfal-gray-400 transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-crfal-blue motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0" aria-hidden />
    </a>;
  }
  return <div className="flex min-h-16 items-center gap-3 rounded-xl border border-dashed border-crfal-gray-200 bg-crfal-gray-50 px-4 py-3">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-crfal-gray-400 ring-1 ring-crfal-gray-200"><Icon className="h-5 w-5" aria-hidden /></span>
    <span className="min-w-0"><span className="block text-sm font-semibold text-crfal-gray-600">{label}</span><span className="block text-xs text-crfal-gray-600">{pendingText}</span></span>
  </div>;
}

function MeetingRow({ meeting, today }: { meeting: PlenaryMeeting; today: string }) {
  const held = meeting.date < today;
  const isToday = meeting.date === today;
  const longDate = formatDate(meeting.date, { day: 'numeric', month: 'long' });
  const status = held && meeting.noQuorum ? { text: 'Sem quórum', className: 'bg-amber-50 text-amber-800 ring-amber-600/25' } : held ? { text: 'Realizada', className: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20' } : isToday ? { text: 'Hoje', className: 'bg-crfal-gold/15 text-[#8A6A12] ring-crfal-gold/40' } : { text: 'Agendada', className: 'bg-crfal-blue-lighter text-crfal-blue ring-crfal-blue/15' };

  return <li className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_460px] xl:items-center xl:gap-8">
    <div className="flex items-start gap-4">
      <time dateTime={meeting.date} className={`flex w-16 shrink-0 flex-col items-center rounded-xl border px-2 py-3 ${held ? 'border-crfal-gray-200 bg-crfal-gray-50 text-crfal-gray-700' : 'border-crfal-blue/15 bg-crfal-blue-lighter/60 text-crfal-blue'}`}>
        <span className="text-2xl font-bold leading-none tabular-nums">{meeting.date.slice(8, 10)}</span>
        <span className="mt-1.5 text-[11px] font-bold uppercase tracking-wide">{formatDate(meeting.date, { month: 'short' }).replace('.', '')}</span>
        <span className="sr-only"> de {meeting.date.slice(0, 4)}</span>
      </time>
      <div className="min-w-0 pt-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${status.className}`}>{held && (meeting.noQuorum ? <CircleSlash className="h-3 w-3" aria-hidden /> : <CircleCheck className="h-3 w-3" aria-hidden />)}{status.text}</span>
          <span className="text-xs text-crfal-gray-600">{weekday(meeting.date)}</span>
        </div>
        <h4 className="mt-2 text-base font-semibold leading-snug text-crfal-gray-900">{meeting.title}</h4>
        {(meeting.time || meeting.location) && <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-crfal-gray-600">
          {meeting.time && <p className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 shrink-0" aria-hidden />{meeting.time}</p>}
          {meeting.location && <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />{meeting.location}</p>}
        </div>}
        {held && meeting.noQuorum && <p className="mt-2 text-xs leading-relaxed text-amber-800">Não realizada por falta de quórum.</p>}
        {meeting.videoUrls?.length ? <div className="mt-1 flex flex-wrap gap-x-5">{meeting.videoUrls.map((url, index, list) => <DocumentLink key={url} href={url}><Video className="h-4 w-4" aria-hidden />{list.length > 1 ? `Assistir parte ${index + 1}` : 'Assistir'}<span className="sr-only"> à reunião de {longDate} no YouTube</span></DocumentLink>)}</div> : null}
      </div>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      <DocumentSlot label="Pauta do dia" icon={FileText} href={meeting.agendaUrl} pendingText={held ? 'Não publicada' : 'A divulgar'} meetingName={longDate} />
      <DocumentSlot label="Ata assinada" icon={FileSignature} href={meeting.minutesUrl} pendingText={held ? (meeting.noQuorum ? 'Não se aplica' : 'Ata em breve') : 'Após a reunião'} meetingName={longDate} />
    </div>
  </li>;
}

function MeetingGroup({ id, title, meetings, today }: { id: string; title: string; meetings: PlenaryMeeting[]; today: string }) {
  if (!meetings.length) return null;
  return <section aria-labelledby={id}>
    <div className="mb-3 flex items-baseline justify-between gap-3 px-1">
      <h3 id={id} className="text-sm font-bold text-crfal-gray-900">{title}</h3>
      <span className="text-xs tabular-nums text-crfal-gray-600">{meetings.length} {meetings.length === 1 ? 'reunião' : 'reuniões'}</span>
    </div>
    <ul className="divide-y divide-crfal-gray-200 overflow-hidden rounded-xl border border-crfal-gray-200 bg-white">
      {meetings.map(meeting => <MeetingRow key={meeting.id} meeting={meeting} today={today} />)}
    </ul>
  </section>;
}

export default function PlenariasPage() {
  const [params, setParams] = useSearchParams();
  const today = todayInMaceio();
  const years = [...plenaryYears].sort((a, b) => b.year - a.year);
  const selected = years.find(item => String(item.year) === params.get('ano')) ?? years[0];
  const meetings = [...(selected?.meetings ?? [])].sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? '') || a.id.localeCompare(b.id));
  const upcoming = meetings.filter(meeting => meeting.date >= today);
  const held = meetings.filter(meeting => meeting.date < today).reverse();
  const next = upcoming[0];
  const realized = held.filter(meeting => !meeting.noQuorum);
  const noQuorum = held.length - realized.length;
  const publishedMinutes = realized.filter(meeting => meeting.minutesUrl).length;
  const youtube = SOCIAL_LINKS.find(item => item.label === 'YouTube')!;
  const metadata = PAGE_METADATA['/instituicao/plenarias'];

  return (
    <div id="plenarias-page" className="min-h-screen bg-crfal-gray-50">
      <SEO {...metadata} path="/instituicao/plenarias" />
      <PageHero title="Plenárias" breadcrumb={[{ label: 'Início', href: '/' }, { label: 'Instituição', href: '/instituicao' }, { label: 'Plenárias' }]} />

      <div className="container-crfal py-10 sm:py-14">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className={goldLabel}>Conselho Pleno</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-crfal-gray-900 sm:text-3xl">Agenda de reuniões</h2>
            <span aria-hidden className="mt-3 block h-0.5 w-10 rounded-full bg-crfal-gold" />
            <p className="mt-3 text-sm leading-relaxed text-crfal-gray-600 sm:text-base">Datas das reuniões plenárias do CRF-AL, com a pauta do dia e a ata assinada de cada encontro.</p>
          </div>
          <a href={youtube.href} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-12 w-fit shrink-0 items-center gap-3 rounded-xl border border-crfal-gray-200 bg-white px-5 py-3 text-sm font-semibold text-crfal-blue transition-colors hover:border-crfal-blue hover:bg-crfal-blue-lighter ${focusRing} focus-visible:ring-offset-4`}><Video className="h-5 w-5" aria-hidden />Canal no YouTube<ExternalLink className="h-3.5 w-3.5" aria-hidden /><span className="sr-only"> do CRF-AL (abre em nova aba)</span></a>
        </div>

        {selected?.isDemo && <div role="note" className="mb-8 flex items-start gap-3 rounded-xl border border-crfal-blue/15 bg-crfal-blue-lighter/60 px-4 py-4 text-sm leading-relaxed text-crfal-blue sm:px-5">
          <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <p><strong className="font-bold">Agenda demonstrativa.</strong> Datas, horários e locais são exemplos e não correspondem à programação oficial do CRF-AL.</p>
        </div>}

        {next && <section aria-labelledby="next-meeting-title" className="relative isolate mb-8 overflow-hidden rounded-2xl border-t-2 border-crfal-gold bg-linear-to-br/srgb from-crfal-blue to-crfal-blue-dark p-6 text-white sm:p-8">
          <CalendarClock className="pointer-events-none absolute -right-6 -top-6 -z-10 h-44 w-44 text-white opacity-[0.06]" aria-hidden />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <time dateTime={next.date} className="flex w-20 shrink-0 flex-col items-center rounded-xl bg-white/10 px-2 py-3 ring-1 ring-crfal-gold/50">
                <span className="text-3xl font-bold leading-none tabular-nums">{next.date.slice(8, 10)}</span>
                <span className="mt-1.5 text-xs font-bold uppercase tracking-wide text-crfal-gold">{formatDate(next.date, { month: 'short' }).replace('.', '')}</span>
              </time>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-crfal-gold">Próxima reunião · {countdown(daysUntil(next.date, today))}</p>
                <h2 id="next-meeting-title" className="mt-1.5 text-xl font-bold sm:text-2xl">{next.title}</h2>
                <p className="mt-1 text-sm text-white/80">{weekday(next.date)}, {formatDate(next.date, { day: 'numeric', month: 'long', year: 'numeric' })}{next.time && ` · ${next.time}`}{next.location && ` · ${next.location}`}</p>
              </div>
            </div>
            {next.agendaUrl
              ? <a href={next.agendaUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-crfal-blue transition-colors hover:bg-crfal-blue-lighter focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-gold focus-visible:ring-offset-2 focus-visible:ring-offset-crfal-blue"><FileText className="h-4 w-4" aria-hidden />Ver pauta do dia<ExternalLink className="h-3.5 w-3.5" aria-hidden /><span className="sr-only"> (abre em nova aba)</span></a>
              : <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/85 ring-1 ring-white/15"><FileText className="h-4 w-4" aria-hidden />Pauta a divulgar</p>}
          </div>
        </section>}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_256px] lg:gap-8">
          <aside aria-labelledby="agenda-summary-title" className="rounded-xl border border-crfal-gray-200 bg-white lg:order-last lg:sticky lg:top-[calc(var(--header-offset)+24px)]">
            <div className="border-b border-crfal-gray-200 px-5 py-5">
              <h2 id="agenda-summary-title" className="text-sm font-bold text-crfal-gray-900">Resumo de {selected?.year ?? 'agenda'}</h2>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-center sm:grid-cols-4 lg:grid-cols-1 lg:text-left">
                {[['Reuniões', meetings.length], ['Realizadas', realized.length], ['Sem quórum', noQuorum], ['A realizar', upcoming.length]].map(([label, value]) => <div key={label} className="rounded-lg bg-crfal-gray-50 px-2 py-3 lg:flex lg:items-baseline lg:justify-between lg:px-3 lg:py-2">
                  <dt className="text-xs text-crfal-gray-600">{label}</dt>
                  <dd className="mt-1 text-lg font-bold tabular-nums text-crfal-gray-900 lg:mt-0 lg:text-base">{value}</dd>
                </div>)}
              </dl>
              {realized.length > 0 && <div className="mt-4">
                <div className="flex items-baseline justify-between text-xs"><span className="font-semibold text-crfal-gray-700">Atas publicadas</span><span className="tabular-nums text-crfal-gray-600">{publishedMinutes} de {realized.length}</span></div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-crfal-gray-200" role="progressbar" aria-label="Atas publicadas" aria-valuemin={0} aria-valuemax={realized.length} aria-valuenow={publishedMinutes}><div className="h-full rounded-full bg-crfal-gold" style={{ width: `${(publishedMinutes / realized.length) * 100}%` }} /></div>
              </div>}
            </div>
            <div className="p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-crfal-gray-900"><FileText className="h-4 w-4 text-crfal-blue" aria-hidden />Documentos</div>
              <p className="text-xs leading-relaxed text-crfal-gray-600">A pauta é divulgada antes de cada reunião; a ata, depois de assinada.</p>
              {selected?.calendarUrl && <div className="mt-3"><DocumentLink href={selected.calendarUrl}>Agenda anual de {selected.year}</DocumentLink></div>}
              <div className="mt-3"><DocumentLink href={TRANSPARENCIA_URL}>Portal da Transparência</DocumentLink></div>
            </div>
          </aside>

          <section aria-labelledby="agenda-title" className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-crfal-gray-200 bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-crfal-blue-lighter text-crfal-blue"><CalendarDays className="h-5 w-5" aria-hidden /></div>
                <div><h2 id="agenda-title" className="text-base font-bold text-crfal-gray-900">Calendário anual</h2><p className="mt-0.5 text-xs text-crfal-gray-600">{meetings.length ? `${meetings.length} ${meetings.length === 1 ? 'reunião' : 'reuniões'}${selected?.isDemo ? ' de exemplo' : ''}` : 'Programação a disponibilizar'}</p></div>
              </div>
              {selected && <div className="flex flex-wrap gap-2" role="group" aria-label="Ano da agenda">
                {years.map(item => <button key={item.year} type="button" aria-pressed={selected.year === item.year} onClick={() => setParams(previous => { const nextParams = new URLSearchParams(previous); nextParams.set('ano', String(item.year)); return nextParams; })} className={`min-h-11 cursor-pointer rounded-lg border px-4 py-2 text-sm font-bold transition-colors ${focusRing} ${selected.year === item.year ? 'border-crfal-blue bg-crfal-blue text-white' : 'border-crfal-gray-200 bg-white text-crfal-gray-600 hover:border-crfal-blue hover:text-crfal-blue'}`}>{item.year}</button>)}
              </div>}
            </div>

            <div aria-live="polite" aria-atomic="true">
              {meetings.length === 0 ? <div className="rounded-xl border border-crfal-gray-200 bg-white px-6 py-12 text-center sm:px-10">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-crfal-blue-lighter text-crfal-blue"><CalendarDays className="h-7 w-7" aria-hidden /></div>
                <h3 className="text-lg font-bold text-crfal-gray-900">Agenda{selected ? ` de ${selected.year}` : ''} ainda não disponível</h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-crfal-gray-600">As datas, os horários e os locais serão apresentados aqui quando a programação for disponibilizada. Você também pode consultar os canais oficiais do Conselho.</p>
                <Link to="/contato" className={`${externalLinkClass} mt-5`}>Fale com o CRF-AL<ArrowRight className="h-4 w-4" aria-hidden /></Link>
              </div> : <div className="space-y-8">
                <MeetingGroup id="upcoming-title" title="Próximas reuniões" meetings={upcoming} today={today} />
                <MeetingGroup id="held-title" title="Reuniões anteriores" meetings={held} today={today} />
              </div>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
