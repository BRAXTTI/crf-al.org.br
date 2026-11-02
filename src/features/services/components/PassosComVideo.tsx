import { useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { GuiaTutorial, VideoGuia } from '@/data/tutoriais-guias';
import { medidorDeVideo, medir } from '@/lib/medir';
import { telaDe } from '../tela';
import VideoTela, { ControlesSom } from './VideoTela';

const focusRing = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2';
const motion = 'transition duration-200 motion-reduce:transition-none';
const FOLGA = 0.05;

interface PassosComVideoProps {
  tarefa: string;
  guia: GuiaTutorial & { video: VideoGuia };
  /** Último passo terminou: o botão de ação recebe destaque. */
  onConcluir: () => void;
  /** Coluna do vídeo: botão de ação no desktop, acima do vídeo para aparecer sem rolar. */
  acao: ReactNode;
  /** Acima do vídeo no celular (ex.: "Antes de começar" recolhido). */
  antesCelular?: ReactNode;
  /** Coluna dos passos, antes da lista. */
  antes: ReactNode;
  /** Coluna dos passos, depois da lista. */
  children: ReactNode;
}

/**
 * Um arquivo por tarefa, com um trecho por passo. Tocando livre, o passo em
 * destaque acompanha o vídeo. No modo ambiente (sem som), escolher um passo vai ao
 * trecho e fica em loop nele; no modo narrado, escolher um passo só posiciona o
 * vídeo sem mudar play/pausa e sem repetir o trecho em loop. A página nunca rola sozinha.
 */
export default function PassosComVideo({ tarefa, guia, onConcluir, acao, antesCelular, antes, children }: PassosComVideoProps) {
  const { passos, video } = guia;
  const narrado = Boolean(video.narrado);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ativo, setAtivo] = useState(0);
  const [anuncio, setAnuncio] = useState('');
  const emTrecho = useRef(false);
  const saltoPendente = useRef<number | null>(null);
  const passosMedidos = useRef(new Set<number>());
  const [medidor] = useState(() => medidorDeVideo(tarefa));
  const total = passos.length;

  const saltar = (segundo: number) => {
    const el = videoRef.current;
    if (el && el.readyState >= 1) el.currentTime = segundo;
    else saltoPendente.current = segundo;
  };

  const escolher = (indice: number) => {
    emTrecho.current = !narrado;
    setAtivo(indice);
    setAnuncio(`Passo ${indice + 1} de ${total}: ${passos[indice].titulo}`);
    saltar(passos[indice].inicio ?? 0);
    if (!passosMedidos.current.has(indice)) {
      passosMedidos.current.add(indice);
      medir('passo', { tarefa, passo: indice + 1 });
    }
  };

  const aoAvancar = (el: HTMLVideoElement) => {
    medidor.aoAvancar(el);
    const t = el.currentTime;
    if (!narrado && emTrecho.current) {
      const passo = passos[ativo];
      if (t >= (passo.fim ?? Infinity) - FOLGA) {
        if (ativo === total - 1) onConcluir();
        el.currentTime = passo.inicio ?? 0;
      }
      return;
    }
    const atual = passos.findIndex((p) => t + FOLGA >= (p.inicio ?? 0) && t + FOLGA < (p.fim ?? Infinity));
    if (atual >= 0 && atual !== ativo) setAtivo(atual);
  };

  const aoTerminar = (el: HTMLVideoElement) => {
    onConcluir();
    if (narrado) return;
    el.currentTime = emTrecho.current ? passos[ativo].inicio ?? 0 : 0;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) el.play().catch(() => {});
  };

  const botaoNav = `inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-1 rounded-full border border-crfal-gray-300 bg-white px-3 text-sm font-semibold text-crfal-blue hover:border-crfal-blue disabled:cursor-not-allowed disabled:opacity-40 ${motion} ${focusRing}`;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
      {antesCelular && <div className="min-w-0 lg:hidden">{antesCelular}</div>}
      {/* Em telas baixas o vídeo deixa de ser fixo, para não ocupar a tela toda. */}
      <div className="z-20 min-w-0 self-start bg-white pb-2 pt-1 max-lg:-mx-4 max-lg:border-b max-lg:border-crfal-gray-200 sm:max-lg:-mx-6 md:max-lg:-mx-8 max-lg:[@media(min-height:640px)]:sticky max-lg:[@media(min-height:640px)]:top-(--header-offset) lg:-mx-1 lg:px-1 lg:pb-0 lg:pt-2 lg:[@media(min-height:700px)]:sticky lg:[@media(min-height:700px)]:top-[calc(var(--header-offset)+16px)]">
        {acao}
        <div className={`${telaDe(video.proporcao)} max-lg:rounded-none max-lg:border-x-0`}>
          <VideoTela
            videoRef={videoRef}
            src={video.src}
            poster={video.poster}
            alt={video.alt}
            duracao={video.duracao}
            narrado={narrado}
            loop={false}
            onPlaying={medidor.aoTocar}
            onTimeUpdate={(e) => aoAvancar(e.currentTarget)}
            onEnded={(e) => aoTerminar(e.currentTarget)}
            onLoadedMetadata={(e) => {
              if (saltoPendente.current === null) return;
              e.currentTarget.currentTime = saltoPendente.current;
              saltoPendente.current = null;
            }}
          />
        </div>
        {narrado && <ControlesSom videoRef={videoRef} duracao={video.duracao} className="max-lg:px-4 sm:max-lg:px-6 md:max-lg:px-8" />}
        <div className="mt-2 flex min-h-11 items-center justify-between gap-3 max-lg:px-4 sm:max-lg:px-6 md:max-lg:px-8 lg:mt-4">
          <p className="line-clamp-2 min-w-0 text-sm font-semibold leading-snug text-crfal-blue-dark">
            Passo {ativo + 1} de {total}
            <span className="lg:hidden">: {passos[ativo].titulo}</span>
          </p>
          <div className="flex shrink-0 gap-2">
            <button type="button" className={botaoNav} disabled={ativo === 0} onClick={() => escolher(ativo - 1)} aria-label="Passo anterior">
              <ChevronLeft className="h-4 w-4" aria-hidden /><span className="hidden lg:inline">Anterior</span>
            </button>
            <button type="button" className={botaoNav} disabled={ativo === total - 1} onClick={() => escolher(ativo + 1)} aria-label="Próximo passo">
              <span className="hidden lg:inline">Próximo</span><ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <div className="min-w-0">
        {antes}
        {video.aviso && <p className="mt-4 rounded-lg border border-crfal-gold/40 bg-[#FBF7EC] px-3.5 py-2.5 text-[13.5px] leading-snug text-crfal-gray-700">{video.aviso}</p>}
        <h2 className="mt-4 text-lg font-bold text-crfal-blue first:mt-0 lg:mt-6">Passos</h2>
        <ol className="mt-3">
          {passos.map((passo, indice) => {
            const atual = indice === ativo;
            return (
              <li key={passo.titulo} aria-current={atual ? 'step' : undefined}>
                <button type="button" onClick={() => escolher(indice)} className={`group flex min-h-11 w-full gap-3 rounded-lg px-1.5 text-left ${focusRing}`}>
                  <span className="flex flex-col items-center self-stretch">
                    <span aria-hidden className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${motion} ${atual ? 'bg-crfal-blue text-white ring-2 ring-crfal-gold' : 'bg-crfal-blue-lighter text-crfal-blue group-hover:bg-crfal-blue group-hover:text-white'}`}>{indice + 1}</span>
                    {indice < total - 1 && <span aria-hidden className="mt-1 block w-px flex-1 bg-crfal-gray-200" />}
                  </span>
                  <span className="block min-w-0 pb-4 pt-1.5">
                    <span className={`block text-[15px] leading-snug ${atual ? 'font-bold text-crfal-blue-dark' : 'font-semibold text-crfal-gray-700 group-hover:text-crfal-blue'}`}>{passo.titulo}</span>
                    {atual && passo.detalhe && <span className="mt-1 block text-sm leading-snug text-crfal-gray-600">{passo.detalhe}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <p role="status" className="sr-only">{anuncio}</p>
        {children}
      </div>
    </div>
  );
}
