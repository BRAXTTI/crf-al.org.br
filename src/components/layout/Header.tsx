import { useState, useEffect, useRef, useCallback, type MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronDown, ExternalLink, Info, Search, User } from 'lucide-react';
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
  const desktopSearchRef = useRef<HTMLButtonElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [lastPathname, setLastPathname] = useState(pathname);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
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

  // Ctrl/⌘ + K abre a busca no desktop.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchTriggerRef.current = desktopSearchRef.current;
        setIsSearchOpen(true);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
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
    'relative flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-2 text-[14px] font-semibold xl:gap-1.5 xl:px-3 xl:text-[14.5px] transition-colors duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue';

  const renderSocial = (
    itemClassName: string,
    iconClassName: string,
    listClassName = 'flex items-center gap-1',
    onNavigate?: () => void,
    tabIndex?: number
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
              tabIndex={tabIndex}
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
    <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-60 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-crfal-blue focus:shadow-lg lg:hidden">Ir para o conteúdo</a>
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Faixa utilitária (desktop): some ao rolar. */}
      <div className={`hidden overflow-hidden bg-crfal-blue-dark text-white/75 transition-[height] duration-300 motion-reduce:transition-none lg:block ${scrolled ? 'h-0' : 'h-8'}`} aria-hidden={scrolled || undefined}>
        <div className="container-crfal flex h-8 items-center justify-between text-[12.5px]">
          <ul className="flex items-center gap-5">
            <li><a href="#conteudo" tabIndex={scrolled ? -1 : undefined} className="rounded hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/70">Ir para o conteúdo</a></li>
            <li>
              <a href={TRANSPARENCIA_URL} target="_blank" rel="noopener noreferrer" tabIndex={scrolled ? -1 : undefined} className="inline-flex items-center gap-1.5 rounded hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/70">
                <Info className="h-3.5 w-3.5 text-crfal-gold" aria-hidden />Acesso à Informação<span className="sr-only">(abre em uma nova aba)</span>
              </a>
            </li>
            <li>
              <a href={TRANSPARENCIA_URL} target="_blank" rel="noopener noreferrer" tabIndex={scrolled ? -1 : undefined} className="rounded hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/70">Transparência<span className="sr-only">(abre em uma nova aba)</span></a>
            </li>
            <li><Link to="/servicos/ouvidoria" tabIndex={scrolled ? -1 : undefined} className="rounded hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/70">Ouvidoria</Link></li>
          </ul>
          {renderSocial(
            'flex h-7 w-7 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/70',
            'h-3.5 w-3.5',
            'flex items-center gap-0.5',
            undefined,
            scrolled ? -1 : undefined
          )}
        </div>
      </div>

      {/* Barra principal: logo, menu, busca e CRF AL em Casa. */}
      <div className={`relative transition-[background-color,box-shadow] duration-300 lg:border-b ${scrolled ? 'glass-blue shadow-[0_8px_32px_-12px_rgba(11,25,44,0.35)] lg:glass-light lg:border-white/50' : 'bg-crfal-blue lg:border-crfal-gray-200/80 lg:bg-white'}`}>
        <div className="container-crfal relative">
          <div className="flex h-16 items-center justify-between gap-2 lg:h-[72px] lg:gap-4">
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
                <span className={`absolute bottom-0 left-0 h-0.5 w-6 bg-current transition-transform duration-200 motion-reduce:transition-none ${isMobileMenuOpen ? 'translate-y-[-9px] -rotate-45' : ''}`} />
              </span>
            </button>

            <Link
              to="/"
              onClick={handleLogoClick}
              className="group absolute left-1/2 flex -translate-x-1/2 items-center rounded-lg px-3 py-1.5 focus-visible:outline-white lg:static lg:shrink-0 lg:translate-x-0 lg:gap-3 lg:p-0 lg:focus-visible:outline-crfal-blue"
            >
              <picture>
                <source media="(max-width: 1023px)" srcSet="/images/logo-crf-branca.webp" />
                <img
                  src="/images/logo-crf-azul.webp"
                  alt="CRFAL - Conselho Regional de Farmácia do Estado de Alagoas"
                  className="h-9 w-auto shrink-0 object-contain transition-transform duration-300 group-hover:scale-[1.03] lg:h-11"
                />
              </picture>
              <span className="hidden min-w-0 border-l border-crfal-gray-200 pl-3 leading-tight xl:block">
                <span className="block text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]">Conselho Regional de Farmácia</span>
                <span className="block text-[15px] font-bold text-crfal-blue-dark">Estado de Alagoas</span>
              </span>
            </Link>

            <nav aria-label="Navegação principal" className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
              {navItems.filter((item) => item.columns || !item.href.startsWith('http')).map((item, index) => (
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

            <button ref={searchButtonRef} type="button" onClick={() => { searchTriggerRef.current = searchButtonRef.current; setIsMobileMenuOpen(false); setIsSearchOpen(true); }} aria-label="Buscar páginas e serviços" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white hover:bg-white/10 focus-visible:outline-white lg:hidden">
              <Search className="h-6 w-6" aria-hidden="true" />
            </button>

            <div className="hidden shrink-0 items-center gap-2 lg:flex">
              <button
                ref={desktopSearchRef}
                type="button"
                onClick={() => { searchTriggerRef.current = desktopSearchRef.current; setIsSearchOpen(true); }}
                aria-label="Buscar páginas e serviços (Ctrl ou ⌘ + K)"
                title="Buscar (Ctrl/⌘ + K)"
                className="flex h-11 w-11 items-center justify-center rounded-full text-crfal-blue transition-colors hover:bg-crfal-blue-lighter focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue"
              >
                <Search className="h-5 w-5" aria-hidden="true" />
              </button>
              <a
                href={CRF_EM_CASA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full bg-crfal-blue px-4 text-sm font-bold text-white shadow-[0_6px_16px_-6px_rgba(0,51,102,0.55)] transition-colors hover:bg-crfal-blue-dark focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 ring-1 ring-crfal-gold/50"><User className="h-3.5 w-3.5" aria-hidden="true" /></span>
                CRF AL em Casa
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                <span className="sr-only">(abre em uma nova aba)</span>
              </a>
            </div>
          </div>
        </div>
        {/* Véu suave sobre a página enquanto um menu está aberto. */}
        <div aria-hidden className={`pointer-events-none absolute inset-x-0 top-full hidden h-screen bg-crfal-blue-dark/25 transition-opacity duration-200 motion-reduce:transition-none lg:block ${activeDropdown ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      <MobileHeaderSearch open={isSearchOpen} onOpenChange={setIsSearchOpen} items={searchItems} triggerRef={searchTriggerRef} />

      <MobileNavigation open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen} triggerRef={menuButtonRef} items={navItems} onOpenSearch={() => { searchTriggerRef.current = searchButtonRef.current; setIsSearchOpen(true); }} socialLinks={renderSocial(
        'flex h-11 w-11 items-center justify-center rounded-lg bg-crfal-blue-lighter text-crfal-blue transition-colors hover:bg-crfal-blue hover:text-white',
        'h-[18px] w-[18px]',
        'flex items-center justify-center gap-2',
        () => setIsMobileMenuOpen(false)
      )} />
    </header>
      {pathname === '/' && (
        <nav aria-label="Acesso rápido por perfil" className="absolute left-0 right-0 top-16 z-40 h-[72px] border-b border-crfal-gray-200 bg-white lg:hidden">
          <div className="container-crfal grid h-full grid-cols-3 items-stretch divide-x divide-crfal-gray-200 py-2">
            {serviceProfiles.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                to={href}
                onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                className="group relative flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-crfal-blue-dark after:absolute after:inset-x-6 after:bottom-[-8px] after:h-0.5 after:rounded-full after:bg-crfal-gold after:opacity-0 after:transition-opacity active:after:opacity-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-crfal-blue focus-visible:after:opacity-100"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-crfal-blue-lighter text-crfal-blue ring-1 ring-crfal-blue/10 transition-colors group-active:bg-crfal-blue group-active:text-white">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="truncate text-[12.5px] font-semibold leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}

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
    ? 'after:absolute after:inset-x-2 after:bottom-[-16px] xl:after:inset-x-3 after:h-0.5 after:rounded-full after:bg-crfal-gold'
    : '';
  const stateClass = isOpen ? 'bg-crfal-blue-lighter text-crfal-blue' : isCurrent ? 'text-crfal-blue' : 'text-crfal-blue-dark/80 hover:bg-crfal-blue-lighter/70 hover:text-crfal-blue';

  if (!item.columns) {
    const external = item.href.startsWith('http');
    const DirectIcon = item.directIcon;
    const className = `${navLinkBase} ${stateClass} ${currentMark}`;
    return external ? (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
        {DirectIcon && <DirectIcon className="h-3.5 w-3.5 text-crfal-gray-400" aria-hidden />}
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
        <div id={panelId} className={`absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2 ${widthClass}`}>
          <div className="overflow-hidden rounded-2xl border border-crfal-gray-200 bg-white shadow-[0_28px_60px_-16px_rgba(11,25,44,0.45)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-200">
            <div aria-hidden className="h-0.5 bg-linear-to-r/srgb from-crfal-gold/0 via-crfal-gold to-crfal-gold/0" />
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
                      const linkClass = `group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue motion-reduce:transition-none ${active ? 'bg-crfal-blue-lighter/70' : 'hover:bg-crfal-gray-50'}`;
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
                <aside className="relative isolate flex flex-col overflow-hidden rounded-xl border-t-2 border-crfal-gold bg-linear-to-br/srgb from-crfal-blue to-crfal-blue-dark p-5 text-white">
                  <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 -z-10 h-40 w-40 rounded-full bg-crfal-blue-light/30 blur-3xl" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-crfal-gold">{item.feature.eyebrow}</p>
                  <p className="mt-2 text-lg font-bold leading-snug">{item.feature.title}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-white/75">{item.feature.text}</p>
                  <div className="mt-auto space-y-2 pt-5">
                    <a
                      href={item.feature.cta.href}
                      target={item.feature.cta.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.feature.cta.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="group flex min-h-10 w-full items-center justify-between gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-bold text-crfal-blue transition-colors hover:bg-crfal-blue-lighter focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-crfal-blue"
                    >
                      <span className="truncate">{item.feature.cta.label}</span>
                      {item.feature.cta.href.startsWith('http') ? <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden /> : <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />}
                      {item.feature.cta.href.startsWith('http') && <span className="sr-only">(abre em uma nova aba)</span>}
                    </a>
                    {item.feature.secondary && (
                      <a href={item.feature.secondary.href} target="_blank" rel="noopener noreferrer" className="flex min-h-10 w-full items-center justify-between gap-2 rounded-full border border-white/30 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white">
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
