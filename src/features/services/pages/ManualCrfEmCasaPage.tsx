import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowUpRight, ImagePlay, PlayCircle } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHero, { PageHeroAction } from '@/components/block/page-hero';
import { Reveal } from '@/components/ui/reveal';
import { PAGE_METADATA } from '@/config/page-metadata';
import { CRF_EM_CASA_URL } from '@/config/site';
import { MANUAL_CRF_EM_CASA, type ManualSecao } from '@/data/manual-crf-em-casa';
import VideoTela from '../components/VideoTela';
import { TELA } from '../tela';

const PATH = '/servicos/manual-crf-em-casa';
const goldLabel = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]';
const focusRing = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2';
const motion = 'transition duration-200 motion-reduce:transition-none';
// Rawline tem itálico real até 600; em 700 o navegador sintetizaria a inclinação.
const destaque = 'font-semibold italic text-crfal-blue-light';
// Deslocamento curto: o padrão de 100px do Reveal pesa em blocos altos como estes.
const entradaCurta = { '--reveal-shift': '24px' } as CSSProperties;

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Demonstração do tópico; sem vídeo, mostra o espaço reservado. */
function Demonstracao({ secao }: { secao: ManualSecao }) {
  if (secao.video) return <div className={TELA}><VideoTela src={secao.video} poster={secao.poster} alt={secao.videoAlt} /></div>;
  return (
    <div className={`${TELA} flex flex-col items-center justify-center gap-3 px-6 text-center`}>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-crfal-blue ring-1 ring-crfal-blue/10"><ImagePlay className="h-6 w-6" aria-hidden /></span>
      <p className="text-sm font-semibold text-crfal-blue-dark">Demonstração em breve</p>
      <p className="sr-only">{secao.videoAlt}</p>
    </div>
  );
}

/** Título do tópico com o trecho `highlight` em destaque. */
function TituloTopico({ secao }: { secao: ManualSecao }) {
  const { title, highlight } = secao;
  const inicio = highlight ? title.indexOf(highlight) : -1;
  if (!highlight || inicio < 0) return title;
  return (
    <>
      {title.slice(0, inicio)}
      <em className={destaque}>{highlight}</em>
      {title.slice(inicio + highlight.length)}
    </>
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

        {/* overflow visível: a sombra das telas não é cortada e o deslocamento da entrada não torna o painel rolável num salto por âncora. */}
        <section aria-labelledby="manual-por-dentro-title" className="section-panel mt-8 overflow-visible! md:mt-10">
          <h2 id="manual-por-dentro-title" className="text-balance text-[30px] font-bold leading-[34px] tracking-tight text-crfal-blue sm:text-[36px] sm:leading-[40px] lg:text-[48px] lg:leading-[52px]">
            Veja o sistema por dentro <em className={destaque}>antes de começar.</em>
          </h2>
          <span aria-hidden className="mt-3 block h-0.5 w-10 rounded-full bg-crfal-gold" />

          <div className="mt-10 space-y-16 lg:mt-14 lg:space-y-24">
            {MANUAL_CRF_EM_CASA.map((secao, index) => {
              const midiaEsquerda = index % 2 === 0;
              return (
                <section key={secao.id} id={secao.id} aria-labelledby={`${secao.id}-title`} className="scroll-mt-[calc(var(--header-offset)+24px)]">
                  <Reveal style={entradaCurta} className={`grid items-center gap-6 lg:gap-14 xl:gap-20 ${midiaEsquerda ? 'lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]' : 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]'}`}>
                    <div className={`min-w-0 ${midiaEsquerda ? 'lg:order-2' : ''}`}>
                      <p className={goldLabel}>Tópico {String(index + 1).padStart(2, '0')}</p>
                      <h3 id={`${secao.id}-title`} className="mt-2 text-balance text-[26px] font-bold leading-[30px] tracking-tight text-crfal-blue sm:text-[28px] sm:leading-[32px] lg:text-[34px] lg:leading-[38px] xl:text-[40px] xl:leading-[44px]">
                        <TituloTopico secao={secao} />
                      </h3>
                      {secao.text.map((paragrafo) => (
                        <p key={paragrafo} className="mt-3 text-base leading-6 text-crfal-gray-600 lg:mt-4 lg:text-[17px] lg:leading-7">{paragrafo}</p>
                      ))}
                      {secao.steps && (
                        <ol className="mt-4 space-y-2 lg:mt-5 lg:space-y-2.5">
                          {secao.steps.map((passo, i) => (
                            <li key={passo} className="flex items-start gap-2.5 text-sm leading-[22px] text-crfal-gray-700 lg:gap-3 lg:text-[15px] lg:leading-6">
                              <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-crfal-blue-lighter text-[11px] font-bold text-crfal-blue lg:h-6 lg:w-6 lg:text-[12px]">{i + 1}</span>
                              {passo}
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                    {/* Vem depois do texto na leitura; no celular, aparece em cima dele. */}
                    <div className={`order-first min-w-0 ${midiaEsquerda ? 'lg:order-1' : 'lg:order-2'}`}>
                      <Demonstracao secao={secao} />
                    </div>
                  </Reveal>
                </section>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="manual-ajuda-title" className="mt-8 overflow-hidden rounded-2xl border-t-2 border-crfal-gold bg-linear-to-br/srgb from-crfal-blue to-crfal-blue-dark p-6 text-white sm:p-8 md:mt-10">
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
