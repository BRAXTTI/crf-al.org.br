import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

interface ThemeToggleProps {
  isOverHero?: boolean;
  mobile?: boolean;
}

export default function ThemeToggle({
  isOverHero = false,
  mobile = false,
}: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';
  const ActiveIcon = !mounted ? Monitor : isDark ? Moon : Sun;
  const ariaLabel = isDark ? 'Ativar modo claro' : 'Ativar modo escuro';

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const triggerClass = mobile
    ? `min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border transition-all ${
        isOverHero
          ? 'text-white border-white/20 bg-white/10 hover:bg-white/15'
          : 'text-neutral-700 border-neutral-200 bg-white hover:bg-neutral-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800'
      }`
    : `flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg border transition-all ${
        isOverHero
          ? 'text-white border-white/20 bg-white/10 hover:bg-white/15'
          : 'text-neutral-700 border-neutral-200 bg-white hover:bg-neutral-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800'
      }`;

  return (
    <button
      onClick={handleToggle}
      className={triggerClass}
      aria-label={ariaLabel}
    >
      <ActiveIcon className={mobile ? 'w-5 h-5' : 'w-4 h-4'} />
      {!mobile && <span className="hidden xl:inline">Tema</span>}
    </button>
  );
}
