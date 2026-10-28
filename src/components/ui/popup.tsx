import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { fimDoPrazo, popupDaVez, popupNoAr, type Popup as PopupData } from '@/data/popups';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowFillButton } from '@/components/block/arrow-fill-button';
import { EVENTO_TOASTS_FIM } from '@/features/notificacoes/sinal';

const DEFAULT_DELAY_MS = 3000;
const DEFAULT_DISMISS_DAYS = 1;
const STORAGE_PREFIX = 'crfal:popup:';
const QUIET_MS = 1500;
// Com o popup aberto, confere o prazo `ate` ao menos uma vez por minuto (relógio do
// sistema ajustado, aba suspensa) além do timer exato até o vencimento.
const EXPIRY_CHECK_MS = 60_000;
const INTERACTION_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'touchmove'] as const;
// Nenhuma interação aqui conta (nem rolagem): cabeçalho, menu, diálogos e sino.
const CHROME_SELECTOR = 'header, [role="dialog"], #mobile-navigation, [data-notification-bell], [data-notification-panel], [data-notification-toasts]';
// Toque, clique ou tecla aqui é o começo de uma ação do usuário: não abre o popup por cima.
const CONTROL_SELECTOR = `a, button, input, select, textarea, summary, [role="button"], [role="menuitem"], ${CHROME_SELECTOR}`;
// Menu mobile, megamenu, sino ou qualquer outro diálogo aberto agora.
const BUSY_SELECTOR = 'header [aria-expanded="true"], [data-notification-bell] [aria-expanded="true"], [role="dialog"]:not([data-site-popup])';

function dismissDays(popup: PopupData) {
  return popup.dismissDays ?? DEFAULT_DISMISS_DAYS;
}

function storageKey(popup: PopupData) {
  return `${STORAGE_PREFIX}${popup.id}:closed-at`;
}

function isDismissed(popup: PopupData) {
  if (typeof window === 'undefined') return true;
  const days = dismissDays(popup);
  try {
    const store = days <= 0 ? window.sessionStorage : window.localStorage;
    const raw = store.getItem(storageKey(popup));
    if (!raw) return false;
    if (days <= 0) return true;
    const closedAt = Number(raw);
    return Number.isFinite(closedAt) && Date.now() - closedAt < days * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function markDismissed(popup: PopupData) {
  const days = dismissDays(popup);
  try {
    const store = days <= 0 ? window.sessionStorage : window.localStorage;
    store.setItem(storageKey(popup), String(Date.now()));
  } catch {
    // Storage indisponível (modo privado): apenas ignora.
  }
}

interface PopupProps {
  /** Popup específico. Padrão: primeiro ativo de `src/data/popups.ts`. */
  popup?: PopupData | null;
}

/**
 * Popup do site, nativo em React (sem plugin de WordPress).
 *
 * - Abre após um delay e uma interação em área neutra (não em controles, cabeçalho ou menu),
 *   uma vez por usuário (frequência configurável).
 * - Responsivo: usa `imageMobile` em telas < 640px quando informado.
 * - Link interno (`/...`) via react-router; externo (`https://...`) em nova aba.
 */
export default function Popup({ popup }: PopupProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const active = useMemo(() => {
    if (popup === undefined) return popupDaVez();
    return popup && popupNoAr(popup) ? popup : null;
  }, [popup]);

  useEffect(() => {
    if (!active || isDismissed(active)) return;
    // Abre só após o delay E uma interação do usuário: depois de uma interação o
    // navegador encerra a medição do LCP, então a arte do popup não vira o LCP da página.
    // Só conta interação em área neutra (rolagem, clique fora de controles): o toque no ☰,
    // num link ou no megamenu é uma ação em curso e o popup não pode abrir por cima dela.
    // Sem `scroll`: rolagens programáticas (âncoras) também disparam esse evento; a rolagem
    // do usuário já chega aqui por roda, toque, teclado ou barra de rolagem.
    let delayDone = false;
    let interacted = false;
    let lastInteraction = 0;
    let quietTimer = 0;
    const busy = () => Boolean(document.querySelector(BUSY_SELECTOR));
    // Toasts das notificações na tela: o pop-up espera eles voarem para o sino.
    const toastsOnScreen = () => Boolean(document.querySelector('[data-notification-toasts]'));
    const tryOpen = () => {
      window.clearTimeout(quietTimer);
      if (!delayDone || !interacted) return;
      // ~1,5 s sem nova interação: nunca abre no meio de uma ação que acabou de começar.
      const wait = lastInteraction + QUIET_MS - performance.now();
      if (wait > 0) {
        quietTimer = window.setTimeout(tryOpen, wait);
        return;
      }
      // Menu, sino ou diálogo aberto: espera a próxima interação (ex.: fechar o menu).
      if (busy() || toastsOnScreen()) return;
      removeListeners();
      if (popupNoAr(active)) setOpen(true);
    };
    const onInteract = (event: Event) => {
      lastInteraction = performance.now();
      // Rolar sobre um link ainda é rolar; tocar nele não.
      const scrolling = event.type === 'wheel' || event.type === 'touchmove';
      const ignored = scrolling ? CHROME_SELECTOR : CONTROL_SELECTOR;
      const inIgnored = event.composedPath().some((target) => target instanceof Element && target.matches(ignored));
      if (inIgnored) {
        // Toque/clique/tecla num controle (ou rolagem no cabeçalho/menu/sino) começa uma
        // ação: descarta a interação anterior e o timer pendente; só uma nova interação
        // neutra volta a armar o popup.
        interacted = false;
        window.clearTimeout(quietTimer);
        return;
      }
      interacted = true;
      tryOpen();
    };
    let afterToasts = 0;
    const onToastsEnd = () => {
      window.clearTimeout(afterToasts);
      // Depois do evento, o React ainda desmonta os toasts: tenta no quadro seguinte.
      afterToasts = window.setTimeout(tryOpen, 200);
    };
    const removeListeners = () => {
      INTERACTION_EVENTS.forEach((type) => window.removeEventListener(type, onInteract, true));
      window.removeEventListener(EVENTO_TOASTS_FIM, onToastsEnd);
    };
    INTERACTION_EVENTS.forEach((type) => window.addEventListener(type, onInteract, { passive: true, capture: true }));
    window.addEventListener(EVENTO_TOASTS_FIM, onToastsEnd);
    const timer = window.setTimeout(() => {
      delayDone = true;
      tryOpen();
    }, active.delayMs ?? DEFAULT_DELAY_MS);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(quietTimer);
      window.clearTimeout(afterToasts);
      removeListeners();
    };
  }, [active]);

  // Aberto quando o prazo `ate` vence (23:59:59 em Maceió): fecha sozinho.
  useEffect(() => {
    if (!open || !active?.ate) return;
    const fim = fimDoPrazo(active);
    let timer = 0;
    const check = () => {
      if (!popupNoAr(active)) {
        setOpen(false);
        return;
      }
      const wait = fim === null ? EXPIRY_CHECK_MS : Math.min(Math.max(fim - Date.now(), 0), EXPIRY_CHECK_MS);
      timer = window.setTimeout(check, wait);
    };
    check();
    return () => window.clearTimeout(timer);
  }, [open, active]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (!next && active) markDismissed(active);
    },
    [active]
  );

  const dismiss = useCallback(() => {
    if (active) markDismissed(active);
    setOpen(false);
  }, [active]);

  const handleNavigate = useCallback(() => {
    if (!active?.href) return;
    markDismissed(active);
    setOpen(false);
    if (active.href.startsWith('/')) {
      navigate(active.href);
    } else if (active.external) {
      window.open(active.href, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = active.href;
    }
  }, [active, navigate]);

  if (!active) return null;

  const isExternal = Boolean(active.href && !active.href.startsWith('/'));
  const hasOverlay = Boolean(active.title || active.description || active.ctaLabel);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        data-site-popup
        showCloseButton={false}
        className="w-fit max-w-[94vw] gap-0 overflow-hidden rounded-2xl border-0 p-0 shadow-card sm:max-w-[94vw]"
      >
        <div className="relative">
          {hasOverlay ? (
            <div className="relative">
              <picture className="block">
                {active.imageMobile && (
                  <source media="(max-width: 639px)" srcSet={active.imageMobile} />
                )}
                <img
                  src={active.image}
                  alt=""
                  decoding="async"
                  className="block h-auto max-h-[85vh] w-auto max-w-[94vw]"
                />
              </picture>

              <div className="absolute inset-0 bg-linear-to-t/srgb from-black/85 via-black/45 to-transparent" />

              {/* A imagem inteira é clicável (mesmo com texto sobreposto). */}
              {active.href &&
                (isExternal ? (
                  <a
                    href={active.href}
                    target={active.external ? '_blank' : undefined}
                    rel={active.external ? 'noopener noreferrer' : undefined}
                    aria-label={active.alt}
                    onClick={dismiss}
                    className="absolute inset-0 z-10"
                  />
                ) : (
                  <Link
                    to={active.href}
                    aria-label={active.alt}
                    onClick={dismiss}
                    className="absolute inset-0 z-10"
                  />
                ))}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-5 sm:p-7">
                {active.title ? (
                  <DialogTitle className="font-display mb-1.5 text-xl font-semibold leading-tight text-white sm:text-2xl">
                    {active.title}
                  </DialogTitle>
                ) : (
                  <DialogTitle className="sr-only">{active.alt}</DialogTitle>
                )}

                {active.description ? (
                  <DialogDescription className="mb-4 text-sm text-white/90 sm:text-base">
                    {active.description}
                  </DialogDescription>
                ) : (
                  <DialogDescription className="sr-only">{active.alt}</DialogDescription>
                )}

                {active.ctaLabel && active.href && (
                  <ArrowFillButton
                    as="button"
                    onClick={handleNavigate}
                    className="pointer-events-auto"
                    bgColor="#ffffff"
                    textColor="#003366"
                    fillBgColor="#C59B27"
                    fillTextColor="#0B192C"
                  >
                    {active.ctaLabel}
                  </ArrowFillButton>
                )}
              </div>
            </div>
          ) : (
            <div className="relative">
              <picture>
                {active.imageMobile && (
                  <source media="(max-width: 639px)" srcSet={active.imageMobile} />
                )}
                <img
                  src={active.image}
                  alt={active.href ? '' : active.alt}
                  decoding="async"
                  className="block h-auto max-h-[85vh] w-auto max-w-[94vw]"
                />
              </picture>

              <DialogTitle className="sr-only">{active.alt}</DialogTitle>
              <DialogDescription className="sr-only">{active.alt}</DialogDescription>

              {active.href &&
                (isExternal ? (
                  <a
                    href={active.href}
                    target={active.external ? '_blank' : undefined}
                    rel={active.external ? 'noopener noreferrer' : undefined}
                    aria-label={active.alt}
                    onClick={dismiss}
                    className="absolute inset-0 z-10"
                  />
                ) : (
                  <Link
                    to={active.href}
                    aria-label={active.alt}
                    onClick={dismiss}
                    className="absolute inset-0 z-10"
                  />
                ))}
            </div>
          )}

          <DialogClose
            aria-label="Fechar"
            className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-xs transition hover:bg-black/70 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-4 w-4" />
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
