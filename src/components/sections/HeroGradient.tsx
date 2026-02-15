import { useEffect, useRef } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';

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

      // Base gradient (dark blue to lighter)
      const base = ctx.createLinearGradient(0, 0, w, h);
      base.addColorStop(0, '#001a2e');
      base.addColorStop(0.4, '#003354');
      base.addColorStop(0.7, '#004a80');
      base.addColorStop(1, '#0066a0');
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);

      // Animated radial blobs (mesh-style)
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
    <section className="relative min-h-[100svh] md:min-h-[90vh] flex items-center overflow-hidden">
      {/* Canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ display: 'block' }}
        aria-hidden
      />

      {/* Subtle grid pattern overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
        aria-hidden
      />

      {/* Content */}
      <div className="container-crfal relative z-10 w-full pt-24 pb-24 sm:pt-28 sm:pb-20 md:pt-32 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: headline + sub + CTA */}
          <div className="max-w-2xl">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6 animate-fade-in"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/90 text-sm font-medium">
                Portal do Farmacêutico
              </span>
            </div>

            <h1
              className="text-[2rem] leading-[1.1] sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-5 sm:mb-6 animate-slide-up"
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

            <p className="text-base sm:text-lg md:text-xl text-white/85 mb-8 sm:mb-10 max-w-xl leading-relaxed">
              Conselho Regional de Farmácia do Estado de Alagoas. Regulação, serviços e apoio ao farmacêutico.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a
                href="#servicos"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-crfal-blue font-semibold rounded-full hover:bg-white/95 hover:shadow-xl active:scale-[0.98] transition-all duration-300 text-sm sm:text-base"
              >
                Conheça nossos serviços
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="/instituicao"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 text-white font-medium rounded-full border border-white/30 hover:bg-white/20 active:scale-[0.98] transition-all duration-300 text-sm sm:text-base"
              >
                Nossa instituição
              </a>
            </div>

            {/* Quick stats - visible on mobile too */}
            <div className="grid grid-cols-3 gap-3 sm:flex sm:items-center sm:gap-6 mt-10 sm:mt-12 pt-8 border-t border-white/10">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white">8+</p>
                <p className="text-xs sm:text-sm text-white/60">Serviços Online</p>
              </div>
              <div className="hidden sm:block w-px h-10 bg-white/20" />
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white">24h</p>
                <p className="text-xs sm:text-sm text-white/60">Disponibilidade</p>
              </div>
              <div className="hidden sm:block w-px h-10 bg-white/20" />
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white">100%</p>
                <p className="text-xs sm:text-sm text-white/60">Digital</p>
              </div>
            </div>
          </div>

          {/* Right: decorative element (desktop only) */}
          <div className="hidden lg:flex items-center justify-center relative">
            <div
              className="w-full max-w-md aspect-square rounded-3xl opacity-90"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.12) 0%, transparent 70%)',
                boxShadow: '0 0 120px rgba(255,255,255,0.08)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: '1s' }}>
        <span className="text-white/40 text-xs tracking-widest uppercase hidden sm:block">Explorar</span>
        <ChevronDown className="w-5 h-5 text-white/40 animate-float" />
      </div>
    </section>
  );
}
