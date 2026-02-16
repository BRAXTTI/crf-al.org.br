import { useState, useEffect, useRef } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Play,
  X,
  Clock3,
  BadgeDollarSign,
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

  const selectedVideoEmbedUrl = getYouTubeEmbedUrl(
    selectedService?.tutorial.videoUrl
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
                    className={`bg-white dark:bg-slate-900/90 rounded-2xl border border-neutral-200 dark:border-slate-700/70 overflow-hidden transition-all duration-300 ${
                      isExpanded ? 'shadow-card' : ''
                    } ${
                      isVisible
                        ? 'opacity-100 translate-x-0'
                        : 'opacity-0 translate-x-8'
                    }`}
                    style={{
                      transitionDelay: isVisible ? `${index * 60}ms` : '0ms',
                    }}
                  >
                    <button
                      onClick={() => handleServiceClick(service)}
                      className={`w-full flex items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 text-left transition-all duration-300 min-h-[64px] active:bg-neutral-50 ${
                        isExpanded
                          ? 'bg-crfal-blue-lighter'
                          : 'hover:bg-neutral-50'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                          isExpanded
                            ? 'bg-crfal-blue text-white'
                            : 'bg-crfal-blue-lighter text-crfal-blue'
                        }`}
                      >
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-medium bg-crfal-blue-lighter text-crfal-blue">
                            {service.category}
                          </span>
                        </div>
                        <h3 className="font-bold text-neutral-800 text-sm sm:text-base leading-snug line-clamp-2 sm:line-clamp-none">
                          {service.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed hidden sm:block">
                          {service.description}
                        </p>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-crfal-blue flex-shrink-0 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-500 ease-in-out ${
                        isExpanded ? 'max-h-[1400px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-crfal-gray-medium">
                        <div className="mt-4">
                          <div className="grid sm:grid-cols-2 gap-3 mb-4">
                            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2">
                              <BadgeDollarSign className="w-4 h-4 text-emerald-700" />
                              <p className="text-sm text-emerald-900">
                                Valor: <strong>{service.valor}</strong>
                              </p>
                            </div>
                            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2">
                              <Clock3 className="w-4 h-4 text-amber-700" />
                              <p className="text-sm text-amber-900">
                                Prazo: <strong>{service.prazo}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-crfal-blue flex items-center gap-2 text-sm sm:text-base">
                              <Play className="w-4 h-4" />
                              Tutorial Passo a Passo
                            </h4>
                            <button
                              onClick={() => {
                                setSelectedService(service);
                                setShowVideoModal(true);
                              }}
                              className="text-xs sm:text-sm text-crfal-blue-light hover:underline flex items-center gap-1 min-h-[44px] px-2"
                            >
                              <Play className="w-4 h-4" />
                              <span className="hidden sm:inline">Assistir vídeo</span>
                              <span className="sm:hidden">Vídeo</span>
                            </button>
                          </div>

                          <ol className="space-y-2.5 sm:space-y-3">
                            {service.tutorial.steps.map((step, stepIndex) => (
                              <li
                                key={stepIndex}
                                className="flex items-start gap-3"
                              >
                                <span className="flex-shrink-0 w-6 h-6 bg-crfal-blue text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                                  {stepIndex + 1}
                                </span>
                                <span className="text-sm text-crfal-gray-dark leading-relaxed">
                                  {step}
                                </span>
                              </li>
                            ))}
                          </ol>

                          <div className="mt-5 flex flex-col sm:flex-row gap-3">
                            <a
                              href="https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-primary text-sm text-center"
                            >
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
