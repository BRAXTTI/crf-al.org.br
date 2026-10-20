import { ATENDIMENTO, LOCAIS, SETOR_CONTATOS, HORARIO_ATENDIMENTO } from '@/config/contact';
import { useEffect, useState, type ElementType, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  ClipboardList,
  Copy,
  CreditCard,
  FileText,
  HeadphonesIcon,
  Landmark,
  Laptop,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import SEO from '@/components/SEO';
import PageHero, { PageHeroAction } from '@/components/block/page-hero';
import { useStatusAtendimento } from '@/lib/maceio';
import { BOLETOS_URL } from '@/config/site';

/* -------------------------------------------------------------------------- */
/* Dados                                                                       */
/* -------------------------------------------------------------------------- */

interface ContactInfo {
  id: string;
  setor: string;
  icon: ElementType;
  /** Pessoa responsável (exibida apenas na Diretoria). */
  responsavel?: string;
  /** Uma linha sobre o que o setor resolve. */
  assunto?: string;
  email: string;
  telefone?: string;
  whatsapp?: string;
  link?: string;
  linkLabel?: string;
}

const DIRETORIA: ContactInfo[] = [
  { id: 'presidencia', setor: 'Presidência', icon: Landmark, responsavel: 'João Batista dos Santos Neto', email: 'presidente@crf-al.org.br', telefone: '(82) 99603-9110' },
  { id: 'vice-presidencia', setor: 'Vice-Presidência', icon: BadgeCheck, responsavel: 'Lyvia Quintela Cavalcante Trajano', email: 'vicepresidente@crf-al.org.br' },
  { id: 'secretaria-geral', setor: 'Secretaria-Geral', icon: ClipboardList, responsavel: 'Ana Renata de Almeida Lima', email: 'secretaria@crf-al.org.br', telefone: '(82) 99971-0247' },
  { id: 'tesouraria', setor: 'Tesouraria', icon: Wallet, responsavel: 'Isadora Lyra Cavalcanti', email: 'tesouraria@crf-al.org.br' },
];

const SETORES: ContactInfo[] = [
  { id: 'fiscalizacao', setor: 'Fiscalização', icon: ShieldCheck, assunto: 'Fiscalizações, autos, defesas e afastamento provisório', ...SETOR_CONTATOS.fiscalizacao },
  { id: 'secretaria', setor: 'Secretaria', icon: FileText, assunto: 'Inscrições, registros, certidões e documentos', email: 'secretaria@crf-al.org.br', telefone: '(82) 98181-9050', whatsapp: '(82) 98181-9050' },
  { id: 'ti', setor: 'Tecnologia da Informação', icon: Laptop, assunto: 'Acesso e dúvidas sobre o CRF AL em Casa', ...SETOR_CONTATOS.tecnologia },
  { id: 'comunicacao', setor: 'Comunicação', icon: Megaphone, assunto: 'Imprensa, entrevistas e divulgação', email: 'ascom@crf-al.org.br' },
  { id: 'ouvidoria', setor: 'Ouvidoria', icon: HeadphonesIcon, assunto: 'Reclamações, sugestões, elogios e denúncias', email: SETOR_CONTATOS.ouvidoria.email, link: '/servicos/ouvidoria', linkLabel: 'Portal da Ouvidoria' },
];

const ATALHOS: { necessidade: string; destino: string; href: string; icon: ElementType }[] = [
  { necessidade: 'Certidões e requerimentos', destino: 'Central de Requerimentos', href: '/servicos/requerimentos', icon: FileText },
  { necessidade: 'Boletos e anuidade', destino: 'Boletos no CRF AL em Casa', href: BOLETOS_URL, icon: CreditCard },
  { necessidade: 'Denúncia, reclamação ou elogio', destino: 'Ouvidoria', href: '/servicos/ouvidoria', icon: HeadphonesIcon },
  { necessidade: 'Fiscalização e afastamento', destino: 'Setor de Fiscalização', href: '#setor-fiscalizacao', icon: ShieldCheck },
  { necessidade: 'Problemas no CRF AL em Casa', destino: 'Suporte de TI', href: '#setor-ti', icon: Laptop },
  { necessidade: 'Imprensa e entrevistas', destino: 'Comunicação', href: '#setor-comunicacao', icon: Megaphone },
];

/* -------------------------------------------------------------------------- */
/* Utilitários                                                                 */
/* -------------------------------------------------------------------------- */

const digits = (numero: string) => numero.replace(/\D/g, '');
const waLink = (numero: string) => `https://wa.me/55${digits(numero)}`;
const telLink = (numero: string) => `tel:+55${digits(numero)}`;
const mapsLink = (busca: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(busca)}`;
const wazeLink = (busca: string) => `https://waze.com/ul?q=${encodeURIComponent(busca)}&navigate=yes`;

const goldLabel = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]';
const focusRing = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2';
const motion = 'transition duration-200 motion-reduce:transition-none';

function CopyButton({ value, label, className = '' }: { value: string; label: string; className?: string }) {
  const [copiado, setCopiado] = useState(false);
  useEffect(() => {
    if (!copiado) return;
    const t = window.setTimeout(() => setCopiado(false), 2000);
    return () => window.clearTimeout(t);
  }, [copiado]);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopiado(true);
        } catch {
          window.prompt(label, value);
        }
      }}
      aria-label={copiado ? 'Copiado' : label}
      title={copiado ? 'Copiado' : label}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-crfal-gray-600 hover:bg-crfal-gray-100 hover:text-crfal-blue ${motion} ${focusRing} ${className}`}
    >
      {copiado ? <Check className="h-4 w-4 text-[#8A6A12]" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
      <span className="sr-only" aria-live="polite">{copiado ? 'Copiado' : ''}</span>
    </button>
  );
}

function SmartLink({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  if (href.startsWith('/')) return <Link to={href} className={className}>{children}</Link>;
  const external = href.startsWith('http');
  return (
    <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className={className}>
      {children}
      {external && <span className="sr-only">(abre em uma nova aba)</span>}
    </a>
  );
}

function SectionTitle({ label, title, text, id }: { label: string; title: string; text?: string; id: string }) {
  return (
    <div className="mb-5 md:mb-6">
      <p className={goldLabel}>{label}</p>
      <h2 id={id} className="mt-1.5 text-[22px] font-bold leading-tight tracking-tight text-crfal-blue sm:text-[26px]">{title}</h2>
      <span aria-hidden className="mt-2.5 block h-0.5 w-10 rounded-full bg-crfal-gold" />
      {text && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-crfal-gray-600">{text}</p>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Página                                                                      */
/* -------------------------------------------------------------------------- */

export default function ContactPage() {
  const status = useStatusAtendimento();

  return (
    <div className="min-h-screen">
      <SEO
        title="Contato"
        description="Entre em contato com o CRFAL — Conselho Regional de Farmácia do Estado de Alagoas. Fale com nossos setores por e-mail, telefone ou WhatsApp."
        path="/contato"
      />

      <PageHero
        breadcrumb={[{ label: 'Início', href: '/' }, { label: 'Fale Conosco' }]}
        title="Fale Conosco"
        eyebrow="Atendimento"
        lead={`Fale com o setor certo por telefone, e-mail ou WhatsApp. ${HORARIO_ATENDIMENTO}.`}
        actions={<PageHeroAction href={waLink(ATENDIMENTO.whatsapp)}>WhatsApp do atendimento</PageHeroAction>}
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[13px] font-medium text-white/90">
          <span aria-hidden className={`relative flex h-2 w-2 ${status.aberto ? '' : 'opacity-70'}`}>
            {status.aberto && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />}
            <span className={`relative inline-flex h-2 w-2 rounded-full ${status.aberto ? 'bg-emerald-400' : 'bg-white/50'}`} />
          </span>
          {status.texto}
        </p>
      </PageHero>

      <div className="container-crfal space-y-12 py-10 md:space-y-16 md:py-14">
        {/* Canais de atendimento */}
        <section aria-labelledby="canais-title">
          <SectionTitle id="canais-title" label="Atendimento geral" title="Canais de atendimento" text="Para dúvidas gerais, comece por aqui. Seg. a sex., das 9h às 17h." />
          <div className="grid gap-4 md:grid-cols-3">
            <a href={waLink(ATENDIMENTO.whatsapp)} target="_blank" rel="noopener noreferrer" className={`group relative isolate flex flex-col overflow-hidden rounded-xl border-t-2 border-crfal-gold bg-linear-to-br/srgb from-crfal-blue to-crfal-blue-dark p-6 text-white shadow-lg shadow-crfal-blue/10 hover:-translate-y-0.5 hover:shadow-xl motion-reduce:hover:translate-y-0 ${motion} ${focusRing}`}>
              <MessageCircle aria-hidden className="pointer-events-none absolute -bottom-6 -right-6 -z-10 h-32 w-32 opacity-[0.07]" strokeWidth={1} />
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 ring-1 ring-crfal-gold/40"><MessageCircle className="h-5 w-5" aria-hidden /></span>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-crfal-gold">Mais rápido</p>
              <p className="mt-1 text-lg font-bold">WhatsApp</p>
              <p className="mt-1 text-[15px] tabular-nums text-white/80">{ATENDIMENTO.whatsapp}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">
                Iniciar conversa
                <ArrowUpRight className={`h-4 w-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${motion}`} aria-hidden />
              </span>
              <span className="sr-only">(abre em uma nova aba)</span>
            </a>

            <div className="flex flex-col rounded-xl border border-crfal-gray-200 bg-white p-6 shadow-xs">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-crfal-blue-lighter text-crfal-blue ring-1 ring-crfal-blue/10"><Phone className="h-5 w-5" aria-hidden /></span>
              <p className={`mt-4 ${goldLabel}`}>Ligação</p>
              <p className="mt-1 text-lg font-bold text-crfal-blue-dark">Telefone</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="text-[15px] tabular-nums text-crfal-gray-700">{ATENDIMENTO.telefone}</span>
                <CopyButton value={ATENDIMENTO.telefone} label="Copiar telefone" />
              </div>
              <a href={telLink(ATENDIMENTO.telefone)} className={`group mt-auto inline-flex items-center gap-2 pt-4 text-sm font-bold text-crfal-blue ${focusRing} rounded`}>
                Ligar agora <ArrowRight className={`h-4 w-4 group-hover:translate-x-1 ${motion}`} aria-hidden />
              </a>
            </div>

            <div className="flex flex-col rounded-xl border border-crfal-gray-200 bg-white p-6 shadow-xs">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-crfal-blue-lighter text-crfal-blue ring-1 ring-crfal-blue/10"><Mail className="h-5 w-5" aria-hidden /></span>
              <p className={`mt-4 ${goldLabel}`}>Mensagem</p>
              <p className="mt-1 text-lg font-bold text-crfal-blue-dark">E-mail</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="min-w-0 break-all text-[15px] text-crfal-gray-700">{ATENDIMENTO.email}</span>
                <CopyButton value={ATENDIMENTO.email} label="Copiar e-mail" />
              </div>
              <a href={`mailto:${ATENDIMENTO.email}`} className={`group mt-auto inline-flex items-center gap-2 pt-4 text-sm font-bold text-crfal-blue ${focusRing} rounded`}>
                Escrever e-mail <ArrowRight className={`h-4 w-4 group-hover:translate-x-1 ${motion}`} aria-hidden />
              </a>
            </div>
          </div>
        </section>

        {/* Qual setor procurar */}
        <section aria-labelledby="atalhos-title">
          <SectionTitle id="atalhos-title" label="Antes de entrar em contato" title="Qual setor procurar?" text="Muitas demandas se resolvem online. Escolha o assunto e vá direto ao lugar certo." />
          <ul className="grid gap-px overflow-hidden rounded-xl border border-crfal-gray-200 bg-crfal-gray-200 shadow-xs sm:grid-cols-2 lg:grid-cols-3">
            {ATALHOS.map((atalho) => {
              const Icon = atalho.icon;
              const external = atalho.href.startsWith('http');
              return (
                <li key={atalho.necessidade} className="bg-white">
                  <SmartLink href={atalho.href} className={`group flex h-full items-center gap-4 p-4 hover:bg-crfal-blue-lighter/50 sm:p-5 ${motion} focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-crfal-blue`}>
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-crfal-blue-lighter text-crfal-blue ring-1 ring-crfal-blue/10 group-hover:bg-crfal-blue group-hover:text-white group-hover:ring-crfal-gold/50 ${motion}`}>
                      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-bold leading-snug text-crfal-blue-dark group-hover:text-crfal-blue">{atalho.necessidade}</span>
                      <span className="mt-0.5 block text-[13px] text-crfal-gray-600">{atalho.destino}</span>
                    </span>
                    {external ? (
                      <ArrowUpRight className="h-5 w-5 shrink-0 text-crfal-gray-400 group-hover:text-[#8A6A12]" aria-hidden />
                    ) : (
                      <ArrowRight className={`h-5 w-5 shrink-0 text-crfal-gray-400 group-hover:translate-x-1 group-hover:text-[#8A6A12] ${motion}`} aria-hidden />
                    )}
                  </SmartLink>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Contatos por setor */}
        <section aria-labelledby="setores-title">
          <SectionTitle id="setores-title" label="Contatos diretos" title="Setores e Diretoria" text="Fale diretamente com quem cuida do seu assunto." />
          <div className="grid gap-8 lg:grid-cols-2">
            <ContactGroup title="Setores" items={SETORES} />
            <ContactGroup title="Diretoria" items={DIRETORIA} />
          </div>
        </section>

        {/* Onde estamos */}
        <section aria-labelledby="locais-title">
          <SectionTitle id="locais-title" label="Atendimento presencial" title="Onde estamos" text="Seg. a sex., das 9h às 17h, sem pausa para o almoço." />
          <div className="grid gap-4 md:grid-cols-2">
            {LOCAIS.map((local) => (
              <article key={local.id} className="flex flex-col rounded-xl border border-crfal-gray-200 bg-white p-6 shadow-xs">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-crfal-blue-lighter text-crfal-blue ring-1 ring-crfal-blue/10"><MapPin className="h-5 w-5" aria-hidden /></span>
                  <div className="min-w-0 flex-1">
                    <p className={goldLabel}>{local.nome}</p>
                    <h3 className="mt-0.5 text-lg font-bold text-crfal-blue-dark">{local.cidade}</h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-crfal-gray-700">{local.endereco}</p>
                  </div>
                  <CopyButton value={local.endereco} label={`Copiar endereço de ${local.cidade}`} className="-mr-2 -mt-2" />
                </div>
                <div className="mt-5 flex flex-wrap gap-2 sm:pl-[60px]">
                  <a href={mapsLink(local.busca)} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-crfal-blue px-4 text-sm font-semibold text-white hover:bg-crfal-blue-dark ${motion} ${focusRing}`}>
                    <MapPin className="h-4 w-4" aria-hidden /> Google Maps
                    <span className="sr-only">(abre em uma nova aba)</span>
                  </a>
                  <a href={wazeLink(local.busca)} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-crfal-gray-300 px-4 text-sm font-semibold text-crfal-blue hover:border-crfal-blue ${motion} ${focusRing}`}>
                    <Navigation className="h-4 w-4" aria-hidden /> Waze
                    <span className="sr-only">(abre em uma nova aba)</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Fechamento: Ouvidoria */}
        <aside className="relative isolate flex flex-col items-start gap-5 overflow-hidden rounded-xl border-t-2 border-crfal-gold bg-linear-to-br/srgb from-crfal-blue to-crfal-blue-dark p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <HeadphonesIcon aria-hidden className="pointer-events-none absolute -bottom-8 -right-6 -z-10 h-40 w-40 opacity-[0.06]" strokeWidth={1} />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-crfal-gold">Não resolveu?</p>
            <p className="mt-1 text-lg font-bold">Registre uma manifestação na Ouvidoria.</p>
            <p className="mt-1 max-w-xl text-sm text-white/75">Reclamações, sugestões, elogios e denúncias recebem resposta em até 30 dias.</p>
          </div>
          <Link to="/servicos/ouvidoria" className="group inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-bold transition-colors hover:border-white hover:bg-white hover:text-crfal-blue focus-visible:outline-white">
            Ir para a Ouvidoria <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
          </Link>
        </aside>
      </div>
    </div>
  );
}

function ContactGroup({ title, items }: { title: string; items: ContactInfo[] }) {
  return (
    <div>
      <p className={`mb-3 flex items-center gap-2 ${goldLabel}`}>
        {title}
        <span aria-hidden className="h-px flex-1 bg-crfal-gray-200" />
      </p>
      <ul className="divide-y divide-crfal-gray-100 overflow-hidden rounded-xl border border-crfal-gray-200 bg-white shadow-xs">
        {items.map((c) => {
          const Icon = c.icon;
          const actionClass = `inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold ${motion} ${focusRing}`;
          return (
            <li key={c.id} id={`setor-${c.id}`} className="scroll-mt-[calc(var(--header-offset)+1.5rem)] p-4 data-alvo:bg-crfal-blue-lighter/40 sm:p-5">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-crfal-blue-lighter text-crfal-blue ring-1 ring-crfal-blue/10">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold leading-snug text-crfal-blue-dark">{c.setor}</h3>
                  {(c.responsavel || c.assunto) && <p className="mt-0.5 text-[13px] leading-snug text-crfal-gray-600">{c.responsavel ?? c.assunto}</p>}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-crfal-gray-700">
                    <span className="inline-flex min-w-0 items-center gap-1.5"><Mail className="h-3.5 w-3.5 shrink-0 text-crfal-gray-400" aria-hidden /><span className="break-all">{c.email}</span></span>
                    {c.telefone && <span className="inline-flex items-center gap-1.5 tabular-nums"><Phone className="h-3.5 w-3.5 text-crfal-gray-400" aria-hidden />{c.telefone}</span>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {c.link && (
                      <Link to={c.link} className={`${actionClass} border-crfal-blue bg-crfal-blue text-white hover:bg-crfal-blue-dark`}>
                        {c.linkLabel} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    )}
                    <a href={`mailto:${c.email}`} aria-label={`Enviar e-mail para ${c.setor}`} className={`${actionClass} border-crfal-gray-200 text-crfal-blue hover:border-crfal-blue`}>
                      <Mail className="h-4 w-4" aria-hidden /><span className="hidden sm:inline">E-mail</span>
                    </a>
                    <CopyButton value={c.email} label={`Copiar e-mail de ${c.setor}`} className="border border-crfal-gray-200" />
                    {c.telefone && (
                      <a href={telLink(c.telefone)} aria-label={`Ligar para ${c.setor}`} className={`${actionClass} border-crfal-gray-200 text-crfal-blue hover:border-crfal-blue`}>
                        <Phone className="h-4 w-4" aria-hidden /><span className="hidden sm:inline">Ligar</span>
                      </a>
                    )}
                    {c.whatsapp && (
                      <a href={waLink(c.whatsapp)} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp de ${c.setor} (abre em uma nova aba)`} className={`${actionClass} border-emerald-600/30 bg-emerald-50 text-emerald-700 hover:border-emerald-600 hover:bg-emerald-600 hover:text-white`}>
                        <MessageCircle className="h-4 w-4" aria-hidden /><span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
