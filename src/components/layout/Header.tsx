import { useState, useEffect, useRef, type MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
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
  Images,
  Search,
} from 'lucide-react';
import MobileHeaderSearch from '@/components/layout/MobileHeaderSearch';
import MobileNavigation from '@/components/layout/MobileNavigation';
import { serviceProfiles } from '@/config/service-profiles';
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
          { label: 'Transparência', href: 'https://crf-al.implanta.net.br/portaltransparencia/', icon: BarChart3, external: true },
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
          { label: 'Custos da Fiscalização', href: 'https://crf-al.implanta.net.br/portaltransparencia/', icon: Scale, external: true },
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
          { label: 'Galeria de Fotos', href: '/imprensa/galeria-de-fotos', icon: Images },
          { label: 'Eventos', href: '/eventos', icon: Calendar },
        ],
      },
    ],
  },
  {
    label: 'Transparência',
    href: 'https://crf-al.implanta.net.br/portaltransparencia/',
    directIcon: ExternalLink,
  },
  {
    label: 'Fale Conosco',
    href: '/contato',
  },
];

const searchItems = navItems
  .flatMap(item => item.columns ? item.columns.flatMap(column => column.items) : [{ label: item.label, href: item.href }])
  .filter((item, index, items) => items.findIndex(candidate => candidate.label === item.label && candidate.href === item.href) === index);

export default function Header() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

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

  const isExternalLink = (href: string) => href.startsWith('http');

  const navLinkBase =
    'flex items-center gap-1.5 rounded-md px-3 py-2 text-[15px] font-medium tracking-[0.02em] transition-all duration-200';

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
      <div className="hidden bg-[#003366] lg:block">
        <div className="container-crfal">
          <div className="relative flex h-14 items-center justify-center">
            <nav className="flex items-center">
              {navItems.map((item, index) => (
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
                        className={`absolute top-full h-4 w-[640px] max-w-[calc(100vw-2rem)] ${
                          index === 0 ? 'left-0' : 'left-1/2 -translate-x-1/2'
                        }`}
                        aria-hidden
                      />
                      <div
                        className={`absolute top-[calc(100%+12px)] z-50 w-[640px] max-w-[calc(100vw-2rem)] ${
                          index === 0 ? 'left-0' : 'left-1/2 -translate-x-1/2'
                        }`}
                      >
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
          </div>
        </div>
      </div>

      <MobileNavigation open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen} triggerRef={menuButtonRef} items={navItems} socialLinks={renderSocial(
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
