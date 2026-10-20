import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUp, ArrowUpRight, ImagePlay, PlayCircle } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHero, { PageHeroAction } from '@/components/block/page-hero';
import { PAGE_METADATA } from '@/config/page-metadata';
import { CRF_EM_CASA_URL } from '@/config/site';
import { MANUAL_CRF_EM_CASA, type ManualSecao } from '@/data/manual-crf-em-casa';

const PATH = '/servicos/manual-crf-em-casa';
const goldLabel = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]';
const focusRing = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2';
const motion = 'transition duration-200 motion-reduce:transition-none';

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Vídeo da demonstração com cantos arredondados. Só baixa o arquivo quando
 * chega perto da tela e só toca enquanto está visível; fora dela, pausa. Até
 * lá, mostra a capa. Com movimento reduzido, não toca sozinho e exibe controles.
 */
function VideoDemonstracao({ secao }: { secao: ManualSecao }) {
  const ref = useRef<HTMLVideoElement>(null);
  // Navegadores sem IntersectionObserver carregam direto.
  const [carregar, setCarregar] = useState(() => typeof window !== 'undefined' && !('IntersectionObserver' in window));
  const [reduzido] = useState(prefersReducedMotion);

  useEffect(() => {
    const video = ref.current;
    if (!video || !('IntersectionObserver' in window)) return;
    const perto = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setCarregar(true);
        perto.disconnect();
      }
    }, { rootMargin: '300px 0px' });
    const visivel = new IntersectionObserver(([entry]) => {
      if (reduzido) return;
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    }, { threshold: 0.25 });
    perto.observe(video);
    visivel.observe(video);
    return () => {
      perto.disconnect();
      visivel.disconnect();
    };
  }, [reduzido]);

  // Ao receber o src, começa a tocar se já estiver na tela.
  useEffect(() => {
    const video = ref.current;
    if (!carregar || reduzido || !video) return;
    const r = video.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) video.play().catch(() => {});
  }, [carregar, reduzido]);

  return (
    <video
      ref={ref}
      src={carregar ? secao.video : undefined}
      poster={secao.poster}
      aria-label={secao.videoAlt}
      muted
      loop
      playsInline
      preload={reduzido ? 'metadata' : 'auto'}
      controls={reduzido}
      className="block aspect-4/3 h-auto w-full rounded-xl bg-crfal-blue-lighter/40 object-cover shadow-xs"
    />
  );
}

/** Demonstração do tópico; sem vídeo, mostra o espaço reservado. */
function Demonstracao({ secao }: { secao: ManualSecao }) {
  if (secao.video) return <VideoDemonstracao secao={secao} />;
  return (
    <div className="flex aspect-16/10 flex-col items-center justify-center gap-3 rounded-xl bg-crfal-blue-lighter/40 px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-crfal-blue ring-1 ring-crfal-blue/10"><ImagePlay className="h-6 w-6" aria-hidden /></span>
      <p className="text-sm font-semibold text-crfal-blue-dark">Demonstração em breve</p>
      <p className="sr-only">{secao.videoAlt}</p>
    </div>
  );
}

function VoltarAoTopo() {
  const [visivel, setVisivel] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisivel(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      type="button"
      onClick={() => {
        document.getElementById('manual-sumario')?.focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      }}
      aria-label="Voltar ao topo"
      tabIndex={visivel ? 0 : -1}
      aria-hidden={!visivel}
      className={`fixed bottom-5 right-5 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full bg-crfal-blue text-white shadow-lg ring-2 ring-crfal-gold/40 hover:bg-crfal-blue-dark sm:bottom-8 sm:right-8 ${motion} ${focusRing} ${visivel ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}
    >
      <ArrowUp className="h-5 w-5" aria-hidden />
    </button>
  );
}

export default function ManualCrfEmCasaPage() {
  const metadata = PAGE_METADATA[PATH];

  return (
    <div className="min-h-screen">
      <SEO {...metadata} path={PATH} />

      <PageHero
        breadcrumb={[
          { label: 'Início', href: '/' },
          { label: 'Serviços', href: '/servicos/requerimentos' },
          { label: 'Manual do CRF AL em Casa' },
        ]}
        title="Manual de uso do CRF AL em Casa"
        section="servicos"
        lead="Veja, com demonstrações curtas, como acessar o sistema, enviar documentos e acompanhar suas solicitações."
        meta={[{ value: String(MANUAL_CRF_EM_CASA.length), label: 'tópicos' }]}
        actions={
          <>
            <PageHeroAction href={CRF_EM_CASA_URL}>Acessar o sistema</PageHeroAction>
            <PageHeroAction href="/servicos/tutoriais" variant="secondary">Ver tutoriais</PageHeroAction>
          </>
        }
      />

      <div className="container-crfal py-10 md:py-14">
        <nav id="manual-sumario" tabIndex={-1} aria-labelledby="sumario-title" className="rounded-xl border border-crfal-gray-200 bg-white p-5 shadow-xs focus:outline-hidden sm:p-6">
          <p className={goldLabel}>Neste manual</p>
          <h2 id="sumario-title" className="mt-1.5 text-lg font-bold text-crfal-blue">Escolha um tópico</h2>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {MANUAL_CRF_EM_CASA.map((secao, index) => (
              <li key={secao.id}>
                <a href={`#${secao.id}`} className={`group flex min-h-11 items-center gap-3 rounded-lg border border-crfal-gray-200 px-3 py-2 text-[14px] font-semibold text-crfal-blue-dark hover:border-crfal-blue hover:bg-crfal-blue-lighter ${motion} ${focusRing}`}>
                  <span className="w-6 shrink-0 text-[13px] font-bold tabular-nums text-[#8A6A12]">{String(index + 1).padStart(2, '0')}</span>
                  {secao.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-8 space-y-6 md:mt-10 md:space-y-8">
          {MANUAL_CRF_EM_CASA.map((secao, index) => (
            <section key={secao.id} id={secao.id} aria-labelledby={`${secao.id}-title`} className="scroll-mt-[calc(var(--header-offset)+24px)] rounded-2xl border border-crfal-gray-200 bg-white p-5 shadow-xs sm:p-8">
              <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.1fr)] lg:gap-6">
                <div className="min-w-0">
                  <p className={goldLabel}>Tópico {String(index + 1).padStart(2, '0')}</p>
                  <h2 id={`${secao.id}-title`} className="mt-1.5 text-[22px] font-bold leading-tight tracking-tight text-crfal-blue sm:text-[26px]">{secao.title}</h2>
                  <span aria-hidden className="mt-2.5 block h-0.5 w-10 rounded-full bg-crfal-gold" />
                  {secao.text.map((paragrafo) => (
                    <p key={paragrafo} className="mt-4 text-[15px] leading-relaxed text-crfal-gray-700">{paragrafo}</p>
                  ))}
                  {secao.steps && (
                    <ol className="mt-4 space-y-2.5">
                      {secao.steps.map((passo, i) => (
                        <li key={passo} className="flex items-start gap-3 text-[14.5px] leading-relaxed text-crfal-gray-700">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-crfal-blue-lighter text-[12px] font-bold text-crfal-blue">{i + 1}</span>
                          {passo}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
                <span aria-hidden className="hidden h-10 w-10 items-center justify-center rounded-full bg-[#FBF7EC] text-[#8A6A12] ring-1 ring-crfal-gold/40 lg:flex">
                  <ArrowLeft className="h-5 w-5" />
                </span>
                <Demonstracao secao={secao} />
              </div>
            </section>
          ))}
        </div>

        <section aria-labelledby="manual-ajuda-title" className="mt-10 overflow-hidden rounded-2xl bg-linear-to-br/srgb from-crfal-blue to-crfal-blue-dark p-6 text-white sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 id="manual-ajuda-title" className="text-xl font-bold">Precisa de um serviço específico?</h2>
              <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-white/80">Os tutoriais mostram o passo a passo de cada serviço, e os requerimentos listam os documentos necessários.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/servicos/tutoriais" className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-crfal-blue hover:bg-crfal-blue-lighter ${motion} focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-crfal-blue-dark`}>
                <PlayCircle className="h-4 w-4" aria-hidden /> Tutoriais
              </Link>
              <a href={CRF_EM_CASA_URL} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 px-5 text-sm font-bold text-white hover:border-white hover:bg-white/10 ${motion} focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-crfal-blue-dark`}>
                CRF AL em Casa <ArrowUpRight className="h-4 w-4" aria-hidden />
                <span className="sr-only">(abre em uma nova aba)</span>
              </a>
            </div>
          </div>
        </section>
      </div>

      <VoltarAoTopo />
    </div>
  );
}
