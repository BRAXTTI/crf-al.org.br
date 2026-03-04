import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ChevronDown, Search, Menu, X, User } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';

interface NavItem {
  label: string;
  href: string;
  submenu?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    label: 'Instituição',
    href: '/instituicao',
    submenu: [
      { label: 'Sobre o Conselho', href: '/instituicao/sobre-conselho' },
      { label: 'Diretoria', href: '/instituicao/diretoria' },
    ],
  },
  {
    label: 'Serviços',
    href: '#servicos',
    submenu: [
      { label: 'Boletos e Anuidades', href: '#boletos-anuidades' },
      { label: 'Requerimentos', href: '/servicos/requerimentos' },
      { label: 'Ouvidoria', href: '/servicos/ouvidoria' },
      { label: 'Tutoriais', href: '/servicos/tutoriais' },
    ],
  },
  {
    label: 'Fiscalização',
    href: '#fiscalizacao',
    submenu: [
      { label: 'Normas de Fiscalização', href: '#normas' },
      { label: 'Denúncias', href: '#denuncias' },
      { label: 'Orientações', href: '#orientacoes' },
      { label: 'Leis Federais', href: '#leis' },
      { label: 'Resoluções', href: '#resolucoes' },
      { label: 'Normativas', href: '#normativas' },
      { label: 'Pareceres', href: '#pareceres' },
    ],
  },
  {
    label: 'Transparência',
    href: 'https://crf-al.implanta.net.br/portalTransparencia/#publico/inicio',
  },
  {
    label: 'Imprensa',
    href: '#imprensa',
    submenu: [
      { label: 'Notícias', href: '/imprensa/noticias' },
      { label: 'Comunicados', href: '#comunicados' },
      { label: 'Galeria', href: '#galeria' },
    ],
  },
  {
    label: 'Fale Conosco',
    href: '/contato',
  },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileItems, setExpandedMobileItems] = useState<string[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileItem = (label: string) => {
    setExpandedMobileItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isMobileItemExpanded = (label: string) =>
    expandedMobileItems.includes(label);

  const isOverHero = !isScrolled;
  const navLinkBase =
    'flex items-center gap-1 px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg';
  const navLinkInactiveLight =
    'text-white/90 hover:text-white hover:bg-white/10';
  const navLinkActiveLight = 'text-white bg-white/15';
  const navLinkInactiveSolid =
    'text-neutral-700 hover:text-crfal-blue hover:bg-neutral-100 dark:text-slate-200 dark:hover:text-blue-300 dark:hover:bg-slate-800';
  const navLinkActiveSolid = 'text-crfal-blue bg-neutral-100 dark:text-blue-300 dark:bg-slate-800';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 overflow-visible transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.05)] dark:bg-slate-950/90 py-2 min-h-[56px] lg:min-h-0'
          : 'bg-transparent py-3 sm:py-4 min-h-[56px] lg:min-h-0'
      }`}
    >
      <div className="container-crfal overflow-visible">
        <div className="flex items-center justify-between gap-2 min-h-[44px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0 min-w-0">
            <img
              src="/images/logo-crf-azul.png"
              alt="CRFAL - Conselho Regional de Farmácia de Alagoas"
              className={`h-8 sm:h-10 md:h-11 w-auto max-w-[150px] sm:max-w-[210px] object-contain transition-all duration-300 group-hover:scale-105 ${
                isOverHero ? 'brightness-0 invert' : ''
              } dark:brightness-0 dark:invert`}
            />
          </Link>

          {/* Desktop: nav links + search + CTA */}
          <div className="hidden lg:flex items-center flex-1 justify-end gap-1">
            <nav className="flex items-center gap-0.5">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {item.submenu ? (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === item.label ? null : item.label
                        )
                      }
                      className={`${navLinkBase} ${
                        isOverHero
                          ? activeDropdown === item.label
                            ? navLinkActiveLight
                            : navLinkInactiveLight
                          : activeDropdown === item.label
                            ? navLinkActiveSolid
                            : navLinkInactiveSolid
                      }`}
                    >
                      {item.label}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === item.label ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  ) : item.href.startsWith('/') ? (
                    <Link
                      to={item.href}
                      className={`${navLinkBase} ${
                        isOverHero
                          ? navLinkInactiveLight
                          : navLinkInactiveSolid
                      }`}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      className={`${navLinkBase} ${
                        isOverHero
                          ? navLinkInactiveLight
                          : navLinkInactiveSolid
                      }`}
                    >
                      {item.label}
                    </a>
                  )}

                  {item.submenu && activeDropdown === item.label ? (
                    <div
                      className="absolute top-full left-0 z-40 h-56 w-56"
                      aria-hidden
                    />
                  ) : null}
                  {item.submenu && activeDropdown === item.label ? (
                    <div
                      className={`absolute top-full left-0 z-50 mt-1 w-56 overflow-hidden rounded-xl border shadow-xl animate-scale-in origin-top ${
                        isOverHero
                          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-white/20 dark:border-slate-700'
                          : 'bg-white border-neutral-200 dark:bg-slate-900 dark:border-slate-700'
                      }`}
                    >
                      <div className="py-2">
                        {item.submenu.map((subItem, index) =>
                          subItem.href.startsWith('/') ? (
                            <Link
                              key={subItem.label}
                              to={subItem.href}
                              className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-crfal-blue dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-300 transition-colors"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              {subItem.label}
                            </Link>
                          ) : (
                            <a
                              key={subItem.label}
                              href={subItem.href}
                              className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-crfal-blue dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-300 transition-colors"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              {subItem.label}
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </nav>

            <ThemeToggle isOverHero={isOverHero} />
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2.5 rounded-lg transition-all ${isOverHero ? 'text-white/90 hover:bg-white/10' : 'text-neutral-600 hover:bg-neutral-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}
              aria-label="Buscar"
            >
              <Search className="w-4 h-4" />
            </button>

            <a
              href="https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf"
              target="_blank"
              rel="noopener noreferrer"
              className={`ml-2 flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full transition-all shrink-0 ${
                isOverHero
                  ? 'bg-white text-crfal-blue hover:bg-white/95 dark:!bg-blue-100 dark:!text-slate-900 dark:hover:!bg-blue-50'
                  : 'bg-crfal-blue text-white hover:bg-crfal-blue-dark'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="whitespace-nowrap">Área do Farmacêutico</span>
            </a>
          </div>

          {/* Mobile: CTA + menu */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border transition-all ${
                isOverHero
                  ? 'text-white/90 border-white/20 bg-white/10 hover:bg-white/15'
                  : 'text-neutral-700 border-neutral-200 bg-white hover:bg-neutral-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800'
              }`}
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>
            <ThemeToggle isOverHero={isOverHero} mobile />
            <a
              href="https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf"
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden md:flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                isOverHero
                  ? 'bg-white text-crfal-blue dark:!bg-blue-100 dark:!text-slate-900'
                  : 'bg-crfal-blue text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Área do Farmacêutico</span>
            </a>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border transition-all ${
                isOverHero
                  ? 'text-white border-white/20 bg-white/10 hover:bg-white/15'
                  : 'text-neutral-700 border-neutral-200 bg-white hover:bg-neutral-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800'
              }`}
              aria-label="Menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen ? (
          <div className="mt-3 sm:mt-4 animate-slide-down">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar no site..."
                autoFocus
                className="w-full px-4 py-3 pr-12 bg-white border border-neutral-200 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-crfal-blue/20 focus:border-crfal-blue text-neutral-800 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 text-sm sm:text-base"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-neutral-500 hover:text-crfal-blue dark:text-slate-400 dark:hover:text-blue-300 rounded-lg transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Mobile Menu - Portal */}
      {isMobileMenuOpen &&
        typeof document !== 'undefined' ?
        createPortal(
          <div
            className="lg:hidden fixed left-0 right-0 bottom-0 top-[56px] sm:top-[72px] z-[9999] bg-white/98 dark:bg-slate-950/95 backdrop-blur-sm overflow-y-auto"
            style={{ WebkitOverflowScrolling: 'touch' }}
            aria-modal
            role="dialog"
            aria-label="Menu de navegação"
          >
            <nav className="min-h-full pb-24">
              <div className="container-crfal py-4 sm:py-6">
                {/* Mobile search (prominent) */}
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="O que você procura?"
                      className="w-full px-4 py-3 pl-11 bg-neutral-100 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-crfal-blue/20 focus:border-crfal-blue text-neutral-800 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 text-sm"
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-400 dark:text-slate-500" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-neutral-200 dark:border-slate-700 overflow-hidden shadow-sm">
                  {navItems.map((item) => (
                    <div key={item.label} className="border-b border-neutral-100 dark:border-slate-800 last:border-0">
                      {item.submenu ? (
                        <button
                          onClick={() => toggleMobileItem(item.label)}
                          className="w-full flex items-center justify-between py-3.5 px-4 text-neutral-800 dark:text-slate-100 hover:bg-neutral-50 dark:hover:bg-slate-800 font-medium text-left transition-colors min-h-[48px] text-[15px]"
                        >
                          <span>{item.label}</span>
                          <ChevronDown
                            className={`w-5 h-5 text-neutral-400 dark:text-slate-500 transition-transform duration-300 ${
                              isMobileItemExpanded(item.label) ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      ) : item.href.startsWith('/') ? (
                        <Link
                          to={item.href}
                          className="block py-3.5 px-4 text-neutral-800 dark:text-slate-100 hover:bg-neutral-50 dark:hover:bg-slate-800 font-medium transition-colors min-h-[48px] text-[15px]"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <a
                          href={item.href}
                          className="block py-3.5 px-4 text-neutral-800 dark:text-slate-100 hover:bg-neutral-50 dark:hover:bg-slate-800 font-medium transition-colors min-h-[48px] text-[15px]"
                          onClick={() => setIsMobileMenuOpen(false)}
                          rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          target={item.href.startsWith('http') ? '_blank' : undefined}
                        >
                          {item.label}
                        </a>
                      )}

                      {item.submenu && (
                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            isMobileItemExpanded(item.label)
                              ? 'max-h-64 opacity-100'
                              : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="pb-2 pl-4 pr-4 space-y-0.5">
                            {item.submenu.map((subItem) =>
                              subItem.href.startsWith('/') ? (
                                <Link
                                  key={subItem.label}
                                  to={subItem.href}
                                  className="block py-2.5 pl-4 text-sm text-neutral-600 dark:text-slate-300 hover:text-crfal-blue dark:hover:text-blue-300 rounded-lg transition-colors border-l-2 border-neutral-200 dark:border-slate-700 hover:border-crfal-blue"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {subItem.label}
                                </Link>
                              ) : (
                                <a
                                  key={subItem.label}
                                  href={subItem.href}
                                  className="block py-2.5 pl-4 text-sm text-neutral-600 dark:text-slate-300 hover:text-crfal-blue dark:hover:text-blue-300 rounded-lg transition-colors border-l-2 border-neutral-200 dark:border-slate-700 hover:border-crfal-blue"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {subItem.label}
                                </a>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <a
                  href="https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 mt-5 px-4 py-3.5 bg-crfal-blue text-white font-medium rounded-full w-full hover:bg-crfal-blue-dark active:scale-[0.98] transition-all min-h-[48px]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  Área do Farmacêutico
                </a>
              </div>
            </nav>
          </div>,
          document.body
        ) : null}
    </header>
  );
}
