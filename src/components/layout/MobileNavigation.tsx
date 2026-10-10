import { useState, type ElementType, type ReactNode, type RefObject } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ChevronDown, ChevronRight, ExternalLink, Home, User, X } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { serviceProfiles } from '@/config/service-profiles';
import { CRF_EM_CASA_URL, TRANSPARENCIA_URL } from '@/config/site';

interface NavigationItem {
  label: string;
  href: string;
  directIcon?: ElementType;
  columns?: { title: string; items: { label: string; href: string; icon: ElementType; external?: boolean }[] }[];
}

const linkClass = 'flex min-h-12 items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-crfal-blue-lighter focus-visible:ring-2 focus-visible:ring-crfal-blue motion-reduce:transition-none';

export default function MobileNavigation({ open, onOpenChange, triggerRef, items, socialLinks }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  items: NavigationItem[];
  socialLinks: ReactNode;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const close = () => onOpenChange(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="drawer" showCloseButton={false} id="mobile-navigation" onCloseAutoFocus={event => { event.preventDefault(); triggerRef.current?.focus(); }}>
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-crfal-gray-200 bg-crfal-blue px-5 py-4 text-white">
          <div>
            <DialogTitle className="text-lg font-bold">Menu de navegação</DialogTitle>
            <DialogDescription className="mt-1 text-xs text-white/80">Conselho Regional de Farmácia de Alagoas</DialogDescription>
          </div>
          <DialogClose aria-label="Fechar menu" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-white/10 focus-visible:outline-white"><X className="h-6 w-6" aria-hidden="true" /></DialogClose>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-4">
          <nav aria-label="Atalhos por perfil no menu" className="mb-5 grid grid-cols-3 gap-2">
            {serviceProfiles.map(profile => { const Icon = profile.icon; return <Link key={profile.id} to={profile.href} onClick={close} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg border border-crfal-gray-200 bg-white px-1 text-crfal-blue hover:bg-crfal-blue-lighter focus-visible:ring-2 focus-visible:ring-crfal-blue"><Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" /><span className="text-[10px] font-semibold">{profile.label}</span></Link>; })}
          </nav>
          <nav aria-label="Navegação principal mobile" className="overflow-hidden rounded-xl border border-crfal-gray-200 bg-white">
            <NavLink to="/" end onClick={close} className={({ isActive }) => `${linkClass} m-2 ${isActive ? 'bg-crfal-blue-lighter font-bold text-crfal-blue' : 'text-crfal-gray-700'}`}><Home className="h-5 w-5" aria-hidden="true" />Página inicial</NavLink>
            {items.map((item, index) => {
              const panelId = `mobile-nav-panel-${index}`;
              const isExpanded = expanded === item.label;
              return <div key={item.label} className="border-t border-crfal-gray-200">
                {item.columns ? <>
                  <button type="button" id={`${panelId}-trigger`} aria-expanded={isExpanded} aria-controls={panelId} onClick={() => setExpanded(isExpanded ? null : item.label)} className="flex min-h-14 w-full items-center justify-between gap-3 px-5 py-4 text-left text-base font-semibold text-crfal-blue hover:bg-crfal-blue-lighter focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-crfal-blue">
                    {item.label}<ChevronDown aria-hidden="true" className={`h-5 w-5 transition-transform duration-200 motion-reduce:transition-none ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  <div id={panelId} role="region" aria-labelledby={`${panelId}-trigger`} aria-hidden={!isExpanded} inert={!isExpanded} className={`grid transition-[grid-template-rows,opacity] duration-200 motion-reduce:transition-none ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="min-h-0 overflow-hidden">
                      <div className="space-y-4 bg-crfal-gray-50 px-3 pb-4 pt-2">
                        {item.columns.map(column => <div key={column.title}>
                          <p className="mb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-crfal-gray-600">{column.title}</p>
                          <ul>{column.items.map(sub => { const Icon = sub.icon; return <li key={sub.href}>
                            {sub.href.startsWith('/') ? <NavLink to={sub.href} onClick={close} className={({ isActive }) => `${linkClass} ${isActive ? 'bg-crfal-blue-lighter font-bold text-crfal-blue' : 'text-crfal-gray-700'}`}><Icon className="h-4 w-4 shrink-0" aria-hidden="true" />{sub.label}</NavLink> : <a href={sub.href} target="_blank" rel="noopener noreferrer" onClick={close} className={`${linkClass} text-crfal-gray-700`}><Icon className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="flex-1">{sub.label}</span><ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only">Abre em uma nova aba.</span></a>}
                          </li>; })}</ul>
                        </div>)}
                      </div>
                    </div>
                  </div>
                </> : item.href.startsWith('/') ? <NavLink to={item.href} onClick={close} className={({ isActive }) => `flex min-h-14 items-center justify-between px-5 py-4 text-base font-semibold hover:bg-crfal-blue-lighter ${isActive ? 'bg-crfal-blue-lighter text-crfal-blue' : 'text-crfal-gray-700'}`}>{item.label}<ChevronRight className="h-4 w-4" aria-hidden="true" /></NavLink> : <a href={item.href} target="_blank" rel="noopener noreferrer" onClick={close} className="flex min-h-14 items-center justify-between px-5 py-4 text-base font-semibold text-crfal-blue hover:bg-crfal-blue-lighter">{item.label}<ExternalLink className="h-4 w-4" aria-hidden="true" /><span className="sr-only">Abre em uma nova aba.</span></a>}
              </div>;
            })}
          </nav>
          <a href={CRF_EM_CASA_URL} target="_blank" rel="noopener noreferrer" onClick={close} className="my-5 flex min-h-12 items-center justify-center gap-2 rounded-lg bg-crfal-blue px-4 py-3 text-sm font-bold text-white hover:bg-crfal-blue-dark"><User className="h-5 w-5" aria-hidden="true" />CRF AL em Casa<ExternalLink className="h-4 w-4" aria-hidden="true" /><span className="sr-only">Abre em uma nova aba.</span></a>
          <div className="rounded-xl border border-crfal-gray-200 bg-white p-4">
            <a href={TRANSPARENCIA_URL} target="_blank" rel="noopener noreferrer" onClick={close} aria-label="Acesso à Informação — Portal da Transparência, abre em uma nova aba" className="mb-4 flex min-h-11 justify-center rounded-lg"><img src="/images/logo-acesso-a-Informacao-colorido.png" alt="Acesso à Informação" className="h-9 w-auto object-contain" /></a>
            <p className="mb-3 text-center text-xs font-semibold text-crfal-gray-600">Redes sociais</p>
            {socialLinks}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
