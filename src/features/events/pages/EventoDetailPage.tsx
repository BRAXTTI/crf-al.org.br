import { useEffect, useMemo, useState, type ElementType } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Ban,
  Building2,
  Calendar,
  ExternalLink,
  MapPin,
  Monitor,
  RefreshCw,
} from 'lucide-react';
import SEO from '@/components/SEO';
import { SITE_URL } from '@/config/site';
import { eventsCalendar } from '@/lib/calendar';
import PageHero, { PageHeroAction } from '@/components/block/page-hero';
import { getPostImage, getPostImageSet, stripHTML } from '@/services/wordpress/client';
import { sanitizeWP } from '@/services/wordpress/sanitize';
import { useEventBySlug, useRelatedEvents } from '@/services/wordpress/event-hooks';
import type { CRFEvent } from '@/services/wordpress/types';
import type { WPEventListing } from '@/services/wordpress/types';
import { EventoCard } from '../components/EventCards';
import {
  acoesDoEvento,
  MODALIDADE_ICONS,
  MODALIDADE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  formatarDataExtenso,
  formatarHorario,
  rotuloContagem,
  mapEvent,
  type Evento,
} from '../utils';

function paraCRFEvent(evento: WPEventListing, bannerFallback?: string | null): CRFEvent {
  const detalhes = evento.event_details;
  // O endpoint individual não retorna `excerpt`; usa o início do conteúdo como resumo.
  const resumoTexto = stripHTML(evento.excerpt?.rendered ?? evento.content?.rendered ?? '');
  return {
    id: evento.id,
    slug: evento.slug,
    title: evento.title?.rendered ?? '',
    excerpt: resumoTexto.length > 160 ? `${resumoTexto.slice(0, 157)}...` : resumoTexto,
    status: evento.status,
    banner: getPostImage(evento) ?? bannerFallback ?? null,
    startDate: detalhes?.startDate?.includes(' ') ? detalhes.startDate : [detalhes?.startDate, detalhes?.startTime].filter(Boolean).join(' '),
    endDate: detalhes?.endDate?.includes(' ') ? detalhes.endDate : [detalhes?.endDate, detalhes?.endTime].filter(Boolean).join(' '),
    location: detalhes?.location ?? '',
    online: detalhes?.online ?? false,
    cancelled: detalhes?.cancelled ?? false,
    featured: detalhes?.featured ?? false,
    registrationUrl: detalhes?.registrationUrl ?? '',
    videoUrl: detalhes?.videoUrl ?? '',
    modalidade: detalhes?.modalidade ?? '',
    publico: detalhes?.publico ?? '',
    types: [],
  };
}

function InfoRow({ icon: Icon, rotulo, valor, dateTime }: { icon: ElementType; rotulo: string; valor: string; dateTime?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-crfal-blue-lighter  shrink-0">
        <Icon className="w-4 h-4 text-crfal-blue " aria-hidden />
      </div>
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-wider text-crfal-gray-600 ">
          {rotulo}
        </dt>
        <dd className="text-sm text-neutral-800 wrap-break-word">{dateTime ? <time dateTime={dateTime}>{valor}</time> : valor}</dd>
      </div>
    </div>
  );
}

export default function EventoDetailPage() {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => { const timer = window.setInterval(() => setAgora(Date.now()), 60_000); return () => window.clearInterval(timer); }, []);
  const { slug } = useParams<{ slug: string }>();
  const porSlug = useEventBySlug(slug ?? '');
  const eventoCompleto = porSlug.data;
  const carregandoEvento = porSlug.isLoading;
  const erroEvento = porSlug.isError;
  const recarregarEvento = porSlug.refetch;
  const relacionados = useRelatedEvents(eventoCompleto?.id);

  const evento: Evento | null = useMemo(() => {
    if (eventoCompleto) { void agora; return mapEvent(paraCRFEvent(eventoCompleto)); }
    return null;
  }, [eventoCompleto, agora]);

  const outrosEventos = useMemo(() => {
    if (!relacionados.data || !evento) return [];
    return relacionados.data
      .map(post => mapEvent(paraCRFEvent(post)))
      .filter((e) => e.id !== evento.id && (e.status === 'em-breve' || e.status === 'em-andamento'))
      .sort((a, b) => a.data.localeCompare(b.data))
      .slice(0, 3);
  }, [relacionados.data, evento]);

  if (!evento && erroEvento && !carregandoEvento) {
    return (
      <div className="min-h-screen  flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-white  rounded-xl border border-red-200  p-8 text-center">
          <p className="text-red-600  mb-4">Não foi possível carregar o evento agora.</p>
          <button
            onClick={() => { void recarregarEvento(); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full border border-crfal-blue text-crfal-blue hover:bg-crfal-blue hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!evento && carregandoEvento) {
    return (
      <div className="container-crfal py-10" role="status"><span className="sr-only">Carregando evento...</span><div className="grid gap-8 lg:grid-cols-12 animate-pulse"><div className="aspect-video rounded-2xl bg-crfal-gray-200 lg:col-span-8" /><div className="h-80 rounded-2xl bg-crfal-gray-200 lg:col-span-4" /></div></div>
    );
  }

  if (!evento) {
    return (
      <div className="min-h-screen  flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-crfal-gray-100  rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-crfal-gray-400 " />
          </div>
          <h2 className="text-2xl font-bold text-neutral-800  mb-4">Evento não encontrado</h2>
          <p className="text-crfal-gray-500  mb-6">
            O evento que você procura não existe ou foi removido.
          </p>
          <Link
            to="/eventos"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-crfal-blue text-white text-sm font-semibold rounded-full hover:bg-crfal-blue-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para eventos
          </Link>
        </div>
      </div>
    );
  }

  const capa = eventoCompleto ? getPostImageSet(eventoCompleto) : undefined;
  const statusConfig = STATUS_COLORS[evento.status];
  const StatusIcon = statusConfig.icon;
  const ModalidadeIcon = MODALIDADE_ICONS[evento.modalidade];
  const conteudo = eventoCompleto ? sanitizeWP(eventoCompleto.content?.rendered ?? '') : '';
  const acoes = acoesDoEvento(evento);
  const horario = formatarHorario(evento.horaInicio, evento.horaFim, evento.data, evento.dataFim);
  const baixarAgenda = () => {
    if (!eventoCompleto) return;
    const url = URL.createObjectURL(new Blob([eventsCalendar([paraCRFEvent(eventoCompleto)], SITE_URL)], { type: 'text/calendar;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = `${evento.slug}.ics`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const dataISO = evento.horaInicio ? `${evento.data.slice(0, 10)}T${evento.horaInicio}-03:00` : evento.data.slice(0, 10);

  return (
    <div className="min-h-screen ">
      <SEO
        title={evento.titulo}
        description={evento.descricao || `Detalhes do evento ${evento.titulo} do CRF-AL.`}
        path={`/eventos/${evento.slug}`}
        image={evento.banner || undefined}
        type="article"
      />

      <PageHero
        breadcrumb={[
          { label: 'Início', href: '/' },
          { label: 'Eventos', href: '/eventos' },
          { label: evento.titulo },
        ]}
        title={evento.titulo}
        eyebrow="Evento"
        section="imprensa"
        actions={<>{acoes.map((acao, i) => <PageHeroAction key={acao.href} href={acao.href} variant={i === 0 ? "primary" : "secondary"}>{acao.label}</PageHeroAction>)}{evento.status === 'em-breve' && evento.data && <button onClick={baixarAgenda} className="min-h-11 rounded-full border border-white/30 px-5 py-2.5 text-sm font-bold text-white focus-visible:ring-2 focus-visible:ring-white">Adicionar à agenda</button>}</>}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
            <StatusIcon className="w-3 h-3" />
            {STATUS_LABELS[evento.status]}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white border border-white/20">
            <ModalidadeIcon className="w-3 h-3" />
            {MODALIDADE_LABELS[evento.modalidade]}
          </span>
          {evento.status === 'em-breve' && rotuloContagem(evento.data) && <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white">{rotuloContagem(evento.data)}</span>}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {formatarDataExtenso(evento.data, evento.dataFim)}{horario && ` · ${horario}`}
          </span>
          {evento.local && (
            <span className="inline-flex items-center gap-1.5">
              {evento.modalidade === 'online' ? (
                <Monitor className="w-4 h-4" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
              {evento.local}
            </span>
          )}
        </div>
      </PageHero>

      <div className="container-crfal pt-6 lg:pt-10 pb-12 lg:pb-16">
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 empty:hidden">
          {evento.status === 'cancelado' && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"><Ban className="mr-2 inline h-5 w-5" aria-hidden />Este evento foi cancelado e não será realizado.</div>}
          {evento.status === 'encerrado' && <div className="mb-6 rounded-xl bg-crfal-gray-100 p-4 text-crfal-gray-700">Este evento já foi realizado em {formatarDataExtenso(evento.data, evento.dataFim)}.{evento.video && <> <a className="underline" href={evento.video} target="_blank" rel="noopener noreferrer">Assistir gravação<span className="sr-only"> (abre em uma nova aba)</span></a></>}</div>}
          {capa && (
          <figure className="overflow-hidden rounded-2xl border border-crfal-gray-200 bg-crfal-gray-100 shadow-card">
            <img src={capa.src} srcSet={capa.srcSet} sizes="(min-width: 1024px) 800px, calc(100vw - 32px)" width={capa.width} height={capa.height} alt={capa.alt || `Arte de divulgação do evento «${evento.titulo}»`} decoding="async" fetchPriority="high" className="mx-auto block h-auto w-auto max-w-full max-h-[min(75vh,720px)]" />
          </figure>
        )}

          </div>
          <aside className="lg:col-start-9 lg:col-span-4 lg:row-span-2 lg:row-start-1 lg:self-start lg:sticky lg:top-(--header-offset)">
            <div className="bg-white  rounded-xl border border-crfal-gray-200  p-6 shadow-card">
              <h2 className="font-display text-xl font-semibold text-neutral-800 md:text-2xl mb-6">
                Informações do evento
              </h2>

              <dl className="space-y-4">
                {evento.data && <InfoRow icon={Calendar} rotulo="Data" valor={formatarDataExtenso(evento.data, evento.dataFim)} dateTime={evento.data.slice(0, 10)} />}
                {horario && <InfoRow icon={Calendar} rotulo="Horário" valor={horario} dateTime={dataISO} />}
                <InfoRow icon={ModalidadeIcon} rotulo="Modalidade" valor={MODALIDADE_LABELS[evento.modalidade]} />
                {evento.local && <InfoRow icon={evento.modalidade === 'online' ? Monitor : MapPin} rotulo={evento.modalidade === 'online' ? 'Transmissão' : 'Local'} valor={evento.local} />}
                {evento.modalidade === 'hibrido' && evento.video && <InfoRow icon={Monitor} rotulo="Transmissão" valor={evento.video} />}
                {evento.publico && <InfoRow icon={Building2} rotulo="Público" valor={evento.publico} />}
                <InfoRow icon={Calendar} rotulo="Situação" valor={`${STATUS_LABELS[evento.status]}${evento.status === 'em-andamento' ? ' · Ao vivo agora' : evento.status === 'em-breve' && rotuloContagem(evento.data) ? ` · ${rotuloContagem(evento.data)}` : ''}`} />
              </dl>

              {(acoes.length > 0 || (evento.status === 'em-breve' && evento.data)) && <div className="hidden lg:block mt-8 pt-6 border-t border-crfal-gray-200 space-y-3">
                {acoes.map((acao, i) => <a key={acao.href} href={acao.href} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-11 w-full items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-full focus-visible:ring-2 focus-visible:ring-crfal-gold ${i === 0 ? 'bg-crfal-blue text-white' : 'border border-crfal-blue text-crfal-blue'}`}>
                  {acao.label}<ExternalLink className="w-4 h-4" aria-hidden /><span className="sr-only"> (abre em uma nova aba)</span>
                </a>)}
                {evento.status === 'em-breve' && evento.data && <button onClick={baixarAgenda} className="min-h-11 w-full rounded-full border border-crfal-blue px-5 py-3 text-sm font-semibold text-crfal-blue focus-visible:ring-2 focus-visible:ring-crfal-gold">Adicionar à agenda</button>}
              </div>}
            </div>
          </aside>
          <div className="lg:col-span-8 min-w-0 rounded-2xl border border-crfal-gray-200 bg-white p-6 md:p-8 shadow-card">
            <h2 className="font-display text-xl font-semibold text-neutral-800  md:text-2xl mb-6">Sobre o evento</h2>

            {erroEvento ? (
              <div className="bg-white  rounded-xl border border-red-200  p-6 text-center">
                <p className="text-red-600  mb-4">
                  Não foi possível carregar a descrição completa.
                </p>
                <button
                  onClick={() => recarregarEvento()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full border border-crfal-blue text-crfal-blue hover:bg-crfal-blue hover:text-white transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Tentar novamente
                </button>
              </div>
            ) : carregandoEvento ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-crfal-gray-100  rounded w-full"></div>
                <div className="h-4 bg-crfal-gray-100  rounded w-11/12"></div>
                <div className="h-4 bg-crfal-gray-100  rounded w-9/12"></div>
              </div>
            ) : conteudo ? (
              <div
                className="max-w-[68ch] text-base md:text-[17px] text-crfal-gray-700 leading-relaxed
                  [&_a]:text-crfal-blue [&_a]:underline
                  [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-neutral-800 [&_h2]:mt-6 [&_h2]:mb-3
                  [&_h3]:font-bold [&_h3]:text-neutral-800 [&_h3]:mt-6 [&_h3]:mb-3
                  [&_img]:rounded-xl [&_img]:my-4
                  [&_iframe]:my-4 [&_iframe]:aspect-video [&_iframe]:h-auto [&_iframe]:w-full [&_iframe]:rounded-xl
                  [&_p]:mb-4
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4"
                dangerouslySetInnerHTML={{ __html: conteudo }}
              />
            ) : evento.descricao ? (
              <p className="max-w-[68ch] text-base md:text-[17px] text-crfal-gray-700 leading-relaxed">{evento.descricao}</p>
            ) : (
              <p className="text-crfal-gray-500 ">
                A descrição completa deste evento ainda não foi disponibilizada.
              </p>
            )}
          </div>

        </div>

        {outrosEventos.length > 0 && (
          <div className="mt-16 pt-10 border-t border-crfal-gray-200 ">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-800 ">Outros eventos</h2>
              <Link to="/eventos" className="inline-flex items-center gap-1 text-sm font-medium text-crfal-blue hover:underline">
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {outrosEventos.map((outro, index) => <EventoCard key={outro.id} evento={outro} index={index} />)}
            </div>
          </div>
        )}

        <div className="mt-12">
          <Link
            to="/eventos"
            className="inline-flex items-center gap-2 text-sm font-medium text-crfal-blue hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para a agenda de eventos
          </Link>
        </div>
      </div>
    </div>
  );
}
