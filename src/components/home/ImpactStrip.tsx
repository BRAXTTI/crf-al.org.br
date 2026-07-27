import { useEffect, useRef, useState } from 'react';
import { servicesData } from '@/data/servicos';

function useCountUp(target: number, active: boolean, duration = 1600) {
  const [value, setValue] = useState(0);
  const [reducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (!active || reducedMotion) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration, reducedMotion]);

  return active && reducedMotion ? target : value;
}

const metrics = [
  { target: servicesData.length, suffix: '+', label: 'Serviços online' },
  { target: 102, suffix: '', label: 'Municípios abrangidos' },
  { target: 24, suffix: 'h', label: 'Disponibilidade' },
  { target: 100, suffix: '%', label: 'Atendimento digital' },
];

export default function ImpactStrip() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-y border-crfal-gray-200/70 bg-white py-14 dark:border-slate-800 dark:bg-slate-950 sm:py-16"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.12]"
        style={{
          background:
            'radial-gradient(720px 200px at 50% -40%, rgba(0,119,204,0.14), transparent 70%)',
        }}
        aria-hidden
      />
      <div className="container-crfal relative">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {metrics.map((metric, i) => (
            <Metric key={metric.label} {...metric} active={active} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Metric({
  target,
  suffix,
  label,
  active,
  index,
}: {
  target: number;
  suffix: string;
  label: string;
  active: boolean;
  index: number;
}) {
  const value = useCountUp(target, active);

  return (
    <div
      className="group relative text-center transition-all duration-700"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? 'translateY(0)' : 'translateY(18px)',
        transitionDelay: `${index * 90}ms`,
      }}
    >
      <p className="font-display text-5xl font-light tracking-tight text-crfal-blue tabular-nums dark:text-crfal-blue-light sm:text-6xl">
        {value}
        <span className="text-[0.55em] align-baseline">{suffix}</span>
      </p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-crfal-gray-500 dark:text-crfal-gray-400">
        {label}
      </p>
      <span
        className="mx-auto mt-4 block h-px w-10 bg-crfal-blue/30 transition-all duration-500 group-hover:w-16 group-hover:bg-crfal-blue/60 dark:bg-crfal-blue-light/30"
        aria-hidden
      />
    </div>
  );
}
