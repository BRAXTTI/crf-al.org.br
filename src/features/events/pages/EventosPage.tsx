import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Monitor,
  Building2,
  ExternalLink,
  ChevronRight,
  Clock,
  AlertCircle,
  Ban,
  XCircle,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import SEO from '@/components/SEO';

type StatusEvento = 'em-andamento' | 'em-breve' | 'encerrado' | 'cancelado';
type ModalidadeEvento = 'presencial' | 'online' | 'hibrido';

interface Evento {
  id: number;
  titulo: string;
  descricao: string;
  data: string;
  dataFim?: string;
  local: string;
  modalidade: ModalidadeEvento;
  status: StatusEvento;
  publico?: string;
  link?: string;
}

const eventosData: Evento[] = [
  {
    id: 1,
    titulo: 'Congresso Estadual de Farmácia 2026',
    descricao: 'O maior evento da farmácia alagoana reúne profissionais, estudantes e autoridades para debater o futuro da profissão no estado. Programação com palestras, mesas redondas e workshops.',
    data: '2026-09-15',
    dataFim: '2026-09-17',
    local: 'Centro de Convenções Ruth Cardoso - Maceió/AL',
    modalidade: 'presencial',
    status: 'em-breve',
    publico: 'Farmacêuticos, estudantes e público geral',
    link: 'https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf',
  },
  {
    id: 2,
    titulo: 'Seminário de Ética e Legislação Farmacêutica',
    descricao: 'Seminário voltado à atualização sobre o Código de Ética e as principais legislações que regem o exercício da profissão farmacêutica.',
    data: '2026-08-10',
    local: 'Auditório CRF-AL - Maceió/AL',
    modalidade: 'hibrido',
    status: 'em-breve',
    publico: 'Farmacêuticos inscritos no CRF-AL',
  },
  {
    id: 3,
    titulo: 'Capacitação: Inspeção de Estabelecimentos Farmacêuticos',
    descricao: 'Treinamento prático para fiscais e profissionais sobre procedimentos de inspeção, documentação e boas práticas em estabelecimentos farmacêuticos.',
    data: '2026-04-20',
    dataFim: '2026-04-21',
    local: 'Plataforma Zoom',
    modalidade: 'online',
    status: 'encerrado',
    publico: 'Fiscais e farmacêuticos responsáveis técnicos',
  },
  {
    id: 4,
    titulo: 'Mutirão de Atendimento Farmacêutico - Arapiraca',
    descricao: 'Ação social com serviços farmacêuticos gratuitos para a população de Arapiraca e região, incluindo orientação sobre uso racional de medicamentos.',
    data: '2026-07-05',
    local: 'Praça Marques da Silva - Arapiraca/AL',
    modalidade: 'presencial',
    status: 'em-breve',
    publico: 'População geral',
  },
  {
    id: 5,
    titulo: 'Workshop de Prescrição Farmacêutica',
    descricao: 'Capacitação sobre prescrição farmacêutica no âmbito do SUS, abordando aspectos legais e práticos da atuação clínica do farmacêutico.',
    data: '2026-06-18',
    local: 'Auditório CRF-AL - Maceió/AL',
    modalidade: 'presencial',
    status: 'em-breve',
    publico: 'Farmacêuticos clínicos e comunitários',
  },
  {
    id: 6,
    titulo: 'Encontro Regional de Fiscalização do Nordeste',
    descricao: 'Encontro entre os Conselhos Regionais do Nordeste para alinhamento de procedimentos e estratégias de fiscalização.',
    data: '2026-05-05',
    dataFim: '2026-05-07',
    local: 'Hotel Jatiúca - Maceió/AL',
    modalidade: 'presencial',
    status: 'cancelado',
    publico: 'Agentes fiscais dos CRFs do Nordeste',
  },
  {
    id: 7,
    titulo: 'Palestra: O Papel do Farmacêutico na Saúde Pública',
    descricao: 'Em alusão ao Dia do Farmacêutico, palestra com especialista discutindo a contribuição da categoria para o fortalecimento do SUS.',
    data: '2026-01-20',
    local: 'Plataforma Zoom',
    modalidade: 'online',
    status: 'encerrado',
    publico: 'Farmacêuticos e estudantes',
  },
  {
    id: 8,
    titulo: 'Posse da Nova Diretoria CRF-AL',
    descricao: 'Cerimônia solene de posse da nova Diretoria do Conselho Regional de Farmácia de Alagoas para o biênio vigente.',
    data: '2026-03-08',
    local: 'Auditório CRF-AL - Maceió/AL',
    modalidade: 'presencial',
    status: 'encerrado',
    publico: 'Convidados',
  },
  {
    id: 9,
    titulo: 'Curso de Atualização em Farmácia Hospitalar',
    descricao: 'Curso intensivo com módulos sobre logística hospitalar, farmacovigilância e segurança do paciente.',
    data: '2026-08-25',
    dataFim: '2026-08-29',
    local: 'Hospital Universitário - Maceió/AL',
    modalidade: 'presencial',
    status: 'em-breve',
    publico: 'Farmacêuticos hospitalares',
  },
  {
    id: 10,
    titulo: 'Reunião Plenária Aberta',
    descricao: 'Sessão plenária aberta à categoria para apresentação do balanço de atividades do semestre e discussão de pautas da classe.',
    data: '2026-07-22',
    local: 'Auditório CRF-AL - Maceió/AL',
    modalidade: 'hibrido',
    status: 'em-andamento',
    publico: 'Farmacêuticos inscritos',
  },
];

const STATUS_LABELS: Record<StatusEvento, string> = {
  'em-andamento': 'Em Andamento',
  'em-breve': 'Em Breve',
  encerrado: 'Encerrado',
  cancelado: 'Cancelado',
};

const STATUS_COLORS: Record<StatusEvento, { bg: string; text: string; icon: React.ElementType }> = {
  'em-andamento': {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    icon: CheckCircle2,
  },
  'em-breve': {
    bg: 'bg-sky-50 dark:bg-sky-900/20',
    text: 'text-sky-700 dark:text-sky-300',
    icon: Clock,
  },
  encerrado: {
    bg: 'bg-neutral-100 dark:bg-slate-800',
    text: 'text-neutral-500 dark:text-slate-400',
    icon: CheckCircle2,
  },
  cancelado: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
    icon: XCircle,
  },
};

const MODALIDADE_ICONS: Record<ModalidadeEvento, React.ElementType> = {
  presencial: Building2,
  online: Monitor,
  hibrido: MapPin,
};

const MODALIDADE_LABELS: Record<ModalidadeEvento, string> = {
  presencial: 'Presencial',
  online: 'Online',
  hibrido: 'Híbrido',
};

function formatarData(data: string, dataFim?: string): string {
  const inicio = new Date(data + 'T00:00:00-03:00');
  const dia = inicio.getDate();
  const mes = inicio.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  const ano = inicio.getFullYear();

  if (dataFim) {
    const fim = new Date(dataFim + 'T00:00:00-03:00');
    const diaFim = fim.getDate();
    const mesFim = fim.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    const anoFim = fim.getFullYear();
    if (ano === anoFim) {
      if (mes === mesFim) return `${dia} a ${diaFim} de ${mes} de ${ano}`;
      return `${dia} de ${mes} a ${diaFim} de ${mesFim} de ${ano}`;
    }
    return `${dia} de ${mes} de ${ano} a ${diaFim} de ${mesFim} de ${anoFim}`;
  }
  return `${dia} de ${mes} de ${ano}`;
}

export default function EventosPage() {
  const [filtroStatus, setFiltroStatus] = useState<StatusEvento | 'todos'>('todos');
  const heroRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const eventosFiltrados = useMemo(() => {
    if (filtroStatus === 'todos') return eventosData;
    return eventosData.filter((e) => e.status === filtroStatus);
  }, [filtroStatus]);

  const agrupadosPorStatus = useMemo(() => {
    const grupos: { status: StatusEvento; eventos: Evento[] }[] = [];
    const ordens: StatusEvento[] = ['em-andamento', 'em-breve', 'encerrado', 'cancelado'];

    for (const status of ordens) {
      const eventos = eventosData
        .filter((e) => (filtroStatus === 'todos' || filtroStatus === status) && e.status === status)
        .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
      if (eventos.length > 0) {
        grupos.push({ status, eventos });
      }
    }
    return grupos;
  }, [filtroStatus]);

  const filtros: { value: StatusEvento | 'todos'; label: string; count: number }[] = [
    { value: 'todos', label: 'Todos', count: eventosData.length },
    { value: 'em-andamento', label: 'Em Andamento', count: eventosData.filter((e) => e.status === 'em-andamento').length },
    { value: 'em-breve', label: 'Em Breve', count: eventosData.filter((e) => e.status === 'em-breve').length },
    { value: 'encerrado', label: 'Encerrados', count: eventosData.filter((e) => e.status === 'encerrado').length },
    { value: 'cancelado', label: 'Cancelados', count: eventosData.filter((e) => e.status === 'cancelado').length },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-slate-950">
      <SEO
        title="Eventos"
        description="Confira a agenda de eventos do CRF-AL — Conselho Regional de Farmácia de Alagoas. Congressos, palestras, capacitações e ações sociais."
        path="/eventos"
      />

      <div
        ref={heroRef}
        className="relative bg-gradient-to-br from-crfal-blue via-crfal-blue-dark to-[#002a4a] pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-crfal-blue-light rounded-full blur-3xl" />
        </div>
        <div className="container-crfal relative z-10">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
            <Link to="/" className="hover:text-white transition-colors">
              Início
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Eventos</span>
          </div>
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Agenda de Eventos
            </h1>
            <p className="text-white/80 text-lg">
              Acompanhe todos os eventos promovidos pelo Conselho Regional de
              Farmácia de Alagoas. Capacitações, congressos, ações sociais e
              muito mais.
            </p>
          </div>
        </div>
      </div>

      <div className="container-crfal py-10 md:py-16" ref={sectionRef}>
        <div
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-crfal-blue" />
              <span className="text-sm font-semibold text-neutral-700 dark:text-slate-300 uppercase tracking-wider">
                Filtrar por Status
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {filtros.map((filtro) => (
                <button
                  key={filtro.value}
                  onClick={() => setFiltroStatus(filtro.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all border ${
                    filtroStatus === filtro.value
                      ? 'bg-crfal-blue text-white border-crfal-blue shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-neutral-600 dark:text-slate-300 border-neutral-200 dark:border-slate-700 hover:border-crfal-blue/40 hover:text-crfal-blue dark:hover:text-sky-300'
                  }`}
                >
                  {filtro.label}
                  <span className={`ml-1.5 text-xs ${
                    filtroStatus === filtro.value ? 'text-white/70' : 'text-neutral-400 dark:text-slate-500'
                  }`}>
                    {filtro.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {eventosFiltrados.length === 0 && (
          <div
            className={`text-center py-16 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-neutral-400 dark:text-slate-500" />
            </div>
            <p className="text-neutral-500 dark:text-slate-400 text-lg">
              Nenhum evento encontrado para o filtro selecionado.
            </p>
          </div>
        )}

        {agrupadosPorStatus.map((grupo) => {
          const statusConfig = STATUS_COLORS[grupo.status];
          const StatusIcon = statusConfig.icon;

          return (
            <div key={grupo.status} className="mb-12">
              <div
                className={`flex items-center gap-3 mb-6 transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${statusConfig.bg}`}>
                  <StatusIcon className={`w-5 h-5 ${statusConfig.text}`} />
                </div>
                <h2 className="text-xl font-bold text-neutral-800 dark:text-slate-100">
                  {STATUS_LABELS[grupo.status]}
                </h2>
                <span className="text-sm text-neutral-400 dark:text-slate-500">
                  {grupo.eventos.length} evento{grupo.eventos.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-4">
                {grupo.eventos.map((evento, index) => (
                  <div
                    key={evento.id}
                    className={`group bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden transition-all duration-500 ${
                      evento.status === 'cancelado'
                        ? 'border-red-200 dark:border-red-900/30 opacity-75'
                        : 'border-neutral-200 dark:border-slate-700 hover:shadow-card-hover hover:border-crfal-blue/20 dark:hover:border-sky-500/20 hover:-translate-y-0.5'
                    } ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: isVisible ? `${200 + index * 100}ms` : '0ms' }}
                  >
                    <div className="p-5 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {STATUS_LABELS[evento.status]}
                            </span>
                            {evento.status === 'cancelado' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                                <Ban className="w-3 h-3" />
                                Não será realizado
                              </span>
                            )}
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-crfal-blue-lighter dark:bg-crfal-blue/10 text-crfal-blue dark:text-sky-300">
                            {(() => {
                              const MIcon = MODALIDADE_ICONS[evento.modalidade];
                              return <MIcon className="w-3 h-3" />;
                            })()}
                            {MODALIDADE_LABELS[evento.modalidade]}
                          </span>
                          </div>

                          <h3 className={`text-lg font-bold mb-2 transition-colors ${
                            evento.status === 'cancelado'
                              ? 'text-neutral-400 dark:text-slate-500 line-through'
                              : 'text-neutral-800 dark:text-slate-100'
                          }`}>
                            {evento.titulo}
                          </h3>

                          <p className="text-sm text-neutral-600 dark:text-slate-400 mb-4 line-clamp-2">
                            {evento.descricao}
                          </p>

                          <div className="flex flex-wrap gap-x-6 gap-y-2">
                            <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-slate-400">
                              <Calendar className="w-4 h-4 text-crfal-blue dark:text-sky-400 shrink-0" />
                              <span>{formatarData(evento.data, evento.dataFim)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-slate-400">
                              {evento.modalidade === 'online' ? (
                                <Monitor className="w-4 h-4 text-crfal-blue dark:text-sky-400 shrink-0" />
                              ) : (
                                <MapPin className="w-4 h-4 text-crfal-blue dark:text-sky-400 shrink-0" />
                              )}
                              <span>{evento.local}</span>
                            </div>
                            {evento.publico && (
                              <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-slate-400">
                                <Building2 className="w-4 h-4 text-crfal-blue dark:text-sky-400 shrink-0" />
                                <span>{evento.publico}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {evento.link && evento.status !== 'cancelado' && evento.status !== 'encerrado' && (
                          <a
                            href={evento.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 shrink-0 px-5 py-2.5 bg-crfal-blue text-white text-sm font-semibold rounded-full hover:bg-crfal-blue-dark transition-colors"
                          >
                            Inscreva-se
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
