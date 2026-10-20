import { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
}

/** Elemento renderizado que já está na tela ou acima dela (passou da dobra). */
function jaAlcancado(el: Element) {
  const { top, width, height } = el.getBoundingClientRect();
  return (width > 0 || height > 0) && top < window.innerHeight;
}

/**
 * Revela uma vez; sem observação ou com movimento reduzido, já começa visível.
 *
 * `threshold` 0 com margem inferior negativa: revela quando o topo passa um pouco da borda
 * de baixo, mesmo em blocos mais altos que a tela (uma fração da área nunca chegaria lá).
 */
export function useInView<T extends Element = HTMLDivElement>({
  threshold = 0,
  rootMargin = '0px 0px -6% 0px',
}: UseInViewOptions = {}) {
  const ref = useRef<T>(null);
  const [instant, setInstant] = useState(false);
  const [inView, setInView] = useState(
    () =>
      typeof window === 'undefined' ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Antes da primeira pintura (e depois do ScrollRestoration): o que já está acima da dobra
  // nasce nítido. Medir já calcula o estilo fosco, então a troca vai sem transição.
  useLayoutEffect(() => {
    if (!inView && ref.current && jaAlcancado(ref.current)) {
      setInView(true);
      setInstant(true);
    }
    // Só na montagem; depois, quem decide é o observador.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (inView || !el) return;
    let observer: IntersectionObserver;
    try {
      observer = new IntersectionObserver(
        ([entry]) => {
          const { bottom, height } = entry.boundingClientRect;
          // Também revela o que ficou para trás num salto (âncora), para não achar desfocado na volta.
          if (entry.isIntersecting || (height > 0 && bottom < 0)) {
            setInView(true);
            observer.disconnect();
          }
        },
        { threshold, rootMargin }
      );
      observer.observe(el);
    } catch {
      // Observador indisponível ou recusado: o conteúdo fica visível.
      setInView(true);
      return;
    }
    return () => observer.disconnect();
  }, [inView, threshold, rootMargin]);

  /** Atributos do elemento que entra; podem ir num filho do observado. */
  const revealProps = {
    'data-reveal': '',
    'data-revealed': inView ? '' : undefined,
    'data-reveal-instant': instant ? '' : undefined,
  };

  return { ref, revealProps };
}
