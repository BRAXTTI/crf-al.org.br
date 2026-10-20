import { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface UseInViewOptions {
  threshold?: number;
  /** Distância (px) acima da borda de baixo da tela em que o topo dispara a entrada (AOS `offset`). */
  offset?: number;
}

/**
 * Quanto o elemento está deslocado pela própria entrada (ou pela de um bloco que o contém):
 * o retângulo medido inclui o `translate`, e o gatilho do AOS usa a posição de layout.
 */
function deslocamento(el: Element) {
  // Soma o próprio elemento e os blocos acima: aninhado, só um deles carrega o efeito por vez.
  const seletor = '[data-reveal]:not([data-revealed])';
  let total = 0;
  let oculto = el.closest(seletor);
  while (oculto) {
    const [, y = '0'] = getComputedStyle(oculto).translate.split(' ');
    total += parseFloat(y) || 0;
    oculto = oculto.parentElement?.closest(seletor) ?? null;
  }
  return total;
}

/** Elemento renderizado que já está na tela ou acima dela (passou da dobra). */
function jaAlcancado(el: Element) {
  const { top, width, height } = el.getBoundingClientRect();
  return (width > 0 || height > 0) && top - deslocamento(el) < window.innerHeight;
}

/**
 * Revela uma vez, como o AOS do site do CFF (`anchorPlacement` top-bottom, `once`): quando o
 * topo do elemento passa `offset` px acima da borda de baixo da tela. Sem observação ou com
 * movimento reduzido, já começa visível.
 */
export function useInView<T extends Element = HTMLDivElement>({
  threshold = 0,
  offset = 100,
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
  // nasce visível, sem animar.
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
      // O retângulo observado já vem deslocado para baixo pelo translate; a margem desconta isso
      // para disparar na mesma posição de layout do AOS.
      const margem = deslocamento(el) - offset;
      observer = new IntersectionObserver(
        ([entry]) => {
          const { bottom, height } = entry.boundingClientRect;
          // Também revela o que ficou para trás num salto (âncora), para não achar vazio na volta.
          if (entry.isIntersecting || (height > 0 && bottom < 0)) {
            setInView(true);
            observer.disconnect();
          }
        },
        { threshold, rootMargin: `0px 0px ${margem}px 0px` }
      );
      observer.observe(el);
    } catch {
      // Observador indisponível ou recusado: o conteúdo fica visível.
      setInView(true);
      return;
    }
    return () => observer.disconnect();
  }, [inView, threshold, offset]);

  /** Atributos do elemento que entra; podem ir num filho do observado. */
  const revealProps = {
    'data-reveal': '',
    'data-revealed': inView ? '' : undefined,
    'data-reveal-instant': instant ? '' : undefined,
  };

  return { ref, inView, revealProps };
}
