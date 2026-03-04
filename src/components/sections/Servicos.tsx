import { useState, useEffect, useRef, useMemo } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Play,
  X,
  Clock3,
  BadgeDollarSign,
  FileText,
} from 'lucide-react';
import { servicesData, type ServiceItem } from '../../data/servicos';
import { getYouTubeEmbedUrl } from '../../lib/youtube';

export default function Servicos() {
  const [expandedService, setExpandedService] = useState<number | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleServiceClick = (service: ServiceItem) => {
    setSelectedService(service);
    setExpandedService(expandedService === service.id ? null : service.id);
  };

  const selectedVideoEmbedUrl = useMemo(
    () => getYouTubeEmbedUrl(selectedService?.tutorial.videoUrl),
    [selectedService?.tutorial.videoUrl]
  );

  return (
    <section
      ref={sectionRef}
      id="servicos"
      className="py-16 sm:py-20 md:py-28 bg-neutral-50 relative overflow-x-clip"
    >
      <div className="container-crfal">
        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <div
                className={`transition-all duration-700 ${
                  isVisible
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-8'
                }`}
              >
                <span className="inline-block px-4 py-1.5 bg-crfal-blue text-white text-sm font-semibold rounded-full mb-4">
                  Serviços
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-800 mb-3 sm:mb-4">
                  Nossos Serviços
                </h2>
                <p className="text-neutral-600 mb-6 text-sm sm:text-base">
                  Conheça todos os serviços disponíveis para farmacêuticos e
                  estabelecimentos. Clique em um serviço para ver o tutorial
                  passo a passo.
                </p>
                <a
                  href="/servicos/tutoriais"
                  className="inline-flex items-center gap-2 btn-primary text-sm sm:text-base"
                >
                  Ver todos os serviços
                  <ChevronRight className="w-5 h-5" />
                </a>
              </div>

              <div
                className={`mt-10 hidden lg:grid grid-cols-2 gap-4 transition-all duration-700 ${
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '200ms' }}
              >
                <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-4 border border-neutral-200 dark:border-slate-700/70">
                  <span className="text-3xl font-bold text-crfal-blue">
                    {servicesData.length}
                  </span>
                  <p className="text-sm text-neutral-600">Serviços Online</p>
                </div>
                <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-4 border border-neutral-200 dark:border-slate-700/70">
                  <span className="text-3xl font-bold text-crfal-blue">24h</span>
                  <p className="text-sm text-neutral-600">Disponibilidade</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="space-y-3 sm:space-y-4" id="todos-servicos">
              {servicesData.map((service, index) => {
                const Icon = service.icon;
                const isExpanded = expandedService === service.id;

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
                      transitionDelay: isVisible ? `${index * 60}ms` : '0ms',
                    }}
                  >
                    {/* ── Header: gradiente quando expandido, limpo quando colapsado ── */}
                    {isExpanded ? (
                      <div
                        className="bg-gradient-to-r from-crfal-blue to-crfal-blue-dark p-4 sm:p-6 cursor-pointer select-none"
                        onClick={() => handleServiceClick(service)}
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
                        onClick={() => handleServiceClick(service)}
                        className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 text-left hover:bg-neutral-50 dark:hover:bg-slate-800/50 transition-colors duration-200 min-h-[64px]"
                      >
                        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-crfal-blue-lighter text-crfal-blue rounded-xl flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-medium bg-crfal-blue-lighter text-crfal-blue">
                              {service.category}
                            </span>
                          </div>
                          <h3 className="font-bold text-neutral-800 dark:text-slate-100 text-sm sm:text-base leading-snug">
                            {service.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-neutral-500 dark:text-slate-400 leading-relaxed hidden sm:block">
                            {service.description}
                          </p>
                        </div>
                        <ChevronDown className="w-5 h-5 text-crfal-blue flex-shrink-0" />
                      </button>
                    )}

                    {/* ── Conteúdo expandido ── */}
                    <div
                      className={`overflow-hidden transition-all duration-500 ease-in-out ${
                        isExpanded ? 'max-h-[1400px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="p-4 sm:p-6 border-b border-neutral-100 dark:border-slate-700/50">
                        <h4 className="font-bold text-neutral-800 dark:text-slate-100 flex items-center gap-2 mb-4 text-sm sm:text-base">
                          <Play className="w-5 h-5 text-crfal-blue" />
                          Tutorial Passo a Passo
                        </h4>
                        <ol className="space-y-2.5 sm:space-y-3">
                          {service.tutorial.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-7 h-7 bg-crfal-blue text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {stepIndex + 1}
                              </span>
                              <span className="text-sm text-neutral-700 dark:text-slate-300 leading-relaxed pt-1">
                                {step}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="p-4 sm:p-6 bg-neutral-50 dark:bg-slate-800/50 flex flex-col sm:flex-row gap-3">
                        <a
                          href="https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary text-sm text-center flex items-center justify-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Acessar Serviço
                        </a>
                        <a
                          href="/servicos/tutoriais"
                          className="btn-outline text-sm text-center"
                        >
                          Ver página de tutoriais
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
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
            <div className="flex items-center justify-between p-4 border-b border-crfal-gray-medium dark:border-slate-700">
              <h3 className="font-bold text-crfal-blue text-sm sm:text-base pr-2">
                Tutorial: {selectedService.title}
              </h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="p-2 hover:bg-crfal-gray dark:hover:bg-slate-800 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
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
              <div className="aspect-video bg-crfal-gray dark:bg-slate-800 flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-16 h-16 text-crfal-blue mx-auto mb-4" />
                  <p className="text-crfal-text-gray">
                    Vídeo tutorial em breve
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
