import { ExternalLink, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import SEO from '@/components/SEO';

interface FiscalizacaoPageShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const quickLinks = [
  { label: 'Visão Geral', href: '/fiscalizacao' },
  { label: 'Custos da fiscalização', href: 'https://crf-al.implanta.net.br/portalTransparencia/#publico/inicio', external: true },
  { label: 'Papel da Fiscalização', href: '/fiscalizacao/papel-da-fiscalizacao' },
  { label: 'Instrumentos de fiscalização', href: '/fiscalizacao/instrumentos-da-fiscalizacao' },
  { label: 'Plano de fiscalização anual', href: '/fiscalizacao/plano-de-fiscalizacao-anual' },
  { label: 'Relatórios', href: '/fiscalizacao/relatorios' },
  { label: 'Processo Administrativo Fiscal', href: '/fiscalizacao/processo-administrativo-fiscal' },
  { label: 'Afastamento Provisório', href: '/fiscalizacao/afastamento-provisorio' },
  { label: 'Legislação', href: '/legislacao' },
];

export default function FiscalizacaoPageShell({ title, description, children }: FiscalizacaoPageShellProps) {
  const location = useLocation();

  return (
    <>
      {description && (
        <SEO title={title} description={description} path={location.pathname} />
      )}
    <section className="relative pt-24 pb-16 bg-neutral-50 dark:bg-slate-950 min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[440px] w-[880px] rounded-full bg-[radial-gradient(circle,_rgba(0,74,128,0.16)_0%,_rgba(0,74,128,0)_65%)] dark:bg-[radial-gradient(circle,_rgba(59,142,217,0.22)_0%,_rgba(59,142,217,0)_65%)]" />
      </div>

      <div className="container-crfal relative z-10 space-y-8">
        <header className="space-y-4 rounded-3xl border border-crfal-blue/15 dark:border-crfal-blue/25 bg-white/80 dark:bg-slate-900/85 backdrop-blur-sm p-6 md:p-8 shadow-sm">
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crfal-blue/10 text-xs font-semibold tracking-[0.16em] uppercase text-crfal-blue">
            <ShieldCheck className="w-4 h-4" />
            Fiscalização
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white">{title}</h1>
          <p className="max-w-3xl text-neutral-600 dark:text-slate-300 text-[1.02rem]">
            Conteúdo institucional da fiscalização farmacêutica no CRF-AL com foco em clareza de procedimentos,
            atribuições legais e orientação aos profissionais e estabelecimentos.
          </p>
        </header>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <article className="order-2 lg:order-1 lg:col-span-8 rounded-3xl border border-neutral-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 lg:p-10 text-neutral-700 dark:text-slate-200 leading-relaxed shadow-sm space-y-6 [&>h2]:text-2xl [&>h2]:md:text-[1.95rem] [&>h2]:font-bold [&>h2]:text-neutral-900 [&>h2]:dark:text-white [&>h2]:pt-3 [&>h2]:border-t [&>h2]:border-neutral-200 [&>h2]:dark:border-slate-800 [&>h2:first-child]:pt-0 [&>h2:first-child]:border-0 [&>p]:text-[1.04rem] [&>p]:leading-8 [&>ul]:space-y-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:text-[1.02rem] [&>ol]:space-y-2 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:text-[1.02rem]">
            {children}
          </article>

          <aside className="order-1 lg:order-2 lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-neutral-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Menu da Fiscalização</h2>
              <div className="space-y-2">
                {quickLinks.map((item) => {
                  const isExternal = !item.href.startsWith('/');
                  const isActive = !isExternal && location.pathname === item.href;
                  const baseClass =
                    'flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all';
                  const activeClass = isActive
                    ? 'border-crfal-blue bg-crfal-blue text-white dark:!text-white'
                    : 'border-neutral-200 dark:border-slate-700 text-neutral-700 dark:text-slate-200 hover:border-crfal-blue/40 hover:bg-crfal-blue/5';

                  if (isExternal) {
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${baseClass} ${activeClass}`}
                      >
                        <span>{item.label}</span>
                        <ExternalLink className="w-4 h-4 opacity-75" />
                      </a>
                    );
                  }

                  return (
                    <Link key={item.label} to={item.href} className={`${baseClass} ${activeClass}`}>
                      <span>{item.label}</span>
                      <span className="text-xs opacity-70">→</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-crfal-blue/20 dark:border-crfal-blue/30 bg-gradient-to-br from-crfal-blue/10 to-white dark:from-crfal-blue/15 dark:to-slate-900 p-5">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Contato da Fiscalização</h3>
              <p className="text-sm text-neutral-600 dark:text-slate-300 mb-4">
                Para comunicações formais e envio de documentos, utilize o e-mail oficial do setor.
              </p>
              <a
                href="mailto:fiscalizacao@crf-al.org.br"
                className="inline-flex rounded-lg bg-crfal-blue px-4 py-2 text-sm font-semibold text-white hover:bg-crfal-blue-dark transition-colors"
              >
                fiscalizacao@crf-al.org.br
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
    </>
  );
}
