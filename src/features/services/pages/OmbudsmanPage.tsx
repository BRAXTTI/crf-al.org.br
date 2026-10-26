import { ESIC_URL } from '@/config/site';
import { SETOR_CONTATOS } from '@/config/contact';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import PageHero, { PageHeroAction } from '@/components/block/page-hero';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ClipboardList,
  Copy,
  FileSearch,
  FileText,
  Hash,
  Info,
  Lightbulb,
  Lock,
  MessageSquare,
  MessagesSquare,
  Phone,
  Send,
  ThumbsUp,
  UserCheck,
  Eye,
  Clock,
} from 'lucide-react';

const OUVIDORIA_URL = 'https://crf-al.implanta.net.br/portaltransparencia/#ouv/home';
const OUVIDORIA_EMAIL = SETOR_CONTATOS.ouvidoria.email;
const OUVIDORIA_TELEFONE = SETOR_CONTATOS.ouvidoria.telefone;

const goldLabel = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]';
const focusRing = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2';
const motion = 'transition duration-200 motion-reduce:transition-none';

const manifestationTypes = [
  { id: 'reclamacao', label: 'Reclamação', icon: MessageSquare, when: 'Insatisfação com um atendimento, a conduta de um agente ou um procedimento do CRF-AL.' },
  { id: 'elogio', label: 'Elogio', icon: ThumbsUp, when: 'Reconhecer um bom atendimento ou serviço. Também ajuda a avaliar e melhorar.' },
  { id: 'sugestao', label: 'Sugestão', icon: Lightbulb, when: 'Propor uma melhoria nos serviços. Avaliamos a viabilidade técnica e econômica.' },
  { id: 'solicitacao', label: 'Solicitação', icon: FileText, when: 'Pedir uma providência que não foi resolvida pelo setor responsável.', badge: 'Procure o setor antes' },
  { id: 'denuncia', label: 'Denúncia', icon: AlertTriangle, when: 'Comunicar irregularidade ou ato ilícito ligado às atribuições do CRF-AL, com as informações mínimas para apuração.', badge: 'Pode ser anônima' },
];

const steps = [
  { icon: ClipboardList, title: 'Escolha o tipo', text: 'Reclamação, elogio, sugestão, solicitação ou denúncia.' },
  { icon: Send, title: 'Registre no portal', text: 'Pelo Portal da Transparência, com cadastro ou, se preferir, sem login.' },
  { icon: Hash, title: 'Guarde o protocolo', text: 'É com ele que você acompanha o andamento e as providências.' },
  { icon: Clock, title: 'Receba a resposta', text: 'Em até 30 dias, prorrogáveis por mais 30 com justificativa.' },
];

const privacy = [
  { icon: Lock, title: 'Sigilo', text: 'Mesmo identificada, sua manifestação é tratada com sigilo (Lei nº 12.527/2011).' },
  { icon: Eye, title: 'Uso restrito', text: 'Seus dados servem só para identificar você, informar o andamento e responder.' },
  { icon: UserCheck, title: 'LGPD', text: 'O CRF-AL é o controlador dos dados (Lei nº 13.709/2018). Você pode acessar, corrigir ou pedir a eliminação.' },
];

const faqs = [
  { q: 'Preciso me identificar?', a: 'Não para denúncias: elas podem ser registradas de forma anônima, sem cadastro. Nesse caso, porém, não é possível acompanhar o andamento nem receber a resposta. Nos demais tipos, a identificação é necessária para que você receba o retorno, e sua manifestação continua sob sigilo.' },
  { q: 'Como acompanho minha manifestação?', a: 'Entre na Central de Atendimento do Portal da Transparência com o mesmo cadastro usado no registro e consulte pelo número de protocolo.' },
  { q: 'O que acontece se pedirem mais informações?', a: 'Em alguns casos a Ouvidoria precisa de dados adicionais. Se não houver retorno dentro do prazo indicado, a manifestação pode ser encerrada sem resposta conclusiva.' },
  { q: 'Qual a diferença entre Ouvidoria e pedido de informação?', a: 'A Ouvidoria (e-OUV) recebe reclamações, elogios, sugestões, solicitações e denúncias. Pedidos de acesso a informações públicas, com base na Lei de Acesso à Informação, são feitos pelo e-SIC. Os dois usam o mesmo cadastro no Portal da Transparência.' },
];

function SectionTitle({ id, label, title, text }: { id: string; label: string; title: string; text?: string }) {
  return (
    <div className="mb-6 md:mb-8">
      <p className={goldLabel}>{label}</p>
      <h2 id={id} className="mt-1.5 text-[22px] font-bold leading-tight tracking-tight text-crfal-blue sm:text-[26px]">{title}</h2>
      <span aria-hidden className="mt-2.5 block h-0.5 w-10 rounded-full bg-crfal-gold" />
      {text && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-crfal-gray-600">{text}</p>}
    </div>
  );
}

function CopyEmail() {
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
        try { await navigator.clipboard.writeText(OUVIDORIA_EMAIL); setCopiado(true); } catch { window.prompt('Copie o e-mail da Ouvidoria:', OUVIDORIA_EMAIL); }
      }}
      aria-label={copiado ? 'E-mail copiado' : 'Copiar e-mail da Ouvidoria'}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-crfal-gray-200 text-crfal-gray-600 hover:border-crfal-blue hover:text-crfal-blue ${motion} ${focusRing}`}
    >
      {copiado ? <Check className="h-4 w-4 text-[#8A6A12]" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
    </button>
  );
}

export default function OmbudsmanPage() {
  const [faqAberta, setFaqAberta] = useState<number | null>(0);

  return (
    <div className="min-h-screen">
      <SEO
        title="Ouvidoria"
        description="Ouvidoria do CRFAL — canal oficial para reclamações, sugestões, elogios e denúncias, atendido pelo Portal da Transparência da Implanta. Manifeste-se e contribua para a melhoria dos serviços farmacêuticos em Alagoas."
        path="/servicos/ouvidoria"
      />

      <PageHero
        breadcrumb={[
          { label: 'Início', href: '/' },
          { label: 'Serviços', href: '/servicos/requerimentos' },
          { label: 'Ouvidoria' },
        ]}
        title="Ouvidoria"
        section="servicos"
        lead="Registre reclamações, elogios, sugestões, solicitações ou denúncias sobre os serviços do CRF-AL. Toda manifestação recebe resposta em até 30 dias."
        meta={[{ value: '30', label: 'dias para resposta' }, { value: '5', label: 'tipos de manifestação' }, { value: 'Anônima', label: 'para denúncias' }]}
        actions={
          <>
            <PageHeroAction href={OUVIDORIA_URL}>Registrar manifestação</PageHeroAction>
            <PageHeroAction href={OUVIDORIA_URL} variant="secondary">Acompanhar protocolo</PageHeroAction>
          </>
        }
      />

      <div className="container-crfal space-y-12 py-10 md:space-y-16 md:py-14">
        {/* Antes de registrar */}
        <section aria-labelledby="antes-title" className="relative overflow-hidden rounded-xl border border-crfal-gold/40 bg-[#FBF7EC] p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#8A6A12] ring-1 ring-crfal-gold/40"><Info className="h-5 w-5" aria-hidden /></span>
              <div>
                <p className={goldLabel}>Antes de registrar</p>
                <h2 id="antes-title" className="mt-1 text-lg font-bold text-crfal-blue-dark">A Ouvidoria é um canal de segunda instância.</h2>
                <p className="mt-1 max-w-2xl text-[14px] leading-relaxed text-crfal-gray-700">Se é a primeira vez que você trata do assunto, o setor responsável resolve mais rápido. Pedidos de informação pública vão pelo e-SIC.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:shrink-0 lg:justify-end">
              <Link to="/servicos/requerimentos" className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-crfal-gray-300 bg-white px-4 text-[13px] font-semibold text-crfal-blue hover:border-crfal-blue ${motion} ${focusRing}`}>
                <FileText className="h-4 w-4" aria-hidden /> Requerimentos
              </Link>
              <Link to="/contato" className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-crfal-gray-300 bg-white px-4 text-[13px] font-semibold text-crfal-blue hover:border-crfal-blue ${motion} ${focusRing}`}>
                <MessagesSquare className="h-4 w-4" aria-hidden /> Fale Conosco
              </Link>
              <a href={ESIC_URL} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-crfal-gray-300 bg-white px-4 text-[13px] font-semibold text-crfal-blue hover:border-crfal-blue ${motion} ${focusRing}`}>
                <FileSearch className="h-4 w-4" aria-hidden /> Pedido de informação (e-SIC) <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only">(abre em uma nova aba)</span>
              </a>
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section aria-labelledby="passos-title">
          <SectionTitle id="passos-title" label="Passo a passo" title="Como funciona" text="O atendimento é feito pelo Portal da Transparência, plataforma oficial do CRF-AL, responsável pela guarda e proteção das informações." />
          <ol className="grid divide-y divide-crfal-gray-100 overflow-hidden rounded-xl border border-crfal-gray-200 shadow-xs sm:grid-cols-2 sm:gap-4 sm:divide-y-0 sm:overflow-visible sm:rounded-none sm:border-0 sm:shadow-none lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="relative flex items-start gap-4 bg-white p-4 sm:flex-col sm:gap-0 sm:rounded-xl sm:border sm:border-crfal-gray-200 sm:p-5 sm:shadow-xs">
                  <div className="flex shrink-0 items-center justify-between sm:w-full">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-crfal-blue text-white ring-2 ring-crfal-gold/30"><Icon className="h-5 w-5" aria-hidden /></span>
                    <span aria-hidden className="hidden text-[32px] font-bold leading-none tracking-tight text-crfal-gray-200 sm:block">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-crfal-blue-dark sm:mt-4"><span className="text-[#8A6A12] sm:hidden">{index + 1}. </span><span className="sr-only">Passo {index + 1}: </span>{step.title}</h3>
                    <p className="mt-1 text-[14px] leading-relaxed text-crfal-gray-600">{step.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="mt-4 flex items-start gap-2 text-[13px] leading-relaxed text-crfal-gray-600">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
            Se a Ouvidoria pedir informações adicionais e não houver retorno no prazo, a manifestação pode ser encerrada sem resposta conclusiva.
          </p>
        </section>

        {/* Tipos */}
        <section aria-labelledby="tipos-title">
          <SectionTitle id="tipos-title" label="Tipos de manifestação" title="Qual é o seu caso?" text="Todos os tipos são registrados no mesmo portal. Escolha o que melhor descreve sua demanda no momento do registro." />
          <ul className="grid gap-px overflow-hidden rounded-xl border border-crfal-gray-200 bg-crfal-gray-200 shadow-xs sm:grid-cols-2 lg:grid-cols-5">
            {manifestationTypes.map((type) => {
              const Icon = type.icon;
              return (
                <li key={type.id} className="flex items-start gap-4 bg-white p-4 sm:flex-col sm:gap-0 sm:p-5 sm:last:col-span-2 lg:last:col-span-1">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-crfal-blue-lighter text-crfal-blue ring-1 ring-crfal-blue/10"><Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden /></span>
                  <div className="min-w-0 sm:flex sm:flex-1 sm:flex-col">
                    <h3 className="text-base font-bold text-crfal-blue-dark sm:mt-4">{type.label}</h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-crfal-gray-600">{type.when}</p>
                    {type.badge && <span className="mt-2.5 inline-flex self-start rounded-full bg-[#FBF7EC] px-2.5 py-1 text-[11px] font-semibold text-[#8A6A12] ring-1 ring-crfal-gold/40">{type.badge}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a href={OUVIDORIA_URL} target="_blank" rel="noopener noreferrer" className={`group inline-flex min-h-11 items-center gap-2 rounded-full bg-crfal-blue px-5 text-sm font-bold text-white hover:bg-crfal-blue-dark ${motion} ${focusRing}`}>
              Registrar no portal <ArrowUpRight className={`h-4 w-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${motion}`} aria-hidden />
              <span className="sr-only">(abre em uma nova aba)</span>
            </a>
            <span className="text-[13px] text-crfal-gray-600">Denúncias anônimas: use “Registrar manifestação sem login”.</span>
          </div>
        </section>

        {/* Privacidade */}
        <section aria-labelledby="privacidade-title">
          <SectionTitle id="privacidade-title" label="Privacidade" title="Como seus dados são tratados" />
          <div className="overflow-hidden rounded-xl border border-crfal-gray-200 bg-white shadow-xs">
            <ul className="grid divide-y divide-crfal-gray-100 md:grid-cols-3 md:divide-x md:divide-y-0">
              {privacy.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.title} className="flex gap-4 p-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-crfal-blue-lighter text-crfal-blue ring-1 ring-crfal-blue/10"><Icon className="h-[18px] w-[18px]" aria-hidden /></span>
                    <div>
                      <h3 className="text-[15px] font-bold text-crfal-blue-dark">{item.title}</h3>
                      <p className="mt-1 text-[13.5px] leading-relaxed text-crfal-gray-600">{item.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-col gap-3 border-t border-crfal-gray-100 bg-crfal-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13.5px] text-crfal-gray-700">Direitos da LGPD e dúvidas sobre seus dados: <a href={`mailto:${OUVIDORIA_EMAIL}`} className="font-semibold text-crfal-blue hover:underline">{OUVIDORIA_EMAIL}</a></p>
              <CopyEmail />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-title">
          <SectionTitle id="faq-title" label="Dúvidas" title="Perguntas frequentes" />
          <div className="divide-y divide-crfal-gray-100 overflow-hidden rounded-xl border border-crfal-gray-200 bg-white shadow-xs">
            {faqs.map((faq, index) => {
              const aberta = faqAberta === index;
              const panelId = `faq-ouvidoria-${index}`;
              return (
                <div key={faq.q}>
                  <h3>
                    <button
                      type="button"
                      onClick={() => setFaqAberta(aberta ? null : index)}
                      aria-expanded={aberta}
                      aria-controls={panelId}
                      className={`relative flex min-h-14 w-full items-center justify-between gap-3 px-5 py-4 text-left text-[15px] font-semibold focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-crfal-blue ${aberta ? 'text-crfal-blue before:absolute before:inset-y-3 before:left-0 before:w-0.5 before:rounded-full before:bg-crfal-gold' : 'text-crfal-blue-dark hover:bg-crfal-gray-50'}`}
                    >
                      {faq.q}
                      <ChevronDown className={`h-5 w-5 shrink-0 text-crfal-gray-400 transition-transform duration-300 motion-reduce:transition-none ${aberta ? 'rotate-180 text-crfal-blue' : ''}`} aria-hidden />
                    </button>
                  </h3>
                  <div id={panelId} role="region" aria-hidden={!aberta} inert={!aberta} className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${aberta ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-[14px] leading-relaxed text-crfal-gray-600">{faq.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Fechamento */}
        <aside className="relative isolate flex flex-col items-start gap-5 overflow-hidden rounded-xl border-t-2 border-crfal-gold bg-linear-to-br/srgb from-crfal-blue to-crfal-blue-dark p-6 text-white sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <MessagesSquare aria-hidden className="pointer-events-none absolute -bottom-8 -right-6 -z-10 h-40 w-40 opacity-[0.06]" strokeWidth={1} />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-crfal-gold">Pronto para registrar?</p>
            <p className="mt-1 text-lg font-bold">Sua manifestação ajuda a melhorar o CRF-AL.</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/75">
              <a href={`mailto:${OUVIDORIA_EMAIL}`} className="hover:text-white hover:underline">{OUVIDORIA_EMAIL}</a>
              <a href={`tel:+55${OUVIDORIA_TELEFONE.replace(/\D/g, '')}`} className="inline-flex items-center gap-1.5 tabular-nums hover:text-white hover:underline"><Phone className="h-3.5 w-3.5" aria-hidden />{OUVIDORIA_TELEFONE}</a>
            </p>
          </div>
          <a href={OUVIDORIA_URL} target="_blank" rel="noopener noreferrer" className="group inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-crfal-blue transition-colors hover:bg-crfal-blue-lighter focus-visible:outline-white">
            Registrar manifestação <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
            <span className="sr-only">(abre em uma nova aba)</span>
          </a>
        </aside>
      </div>
    </div>
  );
}
