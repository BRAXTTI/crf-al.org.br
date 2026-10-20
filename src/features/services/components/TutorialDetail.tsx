import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Clock, Link2, ListChecks, Play, RotateCcw } from 'lucide-react';
import { ArrowFillButton } from '@/components/block/arrow-fill-button';
import { CRF_EM_CASA_URL } from '@/config/site';
import { getRequerimento } from '@/data/requerimentos';
import { type Tutorial } from '@/data/servicos';
import { getYouTubeEmbedUrl } from '@/lib/youtube';
import { PERFIS } from '../tutorial-profiles';
import MotionVideo from './MotionVideo';

const goldLabel = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]';
const focusRing = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2';
const motion = 'transition duration-200 motion-reduce:transition-none';

function linkDoRequerimento(tutorial: Tutorial) {
  return `/servicos/requerimentos?perfil=${tutorial.perfil}&item=${tutorial.requerimentoId}`;
}

export default function TutorialDetail({ tutorial, embutido = false }: { tutorial: Tutorial; embutido?: boolean }) {
  const Icon = tutorial.icon;
  const PerfilIcon = PERFIS[tutorial.perfil].icon;
  const videoEmbedUrl = getYouTubeEmbedUrl(tutorial.videoUrl);
  const requerimento = tutorial.requerimentoId ? getRequerimento(tutorial.requerimentoId) : undefined;

  const [tocando, setTocando] = useState(false);
  const [feitos, setFeitos] = useState<number[]>([]);
  const [linkCopiado, setLinkCopiado] = useState(false);

  useEffect(() => {
    if (!linkCopiado) return;
    const timer = window.setTimeout(() => setLinkCopiado(false), 2500);
    return () => window.clearTimeout(timer);
  }, [linkCopiado]);

  const alternarPasso = (index: number) =>
    setFeitos((atual) => (atual.includes(index) ? atual.filter((i) => i !== index) : [...atual, index]));

  const copiarLink = async () => {
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('tutorial', tutorial.id);
    try {
      await navigator.clipboard.writeText(url.toString());
      setLinkCopiado(true);
    } catch {
      window.prompt('Copie o link do tutorial:', url.toString());
    }
  };

  const total = tutorial.steps.length;
  const progresso = total ? Math.round((feitos.length / total) * 100) : 0;
  const titleId = `tutorial-titulo-${tutorial.id}`;

  return (
    <article
      aria-labelledby={titleId}
      className={`overflow-hidden bg-white motion-safe:animate-fade-in ${embutido ? '' : 'rounded-2xl border border-crfal-gray-200 shadow-[0_24px_48px_-28px_rgba(11,25,44,0.45)]'}`}
    >
      {/* Cabeçalho */}
      <header className="relative isolate overflow-hidden border-t-2 border-crfal-gold bg-linear-to-br/srgb from-crfal-blue to-crfal-blue-dark p-4 sm:p-6">
        <Icon className="pointer-events-none absolute -bottom-8 -right-6 -z-10 h-40 w-40 text-white opacity-[0.06]" strokeWidth={1} aria-hidden="true" />
        <button
          type="button"
          onClick={copiarLink}
          aria-label={linkCopiado ? 'Link copiado' : 'Copiar link deste tutorial'}
          title="Copiar link"
          className="absolute right-2 top-2 inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full p-2 text-xs font-semibold sm:right-3 sm:top-3 text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/60"
        >
          {linkCopiado ? <Check className="h-5 w-5 text-crfal-gold" aria-hidden="true" /> : <Link2 className="h-5 w-5" aria-hidden="true" />}
          <span className="hidden sm:inline" aria-hidden="true">{linkCopiado ? 'Copiado' : 'Copiar link'}</span>
        </button>
        <span role="status" className="sr-only">{linkCopiado ? 'Link do tutorial copiado.' : ''}</span>

        <div className="flex items-start gap-4 pr-12 sm:pr-32">
          <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/5 ring-1 ring-crfal-gold/40 sm:flex">
            <Icon className="h-6 w-6 text-white sm:h-7 sm:w-7" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-crfal-gold">Tutorial · {tutorial.category}</p>
            <h2 id={titleId} className="mt-0.5 text-lg font-bold leading-snug tracking-tight text-white sm:text-[22px]">{tutorial.title}</h2>
          </div>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-white/80 sm:mt-3">{tutorial.description}</p>

        <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
            <PerfilIcon className="h-3.5 w-3.5 text-crfal-gold" aria-hidden="true" /> {PERFIS[tutorial.perfil].label}
          </span>
          {tutorial.prazo && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
              <Clock className="h-3.5 w-3.5 text-crfal-gold" aria-hidden="true" /> Prazo: {tutorial.prazo}
            </span>
          )}
        </div>
      </header>

      {tutorial.motion && <MotionVideo motion={tutorial.motion} titulo={tutorial.title} />}

      {/* Vídeo: o YouTube só carrega depois do clique */}
      {!tutorial.motion && videoEmbedUrl && (
        <div className="aspect-video bg-crfal-blue-dark">
          {tocando ? (
            <iframe
              src={`${videoEmbedUrl}&autoplay=1`}
              title={`Vídeo tutorial: ${tutorial.title}`}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setTocando(true)}
              className="group relative flex h-full w-full flex-col items-center justify-center gap-4 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,rgba(0,102,204,0.35),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(197,155,39,0.14),transparent_55%)] text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-crfal-gold"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-size-[48px_48px] mask-[radial-gradient(ellipse_at_center,black,transparent_75%)]"
              />
              <span className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-white text-crfal-blue shadow-xl ring-4 ring-crfal-gold/40 group-hover:scale-105 group-hover:ring-crfal-gold/70 sm:h-20 sm:w-20 ${motion}`}>
                <Play className="ml-1 h-7 w-7 fill-current sm:h-8 sm:w-8" aria-hidden="true" />
              </span>
              <span className="relative text-center">
                <span className="block text-sm font-bold sm:text-base">Assistir ao tutorial em vídeo</span>
                <span className="mt-0.5 block text-xs text-white/65">O vídeo do YouTube carrega ao clicar</span>
              </span>
            </button>
          )}
        </div>
      )}

      {/* Passo a passo */}
      <div className="p-5 sm:p-6">
        {requerimento && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-crfal-gray-200 bg-crfal-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <ListChecks className="mt-0.5 h-5 w-5 shrink-0 text-[#8A6A12]" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-crfal-gray-700">
                <strong className="text-crfal-blue-dark">Antes de começar,</strong> reúna os {requerimento.documentos.length}{' '}
                {requerimento.documentos.length === 1 ? 'documento exigido' : 'documentos exigidos'} no requerimento.
              </p>
            </div>
            <Link to={linkDoRequerimento(tutorial)} className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 self-start rounded-full px-1 text-sm font-semibold text-crfal-blue underline-offset-4 hover:underline sm:self-auto ${focusRing}`}>
              Ver documentos <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className={goldLabel}>Passo a passo</p>
            <p className="mt-1 text-sm font-semibold text-crfal-blue-dark">
              {feitos.length > 0
                ? `${feitos.length} de ${total} ${total === 1 ? 'passo concluído' : 'passos concluídos'}`
                : `${total} ${total === 1 ? 'passo' : 'passos'} · marque conforme avança`}
            </p>
            <div
              className="mt-1.5 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-crfal-gray-100"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={feitos.length}
              aria-valuetext={`${feitos.length} de ${total}`}
              aria-label="Passos concluídos"
            >
              <div className="h-full rounded-full bg-crfal-gold transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${progresso}%` }} />
            </div>
          </div>
          {feitos.length > 0 && (
            <button type="button" onClick={() => setFeitos([])} className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-crfal-gray-600 hover:bg-crfal-gray-100 hover:text-crfal-blue sm:min-h-9 ${focusRing}`}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Recomeçar
            </button>
          )}
        </div>

        <ol>
          {tutorial.steps.map((passo, index) => {
            const feito = feitos.includes(index);
            const ultimo = index === total - 1;
            return (
              <li key={index}>
                <label className="group/passo flex cursor-pointer gap-4">
                  <input type="checkbox" checked={feito} onChange={() => alternarPasso(index)} className="peer sr-only" />
                  <span className="flex flex-col items-center [&>span:first-child]:peer-focus-visible:ring-crfal-blue">
                    <span
                      aria-hidden="true"
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-2 ${motion} ${
                        feito ? 'bg-crfal-gold text-crfal-blue-dark ring-crfal-gold/40' : 'bg-crfal-blue text-white ring-crfal-gold/30 group-hover/passo:ring-crfal-gold/70'
                      }`}
                    >
                      {feito ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> : index + 1}
                    </span>
                    {!ultimo && <span aria-hidden="true" className={`mt-1 block h-full w-px ${feito ? 'bg-crfal-gold/60' : 'bg-crfal-gray-200'}`} />}
                  </span>
                  <span className={`block pt-1 text-sm leading-relaxed ${ultimo ? '' : 'pb-5'} ${feito ? 'text-crfal-gray-500 line-through decoration-crfal-gray-300' : 'text-crfal-gray-700'}`}>
                    <span className="sr-only">Passo {index + 1}: </span>
                    {passo}
                  </span>
                </label>
              </li>
            );
          })}
        </ol>
        <p className="mt-4 text-xs text-crfal-gray-600">As marcações servem para acompanhar e não ficam salvas ao sair da página.</p>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-crfal-gray-200 bg-crfal-gray-50 p-4 sm:p-5">
        <ArrowFillButton href={tutorial.acesso?.url ?? CRF_EM_CASA_URL} target="_blank" rel="noopener noreferrer">
          {tutorial.acesso?.label ?? 'Acessar CRF AL em Casa'}
          <span className="sr-only"> (abre em uma nova aba)</span>
        </ArrowFillButton>
      </div>
    </article>
  );
}

