import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  Play,
  X,
  Clock3,
  BadgeDollarSign,
  BookOpen,
  Sparkles,
  FileText,
} from 'lucide-react';
import { servicesData, type ServiceItem } from '../../data/servicos';
import { getYouTubeEmbedUrl } from '../../lib/youtube';

export default function Tutoriais() {
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [busca, setBusca] = useState('');
  const [servicoExpandido, setServicoExpandido] = useState<number | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
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
      { threshold: 0.05 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const categorias = useMemo(
    () => ['Todos', ...Array.from(new Set(servicesData.map((item) => item.category)))],
    []
  );

  const servicosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return servicesData.filter((item) => {
      const matchCategoria =
        categoriaAtiva === 'Todos' || item.category === categoriaAtiva;

      const matchBusca =
        termo.length === 0 ||
        item.title.toLowerCase().includes(termo) ||
        item.description.toLowerCase().includes(termo) ||
        item.tutorial.steps.some((step) => step.toLowerCase().includes(termo));

      return matchCategoria && matchBusca;
    });
  }, [busca, categoriaAtiva]);

  const handleExpand = (service: ServiceItem) => {
    setSelectedService(service);
    setServicoExpandido(servicoExpandido === service.id ? null : service.id);
  };

  const selectedVideoEmbedUrl = getYouTubeEmbedUrl(
    selectedService?.tutorial.videoUrl
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-slate-950">
      <div className="relative bg-gradient-to-br from-crfal-blue via-crfal-blue-dark to-[#002a4a] pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-crfal-blue-light rounded-full blur-3xl" />
        </div>

        <div className="container-crfal relative z-10">
          <div className="flex flex-wrap items-center gap-2 text-white/60 text-xs sm:text-sm mb-4">
            <Link to="/" className="hover:text-white transition-colors">
              Início
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span>Serviços</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Tutoriais</span>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                Tutoriais de Serviços
              </h1>
              <p className="text-white/80 text-base sm:text-lg max-w-3xl">
                Encontre rapidamente o serviço que precisa, veja o passo a passo,
                confira valor e prazo e acesse o portal para abrir seu protocolo.
              </p>
            </div>

            <div className="lg:col-span-4 grid grid-cols-2 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <BookOpen className="w-7 h-7 text-white mb-1" />
                <span className="text-2xl font-bold text-white block">
                  {servicesData.length}
                </span>
                <span className="text-sm text-white/70">Serviços</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <Sparkles className="w-7 h-7 text-white mb-1" />
                <span className="text-2xl font-bold text-white block">
                  {categorias.length - 1}
                </span>
                <span className="text-sm text-white/70">Categorias</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-crfal py-10 md:py-16" ref={sectionRef}>
        <div
          className={`bg-white dark:bg-slate-900/90 border border-neutral-200 dark:border-slate-700/70 rounded-2xl p-4 sm:p-5 mb-8 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="grid lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6">
              <label className="text-sm font-medium text-neutral-600 mb-2 block">
                Buscar serviço ou etapa
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={busca}
                  onChange={(e) => {
                    setBusca(e.target.value);
                    setServicoExpandido(null);
                  }}
                  placeholder="Ex.: inscrição, RT, certidão"
                  className="w-full h-11 rounded-xl border border-neutral-200 dark:border-slate-700/70 bg-white dark:bg-slate-900/80 pl-9 pr-3 text-sm outline-none focus:border-crfal-blue/40 focus:ring-2 focus:ring-crfal-blue/10"
                />
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="flex items-center gap-2 text-neutral-500 mb-2">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filtrar por categoria</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categorias.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategoriaAtiva(cat);
                      setServicoExpandido(null);
                    }}
                    className={`px-3 py-2 text-sm rounded-full transition-all duration-200 ${
                      categoriaAtiva === cat
                        ? 'bg-crfal-blue text-white shadow-md'
                        : 'bg-neutral-50 dark:bg-slate-800 border border-neutral-200 dark:border-slate-700/70 text-neutral-600 dark:text-slate-300 hover:border-crfal-blue/30 hover:text-crfal-blue'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-neutral-200 dark:border-slate-700/70 p-5">
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-crfal-blue-lighter text-crfal-blue mb-3">
                  Tutoriais
                </span>
                <h2 className="text-2xl font-bold text-neutral-800 mb-2">
                  Guia completo de serviços
                </h2>
                <p className="text-sm text-neutral-600">
                  Expanda um item para ver etapas, valor e prazo. Use a busca
                  para encontrar o que precisa em segundos.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-neutral-200 dark:border-slate-700/70 p-4">
                  <p className="text-2xl font-bold text-crfal-blue">
                    {servicosFiltrados.length}
                  </p>
                  <p className="text-xs text-neutral-500">Resultados</p>
                </div>
                <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-neutral-200 dark:border-slate-700/70 p-4">
                  <p className="text-2xl font-bold text-crfal-blue">24h</p>
                  <p className="text-xs text-neutral-500">Portal online</p>
                </div>
              </div>

              <a
                href="https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full text-center"
              >
                Acessar CRF AL em Casa
              </a>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="space-y-4">
              {servicosFiltrados.map((service, index) => {
                const Icon = service.icon;
                const isExpanded = servicoExpandido === service.id;

                return (
                  <div
                    key={service.id}
                    className={`bg-white dark:bg-slate-900/90 rounded-2xl border overflow-hidden transition-all duration-300 ${
                      isExpanded
                        ? 'border-crfal-blue/30 shadow-card'
                        : 'border-neutral-200 dark:border-slate-700/70'
                    } ${
                      isVisible
                        ? 'opacity-100 translate-x-0'
                        : 'opacity-0 translate-x-8'
                    }`}
                    style={{
                      transitionDelay: isVisible ? `${index * 80}ms` : '0ms',
                    }}
                  >
                    {/* ── Header: gradiente quando expandido, limpo quando colapsado ── */}
                    {isExpanded ? (
                      <div
                        className="bg-gradient-to-r from-crfal-blue to-crfal-blue-dark p-5 sm:p-6 cursor-pointer select-none"
                        onClick={() => handleExpand(service)}
                      >
                        <div className="flex justify-end mb-3">
                          <ChevronDown className="w-5 h-5 text-white/50 rotate-180" />
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[11px] font-bold tracking-widest uppercase text-white/60 mb-1 block">
                              {service.category}
                            </span>
                            <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                              {service.title}
                            </h3>
                            <p className="text-white/80 text-sm mt-1">
                              {service.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-5">
                          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                            <BadgeDollarSign className="w-4 h-4 text-white/70" />
                            <span className="text-sm text-white">
                              Valor: <strong>{service.valor}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                            <Clock3 className="w-4 h-4 text-white/70" />
                            <span className="text-sm text-white">
                              Prazo: <strong>{service.prazo}</strong>
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedService(service);
                              setShowVideoModal(true);
                            }}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors"
                          >
                            <Play className="w-4 h-4 text-white/70" />
                            <span className="text-sm text-white">Assistir vídeo</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleExpand(service)}
                        className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 text-left hover:bg-neutral-50 dark:hover:bg-slate-800/50 transition-colors duration-200"
                      >
                        <div className="w-11 h-11 bg-crfal-blue-lighter text-crfal-blue rounded-xl flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs px-2 py-0.5 bg-crfal-blue-lighter text-crfal-blue rounded-full font-medium">
                              {service.category}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm sm:text-base text-neutral-800 dark:text-slate-100 leading-snug">
                            {service.title}
                          </h3>
                          <p className="text-sm text-neutral-500 dark:text-slate-400 line-clamp-1 hidden sm:block">
                            {service.description}
                          </p>
                        </div>
                        <ChevronDown className="w-5 h-5 text-crfal-blue flex-shrink-0" />
                      </button>
                    )}

                    {/* ── Conteúdo expandido ── */}
                    <div
                      className={`overflow-hidden transition-all duration-500 ${
                        isExpanded ? 'max-h-[1600px]' : 'max-h-0'
                      }`}
                    >
                      <div className="p-5 sm:p-6 border-b border-neutral-100 dark:border-slate-700/50">
                        <h4 className="font-bold text-neutral-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                          <Play className="w-5 h-5 text-crfal-blue" />
                          Tutorial passo a passo
                        </h4>
                        <ol className="space-y-3">
                          {service.tutorial.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-7 h-7 bg-crfal-blue text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {stepIndex + 1}
                              </span>
                              <span className="text-sm text-neutral-700 dark:text-slate-300 pt-1">
                                {step}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="p-5 sm:p-6 bg-neutral-50 dark:bg-slate-800/50 flex flex-wrap gap-3">
                        <a
                          href="https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary text-sm flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Acessar serviço no portal
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}

              {servicosFiltrados.length === 0 && (
                <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-neutral-200 dark:border-slate-700/70 p-8 sm:p-12 text-center">
                  <Search className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-neutral-700 mb-2">
                    Nenhum serviço encontrado
                  </h3>
                  <p className="text-neutral-500 text-sm">
                    Ajuste os filtros ou tente outro termo de busca.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showVideoModal && selectedService && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70"
          onClick={() => setShowVideoModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl max-w-2xl w-full overflow-hidden max-h-[92svh] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-slate-700">
              <h3 className="font-bold text-crfal-blue pr-2">
                Tutorial: {selectedService.title}
              </h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {selectedVideoEmbedUrl ? (
              <div className="aspect-video bg-black">
                <iframe
                  src={selectedVideoEmbedUrl}
                  title={`Vídeo tutorial: ${selectedService.title}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="aspect-video bg-neutral-100 dark:bg-slate-800 flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-16 h-16 text-crfal-blue mx-auto mb-4" />
                  <p className="text-neutral-500">Vídeo tutorial em breve</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
