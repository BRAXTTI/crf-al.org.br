import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

type BorderBeamProps = {
  /** Lado do feixe, em px. */
  size?: number;
  /** Segundos por volta completa. */
  duration?: number;
  /** Segundos já percorridos ao montar. */
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  className?: string;
  style?: CSSProperties;
  reverse?: boolean;
  /** Ponto de partida, em % do perímetro. */
  initialOffset?: number;
  borderWidth?: number;
  /** Voltas antes de parar; padrão: sem fim. */
  iterations?: number;
  /** Chamado ao fim da última volta (só com `iterations` finito). */
  onComplete?: () => void;
};

/**
 * Feixe de luz que percorre a borda do elemento pai (padrão Magic UI), via
 * `offset-path: rect()` e a animação CSS `border-beam` (sem o `motion.div`,
 * que pesaria ~45 kB na home). O pai precisa de `position: relative` e raio.
 * Sem suporte a `rect()` no `offset-path` (Safari < 17.2), o feixe não
 * aparece. A volta começa no canto superior esquerdo, em sentido horário.
 */
export function BorderBeam({
  className,
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = '#c59b27',
  colorTo = '#0066cc',
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1,
  iterations = Infinity,
  onComplete,
}: BorderBeamProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden rounded-[inherit] border-(length:--border-beam-width) border-transparent mask-[linear-gradient(transparent,transparent),linear-gradient(#000,#000)] [mask-clip:padding-box,border-box] [mask-composite:intersect] supports-[offset-path:rect(0_auto_auto_0)]:block"
      style={{ '--border-beam-width': `${borderWidth}px` } as CSSProperties}
    >
      <div
        className={cn(
          'absolute aspect-square animate-border-beam bg-linear-to-l from-(--color-from) via-(--color-to) to-transparent motion-reduce:hidden',
          reverse && '[animation-direction:reverse]',
          className,
        )}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget) onComplete?.();
        }}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          animationDuration: `${duration}s`,
          animationDelay: `${-delay}s`,
          animationIterationCount: Number.isFinite(iterations) ? iterations : 'infinite',
          '--beam-from': `${initialOffset}%`,
          '--beam-to': `${100 + initialOffset}%`,
          '--color-from': colorFrom,
          '--color-to': colorTo,
          ...style,
        } as CSSProperties}
      />
    </div>
  );
}
