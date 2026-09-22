import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { popups, type Popup as PopupData } from '@/data/popups';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowFillButton } from '@/components/block/arrow-fill-button';

const DEFAULT_DELAY_MS = 3000;
const DEFAULT_DISMISS_DAYS = 1;
const STORAGE_PREFIX = 'crfal:popup:';

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
 * - Abre após um delay, uma vez por usuário (frequência configurável).
 * - Responsivo: usa `imageMobile` em telas < 640px quando informado.
 * - Link interno (`/...`) via react-router; externo (`https://...`) em nova aba.
 */
export default function Popup({ popup }: PopupProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const active = useMemo(
    () => (popup !== undefined ? popup : popups.find((item) => item.active !== false) ?? null),
    [popup]
  );

  useEffect(() => {
    if (!active || isDismissed(active)) return;
    const timer = window.setTimeout(() => setOpen(true), active.delayMs ?? DEFAULT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [active]);

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

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

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
            className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-4 w-4" />
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
