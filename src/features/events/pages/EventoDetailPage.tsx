import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Ban,
  Building2,
  Calendar,
  ChevronRight,
  ExternalLink,
  MapPin,
  Monitor,
  RefreshCw,
  Video,
} from 'lucide-react';
import SEO from '@/components/SEO';
import { getPostImage, sanitizeWP, stripHTML } from '@/services/wordpress/client';
import { useEventById, useEvents } from '@/services/wordpress/hooks';
import type { CRFEvent } from '@/services/wordpress/types';
import type { WPEventListing } from '@/services/wordpress/types';
import {
  MODALIDADE_ICONS,
  MODALIDADE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  formatarData,
  formatarDataHora,
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
    startDate: detalhes?.startDate ?? '',
    endDate: detalhes?.endDate ?? '',
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

function InfoRow({ icon: Icon, rotulo, valor }: { icon: typeof Calendar; rotulo: string; valor: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-crfal-blue-lighter dark:bg-crfal-blue/10 shrink-0">
        <Icon className="w-4 h-4 text-crfal-blue dark:text-sky-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-crfal-gray-400 dark:text-slate-500">
          {rotulo}
        </p>
        <p className="text-sm text-neutral-700 dark:text-slate-200 break-words">{valor}</p>
      </div>
    </div>
  );
}

export default function EventoDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const {
    data: lista,
    isLoading: carregandoLista,
    isError: erroLista,
    refetch: recarregarLista,
  } = useEvents();

  const resumo = useMemo(() => (lista ?? []).find((evento) => evento.slug === slug), [lista, slug]);
  const {
    data: eventoCompleto,
    isLoading: carregandoEvento,
    isError: erroEvento,
    refetch: recarregarEvento,
  } = useEventById(resumo?.id ?? Number.NaN);

  const evento: Evento | null = useMemo(() => {
    if (eventoCompleto) return mapEvent(paraCRFEvent(eventoCompleto, resumo?.banner));
    if (resumo) return mapEvent(resumo);
    return null;
  }, [eventoCompleto, resumo]);

  const outrosEventos = useMemo(() => {
    if (!lista || !evento) return [];
    return lista
      .map(mapEvent)
      .filter((e) => e.id !== evento.id && (e.status === 'em-breve' || e.status === 'em-andamento'))
      .sort((a, b) => a.data.localeCompare(b.data))
      .slice(0, 3);
  }, [lista, evento]);

  if (erroLista) {
    return (
      <div className="min-h-screen bg-crfal-gray-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/30 p-8 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Não foi possível carregar o evento agora.</p>
          <button
            onClick={() => recarregarLista()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full border border-crfal-blue text-crfal-blue hover:bg-crfal-blue hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (carregandoLista) {
    return (
      <div className="min-h-screen bg-crfal-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-crfal-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-crfal-gray-500 dark:text-slate-400">Carregando evento...</p>
        </div>
      </div>
    );
  }

  if (!resumo || !evento) {
    return (
      <div className="min-h-screen bg-crfal-gray-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-crfal-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-crfal-gray-400 dark:text-slate-500" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-slate-100 mb-4">Evento não encontrado</h2>
          <p className="text-crfal-gray-500 dark:text-slate-400 mb-6">
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

  const statusConfig = STATUS_COLORS[evento.status];
  const StatusIcon = statusConfig.icon;
  const ModalidadeIcon = MODALIDADE_ICONS[evento.modalidade];
  const conteudo = eventoCompleto ? sanitizeWP(eventoCompleto.content?.rendered ?? '') : '';
  const inscricaoAberta =
    Boolean(evento.link) && evento.status !== 'cancelado' && evento.status !== 'encerrado';

  return (
    <div className="min-h-screen bg-crfal-gray-50 dark:bg-slate-950">
      <SEO
        title={evento.titulo}
        description={evento.descricao || `Detalhes do evento ${evento.titulo} do CRF-AL.`}
        path={`/eventos/${evento.slug}`}
      />

      <div className="relative bg-gradient-to-br from-crfal-blue via-crfal-blue-dark to-[#002a4a] pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-crfal-blue-light rounded-full blur-3xl" />
        </div>
        <div className="container-crfal relative z-10">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
            <Link to="/" className="hover:text-white transition-colors">Início</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/eventos" className="hover:text-white transition-colors">Eventos</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white truncate max-w-[200px] md:max-w-sm">{evento.titulo}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
              <StatusIcon className="w-3 h-3" />
              {STATUS_LABELS[evento.status]}
            </span>
            {evento.status === 'cancelado' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                <Ban className="w-3 h-3" />
                Não será realizado
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white border border-white/20">
              <ModalidadeIcon className="w-3 h-3" />
              {MODALIDADE_LABELS[evento.modalidade]}
            </span>
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
            Detalhes do evento
          </p>
          <h1 className="mb-4 max-w-4xl font-display text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
            {evento.titulo}
          </h1>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/80 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatarData(evento.data, evento.dataFim)}
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
        </div>
      </div>

      <div className="container-crfal py-10 md:py-16">
        {evento.banner && (
          <div className="rounded-xl overflow-hidden mb-10 border border-crfal-gray-200 dark:border-slate-700 shadow-card">
            <img src={evento.banner} alt={evento.titulo} className="w-full h-auto object-cover max-h-[420px]" />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 min-w-0">
            <h2 className="font-display text-xl font-semibold text-neutral-800 dark:text-slate-100 md:text-2xl mb-6">Sobre o evento</h2>

            {erroEvento ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/30 p-6 text-center">
                <p className="text-red-600 dark:text-red-400 mb-4">
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
                <div className="h-4 bg-crfal-gray-100 dark:bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-crfal-gray-100 dark:bg-slate-800 rounded w-11/12"></div>
                <div className="h-4 bg-crfal-gray-100 dark:bg-slate-800 rounded w-9/12"></div>
              </div>
            ) : conteudo ? (
              <div
                className="text-crfal-gray-600 dark:text-slate-300 leading-relaxed
                  [&_a]:text-crfal-blue [&_a]:underline
                  [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-neutral-800 [&_h2]:mt-6 [&_h2]:mb-3
                  [&_h3]:font-bold [&_h3]:text-neutral-800 [&_h3]:mt-6 [&_h3]:mb-3
                  [&_img]:rounded-xl [&_img]:my-4
                  [&_p]:mb-4
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4"
                dangerouslySetInnerHTML={{ __html: conteudo }}
              />
            ) : evento.descricao ? (
              <p className="text-crfal-gray-600 dark:text-slate-300 leading-relaxed">{evento.descricao}</p>
            ) : (
              <p className="text-crfal-gray-500 dark:text-slate-400">
                A descrição completa deste evento ainda não foi disponibilizada.
              </p>
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-crfal-gray-200 dark:border-slate-700 p-6 shadow-card lg:sticky lg:top-24">
              <h2 className="text-lg font-bold text-neutral-800 dark:text-slate-100 mb-6">
                Informações do evento
              </h2>

              <div className="space-y-5">
                {evento.data && <InfoRow icon={Calendar} rotulo="Início" valor={formatarDataHora(evento.data)} />}
                {evento.dataFim && <InfoRow icon={Calendar} rotulo="Término" valor={formatarDataHora(evento.dataFim)} />}
                {evento.local && (
                  <InfoRow
                    icon={evento.modalidade === 'online' ? Monitor : MapPin}
                    rotulo={evento.modalidade === 'online' ? 'Transmissão' : 'Local'}
                    valor={evento.local}
                  />
                )}
                {evento.publico && <InfoRow icon={Building2} rotulo="Público-alvo" valor={evento.publico} />}
              </div>

              <div className="mt-8 pt-6 border-t border-crfal-gray-200 dark:border-slate-700">
                {inscricaoAberta ? (
                  <a
                    href={evento.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 px-5 py-3 bg-crfal-blue text-white text-sm font-semibold rounded-full hover:bg-crfal-blue-dark transition-colors"
                  >
                    Inscreva-se
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <p className="text-sm text-crfal-gray-500 dark:text-slate-400 text-center">
                    {evento.status === 'cancelado'
                      ? 'Este evento foi cancelado.'
                      : evento.status === 'encerrado'
                        ? 'As inscrições deste evento já foram encerradas.'
                        : 'Inscrições em breve.'}
                  </p>
                )}

                {evento.status === 'em-andamento' && eventoCompleto?.event_details?.videoUrl && (
                  <a
                    href={eventoCompleto.event_details.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 px-5 py-3 border border-crfal-blue text-crfal-blue dark:text-sky-300 text-sm font-semibold rounded-full hover:bg-crfal-blue hover:text-white transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    Assistir transmissão
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>

        {outrosEventos.length > 0 && (
          <div className="mt-16 pt-10 border-t border-crfal-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-800 dark:text-slate-100">Outros eventos</h2>
              <Link to="/eventos" className="inline-flex items-center gap-1 text-sm font-medium text-crfal-blue hover:underline">
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {outrosEventos.map((outro) => (
                <Link
                  key={outro.id}
                  to={`/eventos/${outro.slug}`}
                  className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-xl border border-crfal-gray-200 dark:border-slate-700 px-5 py-4 hover:border-crfal-blue/30 hover:shadow-card transition-all group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-800 dark:text-slate-100 truncate group-hover:text-crfal-blue dark:group-hover:text-sky-300 transition-colors">
                      {outro.titulo}
                    </p>
                    <p className="text-xs text-crfal-gray-500 dark:text-slate-400 mt-0.5">
                      {formatarData(outro.data, outro.dataFim)} · {STATUS_LABELS[outro.status]}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-crfal-gray-300 dark:text-slate-600 group-hover:text-crfal-blue transition-colors shrink-0" />
                </Link>
              ))}
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
