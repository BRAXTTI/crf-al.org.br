import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface ThemeToggleProps {
  isOverHero?: boolean;
  mobile?: boolean;
}

const themes = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
] as const;

export default function ThemeToggle({
  isOverHero = false,
  mobile = false,
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedTheme = mounted ? theme ?? 'system' : 'system';
  const ActiveIcon =
    themes.find((item) => item.value === selectedTheme)?.icon ?? Monitor;

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={triggerClass} aria-label="Alterar tema do site">
          <ActiveIcon className={mobile ? 'w-5 h-5' : 'w-4 h-4'} />
          {!mobile && <span className="hidden xl:inline">Tema</span>}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuRadioGroup
          value={selectedTheme}
          onValueChange={(value) => setTheme(value)}
        >
          {themes.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenuRadioItem
                key={item.value}
                value={item.value}
                className="cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {item.label}
                </span>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

