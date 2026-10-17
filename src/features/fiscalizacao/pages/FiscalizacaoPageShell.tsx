import { ArrowUpRight, Mail, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import SEO from '@/components/SEO';
import PageHero, { type PageHeroMetaItem } from '@/components/block/page-hero';
import { NAV_ITEMS } from '@/config/navigation';

interface FiscalizacaoPageShellProps {
  title: string;
  description?: string;
  /** Frase de apoio exibida no cabeçalho. */
  lead?: string;
  /** Dados curtos em linha no cabeçalho. */
  meta?: PageHeroMetaItem[];
  children: React.ReactNode;
}

// O menu lateral usa as mesmas páginas e rótulos do menu principal.
const quickLinks = NAV_ITEMS.find((item) => item.href === '/fiscalizacao')?.columns?.flatMap((column) => column.items) ?? [];

const SETOR_EMAIL = 'fiscalizacao@crf-al.org.br';
const SETOR_TELEFONE = '(82) 99971-0247';
const SETOR_WHATSAPP = '(82) 99999-8624';
const digits = (value: string) => value.replace(/\D/g, '');

function ContatoSetor({ className = '' }: { className?: string }) {
  return (
    <aside
      aria-labelledby="contato-fiscalizacao"
      className={`relative isolate overflow-hidden rounded-xl border-t-2 border-crfal-gold bg-gradient-to-br from-crfal-blue to-crfal-blue-dark p-6 text-white ${className}`}
    >
      <ShieldCheck aria-hidden className="pointer-events-none absolute -bottom-8 -right-6 -z-10 h-36 w-36 opacity-[0.06]" strokeWidth={1} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-crfal-gold">Fale com o setor</p>
      <h2 id="contato-fiscalizacao" className="mt-1 text-lg font-bold">Departamento de Fiscalização</h2>
      <p className="mt-1 text-sm leading-relaxed text-white/75">
        Comunicações formais, envio de documentos e dúvidas sobre autos, defesas e afastamentos.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <a
          href={`mailto:${SETOR_EMAIL}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-crfal-blue transition-colors hover:bg-crfal-blue-lighter focus-visible:outline-white"
        >
          <Mail className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">{SETOR_EMAIL}</span>
        </a>
        <a
          href={`https://wa.me/55${digits(SETOR_WHATSAPP)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10 focus-visible:outline-white"
        >
          <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
          WhatsApp <span className="tabular-nums text-white/75">{SETOR_WHATSAPP}</span>
          <span className="sr-only">(abre em uma nova aba)</span>
        </a>
      </div>
      <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/75">
        <a href={`tel:+55${digits(SETOR_TELEFONE)}`} className="inline-flex items-center gap-1.5 tabular-nums hover:text-white hover:underline">
          <Phone className="h-3.5 w-3.5" aria-hidden />
          {SETOR_TELEFONE}
        </a>
        <Link to="/contato#setor-fiscalizacao" className="hover:text-white hover:underline">
          Todos os contatos
        </Link>
      </p>
    </aside>
  );
}

export default function FiscalizacaoPageShell({ title, description, lead, meta, children }: FiscalizacaoPageShellProps) {
  const location = useLocation();
  const isOverview = location.pathname === '/fiscalizacao';

  return (
    <>
      {description && (
        <SEO title={title} description={description} path={location.pathname} />
      )}

      <PageHero
        breadcrumb={isOverview ? [{ label: 'Início', href: '/' }, { label: 'Fiscalização' }] : [{ label: 'Início', href: '/' }, { label: 'Fiscalização', href: '/fiscalizacao' }, { label: title }]}
        title={title}
        section="fiscalizacao"
        lead={lead}
        meta={meta}
      />

      <div className="pb-8 md:pb-12">
        <div className="container-crfal py-6 md:py-10">
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="space-y-6 lg:col-span-8">
              <article className="rounded-xl border border-crfal-gray-200 bg-white p-5 shadow-sm md:p-8 lg:p-10 [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:border-t [&>h2]:border-crfal-gray-200 [&>h2]:pt-8 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:tracking-tight [&>h2]:text-crfal-blue [&>h2]:after:mt-2.5 [&>h2]:after:block [&>h2]:after:h-0.5 [&>h2]:after:w-10 [&>h2]:after:rounded-full [&>h2]:after:bg-crfal-gold [&>h2]:after:content-[''] [&>h2]:md:text-2xl [&>h2:first-of-type]:mt-0 [&>h2:first-of-type]:border-0 [&>h2:first-of-type]:pt-0 [&>p]:mb-4 [&>p]:leading-7 [&>p]:text-neutral-700 [&>p]:md:leading-8 [&>p:last-child]:mb-0 [&>ul]:mb-4 [&>ul]:space-y-2 [&>ul]:pl-5 [&>ul]:text-neutral-700 [&>li]:leading-7">
                {children}
              </article>

              {/* No desktop o contato fica na lateral. */}
              <ContatoSetor className="lg:hidden" />
            </div>

            <aside className="hidden lg:col-span-4 lg:block">
              <div className="sticky top-[calc(var(--header-offset)+1.5rem)] space-y-5">
                <nav aria-labelledby="menu-fiscalizacao" className="rounded-xl border border-crfal-gray-200 bg-white p-5 shadow-sm">
                  <h2 id="menu-fiscalizacao" className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]">
                    Menu da Fiscalização
                  </h2>
                  <ul className="space-y-0.5">
                    {quickLinks.map((item) => {
                      const isActive = !item.external && location.pathname === item.href;
                      const linkClass = `relative flex items-center justify-between gap-3 rounded-lg px-3.5 py-2.5 text-sm transition-colors ${
                        isActive
                          ? 'bg-crfal-blue-lighter font-semibold text-crfal-blue before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-crfal-gold'
                          : 'font-medium text-neutral-700 hover:bg-crfal-gray-100 hover:text-crfal-blue'
                      }`;

                      return (
                        <li key={item.href}>
                          {item.external ? (
                            <a href={item.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                              {item.label}
                              <ArrowUpRight className="h-4 w-4 shrink-0 text-crfal-gray-400" aria-hidden />
                              <span className="sr-only">(abre em uma nova aba)</span>
                            </a>
                          ) : (
                            <Link to={item.href} className={linkClass} aria-current={isActive ? 'page' : undefined}>
                              {item.label}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <ContatoSetor />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
