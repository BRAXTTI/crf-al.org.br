import { useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';

type BorderBeamProps = {
  /** Comprimento do rastro, em fração do perímetro medido do pai. */
  length?: number;
  /** Velocidade constante da cabeça, em px/s (a duração sai do perímetro). */
  speed?: number;
  /** Cor da cabeça. */
  colorFrom?: string;
  /** Cor do meio do rastro, que some até a cauda. */
  colorTo?: string;
  /** Espessura do núcleo, em px; deve igualar a borda do pai. */
  borderWidth?: number;
  /** Sem fim; por padrão dá uma única volta e chama `onComplete`. */
  loop?: boolean;
  /** Trechos do rastro; menos trechos, menos trabalho por quadro. */
  segments?: number;
  /**
   * Brilho do feixe: `blur` (filtro SVG, mais fiel, refeito a cada quadro) ou `halo` (traço largo
   * e translúcido por baixo, sem filtro, mais leve para celulares).
   */
  glow?: 'blur' | 'halo';
  onComplete?: () => void;
  className?: string;
};

/** Trechos do rastro; quanto mais, mais contínuo o degradê ao longo do caminho. */
const SEGMENTS = 32;

/** Halo sem filtro: largura (px) e opacidade relativa do traço de baixo. */
const HALO_WIDTH = 3;
const HALO_OPACITY = 0.3;

type Geometry = { width: number; height: number; radius: number };

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(from: string, to: string, t: number) {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(' ')})`;
}

/** Opacidade ao longo do rastro: u = 0 na cabeça, 1 na cauda. */
const alphaAt = (u: number) => (1 - u) ** 1.3;

/** Cor ao longo do rastro: cabeça na cor inicial, passa à final até o meio. */
const colorAt = (from: string, to: string, u: number) => mix(from, to, Math.min(Math.max((u - 0.15) / 0.35, 0), 1));

/**
 * Trechos lado a lado, sem sobreposição (para as cores não se misturarem): `start` é a distância
 * da cabeça do feixe até a ponta do trecho.
 */
function beamSegments(trail: number, colorFrom: string, colorTo: string, count: number) {
  const step = trail / count;
  return Array.from({ length: count }, (_, j) => {
    const u = (j + 0.5) / count;
    return { start: step * j, dash: step, color: colorAt(colorFrom, colorTo, u), opacity: alphaAt(u) };
  });
}

/**
 * Feixe de luz que percorre a borda do elemento pai (padrão Magic UI), desenhado como traço SVG
 * sobre a própria borda: um `<rect>` com o raio medido do pai, em sentido horário a partir do
 * canto superior esquerdo. A cabeça anda em velocidade constante (traço tracejado e animação
 * `border-beam` linear, sem easing nem freio nos cantos). O pai precisa de `position: relative`.
 */
export function BorderBeam({
  length = 0.22,
  speed = 935,
  colorFrom = '#ed3237',
  colorTo = '#0092d5',
  borderWidth = 1,
  loop = false,
  segments: segmentCount = SEGMENTS,
  glow = 'blur',
  onComplete,
  className,
}: BorderBeamProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const done = useRef(false);
  const glowId = useId();
  const [geometry, setGeometry] = useState<Geometry | null>(null);

  // Tamanho da caixa de borda e raio do pai, medidos de novo a cada redimensionamento.
  useLayoutEffect(() => {
    const parent = svgRef.current?.parentElement;
    if (!parent) return;
    const measure = () => {
      const { width, height } = parent.getBoundingClientRect();
      const radius = parseFloat(getComputedStyle(parent).borderTopLeftRadius) || 0;
      setGeometry((prev) =>
        prev && prev.width === width && prev.height === height && prev.radius === radius ? prev : { width, height, radius }
      );
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  // Linha central da borda: meia espessura para dentro da caixa de borda.
  const inset = borderWidth / 2;
  const w = geometry ? Math.max(geometry.width - borderWidth, 0) : 0;
  const h = geometry ? Math.max(geometry.height - borderWidth, 0) : 0;
  const r = geometry ? Math.min(Math.max(geometry.radius - inset, 0), w / 2, h / 2) : 0;
  const perimeter = 2 * (w - 2 * r) + 2 * (h - 2 * r) + 2 * Math.PI * r;
  const trail = perimeter * length;
  // Uma volta: a cabeça percorre o perímetro e a cauda termina de entrar no ponto de partida.
  const travel = loop ? perimeter : perimeter + trail;
  const duration = travel / speed;
  const segments = beamSegments(trail, colorFrom, colorTo, segmentCount);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className={cn('pointer-events-none absolute overflow-visible motion-reduce:hidden', className)}
      style={{ inset: -borderWidth }}
      width={geometry?.width ?? 0}
      height={geometry?.height ?? 0}
      onAnimationEnd={(event) => {
        if (loop || done.current || !(event.target instanceof SVGRectElement)) return;
        done.current = true;
        onComplete?.();
      }}
    >
      {perimeter > 0 && (
        <>
          {glow === 'blur' && (
            <defs>
              {/* Brilho neon justo e discreto, na cor de cada trecho (lê como ~3–4px); uma camada só, para o vermelho não arder no branco. */}
              <filter id={glowId} filterUnits="userSpaceOnUse" x={-8} y={-8} width={w + 16 + borderWidth} height={h + 16 + borderWidth}>
                <feGaussianBlur in="SourceGraphic" stdDeviation={1.5} result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          )}
          <g filter={glow === 'blur' ? `url(#${CSS.escape(glowId)})` : undefined} fill="none">
            {(glow === 'halo' ? [HALO_WIDTH, borderWidth] : [borderWidth]).map((strokeWidth, layer, layers) =>
              segments.map(({ start, dash, color, opacity }, i) => (
                <rect
                  key={`${layer}-${i}`}
                  x={inset}
                  y={inset}
                  width={w}
                  height={h}
                  rx={r}
                  pathLength={perimeter}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeOpacity={layer < layers.length - 1 ? opacity * HALO_OPACITY : opacity}
                  strokeDasharray={`${dash} ${loop ? perimeter - dash : travel}`}
                  className="animate-border-beam"
                  style={{
                    animationDuration: `${duration}s`,
                    animationIterationCount: loop ? 'infinite' : 1,
                    animationFillMode: 'both',
                    '--beam-from': `${start + dash}px`,
                    '--beam-to': `${start + dash - travel}px`,
                  } as CSSProperties}
                />
              ))
            )}
          </g>
        </>
      )}
    </svg>
  );
}
