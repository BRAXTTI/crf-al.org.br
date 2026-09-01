import { useState } from 'react';
import SEO from '@/components/SEO';
import {
  ChevronRight,
  MessageSquare,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  FileText,
  HelpCircle,
  Shield,
  ChevronDown,
  ExternalLink,
  Lock,
  Eye,
  UserCheck,
  FileClock,
} from 'lucide-react';

const PORTAL_TRANSPARENCIA_URL = 'https://crf-al.implanta.net.br/portaltransparencia/#ouv/home';

const manifestationTypes = [
  {
    id: 'reclamacao',
    label: 'Reclamação',
    icon: MessageSquare,
    description:
      'Se você não se sentir completamente atendido pelos nossos serviços, manifeste sua insatisfação em relação à conduta de um agente público ou à ineficiência de algum procedimento realizado pelo CRF-AL.',
  },
  {
    id: 'elogio',
    label: 'Elogio',
    icon: ThumbsUp,
    description:
      'Expresse sua satisfação com o atendimento recebido por algum agente público e pelos serviços oferecidos pelo CRF-AL. Esse registro é muito importante, pois se torna mais uma ferramenta de avaliação e melhoria.',
  },
  {
    id: 'sugestao',
    label: 'Sugestão',
    icon: Lightbulb,
    description:
      'Envie sua ideia ou proposta de melhoria que amplie a qualidade dos serviços realizados pelo CRF-AL. Havendo viabilidade técnica e econômica, poderemos implantar sua proposta em nossa rotina administrativa.',
  },
  {
    id: 'solicitacao',
    label: 'Solicitação',
    icon: FileText,
    description:
      'A Ouvidoria é um canal de segunda instância. Antes de registrar sua solicitação, certifique-se de ter procurado os demais departamentos responsáveis, que também estão prontos para atendê-lo com agilidade.',
  },
  {
    id: 'denuncia',
    label: 'Denúncia',
    icon: AlertTriangle,
    description:
      'Comunique uma irregularidade, um ato ilícito ou uma violação de direitos na administração pública. Somente serão apuradas as denúncias com as informações mínimas necessárias e relacionadas às atribuições do CRF-AL.',
  },
];

const dataTreatment = [
  {
    icon: Lock,
    title: 'Sigilo garantido',
    text: 'Mesmo com identificação, sua manifestação é tratada com sigilo e os dados pessoais são resguardados, nos termos da Lei nº 12.527/2011 (Lei de Acesso à Informação).',
  },
  {
    icon: Eye,
    title: 'Uso restrito à finalidade',
    text: 'Os dados informados são utilizados exclusivamente para identificar o manifestante, comunicar o andamento e enviar a resposta à manifestação — nada além disso.',
  },
  {
    icon: UserCheck,
    title: 'Conformidade com a LGPD',
    text: 'O CRF-AL é o controlador dos dados pessoais coletados por meio da plataforma, em conformidade com a Lei nº 13.709/2018 (LGPD). Você pode confirmar, acessar, corrigir e solicitar a eliminação de seus dados.',
  },
  {
    icon: FileClock,
    title: 'Prazo de resposta',
    text: 'O prazo de resposta é de até 30 dias, com possibilidade de uma prorrogação por igual período, desde que justificada. Em alguns casos, podem ser solicitadas informações adicionais.',
  },
];

const faqs = [
  {
    q: 'Como faço para registrar uma manifestação?',
    a: 'O atendimento é realizado pelo Portal da Transparência da Implanta, plataforma oficial utilizada pelo CRF-AL. Basta acessar o link desta página, escolher o tipo de manifestação e preencher os dados solicitados.',
  },
  {
    q: 'Preciso me identificar para registrar uma manifestação?',
    a: 'Para denúncias, é possível o registro anônimo. Nas demais situações, a identificação é necessária para que você receba resposta e possa acompanhar o andamento — mas sua manifestação continua sendo tratada com sigilo.',
  },
  {
    q: 'Como acompanho o status da minha manifestação?',
    a: 'Ao registrar sua manifestação na plataforma, você recebe um número de protocolo que permite acompanhar o andamento e o acesso às providências tomadas.',
  },
  {
    q: 'Posso registrar denúncia anônima?',
    a: 'Sim. Porém, quando a pessoa escolhe permanecer anônima, não é possível acompanhar o andamento nem receber a resposta com as providências adotadas.',
  },
];

export default function OmbudsmanPage() {
  const [faqAberta, setFaqAberta] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-crfal-gray-50 dark:bg-slate-950">
      <SEO
        title="Ouvidoria"
        description="Ouvidoria do CRFAL — canal oficial para reclamações, sugestões, elogios e denúncias, atendido pelo Portal da Transparência da Implanta. Manifeste-se e contribua para a melhoria dos serviços farmacêuticos em Alagoas."
        path="/servicos/ouvidoria"
      />

      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-crfal-blue via-crfal-blue-dark to-[#002a4a]">
        <div aria-hidden className="absolute inset-0">
          <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:26px_26px]" />
          <div className="absolute -left-24 -top-24 h-96 w-96 animate-float rounded-full bg-crfal-blue-light/25 blur-3xl" />
          <div className="absolute -bottom-32 right-0 h-[26rem] w-[26rem] rounded-full bg-[#0066CC]/20 blur-3xl" />
        </div>

        <div className="container-crfal relative z-10 pb-14 pt-28 md:pb-20 md:pt-36">
          <nav aria-label="Trilha de navegação" className="mb-6 flex items-center gap-2 text-sm text-white/60">
            <a href="/" className="transition-colors hover:text-white">Início</a>
            <ChevronRight className="h-4 w-4" />
            <span>Serviços</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">Ouvidoria</span>
          </nav>

          <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
            <MessageSquare className="h-4 w-4 text-crfal-gold" />
            Canal oficial · CRF-AL
          </p>

          <h1 className="max-w-3xl font-display text-[2.25rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Ouvidoria{' '}
            <span className="bg-gradient-to-r from-[#8FC1F2] to-crfal-gold bg-clip-text text-transparent">
              CRF-AL
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
            A Ouvidoria do Conselho Regional de Farmácia de Alagoas (CRF-AL) é o canal para
            registrar denúncias, reclamações, solicitações, sugestões e elogios.
          </p>

          <dl className="mt-9 grid max-w-lg grid-cols-3 gap-3">
            {[
              { valor: '30', rotulo: 'Dias p/ resposta' },
              { valor: '5', rotulo: 'Tipos de manifestação' },
              { valor: '24h', rotulo: 'Canal disponível' },
            ].map((item) => (
              <div
                key={item.rotulo}
                className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm"
              >
                <dd className="font-display text-2xl font-bold text-white sm:text-3xl">{item.valor}</dd>
                <dt className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-white/70">
                  {item.rotulo}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <main className="container-crfal py-10 md:py-14">
        {/* Introdução + plataforma */}
        <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards duration-500">
            <span className="mb-3 inline-block rounded-full bg-crfal-blue-lighter px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-crfal-blue dark:bg-crfal-blue/10 dark:text-crfal-blue-light">
              Atendimento
            </span>
            <h2 className="mb-4 font-display text-2xl font-bold text-neutral-800 dark:text-white sm:text-3xl">
              Como nossa Ouvidoria funciona
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-crfal-gray-600 dark:text-crfal-gray-400 sm:text-base">
              <p>
                O atendimento é realizado pelo{' '}
                <strong className="font-semibold text-crfal-blue dark:text-crfal-blue-light">
                  Portal da Transparência da Implanta
                </strong>
                , plataforma oficial utilizada pelo CRF-AL para receber e gerenciar manifestações.
                Para enviar sua manifestação, basta acessar o portal e preencher as informações
                solicitadas.
              </p>
              <p>
                Ao escolher a opção que melhor descreve sua demanda, você será direcionado ao
                ambiente da plataforma, responsável pela guarda das informações e pela proteção
                dos dados do usuário.
              </p>
              <p>
                Em alguns casos, pode ser necessário solicitar informações adicionais. Se não
                houver retorno dentro do prazo indicado, a manifestação poderá ser encerrada
                automaticamente, sem resposta conclusiva.
              </p>
            </div>
          </div>

          <div
            className="animate-in fade-in slide-in-from-bottom-3 fill-mode-backwards rounded-2xl border border-crfal-blue/15 bg-white p-7 shadow-card duration-500 dark:border-crfal-blue/25 dark:bg-slate-900 sm:p-8"
            style={{ animationDelay: '120ms' }}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-crfal-blue text-white">
              <ExternalLink className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-display text-lg font-semibold text-neutral-800 dark:text-white sm:text-xl">
              Portal da Transparência — Implanta
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-crfal-gray-600 dark:text-crfal-gray-400">
              Todo o atendimento da Ouvidoria é feito exclusivamente por essa plataforma. Registre
              sua manifestação e acompanhe o andamento pelo número de protocolo.
            </p>
            <a
              href={PORTAL_TRANSPARENCIA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-crfal-blue px-6 font-semibold text-white transition-all hover:bg-crfal-blue-dark active:scale-[0.98] sm:w-auto"
            >
              Acessar a plataforma
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </section>

        {/* Tipos de manifestação */}
        <section className="mt-14 md:mt-20">
          <div className="mb-8 text-center">
            <h2 className="mb-3 font-display text-2xl font-bold text-neutral-800 dark:text-white sm:text-3xl">
              Escolha o tipo de manifestação
            </h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-crfal-gray-600 dark:text-crfal-gray-400 sm:text-base">
              Sua participação fortalece o CRF-AL. Ao escolher a opção que melhor descreve sua
              demanda, você será direcionado ao Portal da Transparência da Implanta.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {manifestationTypes.map((type) => (
              <a
                key={type.id}
                href={PORTAL_TRANSPARENCIA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-2xl border border-crfal-gray-200 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-crfal-blue/30 hover:shadow-card-hover dark:border-slate-700 dark:bg-slate-900 dark:hover:border-crfal-blue/40"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-crfal-blue-lighter text-crfal-blue transition-colors duration-300 group-hover:bg-crfal-blue group-hover:text-white dark:bg-slate-800 dark:text-crfal-blue-light">
                  <type.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 flex items-center gap-2 font-display text-base font-semibold text-neutral-800 dark:text-white">
                  {type.label}
                  <ExternalLink className="h-3.5 w-3.5 text-crfal-gray-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </h3>
                <p className="text-sm leading-relaxed text-crfal-gray-600 dark:text-crfal-gray-400">
                  {type.description}
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* Tratamento de dados */}
        <section className="mt-14 md:mt-20">
          <div className="mb-8 text-center">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-crfal-blue-lighter px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-crfal-blue dark:bg-crfal-blue/10 dark:text-crfal-blue-light">
              <Shield className="h-3.5 w-3.5" />
              Privacidade
            </span>
            <h2 className="font-display text-2xl font-bold text-neutral-800 dark:text-white sm:text-3xl">
              Como seus dados são tratados
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {dataTreatment.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-crfal-gray-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-crfal-blue text-white">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-base font-semibold text-neutral-800 dark:text-white">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-crfal-gray-600 dark:text-crfal-gray-400">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-crfal-blue/15 bg-crfal-blue-lighter/50 p-6 dark:border-crfal-blue/25 dark:bg-crfal-blue/10">
            <p className="text-sm leading-relaxed text-crfal-gray-600 dark:text-crfal-gray-400">
              Para exercer seus direitos previstos na LGPD ou tirar dúvidas sobre o tratamento dos
              seus dados, entre em contato pelo e-mail{' '}
              <a
                href="mailto:ouvidoria@crf-al.org.br"
                className="font-semibold text-crfal-blue hover:underline dark:text-crfal-blue-light"
              >
                ouvidoria@crf-al.org.br
              </a>
              .
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-14 md:mt-20">
          <h2 className="mb-6 flex items-center gap-2 font-display text-xl font-semibold text-neutral-800 dark:text-white md:text-2xl">
            <HelpCircle className="h-5 w-5 text-crfal-blue dark:text-crfal-blue-light" />
            Perguntas Frequentes
          </h2>
          <div className="space-y-2.5">
            {faqs.map((faq, index) => {
              const aberta = faqAberta === index;
              return (
                <div
                  key={faq.q}
                  className={`overflow-hidden rounded-xl border transition-colors ${
                    aberta
                      ? 'border-crfal-blue/30 bg-crfal-blue-lighter/40 dark:border-crfal-blue/30 dark:bg-crfal-blue/10'
                      : 'border-crfal-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800/50'
                  }`}
                >
                  <button
                    onClick={() => setFaqAberta(aberta ? null : index)}
                    aria-expanded={aberta}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold text-neutral-800 transition-colors hover:text-crfal-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-crfal-blue-light dark:text-white dark:hover:text-crfal-blue-light"
                  >
                    {faq.q}
                    <ChevronDown className={`h-4 w-4 shrink-0 text-crfal-gray-400 transition-transform duration-300 ${aberta ? 'rotate-180 text-crfal-blue dark:text-crfal-blue-light' : ''}`} />
                  </button>
                  <div className={`grid transition-all duration-300 ease-out ${aberta ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <p className="px-4 pb-4 text-sm leading-relaxed text-crfal-gray-600 dark:text-crfal-gray-400">{faq.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
