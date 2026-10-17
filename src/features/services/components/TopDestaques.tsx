import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, ListChecks, Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import { REELS_DESTAQUE, type ReelDestaque } from '@/data/tutoriais-destaque';

const goldLabel = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]';
const motion = 'transition duration-200 motion-reduce:transition-none';

/** Faixa “Top 5 destaques”: cards verticais com prévia e um visualizador estilo reels. */
export default function TopDestaques({ onVerTutorial }: { onVerTutorial: (tutorialId: string) => void }) {
  const [aberto, setAberto] = useState<number | null>(null);
  const ultimoCard = useRef<HTMLButtonElement | null>(null);

  const abrir = (index: number, botao: HTMLButtonElement) => {
    ultimoCard.current = botao;
    // No celular o visualizador ocupa a tela inteira; onde a API existe, esconde também a barra do navegador.
    if (!window.matchMedia('(min-width: 1024px)').matches) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
    setAberto(index);
  };

  const fechar = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setAberto(null);
    ultimoCard.current?.focus();
  };

  return (
    <section aria-labelledby="top-destaques" className="mb-8 md:mb-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className={goldLabel}>Top 5 destaques</p>
          <h2 id="top-destaques" className="mt-1 text-[22px] font-bold leading-tight tracking-tight text-crfal-blue sm:text-[24px]">
            Tutoriais em menos de 1 minuto
          </h2>
          <span aria-hidden="true" className="mt-2.5 block h-0.5 w-10 rounded-full bg-crfal-gold" />
        </div>
        <p className="hidden text-sm text-crfal-gray-600 sm:block">Passe o mouse para ver a prévia</p>
      </div>

      <ol className="-mx-4 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible [&::-webkit-scrollbar]:hidden">
        {REELS_DESTAQUE.map((reel, index) => (
          <li key={reel.id} className="w-[42%] shrink-0 snap-start sm:w-[30%] lg:w-auto">
            <ReelCard reel={reel} posicao={index + 1} onAbrir={(botao) => abrir(index, botao)} />
          </li>
        ))}
      </ol>

      {aberto !== null &&
        createPortal(
          <ReelsViewer
            inicial={aberto}
            onFechar={fechar}
            onVerTutorial={(id) => {
              fechar();
              onVerTutorial(id);
            }}
          />,
          document.body
        )}
    </section>
  );
}

function ReelCard({ reel, posicao, onAbrir }: { reel: ReelDestaque; posicao: number; onAbrir: (botao: HTMLButtonElement) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [previa, setPrevia] = useState(false);

  // Prévia muda só em quem tem mouse; no toque o card abre direto o visualizador.
  const iniciarPrevia = () => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    videoRef.current?.play().then(() => setPrevia(true), () => {});
  };
  const pararPrevia = () => {
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
    setPrevia(false);
  };

  return (
    <button
      type="button"
      onClick={(e) => onAbrir(e.currentTarget)}
      onMouseEnter={iniciarPrevia}
      onMouseLeave={pararPrevia}
      onFocus={iniciarPrevia}
      onBlur={pararPrevia}
      aria-label={`${posicao}º destaque: ${reel.title}, vídeo de ${reel.duracao}`}
      className={`group relative block aspect-[9/16] w-full overflow-hidden rounded-2xl bg-crfal-blue-dark text-left shadow-[0_18px_36px_-20px_rgba(11,25,44,0.6)] ring-1 ring-crfal-gray-200 ${motion} hover:-translate-y-1 hover:shadow-[0_26px_44px_-22px_rgba(11,25,44,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2`}
    >
      <img src={reel.poster} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      <video
        ref={videoRef}
        src={reel.src}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full object-cover ${motion} ${previa ? 'opacity-100' : 'opacity-0'}`}
      />

      <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,25,44,0.98)_0%,rgba(11,25,44,0.85)_28%,rgba(11,25,44,0)_55%,rgba(11,25,44,0)_80%,rgba(11,25,44,0.35)_100%)]" />

      <span aria-hidden="true" className="absolute left-3 top-2 text-[40px] font-black leading-none text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.45)] [-webkit-text-stroke:1.5px_#C59B27] sm:text-[48px]">
        {posicao}
      </span>
      <span aria-hidden="true" className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
        <Play className="h-3 w-3 fill-current" /> {reel.duracao}
      </span>

      <span aria-hidden="true" className={`absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-crfal-blue shadow-lg ring-4 ring-crfal-gold/40 ${motion} ${previa ? 'scale-90 opacity-0' : 'opacity-100'}`}>
        <Play className="ml-0.5 h-5 w-5 fill-current" />
      </span>

      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 p-3">
        <span className="block text-[14px] font-bold leading-snug text-white sm:text-[15px]">{reel.title}</span>
        <span className="mt-0.5 block text-[12px] text-white/70">{reel.subtitle}</span>
      </span>
    </button>
  );
}

function ReelsViewer({
  inicial,
  onFechar,
  onVerTutorial,
}: {
  inicial: number;
  onFechar: () => void;
  onVerTutorial: (tutorialId: string) => void;
}) {
  const [atual, setAtual] = useState(inicial);
  const [pausado, setPausado] = useState(false);
  const [mudo, setMudo] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fecharRef = useRef<HTMLButtonElement>(null);
  const reel = REELS_DESTAQUE[atual];
  const total = REELS_DESTAQUE.length;

  const irPara = useCallback(
    (index: number) => {
      if (index < 0) return;
      if (index >= total) return onFechar();
      setAtual(index);
      setProgresso(0);
      setPausado(false);
    },
    [total, onFechar]
  );

  useEffect(() => {
    fecharRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar();
      else if (e.key === 'ArrowRight') irPara(atual + 1);
      else if (e.key === 'ArrowLeft') irPara(atual - 1);
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [atual, irPara, onFechar]);

  // Se o celular sair da tela cheia pelo botão “voltar”, fecha junto.
  useEffect(() => {
    const aoMudar = () => {
      if (!document.fullscreenElement && !window.matchMedia('(min-width: 1024px)').matches) onFechar();
    };
    document.addEventListener('fullscreenchange', aoMudar);
    return () => document.removeEventListener('fullscreenchange', aoMudar);
  }, [onFechar]);

  const alternarPausa = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPausado(false);
    } else {
      v.pause();
      setPausado(true);
    }
  };

  const botaoNav = 'hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 lg:flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-gold';
  const botaoTopo = 'flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-gold';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Destaque ${atual + 1} de ${total}: ${reel.title}`}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black lg:gap-6 lg:bg-crfal-blue-dark/95 lg:backdrop-blur-md motion-safe:animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onFechar()}
    >
      <button type="button" onClick={() => irPara(atual - 1)} disabled={atual === 0} aria-label="Vídeo anterior" className={botaoNav}>
        <ChevronLeft className="h-6 w-6" />
      </button>

      <div className="relative h-[100dvh] w-full overflow-hidden bg-black lg:aspect-[9/16] lg:h-[min(88vh,820px)] lg:w-auto lg:rounded-3xl lg:shadow-2xl lg:ring-1 lg:ring-white/10">
        <video
          key={reel.id}
          ref={videoRef}
          src={reel.src}
          poster={reel.poster}
          autoPlay
          playsInline
          muted={mudo}
          onTimeUpdate={(e) => setProgresso(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
          onEnded={() => irPara(atual + 1)}
          className="absolute inset-0 h-full w-full object-contain lg:object-cover"
        />

        {/* Toque na esquerda volta, na direita avança, como nos stories */}
        <div className="absolute inset-0 flex" aria-hidden="true">
          <div className="h-full w-1/3" onClick={() => irPara(atual - 1)} />
          <div className="h-full w-1/3" onClick={alternarPausa} />
          <div className="h-full w-1/3" onClick={() => irPara(atual + 1)} />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent px-3 pb-8 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex gap-1">
            {REELS_DESTAQUE.map((r, i) => (
              <span key={r.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
                <span
                  className="block h-full rounded-full bg-white"
                  style={{ width: `${i < atual ? 100 : i === atual ? progresso * 100 : 0}%` }}
                />
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-crfal-gold text-xs font-black text-crfal-blue-dark">{atual + 1}</span>
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{reel.title}</p>
            <div className="pointer-events-auto flex">
              <button type="button" onClick={alternarPausa} aria-label={pausado ? 'Continuar' : 'Pausar'} className={botaoTopo}>
                {pausado ? <Play className="h-5 w-5 fill-current" /> : <Pause className="h-5 w-5 fill-current" />}
              </button>
              <button type="button" onClick={() => setMudo((m) => !m)} aria-label={mudo ? 'Ativar som' : 'Desativar som'} className={botaoTopo}>
                {mudo ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <button ref={fecharRef} type="button" onClick={onFechar} aria-label="Fechar" className={botaoTopo}>
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {(reel.tutorialId || reel.href) && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-10">
            {reel.tutorialId ? (
              <button
                type="button"
                onClick={() => onVerTutorial(reel.tutorialId!)}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-crfal-blue hover:bg-crfal-blue-lighter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-gold"
              >
                <ListChecks className="h-4 w-4" aria-hidden="true" /> Ver o passo a passo
              </button>
            ) : (
              <Link
                to={reel.href!}
                onClick={onFechar}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-crfal-blue hover:bg-crfal-blue-lighter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-gold"
              >
                {reel.hrefLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        )}
      </div>

      <button type="button" onClick={() => irPara(atual + 1)} disabled={atual === total - 1} aria-label="Próximo vídeo" className={botaoNav}>
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}
