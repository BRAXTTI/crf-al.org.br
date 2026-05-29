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
      { label: 'História', href: '/instituicao/historia' },
      { label: 'Missão e Visão', href: '/instituicao/missao-visao' },
      { label: 'Diretoria', href: '/instituicao/diretoria' },
      { label: 'Estatuto', href: '/instituicao/estatuto' },
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
    href: '/fiscalizacao',
    submenu: [
      { label: 'Custos da fiscalização', href: 'https://crf-al.implanta.net.br/portalTransparencia/#publico/inicio' },
      { label: 'Papel da Fiscalização', href: '/fiscalizacao/papel-da-fiscalizacao' },
      { label: 'Instrumentos de fiscalização', href: '/fiscalizacao/instrumentos-da-fiscalizacao' },
      { label: 'Plano de fiscalização anual', href: '/fiscalizacao/plano-de-fiscalizacao-anual' },
      { label: 'Relatórios', href: '/fiscalizacao/relatorios' },
      { label: 'Processo Administrativo Fiscal', href: '/fiscalizacao/processo-administrativo-fiscal' },
      { label: 'Afastamento Provisório', href: '/fiscalizacao/afastamento-provisorio' },
      { label: 'Legislação', href: '/legislacao' },
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
    window.addEventListener('resize', handleResize);
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
  const navLinkInactiveLight = 'text-white/90 hover:text-white hover:bg-white/10';
  const navLinkActiveLight = 'text-white bg-white/15';
  const navLinkInactiveSolid = 'text-neutral-700 hover:text-crfal-blue hover:bg-neutral-100';
  const navLinkActiveSolid = 'text-crfal-blue bg-neutral-100';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 overflow-visible transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.05)] py-2 min-h-[56px] lg:min-h-0'
          : 'bg-transparent py-4 min-h-[60px] lg:min-h-0'
      }`}
    >
      <div className="container-crfal overflow-visible">
        <div className="flex items-center justify-between gap-2 min-h-[44px]">
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <img
              src="/images/logo-crf-azul.png"
              alt="CRFAL - Conselho Regional de Farmácia de Alagoas"
              className={`h-10 md:h-11 w-auto object-contain transition-all duration-300 group-hover:scale-105 ${
                isOverHero ? 'brightness-0 invert' : ''
              }`}
            />
          </Link>

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
                      className={`${navLinkBase} ${
                        isOverHero
                          ? activeDropdown === item.label ? navLinkActiveLight : navLinkInactiveLight
                          : activeDropdown === item.label ? navLinkActiveSolid : navLinkInactiveSolid
                      }`}
                      onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
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
                          ? activeDropdown === item.label ? navLinkActiveLight : navLinkInactiveLight
                          : activeDropdown === item.label ? navLinkActiveSolid : navLinkInactiveSolid
                      }`}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      className={`${navLinkBase} ${
                        isOverHero
                          ? activeDropdown === item.label ? navLinkActiveLight : navLinkInactiveLight
                          : activeDropdown === item.label ? navLinkActiveSolid : navLinkInactiveSolid
                      }`}
                    >
                      {item.label}
                    </a>
                  )}

                  {item.submenu && activeDropdown === item.label && (
                    <div className="absolute top-full left-0 z-40 h-56 w-56" aria-hidden />
                  )}
                  {item.submenu && activeDropdown === item.label && (
                    <div
                      className={`absolute top-full left-0 z-50 mt-1 w-56 overflow-hidden rounded-xl border shadow-xl animate-scale-in origin-top ${
                        isOverHero
                          ? 'bg-white/95 backdrop-blur-md border-white/20'
                          : 'bg-white border-neutral-200'
                      }`}
                    >
                      <div className="py-2">
                        {item.submenu.map((subItem, index) =>
                          subItem.href.startsWith('/') ? (
                            <Link
                              key={subItem.label}
                              to={subItem.href}
                              className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-crfal-blue transition-colors"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              {subItem.label}
                            </Link>
                          ) : (
                            <a
                              key={subItem.label}
                              href={subItem.href}
                              className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-crfal-blue transition-colors"
                              style={{ animationDelay: `${index * 50}ms` }}
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
            </nav>

            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2.5 rounded-lg transition-all ${isOverHero ? 'text-white/90 hover:bg-white/10' : 'text-neutral-600 hover:bg-neutral-100'}`}
              aria-label="Buscar"
            >
              <Search className="w-4 h-4" />
            </button>

            <ThemeToggle isOverHero={isOverHero} />

            <a
              href="https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf"
              target="_blank"
              className={`ml-2 flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full transition-all shrink-0 ${
                isOverHero
                  ? 'bg-white text-crfal-blue hover:bg-white/95'
                  : 'bg-crfal-blue text-white hover:bg-crfal-blue-dark'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="whitespace-nowrap">Área do Farmacêutico</span>
            </a>
          </div>

          <div className="flex lg:hidden items-center gap-2 shrink-0">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all ${
                isOverHero ? 'text-white/90 hover:bg-white/10' : 'text-neutral-700 hover:bg-neutral-100'
              }`}
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>
            <ThemeToggle isOverHero={isOverHero} mobile />
            <a
              href="https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf"
              target="_blank"
              className={`flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-full text-sm font-medium ${
                isOverHero ? 'bg-white text-crfal-blue' : 'bg-crfal-blue text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden xs:inline">Área do Farmacêutico</span>
            </a>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all ${
                isOverHero ? 'text-white hover:bg-white/10' : 'text-neutral-700 hover:bg-neutral-100'
              }`}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="mt-4 animate-slide-down">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar no site..."
                className="w-full px-4 py-3 pr-12 bg-white border border-neutral-200 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-crfal-blue/20 focus:border-crfal-blue text-neutral-800"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-neutral-500 hover:text-crfal-blue rounded-lg transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {isMobileMenuOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="lg:hidden fixed left-0 right-0 bottom-0 top-[72px] z-[9999] bg-white overflow-y-auto"
            style={{ WebkitOverflowScrolling: 'touch' }}
            aria-modal
            role="dialog"
            aria-label="Menu de navegação"
          >
            <nav className="min-h-full pb-24">
              <div className="container-crfal py-6">
                <div className="bg-neutral-50 rounded-2xl border border-neutral-200 overflow-hidden">
                  {navItems.map((item) => (
                    <div key={item.label} className="border-b border-neutral-200 last:border-0">
                      <button
                        onClick={() => item.submenu && toggleMobileItem(item.label)}
                        className="w-full flex items-center justify-between py-4 px-4 text-neutral-800 hover:bg-neutral-100 font-medium text-left transition-colors min-h-[48px]"
                      >
                        {item.submenu ? (
                          <span>{item.label}</span>
                        ) : item.href.startsWith('/') ? (
                          <Link
                            to={item.href}
                            className="flex-1"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        ) : (
                          <a
                            href={item.href}
                            className="flex-1"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.label}
                          </a>
                        )}
                        {item.submenu && (
                          <ChevronDown
                            className={`w-5 h-5 transition-transform duration-300 ${
                              isMobileItemExpanded(item.label) ? 'rotate-180' : ''
                            }`}
                          />
                        )}
                      </button>

                      {item.submenu && (
                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            isMobileItemExpanded(item.label) ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="pb-3 pl-6 pr-4 space-y-1 bg-neutral-100/50">
                            {item.submenu.map((subItem) =>
                              subItem.href.startsWith('/') ? (
                                <Link
                                  key={subItem.label}
                                  to={subItem.href}
                                  className="block py-2.5 pl-3 text-sm text-neutral-700 hover:bg-neutral-200/70 hover:text-crfal-blue rounded-lg transition-colors"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {subItem.label}
                                </Link>
                              ) : (
                                <a
                                  key={subItem.label}
                                  href={subItem.href}
                                  className="block py-2.5 pl-3 text-sm text-neutral-700 hover:bg-neutral-200/70 hover:text-crfal-blue rounded-lg transition-colors"
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
                  href="#login"
                  className="flex items-center justify-center gap-2 mt-6 px-4 py-4 bg-crfal-blue text-white font-medium rounded-full w-full hover:bg-crfal-blue-dark transition-colors min-h-[48px]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  Área do Farmacêutico
                </a>
              </div>
            </nav>
          </div>,
          document.body
        )}
    </header>
  );
}
