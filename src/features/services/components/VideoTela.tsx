import { useEffect, useRef, useState, type ReactEventHandler, type RefObject } from 'react';
import { Pause, Play } from 'lucide-react';

const focusRing = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-crfal-blue-dark';

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface VideoTelaProps {
  src: string;
  poster?: string;
  alt: string;
  loop?: boolean;
  videoRef?: RefObject<HTMLVideoElement | null>;
  onPlaying?: ReactEventHandler<HTMLVideoElement>;
  onTimeUpdate?: ReactEventHandler<HTMLVideoElement>;
  onEnded?: ReactEventHandler<HTMLVideoElement>;
  onLoadedMetadata?: ReactEventHandler<HTMLVideoElement>;
}

/**
 * Vídeo sem som dentro da tela 4:3. Só baixa o arquivo quando chega perto da tela
 * e só toca enquanto está visível; fora dela, pausa. O botão de pausa fica sempre
 * visível e a escolha da pessoa é respeitada ao voltar à tela. Com movimento
 * reduzido, não toca sozinho e usa os controles do navegador. Se o aparelho não
 * tocar o arquivo, fica a capa com um aviso; os passos seguem em texto na página.
 */
export default function VideoTela({ src, poster, alt, loop = true, videoRef, onPlaying, onTimeUpdate, onEnded, onLoadedMetadata }: VideoTelaProps) {
  const proprioRef = useRef<HTMLVideoElement>(null);
  const ref = videoRef ?? proprioRef;
  // Navegadores sem IntersectionObserver carregam direto.
  const [carregar, setCarregar] = useState(() => typeof window !== 'undefined' && !('IntersectionObserver' in window));
  const [reduzido] = useState(prefersReducedMotion);
  const [tocando, setTocando] = useState(false);
  const [erro, setErro] = useState(false);
  const pausadoPelaPessoa = useRef(false);

  useEffect(() => {
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
  }, [reduzido, ref]);

  // Ao receber o src, começa a tocar se já estiver na tela.
  useEffect(() => {
    const video = ref.current;
    if (!carregar || reduzido || !video || pausadoPelaPessoa.current) return;
    const r = video.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) video.play().catch(() => {});
  }, [carregar, reduzido, ref]);

  const alternar = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      pausadoPelaPessoa.current = false;
      video.play().catch(() => {});
    } else {
      pausadoPelaPessoa.current = true;
      video.pause();
    }
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
        src={carregar ? src : undefined}
        poster={poster}
        aria-label={alt}
        muted
        loop={loop}
        playsInline
        // Só metadados: o download completo (até ~5 MB por vídeo) começa ao tocar.
        preload="metadata"
        controls={reduzido}
        width={960}
        height={720}
        onPlay={() => setTocando(true)}
        onPause={() => setTocando(false)}
        onPlaying={onPlaying}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        onLoadedMetadata={onLoadedMetadata}
        onError={() => setErro(true)}
        className="block h-full w-full object-contain"
      />
      {!reduzido && (
        <button
          type="button"
          onClick={alternar}
          aria-label={tocando ? 'Pausar vídeo' : 'Tocar vídeo'}
          className={`absolute bottom-2.5 right-2.5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-crfal-blue-dark/85 text-white shadow-md hover:bg-crfal-blue-dark ${focusRing}`}
        >
          {tocando ? <Pause className="h-5 w-5 fill-current" aria-hidden /> : <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden />}
        </button>
      )}
    </div>
  );
}
