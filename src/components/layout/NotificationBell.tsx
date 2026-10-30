import { lazy, Suspense, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { contarNaoLidas, useEstadoNotificacoes } from '@/features/notificacoes/estado';
import { useFontesNotificacoes } from '@/features/notificacoes/fontes';
import { EVENTO_ABRIR_PAINEL, EVENTO_NOVIDADE, definirPainelAberto } from '@/features/notificacoes/sinal';

// O feed (e as animações de cada tipo) só é baixado quando o painel abre ou o sino recebe ponteiro/foco.
const carregarPainel = () => import('@/features/notificacoes/NotificationPanel');
const NotificationPanel = lazy(carregarPainel);

/** Respiro entre a borda inferior do <header> e o painel, igual em todas as larguras. */
const RESPIRO_PX = 8;

/** Notícias entram depois da primeira abertura (ou já em cache, como na home): o sino não pesa nas outras páginas. */
let painelJaAberto = false;

const VARIANTS = {
  desktop: {
    button: 'relative flex h-11 w-11 items-center justify-center rounded-full text-crfal-blue transition-colors hover:bg-crfal-blue-lighter focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue aria-expanded:bg-crfal-blue-lighter',
    icon: 'h-5 w-5',
    badge: 'ring-white',
    // O topo é medido até o fim do <header> inteiro (barra utilitária, barra principal e borda).
    panel: 'absolute right-0 top-[calc(100%+12px)] z-50 w-[432px]',
  },
  mobile: {
    button: 'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white hover:bg-white/10 focus-visible:outline-white aria-expanded:bg-white/10',
    icon: 'h-6 w-6',
    badge: 'ring-crfal-blue',
    panel: 'fixed inset-x-3 top-[calc(var(--header-offset)+8px)] z-50 mx-auto max-w-[432px]',
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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const [topoDesktop, setTopoDesktop] = useState<number>();

  // Fecha ao trocar de página (inclusive ao abrir um evento ou notícia pelo painel).
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  const naoLidas = contarNaoLidas(fontes.ids, estado);

  const abrir = useCallback(() => {
    void queryClient.refetchQueries({ queryKey: ['wp', 'events'], stale: true });
    void queryClient.refetchQueries({ queryKey: ['wp', 'posts', 1, 5], stale: true });
    painelJaAberto = true;
    setComNoticias(true);
    setOpen(true);
  }, [queryClient]);

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

  // O banner só aparece (e some, se já estiver na tela) com o painel fechado.
  useEffect(() => {
    if (!open) return;
    definirPainelAberto(true);
    return () => definirPainelAberto(false);
  }, [open]);

  // Quando o banner avisa de novidades, o sino balança uma vez e amortece, como um sino de verdade.
  useEffect(() => {
    const onNovidade = () => {
      const icon = iconRef.current;
      if (!icon || icon.getBoundingClientRect().width === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      icon.animate(
        [
          { transform: 'rotate(0deg)' },
          { transform: 'rotate(-9deg)', offset: 0.25 },
          { transform: 'rotate(6deg)', offset: 0.55 },
          { transform: 'rotate(-2deg)', offset: 0.8 },
          { transform: 'rotate(0deg)' },
        ],
        { duration: 500, easing: 'ease-out' },
      );
    };
    window.addEventListener(EVENTO_NOVIDADE, onNovidade);
    return () => window.removeEventListener(EVENTO_NOVIDADE, onNovidade);
  }, []);

  // O clique no banner abre o painel do sino visível (o outro está oculto por CSS).
  useEffect(() => {
    const onAbrir = () => {
      if (buttonRef.current && buttonRef.current.getBoundingClientRect().width > 0) abrir();
    };
    window.addEventListener(EVENTO_ABRIR_PAINEL, onAbrir);
    return () => window.removeEventListener(EVENTO_ABRIR_PAINEL, onAbrir);
  }, [abrir]);

  // Desktop: o sino fica no meio da barra; o painel desce até o fim do <header> + 8px. A distância
  // sino→fim do header não muda quando a barra utilitária recolhe (os dois sobem juntos), então
  // basta medir ao abrir e ao redimensionar.
  useLayoutEffect(() => {
    if (!open || variant !== 'desktop') return;
    const medir = () => {
      const wrapper = wrapperRef.current;
      const header = wrapper?.closest('header');
      if (!wrapper || !header) return;
      const ate = header.getBoundingClientRect().bottom - wrapper.getBoundingClientRect().bottom;
      setTopoDesktop(Math.max(0, Math.round(ate)) + RESPIRO_PX);
    };
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, [open, variant]);

  const rotulo = naoLidas > 0 ? `Notificações, ${naoLidas} ${naoLidas === 1 ? 'não lida' : 'não lidas'}` : 'Notificações';

  return (
    <div ref={wrapperRef} data-notification-bell className={variant === 'desktop' ? 'relative' : undefined}>
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
        <span ref={iconRef} data-bell-icon className="grid place-items-center" style={{ transformOrigin: '50% 15%' }}>
          <Bell className={styles.icon} aria-hidden="true" />
        </span>
        {naoLidas > 0 && (
          <span aria-hidden data-bell-count={naoLidas} className="absolute right-1 top-1 rounded-full">
            {/* A chave refaz o "pop" a cada mudança do número. */}
            <span
              key={naoLidas}
              className={`relative block min-w-[18px] rounded-full bg-crfal-gold px-1 text-center text-[10.5px] font-bold leading-[18px] text-crfal-blue-dark tabular-nums ring-2 motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:duration-300 ${styles.badge}`}
            >
              {naoLidas > 9 ? '9+' : naoLidas}
            </span>
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
          style={{ outline: 'none', ...(variant === 'desktop' && topoDesktop !== undefined ? { top: `calc(100% + ${topoDesktop}px)` } : null) }}
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
