import { useEffect, useRef, useState, type ReactEventHandler, type RefObject } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';

const focusRing = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-crfal-blue-dark';
const focusRingClaro = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2';

const sincronizadores = new WeakMap<HTMLVideoElement, Set<(tocando: boolean) => void>>();

function registrarSincronizador(video: HTMLVideoElement, fn: (tocando: boolean) => void) {
  let conjunto = sincronizadores.get(video);
  if (!conjunto) {
    conjunto = new Set();
    sincronizadores.set(video, conjunto);
  }
  conjunto.add(fn);
  return () => {
    conjunto?.delete(fn);
  };
}

function notificarPlay(video: HTMLVideoElement, ativo: boolean) {
  sincronizadores.get(video)?.forEach((fn) => fn(ativo));
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** No iPhone/iPad o volume é do aparelho: `volume` ignora escrita. Lá só há mudo. */
function volumeAjustavel() {
  if (typeof document === 'undefined') return false;
  try {
    const v = document.createElement('video');
    v.volume = 0.5;
    return v.volume === 0.5;
  } catch {
    return false;
  }
}

function formatarTempo(segundos: number) {
  if (!Number.isFinite(segundos) || segundos < 0) return '0:00';
  const total = Math.floor(segundos);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface ControlesSomProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  duracao?: string;
  className?: string;
}

/**
 * Barra de controles do modo narrado, posicionada fora da moldura do vídeo para
 * não cobrir botões da gravação. Sincroniza mudo e volume pelo evento `volumechange`.
 */
export function ControlesSom({ videoRef, duracao, className = '' }: ControlesSomProps) {
  const [ajustavel] = useState(volumeAjustavel);
  const [tocando, setTocando] = useState(false);
  const [mudo, setMudo] = useState(false);
  const [volume, setVolume] = useState(1);
  const [segundo, setSegundo] = useState(0);
  const jaIniciou = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const desregistrar = registrarSincronizador(video, (ativo) => {
      if (ativo) jaIniciou.current = true;
      setTocando(ativo);
    });
    const aoPlay = () => {
      jaIniciou.current = true;
      setTocando(true);
    };
    const aoPausar = () => setTocando(false);
    const aoMudarSom = () => {
      setMudo(video.muted);
      setVolume(video.volume);
    };
    const aoTempo = () => setSegundo(video.currentTime);
    video.addEventListener('play', aoPlay);
    video.addEventListener('pause', aoPausar);
    video.addEventListener('ended', aoPausar);
    video.addEventListener('volumechange', aoMudarSom);
    video.addEventListener('timeupdate', aoTempo);
    return () => {
      desregistrar();
      video.removeEventListener('play', aoPlay);
      video.removeEventListener('pause', aoPausar);
      video.removeEventListener('ended', aoPausar);
      video.removeEventListener('volumechange', aoMudarSom);
      video.removeEventListener('timeupdate', aoTempo);
    };
  }, [videoRef]);

  const alternarPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused && !tocando) {
      if (!jaIniciou.current) {
        jaIniciou.current = true;
        video.muted = false;
      }
      notificarPlay(video, true);
      video.play().catch(() => notificarPlay(video, false));
    } else {
      notificarPlay(video, false);
      video.pause();
    }
  };

  const alternarMudo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };

  const valorVolume = mudo ? 0 : volume;
  const botao = `inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-crfal-gray-300 bg-white text-crfal-blue hover:border-crfal-blue ${focusRingClaro}`;

  return (
    <div className={`mt-2 flex h-11 items-center justify-between gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={alternarPlay}
          aria-label={tocando ? 'Pausar vídeo' : 'Tocar vídeo'}
          className={botao}
        >
          {tocando ? <Pause className="h-4 w-4 fill-current" aria-hidden /> : <Play className="ml-0.5 h-4 w-4 fill-current" aria-hidden />}
        </button>
        <button
          type="button"
          onClick={alternarMudo}
          aria-label={mudo ? 'Ativar som' : 'Desativar som'}
          className={botao}
        >
          {mudo ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
        </button>
        {ajustavel && (
          <div className="flex h-11 min-w-24 items-center px-1">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={valorVolume}
              aria-label="Volume"
              aria-valuetext={`${Math.round(valorVolume * 100)}%`}
              onChange={(e) => {
                const video = videoRef.current;
                if (!video) return;
                const v = Number(e.currentTarget.value);
                video.volume = v;
                video.muted = v === 0;
              }}
              className={`h-11 w-24 cursor-pointer accent-crfal-blue ${focusRingClaro}`}
            />
          </div>
        )}
      </div>
      <span aria-hidden className="text-xs tabular-nums text-crfal-gray-600 max-[379px]:hidden">
        {formatarTempo(segundo)}{duracao ? ` / ${duracao}` : ''}
      </span>
    </div>
  );
}

interface VideoTelaProps {
  src: string;
  poster?: string;
  alt: string;
  duracao?: string;
  narrado?: boolean;
  loop?: boolean;
  videoRef?: RefObject<HTMLVideoElement | null>;
  onPlaying?: ReactEventHandler<HTMLVideoElement>;
  onTimeUpdate?: ReactEventHandler<HTMLVideoElement>;
  onEnded?: ReactEventHandler<HTMLVideoElement>;
  onLoadedMetadata?: ReactEventHandler<HTMLVideoElement>;
}

/**
 * Player de vídeo com dois modos:
 * - **Ambiente** (`narrado` falso, padrão): vídeo sem som dentro da tela 4:3. Só baixa
 *   o arquivo quando chega perto da tela e só toca enquanto está visível; fora dela,
 *   pausa. O botão de pausa fica sempre visível e a escolha da pessoa é respeitada ao
 *   voltar à tela. Com movimento reduzido, não toca sozinho e usa os controles nativos.
 * - **Narrado** (`narrado` verdadeiro): vídeo com narração em 16:9. Não toca sozinho;
 *   toca apenas quando a pessoa clica, já com som, e usa `ControlesSom` fora da moldura.
 *
 * Se o aparelho não tocar o arquivo, fica a capa com um aviso; os passos seguem em texto.
 */
export default function VideoTela({
  src,
  poster,
  alt,
  duracao,
  narrado = false,
  loop = true,
  videoRef,
  onPlaying,
  onTimeUpdate,
  onEnded,
  onLoadedMetadata,
}: VideoTelaProps) {
  const proprioRef = useRef<HTMLVideoElement>(null);
  const ref = videoRef ?? proprioRef;
  // Navegadores sem IntersectionObserver ou vídeos narrados (preload="metadata") definem o src na montagem.
  const [carregar, setCarregar] = useState(() => narrado || (typeof window !== 'undefined' && !('IntersectionObserver' in window)));
  const [reduzido] = useState(prefersReducedMotion);
  const [tocando, setTocando] = useState(false);
  const [jaTocou, setJaTocou] = useState(false);
  const [erro, setErro] = useState(false);
  const pausadoPelaPessoa = useRef(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    return registrarSincronizador(video, (ativo) => {
      if (ativo) setJaTocou(true);
      setTocando(ativo);
    });
  }, [ref]);

  useEffect(() => {
    if (narrado) return;
    const video = ref.current;
    if (!video || !('IntersectionObserver' in window)) return;
    // Entradas podem chegar em lote; vale a mais recente.
    const perto = new IntersectionObserver((entries) => {
      if (entries[entries.length - 1].isIntersecting) {
        setCarregar(true);
        perto.disconnect();
      }
    }, { rootMargin: '300px 0px' });
    const visivel = new IntersectionObserver((entries) => {
      if (reduzido) return;
      if (!entries[entries.length - 1].isIntersecting) video.pause();
      else if (!pausadoPelaPessoa.current) video.play().catch(() => {});
    }, { threshold: 0.25 });
    perto.observe(video);
    visivel.observe(video);
    return () => {
      perto.disconnect();
      visivel.disconnect();
    };
  }, [narrado, reduzido, ref]);

  // Ao receber o src no modo ambiente, começa a tocar se já estiver na tela.
  useEffect(() => {
    if (narrado) return;
    const video = ref.current;
    if (!carregar || reduzido || !video || pausadoPelaPessoa.current) return;
    const r = video.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) video.play().catch(() => {});
  }, [carregar, narrado, reduzido, ref]);

  const alternar = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused && !tocando) {
      pausadoPelaPessoa.current = false;
      notificarPlay(video, true);
      video.play().catch(() => notificarPlay(video, false));
    } else {
      pausadoPelaPessoa.current = true;
      notificarPlay(video, false);
      video.pause();
    }
  };

  const tocar = () => {
    const video = ref.current;
    if (!video) return;
    video.muted = false;
    setJaTocou(true);
    notificarPlay(video, true);
    video.play().catch(() => notificarPlay(video, false));
  };

  if (erro) {
    return (
      <div className="relative h-full w-full">
        {poster && <img src={poster} alt="" className="block h-full w-full object-contain opacity-40" />}
        <p className="absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-lg bg-white px-4 py-3 text-center text-sm font-semibold text-crfal-blue-dark shadow-sm">
          Não foi possível tocar o vídeo neste aparelho. Siga os passos em texto.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <video
        ref={ref}
        src={narrado || carregar ? src : undefined}
        poster={poster}
        aria-label={alt}
        muted={narrado ? undefined : true}
        loop={narrado ? undefined : loop}
        playsInline
        // Só metadados: o download completo começa ao tocar.
        preload="metadata"
        controls={narrado ? false : reduzido}
        width={960}
        height={narrado ? 540 : 720}
        onClick={narrado && jaTocou ? alternar : undefined}
        onPlay={() => {
          setJaTocou(true);
          setTocando(true);
        }}
        onPause={() => setTocando(false)}
        onPlaying={onPlaying}
        onTimeUpdate={onTimeUpdate}
        onEnded={(e) => {
          setTocando(false);
          onEnded?.(e);
        }}
        onLoadedMetadata={onLoadedMetadata}
        onError={() => setErro(true)}
        className={`block h-full w-full object-contain ${narrado && jaTocou ? 'cursor-pointer' : ''}`}
      />
      {narrado ? (
        !jaTocou && (
          <button
            type="button"
            onClick={tocar}
            aria-label={duracao ? `Tocar vídeo com narração (${duracao})` : 'Tocar vídeo com narração'}
            className={`group absolute inset-0 grid place-items-center bg-crfal-blue-dark/20 text-white transition hover:bg-crfal-blue-dark/30 ${focusRing}`}
          >
            <span className="flex flex-col items-center gap-2.5">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-crfal-blue shadow-xl ring-4 ring-crfal-gold/40 transition duration-200 group-hover:scale-105 group-hover:ring-crfal-gold/70 motion-reduce:transition-none">
                <Play className="ml-0.5 h-7 w-7 fill-current" aria-hidden />
              </span>
              <span className="rounded-full bg-crfal-blue-dark/85 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-xs">
                Assistir com som{duracao ? ` · ${duracao}` : ''}
              </span>
            </span>
          </button>
        )
      ) : (
        !reduzido && (
          <button
            type="button"
            onClick={alternar}
            aria-label={tocando ? 'Pausar vídeo' : 'Tocar vídeo'}
            className={`absolute bottom-2.5 right-2.5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-crfal-blue-dark/85 text-white shadow-md hover:bg-crfal-blue-dark ${focusRing}`}
          >
            {tocando ? <Pause className="h-5 w-5 fill-current" aria-hidden /> : <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden />}
          </button>
        )
      )}
    </div>
  );
}
