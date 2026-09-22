import type { CSSProperties, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import './arrow-fill-button.css';

export type ArrowFillButtonProps = {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Elemento raiz: `a` (padrão), `button` ou um componente (ex.: `Link` do react-router). */
  as?: ElementType;
  bgColor?: string;
  textColor?: string;
  fillBgColor?: string;
  fillTextColor?: string;
  hoverFillBgColor?: string;
  hoverFillTextColor?: string;
  arrowColor?: string;
  hoverArrowColor?: string;
} & Record<string, unknown>;

/**
 * Botão com preenchimento animado e seta deslizante.
 * Origem: ObsidianUI (MIT). Adaptado ao CRF-AL: fonte da casa, cores da marca,
 * `prefers-reduced-motion` e classes prefixadas (`crfal-`) para não colidir.
 */
export function ArrowFillButton({
  children = 'Saiba mais',
  className,
  bgColor = '#003366',
  textColor = '#ffffff',
  fillBgColor = '#ffffff',
  fillTextColor = '#003366',
  hoverFillBgColor,
  hoverFillTextColor,
  arrowColor,
  hoverArrowColor,
  as: Component = 'a',
  style,
  ...props
}: ArrowFillButtonProps) {
  return (
    <Component
      {...(Component === 'button' ? { type: 'button' } : {})}
      {...props}
      className={cn('crfal-arrow-fill-btn', className)}
      style={
        {
          '--btn-bg': bgColor,
          '--btn-text': textColor,
          '--btn-fill-bg': fillBgColor,
          '--btn-fill-text': fillTextColor,
          // Sem hover explícito, o preenchimento mantém a própria cor — evita a
          // cor "desbotar" durante a transição do clip-path.
          '--btn-fill-bg-hover': hoverFillBgColor || fillBgColor,
          '--btn-fill-text-hover': hoverFillTextColor || fillTextColor,
          '--btn-arrow': arrowColor || fillTextColor,
          '--btn-arrow-hover': hoverArrowColor || hoverFillTextColor || fillTextColor,
          ...style,
        } as CSSProperties
      }
    >
      <span className="crfal-arrow-fill-btn__label">{children}</span>

      <span aria-hidden="true" className="crfal-arrow-fill-btn__fill">
        <span className="crfal-arrow-fill-btn__label">{children}</span>

        <span className="crfal-arrow-fill-btn__arrow">
          <svg
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.82475e-07 5.625L7.625 5.625L4.125 9.125L5 10L10 5L5 -4.37114e-07L4.125 0.874999L7.625 4.375L4.91753e-07 4.375L3.82475e-07 5.625Z"
              className="crfal-arrow-fill-btn__path"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.82475e-07 5.625L7.625 5.625L4.125 9.125L5 10L10 5L5 -4.37114e-07L4.125 0.874999L7.625 4.375L4.91753e-07 4.375L3.82475e-07 5.625Z"
              className="crfal-arrow-fill-btn__path"
            />
          </svg>
        </span>
      </span>
    </Component>
  );
}

export default ArrowFillButton;
