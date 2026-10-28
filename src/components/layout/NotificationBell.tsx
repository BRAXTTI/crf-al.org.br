import { lazy, Suspense, useEffect, useId, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useEstadoNotificacoes } from '@/features/notificacoes/estado';
import { useFontesNotificacoes } from '@/features/notificacoes/fontes';

// O feed (e as animações de cada tipo) só é baixado quando o painel abre ou o sino recebe ponteiro/foco.
const carregarPainel = () => import('@/features/notificacoes/NotificationPanel');
const NotificationPanel = lazy(carregarPainel);

/** Notícias entram depois da primeira abertura (ou já em cache, como na home): o sino não pesa nas outras páginas. */
let painelJaAberto = false;

const VARIANTS = {
  desktop: {
    button: 'relative flex h-11 w-11 items-center justify-center rounded-full text-crfal-blue transition-colors hover:bg-crfal-blue-lighter focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue aria-expanded:bg-crfal-blue-lighter',
    icon: 'h-5 w-5',
    badge: 'ring-white',
    panel: 'absolute right-0 top-full z-50 mt-3 w-[432px]',
  },
  mobile: {
    button: 'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white hover:bg-white/10 focus-visible:outline-white aria-expanded:bg-white/10',
    icon: 'h-6 w-6',
    badge: 'ring-crfal-blue',
    panel: 'fixed inset-x-2 top-[calc(var(--header-offset)+8px)] z-50 mx-auto max-w-[432px]',
  },
} as const;

export default function NotificationBell({ variant }: { variant: keyof typeof VARIANTS }) {
  const styles = VARIANTS[variant];
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [comNoticias, setComNoticias] = useState(painelJaAberto);
  const fontes = useFontesNotificacoes(comNoticias);
  const estado = useEstadoNotificacoes();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [lastPathname, setLastPathname] = useState(pathname);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // Fecha ao trocar de página (inclusive ao abrir um evento ou notícia pelo painel).
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  const lidas = new Set(estado.lidas);
  const dispensadas = new Set(estado.dispensadas);
  const naoLidas = fontes.ids.filter((id) => !lidas.has(id) && !dispensadas.has(id)).length;

  const abrir = () => {
    void queryClient.refetchQueries({ queryKey: ['wp', 'events'], stale: true });
    void queryClient.refetchQueries({ queryKey: ['wp', 'posts', 1, 5], stale: true });
    painelJaAberto = true;
    setComNoticias(true);
    setOpen(true);
  };

  const fechar = () => {
    setOpen(false);
    buttonRef.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (!open) return;
    const button = buttonRef.current;
    panelRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      fechar();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      fechar();
      // O foco padrão do ponteiro ocorre depois de pointerdown.
      requestAnimationFrame(() => buttonRef.current?.focus({ preventScroll: true }));
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      button?.focus({ preventScroll: true });
    };
  }, [open]);

  const rotulo = naoLidas > 0 ? `Notificações, ${naoLidas} ${naoLidas === 1 ? 'não lida' : 'não lidas'}` : 'Notificações';

  return (
    <div data-notification-bell className={variant === 'desktop' ? 'relative' : undefined}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={rotulo}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => (open ? fechar() : abrir())}
        onPointerEnter={() => void carregarPainel()}
        onFocus={() => void carregarPainel()}
        className={styles.button}
      >
        <Bell className={styles.icon} aria-hidden="true" />
        {naoLidas > 0 && (
          <span
            aria-hidden
            className={`absolute right-1 top-1 min-w-[18px] rounded-full bg-crfal-gold px-1 text-center text-[10.5px] font-bold leading-[18px] text-crfal-blue-dark tabular-nums ring-2 motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:duration-300 ${styles.badge}`}
          >
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {open && (
        <div
          data-notification-panel
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label="Notificações"
          tabIndex={-1}
          // Alvo de foco programático (não interativo): sem o contorno global de :focus-visible.
          style={{ outline: 'none' }}
          onBlur={(event) => {
            const destino = event.relatedTarget as Node | null;
            if (destino && !event.currentTarget.contains(destino) && !buttonRef.current?.contains(destino)) fechar();
          }}
          className={`${styles.panel} motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-300`}
        >
          <Suspense
            fallback={
              <div role="status" className="grid h-40 place-items-center rounded-[28px] border border-crfal-gray-200/80 bg-white text-sm text-crfal-gray-600 shadow-[0_28px_60px_-24px_rgba(11,25,44,0.45)]">
                Carregando notificações…
              </div>
            }
          >
            <NotificationPanel fontes={fontes} estado={estado} onNavigate={(href) => { fechar(); navigate(href); }} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
