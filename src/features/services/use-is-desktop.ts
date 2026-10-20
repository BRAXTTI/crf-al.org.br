import { useSyncExternalStore } from 'react';

const DESKTOP_QUERY = '(min-width: 1024px)';

export function useIsDesktop() {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(DESKTOP_QUERY);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => true
  );
}

