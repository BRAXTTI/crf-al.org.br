import { useState, useEffect, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Search,
  Menu,
  X,
  User,
  Building2,
  Users,
  Target,
  BookOpen,
  FileText,
  CreditCard,
  ClipboardList,
  HeadphonesIcon,
  Scale,
  Gavel,
  BarChart3,
  Newspaper,
  ExternalLink,
  Calendar,
} from 'lucide-react';


type SubItem = { label: string; href: string; icon: React.ElementType; external?: boolean };
type Column = { title: string; items: SubItem[] };

interface NavItem {
  label: string;
  href: string;
  columns?: Column[];
  directIcon?: React.ElementType;
}

const navItems: NavItem[] = [
  {
    label: 'Instituição',
    href: '/instituicao',
    columns: [
      {
        title: 'A CRFAL',
        items: [
          { label: 'Sobre o Conselho', href: '/instituicao/sobre-conselho', icon: Building2 },
          { label: 'Diretoria', href: '/instituicao/diretoria', icon: Users },
          { label: 'Missão e Visão', href: '/instituicao/missao-visao', icon: Target },
          { label: 'Estatuto', href: '/instituicao/estatuto', icon: BookOpen },
        ],
      },
      {
        title: 'Normas e Controle',
        items: [
          { label: 'Legislação', href: '/legislacao', icon: Gavel },
          { label: 'Transparência', href: 'https://crf-al.implanta.net.br/portalTransparencia/#publico/inicio', icon: BarChart3, external: true },
        ],
      },
    ],
  },
  {
    label: 'Serviços',
    href: '#servicos',
    columns: [
      {
        title: 'Atendimento Digital',
        items: [
          { label: 'Requerimentos', href: '/servicos/requerimentos', icon: FileText },
          { label: 'Tutoriais', href: '/servicos/tutoriais', icon: ClipboardList },
          { label: 'Ouvidoria', href: '/servicos/ouvidoria', icon: HeadphonesIcon },
        ],
      },
      {
        title: 'Financeiro',
        items: [
          { label: 'Boletos e Anuidades', href: 'https://crfal-emcasa.cisantec.com.br/crf-em-casa/consulta/boletos/inicial.jsf', icon: CreditCard, external: true },
        ],
      },
    ],
  },
  {
    label: 'Fiscalização',
    href: '/fiscalizacao',
    columns: [
      {
        title: 'Atuação',
        items: [
          { label: 'Papel da Fiscalização', href: '/fiscalizacao/papel-da-fiscalizacao', icon: Building2 },
          { label: 'Instrumentos', href: '/fiscalizacao/instrumentos-da-fiscalizacao', icon: Gavel },
          { label: 'Plano Anual', href: '/fiscalizacao/plano-de-fiscalizacao-anual', icon: Target },
        ],
      },
      {
        title: 'Processos e Relatórios',
        items: [
          { label: 'Relatórios', href: '/fiscalizacao/relatorios', icon: BarChart3 },
          { label: 'Processo Administrativo', href: '/fiscalizacao/processo-administrativo-fiscal', icon: FileText },
          { label: 'Afastamento Provisório', href: '/fiscalizacao/afastamento-provisorio', icon: Users },
          { label: 'Custos da Fiscalização', href: 'https://crf-al.implanta.net.br/portalTransparencia/#publico/inicio', icon: Scale, external: true },
        ],
      },
    ],
  },
  {
    label: 'Imprensa',
    href: '#imprensa',
    columns: [
      {
        title: 'Comunicação',
        items: [
          { label: 'Notícias', href: '/imprensa/noticias', icon: Newspaper },
          { label: 'Eventos', href: '/eventos', icon: Calendar },
        ],
      },
    ],
  },
  {
    label: 'Transparência',
    href: 'https://crf-al.implanta.net.br/portalTransparencia/#publico/inicio',
    directIcon: ExternalLink,
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
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
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
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileItem = (label: string) => {
    setExpandedMobileItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { pathname } = useLocation();
  const darkHeroPages = ['/', '/imprensa/noticias'];
  const hasDarkHero = darkHeroPages.includes(pathname) || pathname.startsWith('/imprensa/noticias/');
  const isOverHero = hasDarkHero && !isScrolled;

  const isExternalLink = (href: string) => href.startsWith('http');

  const navLinkBase =
    'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.06)] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)] py-2'
          : 'bg-gradient-to-b from-black/55 via-black/25 to-transparent py-3'
      }`}
    >
      <div className="container-crfal">
        <div className="flex items-center justify-between gap-3 min-h-[52px]">
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex items-center gap-3 group shrink-0"
          >
            <img
              src="/images/logo-crf-azul.png"
              alt="CRFAL"
              className={`h-11 w-auto object-contain transition-all duration-300 group-hover:scale-105 ${
                isOverHero ? 'brightness-0 invert' : ''
              }`}
            />
            <div className={`hidden xl:block transition-colors duration-300 ${isOverHero ? 'text-white' : 'text-neutral-800 dark:text-white'}`}>
              <p className="text-[11px] font-medium uppercase tracking-wider leading-none opacity-80">
                Conselho Regional de Farmácia
              </p>
              <p className="text-sm font-bold leading-tight">Estado de Alagoas</p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center flex-1 justify-end gap-1">
            <nav className="flex items-center">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.columns && setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {item.columns ? (
                    <button
                      type="button"
                      className={`${navLinkBase} ${
                        isOverHero
                          ? activeDropdown === item.label
                            ? 'text-white bg-white/15'
                            : 'text-white/90 hover:text-white hover:bg-white/10'
                          : activeDropdown === item.label
                            ? 'text-crfal-blue dark:text-sky-300 bg-crfal-gray-100 dark:bg-slate-800'
                            : 'text-neutral-700 dark:text-slate-200 hover:text-crfal-blue dark:hover:text-sky-300 hover:bg-crfal-gray-100 dark:hover:bg-slate-800'
                      }`}
                      onClick={() =>
                        setActiveDropdown(activeDropdown === item.label ? null : item.label)
                      }
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
                          ? 'text-white/90 hover:text-white hover:bg-white/10'
                          : 'text-neutral-700 dark:text-slate-200 hover:text-crfal-blue dark:hover:text-sky-300 hover:bg-crfal-gray-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item.directIcon && <item.directIcon className="w-3.5 h-3.5" />}
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      target={isExternalLink(item.href) ? '_blank' : undefined}
                      rel={isExternalLink(item.href) ? 'noopener noreferrer' : undefined}
                      className={`${navLinkBase} ${
                        isOverHero
                          ? 'text-white/90 hover:text-white hover:bg-white/10'
                          : 'text-neutral-700 dark:text-slate-200 hover:text-crfal-blue dark:hover:text-sky-300 hover:bg-crfal-gray-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {item.directIcon && <item.directIcon className="w-3.5 h-3.5" />}
                      {item.label}
                    </a>
                  )}

                  {item.columns && activeDropdown === item.label && (
                    <>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 h-4 w-[720px]" aria-hidden />
                      <div className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 z-50 w-[720px]">
                        <div
                          className={`overflow-hidden rounded-xl border shadow-2xl animate-scale-in origin-top ${
                            isOverHero
                              ? 'bg-white dark:bg-slate-900 border-white/20 dark:border-slate-700'
                              : 'bg-white dark:bg-slate-900 border-crfal-gray-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="grid grid-cols-2 gap-8 p-6">
                            {item.columns.map((column) => (
                              <div key={column.title}>
                                <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-crfal-gray-400 dark:text-crfal-gray-500">
                                  {column.title}
                                </h4>
                                <ul className="space-y-1">
                                  {column.items.map((subItem) => {
                                    const Icon = subItem.icon;
                                    const content = (
                                      <>
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-crfal-blue-lighter text-crfal-blue transition-colors duration-200 group-hover:bg-crfal-blue group-hover:text-white dark:bg-slate-800 dark:text-crfal-blue-light dark:group-hover:bg-crfal-blue dark:group-hover:text-white">
                                          <Icon className="h-4.5 w-4.5" />
                                        </span>
                                        <span className="flex-1">
                                          <span className="block text-sm font-semibold text-neutral-700 transition-colors duration-200 group-hover:text-crfal-blue dark:text-slate-200 dark:group-hover:text-crfal-blue-light">
                                            {subItem.label}
                                          </span>
                                          {subItem.external && (
                                            <span className="block text-[10px] uppercase tracking-wider text-crfal-gray-400 dark:text-crfal-gray-500">
                                              Link externo
                                            </span>
                                          )}
                                        </span>
                                      </>
                                    );
                                    return (
                                      <li key={subItem.label}>
                                        {subItem.href.startsWith('/') ? (
                                          <Link
                                            to={subItem.href}
                                            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-crfal-gray-50 dark:hover:bg-slate-800"
                                          >
                                            {content}
                                          </Link>
                                        ) : (
                                          <a
                                            href={subItem.href}
                                            target={subItem.external ? '_blank' : undefined}
                                            rel={subItem.external ? 'noopener noreferrer' : undefined}
                                            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-crfal-gray-50 dark:hover:bg-slate-800"
                                          >
                                            {content}
                                          </a>
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
                    </>
                  )}
                </div>
              ))}
            </nav>

            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2.5 rounded-lg transition-all ${
                isOverHero ? 'text-white/90 hover:bg-white/10' : 'text-crfal-gray-600 hover:bg-crfal-gray-100'
              }`}
              aria-label="Buscar"
            >
              <Search className="w-4 h-4" />
            </button>

            <a
              href="https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf"
              target="_blank"
              rel="noopener noreferrer"
              className={`ml-2 flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full transition-all shrink-0 ${
                isOverHero
                  ? 'bg-white text-crfal-blue hover:bg-white/95'
                  : 'bg-crfal-blue text-white hover:bg-crfal-blue-dark'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="whitespace-nowrap">CRF AL em Casa</span>
            </a>
          </div>

          <div className="flex lg:hidden items-center gap-1 shrink-0">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all ${
                isOverHero ? 'text-white/90 hover:bg-white/10' : 'text-neutral-700 hover:bg-crfal-gray-100'
              }`}
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>
            <a
              href="https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-full text-sm font-medium ${
                isOverHero ? 'bg-white text-crfal-blue' : 'bg-crfal-blue text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden xs:inline">CRF AL em Casa</span>
            </a>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all ${
                isOverHero ? 'text-white hover:bg-white/10' : 'text-neutral-700 hover:bg-crfal-gray-100'
              }`}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="mt-3 animate-slide-down">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar no site..."
                className="w-full px-4 py-3 pr-12 bg-white dark:bg-slate-900 border border-crfal-gray-200 dark:border-slate-700 rounded-xl shadow-card focus:outline-none focus:ring-2 focus:ring-crfal-blue/20 focus:border-crfal-blue text-neutral-800 dark:text-white"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-crfal-gray-500 hover:text-crfal-blue rounded-lg transition-colors">
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
            className="lg:hidden fixed left-0 right-0 bottom-0 top-[72px] z-[9999] bg-white dark:bg-slate-950 overflow-y-auto"
            style={{ WebkitOverflowScrolling: 'touch' }}
            aria-modal
            role="dialog"
            aria-label="Menu de navegação"
          >
            <nav className="min-h-full pb-24">
              <div className="container-crfal py-6">
                <div className="bg-crfal-gray-50 dark:bg-slate-900 rounded-xl border border-crfal-gray-200 dark:border-slate-700 overflow-hidden">
                  {navItems.map((item) => {
                    const ItemIcon = item.directIcon;
                    return (
                      <div key={item.label} className="border-b border-crfal-gray-200 last:border-0 dark:border-slate-700">
                        <button
                          onClick={() => item.columns && toggleMobileItem(item.label)}
                          className="w-full flex items-center justify-between py-4 px-4 text-neutral-800 dark:text-slate-100 hover:bg-crfal-gray-100 dark:hover:bg-slate-800 font-medium text-left transition-colors min-h-[48px]"
                        >
                          <span className="flex items-center gap-2">
                            {ItemIcon && <ItemIcon className="w-4 h-4" />}
                            {item.columns ? (
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
                                target={isExternalLink(item.href) ? '_blank' : undefined}
                                rel={isExternalLink(item.href) ? 'noopener noreferrer' : undefined}
                                className="flex-1"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {item.label}
                              </a>
                            )}
                          </span>
                          {item.columns && (
                            <ChevronDown
                              className={`w-5 h-5 transition-transform duration-300 ${
                                expandedMobileItems.includes(item.label) ? 'rotate-180' : ''
                              }`}
                            />
                          )}
                        </button>

                        {item.columns && (
                          <div
                            className={`overflow-hidden transition-all duration-300 ${
                              expandedMobileItems.includes(item.label)
                                ? 'max-h-[600px] opacity-100'
                                : 'max-h-0 opacity-0'
                            }`}
                          >
                            <div className="pb-3 pl-4 pr-4 space-y-4 bg-crfal-gray-100/50 dark:bg-slate-800/50">
                              {item.columns.map((column) => (
                                <div key={column.title}>
                                  <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-crfal-gray-400 dark:text-crfal-gray-500">
                                    {column.title}
                                  </p>
                                  <div className="space-y-1">
                                    {column.items.map((subItem) => {
                                      const SubIcon = subItem.icon;
                                      return subItem.href.startsWith('/') ? (
                                        <Link
                                          key={subItem.label}
                                          to={subItem.href}
                                          className="flex items-center gap-3 rounded-lg py-2.5 pl-3 pr-2 text-sm text-neutral-700 dark:text-slate-300 hover:bg-neutral-200/70 dark:hover:bg-slate-700/70 hover:text-crfal-blue dark:hover:text-sky-300 transition-colors"
                                          onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                          <SubIcon className="w-4 h-4 shrink-0" />
                                          {subItem.label}
                                        </Link>
                                      ) : (
                                        <a
                                          key={subItem.label}
                                          href={subItem.href}
                                          target={subItem.external ? '_blank' : undefined}
                                          rel={subItem.external ? 'noopener noreferrer' : undefined}
                                          className="flex items-center gap-3 rounded-lg py-2.5 pl-3 pr-2 text-sm text-neutral-700 dark:text-slate-300 hover:bg-neutral-200/70 dark:hover:bg-slate-700/70 hover:text-crfal-blue dark:hover:text-sky-300 transition-colors"
                                          onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                          <SubIcon className="w-4 h-4 shrink-0" />
                                          {subItem.label}
                                        </a>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <a
                  href="https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 mt-6 px-4 py-4 bg-crfal-blue text-white font-semibold rounded-full w-full hover:bg-crfal-blue-dark transition-colors min-h-[48px]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  CRF AL em Casa
                </a>
              </div>
            </nav>
          </div>,
          document.body
        )}
    </header>
  );
}
