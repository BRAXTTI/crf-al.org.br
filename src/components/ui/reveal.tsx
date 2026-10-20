import { createElement, type ComponentPropsWithoutRef, type CSSProperties } from 'react';
import { useInView } from '@/hooks/useInView';

type RevealProps<T extends keyof HTMLElementTagNameMap> = {
  as?: T;
  delay?: number;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'delay'>;

/** O próprio painel ou item de grade recebe a entrada, sem um contêiner extra. */
export function Reveal<T extends keyof HTMLElementTagNameMap = 'div'>({
  as,
  delay = 0,
  className,
  style,
  children,
  ...props
}: RevealProps<T>) {
  const { ref, inView } = useInView<HTMLElementTagNameMap[T]>();

  return createElement(as ?? 'div', {
    ...props,
    ref,
    className,
    style: { ...style, '--reveal-delay': `${delay}ms` } as CSSProperties,
    'data-reveal': '',
    'data-revealed': inView ? '' : undefined,
  }, children);
}
