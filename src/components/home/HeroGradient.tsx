import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

export default function HeroGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      time += 0.004;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      const base = ctx.createLinearGradient(0, 0, w, h);
      base.addColorStop(0, '#001a2e');
      base.addColorStop(0.4, '#003354');
      base.addColorStop(0.7, '#004a80');
      base.addColorStop(1, '#0066a0');
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);

      const cx1 = w * (0.3 + 0.15 * Math.sin(time));
      const cy1 = h * (0.4 + 0.1 * Math.cos(time * 0.7));
      const g1 = ctx.createRadialGradient(cx1, cy1, 0, cx1, cy1, w * 0.6);
      g1.addColorStop(0, 'rgba(0, 119, 204, 0.5)');
      g1.addColorStop(0.5, 'rgba(0, 74, 128, 0.2)');
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      const cx2 = w * (0.7 + 0.12 * Math.cos(time * 0.9));
      const cy2 = h * (0.5 + 0.12 * Math.sin(time * 0.6));
      const g2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, w * 0.5);
      g2.addColorStop(0, 'rgba(0, 150, 200, 0.35)');
      g2.addColorStop(0.6, 'rgba(0, 74, 128, 0.15)');
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      const cx3 = w * (0.5 + 0.2 * Math.sin(time * 0.5));
      const cy3 = h * (0.2 + 0.15 * Math.cos(time));
      const g3 = ctx.createRadialGradient(cx3, cy3, 0, cx3, cy3, w * 0.45);
      g3.addColorStop(0, 'rgba(100, 180, 220, 0.25)');
      g3.addColorStop(0.7, 'transparent');
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, w, h);

      animationId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ display: 'block' }}
        aria-hidden
      />

      <div className="container-crfal relative z-10 w-full pt-28 pb-20 md:pt-32 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="max-w-2xl">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight mb-6"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #b8e0f0 40%, #7ec8e3 70%, #e0f4fc 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textShadow: '0 0 80px rgba(255,255,255,0.15)',
              }}
            >
              Bem-vindo ao CRFAL
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-xl leading-relaxed">
              Conselho Regional de Farmácia do Estado de Alagoas. Regulação, serviços e apoio ao farmacêutico.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#servicos"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-crfal-blue font-semibold rounded-full hover:bg-white/95 hover:shadow-xl transition-all duration-300"
              >
                Conheça nossos serviços
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="/instituicao"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 text-white font-medium rounded-full border border-white/30 hover:bg-white/20 transition-all duration-300"
              >
                Nossa instituição
              </a>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center relative">
            <div
              className="w-full max-w-md aspect-square rounded-3xl opacity-90"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.12) 0%, transparent 70%)',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
