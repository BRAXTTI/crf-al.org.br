import { useLayoutEffect, type ReactNode } from 'react';

/**
 * Roda `run` depois do commit da hidratação e antes dos efeitos passivos (onde as consultas buscam
 * dados). Envolve a árvore com filho único: um irmão a mais mudaria os ids de `useId` em relação ao HTML do build.
 */
export function AfterCommit({ run, children }: { run: () => void; children: ReactNode }) {
  useLayoutEffect(() => {
    run();
  }, [run]);
  return children;
}
