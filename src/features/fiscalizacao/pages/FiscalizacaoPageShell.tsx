import { useState } from 'react';
import { ExternalLink, ShieldCheck, ChevronDown, Mail, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import SEO from '@/components/SEO';

interface FiscalizacaoPageShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const quickLinks = [
  { label: 'Visão Geral', href: '/fiscalizacao' },
  { label: 'Papel da Fiscalização', href: '/fiscalizacao/papel-da-fiscalizacao' },
  { label: 'Instrumentos', href: '/fiscalizacao/instrumentos-da-fiscalizacao' },
  { label: 'Plano Anual', href: '/fiscalizacao/plano-de-fiscalizacao-anual' },
  { label: 'Relatórios', href: '/fiscalizacao/relatorios' },
  { label: 'Processo Administrativo', href: '/fiscalizacao/processo-administrativo-fiscal' },
  { label: 'Afastamento Provisório', href: '/fiscalizacao/afastamento-provisorio' },
  { label: 'Legislação', href: '/legislacao' },
  { label: 'Custos da fiscalização', href: 'https://crf-al.implanta.net.br/portalTransparencia/#publico/inicio', external: true },
];

export default function FiscalizacaoPageShell({ title, description, children }: FiscalizacaoPageShellProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {description && (
        <SEO title={title} description={description} path={location.pathname} />
      )}

      <div className="relative overflow-hidden bg-crfal-blue-dark pb-14 pt-24 md:pb-18 md:pt-32">
        <div className="absolute inset-0 bg-gradient-to-br from-crfal-blue-dark via-crfal-blue/90 to-crfal-blue-dark" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
          aria-hidden
        />

        <div className="container-crfal relative z-10">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-white/60 sm:text-sm" aria-label="Breadcrumb">
            <a href="/" className="transition-colors hover:text-white">Início</a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">Fiscalização</span>
          </nav>

          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            Fiscalização
          </span>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.3)] sm:text-4xl md:text-5xl">
            {title}
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/80 sm:text-lg">
            Conteúdo institucional da fiscalização farmacêutica no CRFAL com foco em clareza de procedimentos, atribuições legais e orientação aos profissionais e estabelecimentos.
          </p>
        </div>
      </div>

      <div className="bg-neutral-50 pb-16 dark:bg-slate-950 md:pb-24">
        <div className="container-crfal py-8 md:py-10">
          <div className="lg:hidden mb-8">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-5 py-3.5 text-sm font-semibold text-neutral-800 shadow-sm transition-colors hover:bg-neutral-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
              aria-expanded={mobileMenuOpen}
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-crfal-blue dark:text-crfal-blue-light" />
                Navegação da Fiscalização
              </span>
              <ChevronDown className={`h-5 w-5 text-neutral-400 transition-transform duration-300 ${mobileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'mt-3 max-h-[600px] opacity-100' : 'max-h-0 mt-0 opacity-0'}`}>
              <div className="grid grid-cols-1 gap-1.5 rounded-xl border border-neutral-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-2">
                {quickLinks.map((item) => {
                  const isExternal = !item.href.startsWith('/');
                  const isActive = !isExternal && location.pathname === item.href;
                  const linkClass = `flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-crfal-blue text-white'
                      : 'text-neutral-700 hover:bg-neutral-100 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`;

                  if (isExternal) {
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                        <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                      </a>
                    );
                  }
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      className={linkClass}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                      {isActive && <span className="text-xs opacity-70">→</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            <article className="lg:col-span-8 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8 lg:p-10 [&>h2]:mt-10 [&>h2]:mb-3 [&>h2]:border-t [&>h2]:border-neutral-200 [&>h2]:pt-6 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-neutral-900 [&>h2]:dark:border-slate-800 [&>h2]:dark:text-white [&>h2]:md:text-2xl [&>h2:first-of-type]:mt-0 [&>h2:first-of-type]:border-0 [&>h2:first-of-type]:pt-0 [&>p]:mb-4 [&>p]:leading-8 [&>p]:text-neutral-700 [&>p]:dark:text-slate-200 [&>p:last-child]:mb-0 [&>ul]:mb-4 [&>ul]:space-y-2 [&>ul]:pl-5 [&>ul]:text-neutral-700 [&>ul]:dark:text-slate-200 [&>li]:leading-7">
              {children}
            </article>

            <aside className="hidden lg:col-span-4 lg:block">
              <div className="sticky top-28 space-y-5">
                <nav className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
                    Menu da Fiscalização
                  </h2>
                  <div className="space-y-1.5">
                    {quickLinks.map((item) => {
                      const isExternal = !item.href.startsWith('/');
                      const isActive = !isExternal && location.pathname === item.href;
                      const linkClass = `flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-crfal-blue text-white shadow-sm'
                          : 'text-neutral-700 hover:bg-neutral-100 dark:text-slate-200 dark:hover:bg-slate-800'
                      }`;

                      if (isExternal) {
                        return (
                          <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                            {item.label}
                            <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                          </a>
                        );
                      }
                      return (
                        <Link key={item.label} to={item.href} className={linkClass}>
                          {item.label}
                          {isActive && <span className="text-xs opacity-70">→</span>}
                        </Link>
                      );
                    })}
                  </div>
                </nav>

                <div className="rounded-xl border border-crfal-blue/20 bg-gradient-to-br from-crfal-blue/8 to-white p-5 dark:border-crfal-blue/30 dark:from-crfal-blue/10 dark:to-slate-900">
                  <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
                    Contato
                  </h3>
                  <p className="mb-4 text-sm leading-relaxed text-neutral-600 dark:text-slate-300">
                    Para comunicações formais e envio de documentos, utilize o e-mail oficial do setor.
                  </p>
                  <a
                    href="mailto:fiscalizacao@crf-al.org.br"
                    className="inline-flex items-center gap-2 rounded-lg bg-crfal-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-crfal-blue-dark"
                  >
                    <Mail className="h-4 w-4" />
                    fiscalizacao@crf-al.org.br
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
