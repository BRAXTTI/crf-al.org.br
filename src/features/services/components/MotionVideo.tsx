import { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { type TutorialMotion } from '@/data/servicos';
import { useIsDesktop } from '../use-is-desktop';

const motion = 'transition duration-200 motion-reduce:transition-none';

type VideoComFullscreenWebkit = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

/**
 * Vídeo vertical em motion. No desktop toca dentro de uma moldura de iPhone;
 * no celular o toque já abre o vídeo em tela cheia.
 */
export default function MotionVideo({ motion: video, titulo }: { motion: TutorialMotion; titulo: string }) {
  const ref = useRef<VideoComFullscreenWebkit>(null);
  const isDesktop = useIsDesktop();
  const [tocando, setTocando] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Ao sair da tela cheia no celular o vídeo pausa, em vez de seguir tocando na miniatura.
    if (isDesktop) return;
    const aoSair = () => {
      if (document.fullscreenElement) return;
      el.pause();
      setTocando(false);
    };
    el.addEventListener('fullscreenchange', aoSair);
    el.addEventListener('webkitendfullscreen', aoSair);
    return () => {
      el.removeEventListener('fullscreenchange', aoSair);
      el.removeEventListener('webkitendfullscreen', aoSair);
    };
  }, [isDesktop]);

  const assistir = () => {
    const el = ref.current;
    if (!el) return;
    setTocando(true);
    const reproducao = el.play();
    if (!isDesktop) {
      // Precisa acontecer dentro do gesto do usuário: Android usa a API padrão, iPhone a do WebKit.
      try {
        if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
        else el.webkitEnterFullscreen?.();
      } catch {
        // Sem tela cheia disponível, o vídeo segue tocando na miniatura.
      }
    }
    reproducao.catch(() => setTocando(false));
  };

  const legenda = `Tutorial em vídeo: ${titulo}`;

  const elementoVideo = (className: string) => (
    <video
      ref={ref}
      src={video.src}
      poster={video.poster}
      preload="metadata"
      playsInline
      controls={tocando}
      onEnded={() => setTocando(false)}
      aria-label={legenda}
      className={className}
    />
  );

  const botaoPlay = (grande: boolean) => (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-white text-crfal-blue shadow-xl ring-4 ring-crfal-gold/40 group-hover:scale-105 group-hover:ring-crfal-gold/70 ${motion} ${grande ? 'h-16 w-16' : 'h-11 w-11'}`}>
      <Play className={`ml-0.5 fill-current ${grande ? 'h-7 w-7' : 'h-5 w-5'}`} aria-hidden="true" />
    </span>
  );

  return (
    <div className="relative isolate overflow-hidden bg-crfal-blue-dark bg-[radial-gradient(ellipse_at_top_right,rgba(0,102,204,0.35),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(197,155,39,0.14),transparent_55%)]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-size-[48px_48px] mask-[radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />

      {isDesktop ? (
        // Desktop: o vídeo toca dentro da moldura de iPhone, imitando a tela do celular.
        <div className="flex justify-center px-6 py-8">
          <div className="relative w-[260px] xl:w-[280px]">
            <div className="absolute left-[5%] top-[3.488%] h-[93.023%] w-[90%] overflow-hidden bg-black rounded-[12.22%/6.875%]">
              {elementoVideo('block h-full w-full object-cover')}
            </div>
            <img
              src="/images/tutoriais/iphone-frame.svg"
              alt=""
              aria-hidden="true"
              className="pointer-events-none relative block w-full drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)]"
            />
            {!tocando && (
              <button
                type="button"
                onClick={assistir}
                aria-label={`Assistir ao vídeo: ${titulo} (${video.duracao})`}
                className="group absolute inset-[3.5%_5%] flex flex-col items-center justify-center gap-3 rounded-[12%/7%] text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-gold"
              >
                {botaoPlay(true)}
                <span className="rounded-full bg-crfal-blue-dark/80 px-3 py-1 text-xs font-semibold backdrop-blur-xs">{video.duracao}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        // Celular: a miniatura abre o vídeo direto em tela cheia.
        <div className="flex items-center gap-4 p-4 sm:p-5">
          {/* Toque na miniatura também abre o vídeo; o botão ao lado é o alvo acessível. */}
          <div onClick={tocando ? undefined : assistir} className="w-[84px] shrink-0 cursor-pointer overflow-hidden rounded-xl bg-black ring-1 ring-white/20">
            {elementoVideo('block aspect-9/16 w-full object-cover')}
          </div>
          <button
            type="button"
            onClick={assistir}
            className="group flex min-h-[44px] flex-1 items-center gap-3 text-left text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-gold"
          >
            {botaoPlay(false)}
            <span>
              <span className="block text-sm font-bold">Assistir ao vídeo</span>
              <span className="mt-0.5 block text-xs text-white/65">{video.duracao} · abre em tela cheia</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
