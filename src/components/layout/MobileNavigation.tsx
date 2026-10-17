import { useState, type ReactNode, type RefObject } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowUpRight, ChevronDown, ChevronRight, Home, Search, User, X } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { serviceProfiles } from '@/config/service-profiles';
import { CRF_EM_CASA_URL, TRANSPARENCIA_URL } from '@/config/site';
import { isNavItemActive, isNavSubItemActive, type NavItem } from '@/config/navigation';

const goldLabel = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]';
const focusRing = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-crfal-blue';

export default function MobileNavigation({ open, onOpenChange, triggerRef, items, socialLinks, onOpenSearch }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  items: NavItem[];
  socialLinks: ReactNode;
  onOpenSearch?: () => void;
}) {
  const { pathname } = useLocation();
  const currentSection = items.find((item) => item.columns && isNavItemActive(item, pathname))?.label ?? null;
  // `undefined` = ainda não mexeu: abre a seção da página atual.
  const [manualExpanded, setManualExpanded] = useState<string | null | undefined>(undefined);
  const expanded = manualExpanded === undefined ? currentSection : manualExpanded;

  const handleOpenChange = (value: boolean) => {
    if (!value) setManualExpanded(undefined);
    onOpenChange(value);
  };
  const close = () => handleOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent variant="drawer" showCloseButton={false} id="mobile-navigation" onCloseAutoFocus={event => { event.preventDefault(); triggerRef.current?.focus(); }}>
        <div className="relative isolate flex shrink-0 items-center justify-between gap-4 overflow-hidden border-b-2 border-crfal-gold bg-linear-to-br/srgb from-crfal-blue to-crfal-blue-dark px-5 py-4 text-white">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-16 -z-10 h-40 w-40 rounded-full bg-crfal-blue-light/30 blur-3xl" />
          <Link to="/" onClick={close} className="rounded-lg focus-visible:outline-white">
            <img src="/images/logo-crf-branca.webp" alt="CRF-AL, página inicial" className="h-10 w-auto object-contain" />
          </Link>
          <DialogTitle className="sr-only">Menu de navegação</DialogTitle>
          <DialogDescription className="sr-only">Conselho Regional de Farmácia de Alagoas</DialogDescription>
          <DialogClose aria-label="Fechar menu" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline-white"><X className="h-6 w-6" aria-hidden="true" /></DialogClose>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-crfal-gray-50 px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-4">
          {onOpenSearch && (
            <button
              type="button"
              onClick={() => { close(); onOpenSearch(); }}
              className="mb-4 flex min-h-12 w-full items-center gap-3 rounded-full border border-crfal-gray-200 bg-white px-4 text-left text-sm text-crfal-gray-600 shadow-xs hover:border-crfal-blue/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue"
            >
              <Search className="h-5 w-5 text-crfal-blue" aria-hidden="true" />
              Buscar páginas e serviços
            </button>
          )}

          <nav aria-label="Atalhos por perfil no menu" className="mb-4 grid grid-cols-3 gap-2">
            {serviceProfiles.map(profile => {
              const Icon = profile.icon;
              return (
                <Link key={profile.id} to={profile.href} onClick={close} className="flex min-h-[76px] flex-col items-center justify-center gap-1.5 rounded-xl border border-crfal-gray-200 bg-white px-1 text-crfal-blue hover:border-crfal-blue/30 hover:bg-crfal-blue-lighter focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue">
                  <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
                  <span className="text-[11px] font-semibold">{profile.label}</span>
                </Link>
              );
            })}
          </nav>

          <nav aria-label="Navegação principal mobile" className="overflow-hidden rounded-2xl border border-crfal-gray-200 bg-white shadow-xs">
            <NavLink to="/" end onClick={close} className={({ isActive }) => `flex min-h-14 items-center gap-3 px-5 text-base font-semibold ${focusRing} ${isActive ? 'text-crfal-blue' : 'text-crfal-blue-dark hover:bg-crfal-gray-50'}`}>
              <Home className="h-5 w-5 text-crfal-blue" aria-hidden="true" />Página inicial
            </NavLink>

            {items.map((item, index) => {
              const panelId = `mobile-nav-panel-${index}`;
              const isExpanded = expanded === item.label;
              const isCurrent = isNavItemActive(item, pathname);
              const sectionMark = isCurrent ? <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-crfal-gold" /> : null;

              if (!item.columns) {
                const external = item.href.startsWith('http');
                const rowClass = `flex min-h-14 items-center justify-between gap-3 border-t border-crfal-gray-200 px-5 text-base font-semibold ${focusRing} ${isCurrent ? 'bg-crfal-blue-lighter/60 text-crfal-blue' : 'text-crfal-blue-dark hover:bg-crfal-gray-50'}`;
                return external ? (
                  <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" onClick={close} className={rowClass}>
                    {item.label}
                    <ArrowUpRight className="h-4 w-4 text-crfal-gray-400" aria-hidden="true" />
                    <span className="sr-only">Abre em uma nova aba.</span>
                  </a>
                ) : (
                  <Link key={item.label} to={item.href} onClick={close} aria-current={isCurrent ? 'page' : undefined} className={rowClass}>
                    <span className="flex items-center gap-2">{item.label}{sectionMark}</span>
                    <ChevronRight className="h-4 w-4 text-crfal-gray-400" aria-hidden="true" />
                  </Link>
                );
              }

              return (
                <div key={item.label} className="border-t border-crfal-gray-200">
                  <button
                    type="button"
                    id={`${panelId}-trigger`}
                    aria-expanded={isExpanded}
                    aria-controls={panelId}
                    onClick={() => setManualExpanded(isExpanded ? null : item.label)}
                    className={`flex min-h-14 w-full items-center justify-between gap-3 px-5 text-left text-base font-semibold ${focusRing} ${isExpanded ? 'bg-crfal-gray-50 text-crfal-blue' : 'text-crfal-blue-dark hover:bg-crfal-gray-50'}`}
                  >
                    <span className="flex items-center gap-2">{item.label}{sectionMark}</span>
                    <ChevronDown aria-hidden="true" className={`h-5 w-5 text-crfal-gray-400 transition-transform duration-200 motion-reduce:transition-none ${isExpanded ? 'rotate-180 text-crfal-blue' : ''}`} />
                  </button>
                  <div id={panelId} role="region" aria-labelledby={`${panelId}-trigger`} aria-hidden={!isExpanded} inert={!isExpanded} className={`grid transition-[grid-template-rows,opacity] duration-200 motion-reduce:transition-none ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="min-h-0 overflow-hidden">
                      <div className="space-y-4 bg-crfal-gray-50 px-3 pb-4 pt-1">
                        {item.columns.map(column => (
                          <div key={column.title}>
                            <p className={`mb-1 px-3 ${goldLabel}`}>{column.title}</p>
                            <ul>
                              {column.items.map(sub => {
                                const Icon = sub.icon;
                                const active = isNavSubItemActive(sub, pathname);
                                const subClass = `relative flex min-h-12 items-center gap-3 rounded-xl px-3 py-2 text-[15px] font-medium ${focusRing} ${active ? 'bg-white font-semibold text-crfal-blue shadow-xs before:absolute before:inset-y-2.5 before:left-0 before:w-0.5 before:rounded-full before:bg-crfal-gold' : 'text-crfal-gray-700 hover:bg-white'}`;
                                const icon = (
                                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ${active ? 'bg-crfal-blue text-white ring-crfal-gold/50' : 'bg-white text-crfal-blue ring-crfal-gray-200'}`}>
                                    <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                                  </span>
                                );
                                return (
                                  <li key={sub.href + sub.label}>
                                    {sub.external ? (
                                      <a href={sub.href} target="_blank" rel="noopener noreferrer" onClick={close} className={subClass}>
                                        {icon}<span className="flex-1">{sub.label}</span>
                                        <ArrowUpRight className="h-4 w-4 text-crfal-gray-400" aria-hidden="true" />
                                        <span className="sr-only">Abre em uma nova aba.</span>
                                      </a>
                                    ) : (
                                      <Link to={sub.href} onClick={close} aria-current={active ? 'page' : undefined} className={subClass}>
                                        {icon}<span className="flex-1">{sub.label}</span>
                                      </Link>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          <a href={CRF_EM_CASA_URL} target="_blank" rel="noopener noreferrer" onClick={close} className="relative isolate my-4 flex min-h-14 items-center justify-between gap-3 overflow-hidden rounded-2xl border-t-2 border-crfal-gold bg-linear-to-br/srgb from-crfal-blue to-crfal-blue-dark px-5 py-3 text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2">
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-crfal-gold/40"><User className="h-5 w-5" aria-hidden="true" /></span>
              <span>
                <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-crfal-gold">Atendimento online</span>
                <span className="block text-sm font-bold">CRF AL em Casa</span>
              </span>
            </span>
            <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Abre em uma nova aba.</span>
          </a>

          <div className="rounded-2xl border border-crfal-gray-200 bg-white p-4">
            <a href={TRANSPARENCIA_URL} target="_blank" rel="noopener noreferrer" onClick={close} aria-label="Acesso à Informação — Portal da Transparência, abre em uma nova aba" className="mb-4 flex min-h-11 justify-center rounded-lg"><img src="/images/logo-acesso-a-Informacao-colorido.webp" alt="Acesso à Informação" className="h-9 w-auto object-contain" /></a>
            <p className={`mb-3 text-center ${goldLabel}`}>Redes sociais</p>
            {socialLinks}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
