import { useState, useEffect, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
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
import { CRF_EM_CASA_URL, SOCIAL_LINKS, TRANSPARENCIA_URL } from '@/config/site';
import { FacebookIcon, InstagramIcon, XIcon, YouTubeIcon } from '@/components/icons/social';


type SubItem = { label: string; href: string; icon: React.ElementType; external?: boolean };
type Column = { title: string; items: SubItem[] };

interface NavItem {
  label: string;
  href: string;
  columns?: Column[];
  directIcon?: React.ElementType;
}

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  Instagram: InstagramIcon,
  Facebook: FacebookIcon,
  YouTube: YouTubeIcon,
  X: XIcon,
};

const navItems: NavItem[] = [
  {
    label: 'Instituição',
    href: '/instituicao',
    columns: [
      {
        title: 'O CRF AL',
        items: [
          { label: 'Sobre o Conselho', href: '/instituicao/sobre-conselho', icon: Building2 },
          { label: 'Diretoria', href: '/instituicao/diretoria', icon: Users },
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
    href: '/servicos/requerimentos',
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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileItems, setExpandedMobileItems] = useState<string[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

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

  const isExternalLink = (href: string) => href.startsWith('http');

  const navLinkBase =
    'flex items-center gap-1.5 rounded-md px-3 py-2 text-[15px] font-medium tracking-[0.02em] transition-all duration-200';

  const renderSocial = (itemClassName: string, iconClassName: string) => (
    <ul className="flex items-center gap-1">
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
            >
              <Icon className={iconClassName} />
            </a>
          </li>
        );
      })}
    </ul>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Barra de identidade — logo, nome da entidade, redes sociais e acesso do profissional */}
      <div className="border-b border-crfal-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
        <div className="container-crfal">
          <div className="flex h-16 items-center justify-between gap-2 lg:h-[76px] lg:gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-crfal-blue transition-colors hover:bg-crfal-blue-lighter lg:hidden"
              aria-label="Menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <Link
              to="/"
              onClick={handleLogoClick}
              className="group flex min-w-0 items-center gap-2.5 lg:gap-3"
            >
              <img
                src="/images/logo-crf-azul.png"
                alt="CRFAL - Conselho Regional de Farmácia do Estado de Alagoas"
                className="h-10 w-auto shrink-0 object-contain transition-transform duration-300 group-hover:scale-[1.03] lg:h-12"
              />
              <span className="min-w-0 border-l border-crfal-gray-200 pl-2.5 leading-tight lg:pl-3">
                <span className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-crfal-blue sm:block lg:text-[11px]">
                  Conselho Regional de Farmácia
                </span>
                <span className="block truncate text-sm font-bold text-crfal-blue-dark lg:text-base">
                  <span className="hidden sm:inline">Estado de Alagoas</span>
                  <span className="sm:hidden">CRF-AL</span>
                </span>
              </span>
            </Link>

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

            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-crfal-blue transition-colors hover:bg-crfal-blue-lighter lg:hidden"
              aria-label="Buscar"
              aria-expanded={isSearchOpen}
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Barra de menu — navegação principal (desktop) */}
      <div className="hidden bg-[#003366] lg:block">
        <div className="container-crfal">
          <div className="flex h-14 items-center justify-between gap-3">
            <nav className="-ml-3 flex items-center">
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
                        activeDropdown === item.label
                          ? 'bg-white/15 text-white'
                          : 'text-white/90 hover:bg-white/10 hover:text-white'
                      }`}
                      onClick={() =>
                        setActiveDropdown(activeDropdown === item.label ? null : item.label)
                      }
                    >
                      {item.label}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          activeDropdown === item.label ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  ) : item.href.startsWith('/') ? (
                    <Link
                      to={item.href}
                      className={`${navLinkBase} text-white/90 hover:bg-white/10 hover:text-white`}
                    >
                      {item.directIcon && <item.directIcon className="h-3.5 w-3.5" />}
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      target={isExternalLink(item.href) ? '_blank' : undefined}
                      rel={isExternalLink(item.href) ? 'noopener noreferrer' : undefined}
                      className={`${navLinkBase} text-white/90 hover:bg-white/10 hover:text-white`}
                    >
                      {item.directIcon && <item.directIcon className="h-3.5 w-3.5" />}
                      {item.label}
                    </a>
                  )}

                  {item.columns && activeDropdown === item.label && (
                    <>
                      <div
                        className="absolute left-0 top-full h-4 w-[640px] max-w-[calc(100vw-2rem)]"
                        aria-hidden
                      />
                      <div className="absolute left-0 top-[calc(100%+12px)] z-50 w-[640px] max-w-[calc(100vw-2rem)]">
                        <div className="origin-top overflow-hidden rounded-xl border border-crfal-gray-200 bg-white shadow-2xl animate-scale-in">
                          <div className="grid grid-cols-2 gap-8 p-6">
                            {item.columns.map((column) => (
                              <div key={column.title}>
                                <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-crfal-gray-400">
                                  {column.title}
                                </h4>
                                <ul className="space-y-1">
                                  {column.items.map((subItem) => {
                                    const Icon = subItem.icon;
                                    const content = (
                                      <>
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-crfal-blue-lighter text-crfal-blue transition-colors duration-200 group-hover:bg-crfal-blue group-hover:text-white">
                                          <Icon className="h-4.5 w-4.5" />
                                        </span>
                                        <span className="flex-1">
                                          <span className="block text-sm font-semibold text-neutral-700 transition-colors duration-200 group-hover:text-crfal-blue">
                                            {subItem.label}
                                          </span>
                                          {subItem.external && (
                                            <span className="block text-[10px] uppercase tracking-wider text-crfal-gray-400">
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
                                            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-crfal-gray-50"
                                          >
                                            {content}
                                          </Link>
                                        ) : (
                                          <a
                                            href={subItem.href}
                                            target={subItem.external ? '_blank' : undefined}
                                            rel={subItem.external ? 'noopener noreferrer' : undefined}
                                            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-crfal-gray-50"
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
              className="flex h-10 w-10 items-center justify-center rounded-lg text-white/90 transition-all hover:bg-white/10"
              aria-label="Buscar"
              aria-expanded={isSearchOpen}
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Busca — comum a desktop e mobile */}
      {isSearchOpen && (
        <div className="border-b border-crfal-gray-200 bg-white shadow-card">
          <div className="container-crfal py-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar no site..."
                className="w-full rounded-xl border border-crfal-gray-200 bg-white px-4 py-3 pr-12 text-neutral-800 shadow-card focus:border-crfal-blue focus:outline-none focus:ring-2 focus:ring-crfal-blue/20"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-crfal-gray-500 transition-colors hover:text-crfal-blue">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu mobile */}
      {isMobileMenuOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed left-0 right-0 bottom-0 top-[var(--header-offset)] z-[9999] overflow-y-auto bg-[#F8FAFC] lg:hidden"
            style={{ WebkitOverflowScrolling: 'touch' }}
            aria-modal
            role="dialog"
            aria-label="Menu de navegação"
          >
            <nav className="min-h-full pb-24">
              <div className="container-crfal py-6">
                <div className="overflow-hidden rounded-xl border border-crfal-gray-200 bg-white">
                  {navItems.map((item) => {
                    const ItemIcon = item.directIcon;
                    return (
                      <div key={item.label} className="border-b border-crfal-gray-200 last:border-0">
                        <button
                          onClick={() => item.columns && toggleMobileItem(item.label)}
                          className="flex min-h-[48px] w-full items-center justify-between px-4 py-4 text-left font-medium text-neutral-800 transition-colors hover:bg-crfal-gray-100"
                        >
                          <span className="flex items-center gap-2">
                            {ItemIcon && <ItemIcon className="h-4 w-4" />}
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
                              className={`h-5 w-5 transition-transform duration-300 ${
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
                            <div className="space-y-4 bg-crfal-gray-100/60 pb-3 pl-4 pr-4">
                              {item.columns.map((column) => (
                                <div key={column.title}>
                                  <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-crfal-gray-400">
                                    {column.title}
                                  </p>
                                  <div className="space-y-1">
                                    {column.items.map((subItem) => {
                                      const SubIcon = subItem.icon;
                                      return subItem.href.startsWith('/') ? (
                                        <Link
                                          key={subItem.label}
                                          to={subItem.href}
                                          className="flex items-center gap-3 rounded-lg py-2.5 pl-3 pr-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-200/70 hover:text-crfal-blue"
                                          onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                          <SubIcon className="h-4 w-4 shrink-0" />
                                          {subItem.label}
                                        </Link>
                                      ) : (
                                        <a
                                          key={subItem.label}
                                          href={subItem.href}
                                          target={subItem.external ? '_blank' : undefined}
                                          rel={subItem.external ? 'noopener noreferrer' : undefined}
                                          className="flex items-center gap-3 rounded-lg py-2.5 pl-3 pr-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-200/70 hover:text-crfal-blue"
                                          onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                          <SubIcon className="h-4 w-4 shrink-0" />
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
                  href={TRANSPARENCIA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Acesso à Informação — Portal da Transparência do CRF-AL"
                  className="mt-5 flex items-center justify-center rounded-xl border border-crfal-gray-200 bg-white px-4 py-3.5 transition-colors hover:bg-crfal-gray-50"
                >
                  <img
                    src="/images/logo-acesso-a-Informacao-colorido.png"
                    alt="Acesso à Informação"
                    className="h-9 w-auto object-contain"
                  />
                </a>

                <div className="mt-4 rounded-xl border border-crfal-gray-200 bg-white p-4">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-crfal-gray-400">
                    Redes sociais
                  </p>
                  {renderSocial(
                    'flex h-10 w-10 items-center justify-center rounded-lg bg-crfal-blue-lighter text-crfal-blue transition-colors hover:bg-crfal-blue hover:text-white',
                    'h-[18px] w-[18px]'
                  )}
                </div>

                <a
                  href={CRF_EM_CASA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-crfal-blue px-4 py-4 font-semibold text-white transition-colors hover:bg-crfal-blue-dark"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
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
