import { useState, useEffect, useRef, useCallback, type MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronDown, ExternalLink, Search, User } from 'lucide-react';
import MobileHeaderSearch from '@/components/layout/MobileHeaderSearch';
import MobileNavigation from '@/components/layout/MobileNavigation';
import { serviceProfiles } from '@/config/service-profiles';
import { CRF_EM_CASA_URL, SOCIAL_LINKS, TRANSPARENCIA_URL } from '@/config/site';
import { FacebookIcon, InstagramIcon, XIcon, YouTubeIcon } from '@/components/icons/social';
import { NAV_ITEMS, isNavItemActive, isNavSubItemActive, type NavItem } from '@/config/navigation';


const SOCIAL_ICONS: Record<string, React.ElementType> = {
  Instagram: InstagramIcon,
  Facebook: FacebookIcon,
  YouTube: YouTubeIcon,
  X: XIcon,
};

const navItems = NAV_ITEMS;

const searchItems = navItems
  .flatMap(item => item.columns ? item.columns.flatMap(column => column.items.map(({ label, href }) => ({ label, href }))) : [{ label: item.label, href: item.href }])
  .filter((item, index, items) => items.findIndex(candidate => candidate.label === item.label && candidate.href === item.href) === index);

export default function Header() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [lastPathname, setLastPathname] = useState(pathname);
  const timerRef = useRef<number | undefined>(undefined);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Fecha o menu ao trocar de página.
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setActiveDropdown(null);
  }

  const scheduleDropdown = useCallback((label: string | null, delay: number) => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setActiveDropdown(label), delay);
  }, []);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (!activeDropdown) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        triggerRefs.current[activeDropdown]?.focus();
        setActiveDropdown(null);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [activeDropdown]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinkBase =
    'relative flex items-center gap-1.5 rounded-md px-3 py-2 text-[15px] font-medium tracking-[0.02em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70';

  const renderSocial = (
    itemClassName: string,
    iconClassName: string,
    listClassName = 'flex items-center gap-1',
    onNavigate?: () => void
  ) => (
    <ul className={listClassName}>
      {SOCIAL_LINKS.map((social) => {
        const Icon = SOCIAL_ICONS[social.label] ?? ExternalLink;
        return (
          <li key={social.label}>
            <a
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className={itemClassName}
              onClick={onNavigate}
            >
              <Icon className={iconClassName} />
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Barra de identidade — logo, nome da entidade, redes sociais e acesso do profissional */}
      <div className="border-crfal-gray-200 bg-crfal-blue shadow-[0_1px_2px_rgba(15,23,42,0.05)] lg:border-b lg:bg-white">
        <div className="container-crfal">
          <div className="relative flex h-20 items-center justify-between gap-2 lg:h-[76px] lg:gap-3">
            <button
              ref={menuButtonRef}
              type="button"
              aria-controls="mobile-navigation"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 focus-visible:outline-white lg:hidden"
              aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <span aria-hidden="true" className="relative block h-5 w-6">
                <span className={`absolute left-0 top-0 h-0.5 w-6 bg-current transition-transform duration-200 motion-reduce:transition-none ${isMobileMenuOpen ? 'translate-y-[9px] rotate-45' : ''}`} />
                <span className={`absolute left-0 top-[9px] h-0.5 w-6 bg-current transition-opacity duration-200 motion-reduce:transition-none ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`absolute bottom-0 left-0 h-0.5 w-6 bg-current transition-transform duration-200 motion-reduce:transition-none ${isMobileMenuOpen ? '-translate-y-[9px] -rotate-45' : ''}`} />
              </span>
            </button>

            <Link
              to="/"
              onClick={handleLogoClick}
              className="group absolute left-1/2 flex -translate-x-1/2 items-center rounded-lg px-3 py-2 focus-visible:outline-white lg:static lg:min-w-0 lg:translate-x-0 lg:gap-3 lg:bg-transparent lg:p-0"
            >
              <picture>
              <source media="(max-width: 1023px)" srcSet="/images/logo-crf-branca.png" />
              <img
                src="/images/logo-crf-azul.png"
                alt="CRFAL - Conselho Regional de Farmácia do Estado de Alagoas"
                className="h-10 w-auto shrink-0 object-contain transition-transform duration-300 group-hover:scale-[1.03] lg:h-12"
              />
              </picture>
              <span className="hidden min-w-0 border-l border-crfal-gray-200 pl-2.5 leading-tight lg:block lg:pl-3">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-crfal-blue lg:text-[11px]">
                  Conselho Regional de Farmácia
                </span>
                <span className="block truncate text-sm font-bold text-crfal-blue-dark lg:text-base">
                  Estado de Alagoas
                </span>
              </span>
            </Link>

            <button ref={searchButtonRef} type="button" onClick={() => { setIsMobileMenuOpen(false); setIsSearchOpen(true); }} aria-label="Buscar páginas e serviços" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white hover:bg-white/10 focus-visible:outline-white lg:hidden">
              <Search className="h-6 w-6" aria-hidden="true" />
            </button>

            <div className="hidden items-center gap-2 lg:flex">
              <a
                href={TRANSPARENCIA_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Acesso à Informação — Portal da Transparência do CRF-AL"
                title="Acesso à Informação — Portal da Transparência"
                className="mr-1 flex h-11 items-center rounded-lg px-1 transition-opacity hover:opacity-80"
              >
                <img
                  src="/images/logo-acesso-a-Informacao-colorido.png"
                  alt="Acesso à Informação"
                  className="h-8 w-auto object-contain"
                />
              </a>

              <span aria-hidden className="h-6 w-px bg-crfal-gray-200" />

              {renderSocial(
                'flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-crfal-blue-lighter hover:text-crfal-blue',
                'h-[18px] w-[18px]'
              )}

              <span aria-hidden className="mx-1 h-6 w-px bg-crfal-gray-200" />

              <a
                href={CRF_EM_CASA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 whitespace-nowrap rounded-lg border-2 border-crfal-blue px-4 py-2 text-sm font-semibold text-crfal-blue transition-colors hover:bg-crfal-blue hover:text-white"
              >
                <User className="h-4 w-4" />
                CRF AL em Casa
              </a>
            </div>
          </div>
        </div>
      </div>


      <MobileHeaderSearch open={isSearchOpen} onOpenChange={setIsSearchOpen} items={searchItems} triggerRef={searchButtonRef} />

      {/* Barra de menu — navegação principal (desktop) */}
      <div className="relative hidden bg-[#003366] lg:block">
        <div className="container-crfal">
          <div className="relative flex h-14 items-center justify-center">
            <nav aria-label="Navegação principal" className="flex items-center">
              {navItems.map((item, index) => (
                <DesktopNavEntry
                  key={item.label}
                  item={item}
                  index={index}
                  isOpen={activeDropdown === item.label}
                  isCurrent={isNavItemActive(item, pathname)}
                  pathname={pathname}
                  navLinkBase={navLinkBase}
                  triggerRef={(el) => { triggerRefs.current[item.label] = el; }}
                  onOpen={(delay) => scheduleDropdown(item.label, delay)}
                  onClose={(delay) => scheduleDropdown(null, delay)}
                  onToggle={() => { window.clearTimeout(timerRef.current); setActiveDropdown(activeDropdown === item.label ? null : item.label); }}
                />
              ))}
            </nav>
          </div>
        </div>
        {/* Véu suave sobre a página enquanto um menu está aberto. */}
        <div aria-hidden className={`pointer-events-none absolute inset-x-0 top-full h-screen bg-crfal-blue-dark/25 transition-opacity duration-200 motion-reduce:transition-none ${activeDropdown ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      <MobileNavigation open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen} triggerRef={menuButtonRef} items={navItems} onOpenSearch={() => setIsSearchOpen(true)} socialLinks={renderSocial(
        'flex h-11 w-11 items-center justify-center rounded-lg bg-crfal-blue-lighter text-crfal-blue transition-colors hover:bg-crfal-blue hover:text-white',
        'h-[18px] w-[18px]',
        'flex items-center justify-center gap-2',
        () => setIsMobileMenuOpen(false)
      )} />
    </header>
      <nav aria-label="Acessos por perfil" className="absolute left-0 right-0 top-20 z-40 h-24 border-b border-crfal-gray-200 bg-white lg:hidden">
        <div className="container-crfal grid h-full grid-cols-3 items-center">
          {serviceProfiles.map(({ label, href, icon: Icon }) => (
            <Link key={label} to={href} onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'instant' }); }} className="flex min-h-16 min-w-0 flex-col items-center justify-center gap-2 border-r border-crfal-blue/20 px-1 text-crfal-blue last:border-r-0 hover:bg-crfal-blue-lighter focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-crfal-blue">
              <Icon className="h-8 w-8" strokeWidth={1.5} aria-hidden="true" />
              <span className="text-[11px] font-semibold sm:text-sm">{label}</span>
            </Link>
          ))}
        </div>
      </nav>

    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Item da barra desktop e mega menu                                           */
/* -------------------------------------------------------------------------- */

const OPEN_DELAY = 90;
const CLOSE_DELAY = 160;

function DesktopNavEntry({
  item,
  index,
  isOpen,
  isCurrent,
  pathname,
  navLinkBase,
  triggerRef,
  onOpen,
  onClose,
  onToggle,
}: {
  item: NavItem;
  index: number;
  isOpen: boolean;
  isCurrent: boolean;
  pathname: string;
  navLinkBase: string;
  triggerRef: (el: HTMLButtonElement | null) => void;
  onOpen: (delay: number) => void;
  onClose: (delay: number) => void;
  onToggle: () => void;
}) {
  const panelId = `mega-menu-${index}`;
  const currentMark = isCurrent
    ? 'after:absolute after:inset-x-3 after:-bottom-[9px] after:h-0.5 after:rounded-full after:bg-crfal-gold'
    : '';
  const stateClass = isOpen ? 'bg-white/15 text-white' : isCurrent ? 'text-white' : 'text-white/85 hover:bg-white/10 hover:text-white';

  if (!item.columns) {
    const external = item.href.startsWith('http');
    const DirectIcon = item.directIcon;
    const className = `${navLinkBase} ${stateClass} ${currentMark}`;
    return external ? (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
        {DirectIcon && <DirectIcon className="h-3.5 w-3.5" aria-hidden />}
        {item.label}
        <span className="sr-only">(abre em uma nova aba)</span>
      </a>
    ) : (
      <Link to={item.href} aria-current={isCurrent ? 'page' : undefined} className={className}>{item.label}</Link>
    );
  }

  const columnCount = item.columns.length;
  const widthClass = columnCount > 1 ? 'w-[min(980px,calc(100vw-2rem))]' : 'w-[min(640px,calc(100vw-2rem))]';

  return (
    // Sem `relative`: o painel se posiciona pela barra inteira e fica sempre centralizado na tela.
    <div onMouseEnter={() => onOpen(OPEN_DELAY)} onMouseLeave={() => onClose(CLOSE_DELAY)}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className={`${navLinkBase} ${stateClass} ${currentMark}`}
      >
        {item.label}
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
      </button>

      {isOpen && (
        <div id={panelId} className={`absolute left-1/2 top-full z-50 -translate-x-1/2 pt-1.5 ${widthClass}`}>
          <div className="overflow-hidden rounded-2xl border border-crfal-gray-200 bg-white shadow-[0_28px_60px_-16px_rgba(11,25,44,0.45)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-200">
            <div aria-hidden className="h-0.5 bg-gradient-to-r from-crfal-gold/0 via-crfal-gold to-crfal-gold/0" />
            <div className={`grid gap-2 p-3 ${columnCount > 1 ? 'grid-cols-[minmax(0,1fr)_minmax(0,1fr)_280px]' : 'grid-cols-[minmax(0,1fr)_250px]'}`}>
              {item.columns.map((column) => (
                <div key={column.title} className="p-3">
                  <p className="mb-2 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]">
                    {column.title}
                    <span aria-hidden className="h-px flex-1 bg-crfal-gray-200" />
                  </p>
                  <ul className="space-y-0.5">
                    {column.items.map((sub) => {
                      const Icon = sub.icon;
                      const active = isNavSubItemActive(sub, pathname);
                      const linkClass = `group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue motion-reduce:transition-none ${active ? 'bg-crfal-blue-lighter/70' : 'hover:bg-crfal-gray-50'}`;
                      const content = (
                        <>
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 transition-colors duration-150 ${active ? 'bg-crfal-blue text-white ring-crfal-gold/50' : 'bg-crfal-blue-lighter text-crfal-blue ring-crfal-blue/10 group-hover:bg-crfal-blue group-hover:text-white'}`}>
                            <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className={`block text-sm font-semibold leading-snug ${active ? 'text-crfal-blue' : 'text-crfal-blue-dark group-hover:text-crfal-blue'}`}>{sub.label}</span>
                            {sub.description && <span className="mt-0.5 block text-[12.5px] leading-snug text-crfal-gray-600">{sub.description}</span>}
                          </span>
                          {sub.external ? (
                            <ArrowUpRight className="h-4 w-4 shrink-0 text-crfal-gray-400 group-hover:text-[#8A6A12]" aria-hidden />
                          ) : (
                            <ArrowRight className="h-4 w-4 shrink-0 -translate-x-1 text-[#8A6A12] opacity-0 transition duration-150 group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:transition-none" aria-hidden />
                          )}
                        </>
                      );
                      return (
                        <li key={sub.label}>
                          {sub.external ? (
                            <a href={sub.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                              {content}
                              <span className="sr-only">(abre em uma nova aba)</span>
                            </a>
                          ) : (
                            <Link to={sub.href} aria-current={active ? 'page' : undefined} className={linkClass}>{content}</Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              {item.feature && (
                <aside className="relative isolate flex flex-col overflow-hidden rounded-xl border-t-2 border-crfal-gold bg-gradient-to-br from-crfal-blue to-crfal-blue-dark p-5 text-white">
                  <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 -z-10 h-40 w-40 rounded-full bg-crfal-blue-light/30 blur-3xl" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-crfal-gold">{item.feature.eyebrow}</p>
                  <p className="mt-2 text-lg font-bold leading-snug">{item.feature.title}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-white/75">{item.feature.text}</p>
                  <div className="mt-auto space-y-2 pt-5">
                    <a
                      href={item.feature.cta.href}
                      target={item.feature.cta.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.feature.cta.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="group flex min-h-10 w-full items-center justify-between gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-bold text-crfal-blue transition-colors hover:bg-crfal-blue-lighter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-crfal-blue"
                    >
                      <span className="truncate">{item.feature.cta.label}</span>
                      {item.feature.cta.href.startsWith('http') ? <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden /> : <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />}
                      {item.feature.cta.href.startsWith('http') && <span className="sr-only">(abre em uma nova aba)</span>}
                    </a>
                    {item.feature.secondary && (
                      <a href={item.feature.secondary.href} target="_blank" rel="noopener noreferrer" className="flex min-h-10 w-full items-center justify-between gap-2 rounded-full border border-white/30 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                        <span className="truncate">{item.feature.secondary.label}</span>
                        <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
                        <span className="sr-only">(abre em uma nova aba)</span>
                      </a>
                    )}
                  </div>
                </aside>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
