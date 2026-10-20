import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BarChart3,
  Ban,
  Check,
  Cookie,
  Copy,
  FileSearch,
  HardDrive,
  Lock,
  Mail,
  MonitorSmartphone,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import SEO from '@/components/SEO';
import PageHero, { PageHeroAction } from '@/components/block/page-hero';
import { CRF_EM_CASA_URL, TRANSPARENCIA_URL } from '@/config/site';

const PATH = '/politica-de-privacidade';
const ATUALIZACAO = '19 de outubro de 2026';
/** Encarregado pelo tratamento de dados pessoais (art. 41 da LGPD). */
const ENCARREGADO = { nome: 'Thailanderson Rocha', email: 'tecnologia@crf-al.org.br' };
const OUVIDORIA_EMAIL = 'ouvidoria@crf-al.org.br';
const ATENDIMENTO_EMAIL = 'atendimento@crf-al.org.br';
const ESIC_URL = 'https://crf-al.implanta.net.br/portaltransparencia/#sic/home';

const goldLabel = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]';
const focusRing = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2';
const motion = 'transition duration-200 motion-reduce:transition-none';
const linkClass = `font-semibold text-crfal-blue underline decoration-crfal-blue/30 underline-offset-2 hover:decoration-crfal-blue ${focusRing} rounded-sm`;

/** Avisos em destaque no topo da página: o essencial em uma leitura rápida. */
const AVISOS: { icon: ComponentType<{ className?: string }>; title: string; text: string }[] = [
  {
    icon: Cookie,
    title: 'Sem cookies de rastreamento',
    text: 'O CRF-AL não utiliza cookies para identificação pessoal ou rastreamento dos visitantes, apenas cookies essenciais ao funcionamento do site e à produção de estatísticas de navegação.',
  },
  {
    icon: UserRound,
    title: 'Navegação sem cadastro',
    text: 'Para consultar as páginas deste site não é preciso fazer login nem informar nenhum dado pessoal.',
  },
  {
    icon: Ban,
    title: 'Sem uso comercial',
    text: 'O CRF-AL não vende, não aluga e não cede dados pessoais para fins comerciais ou publicitários.',
  },
  {
    icon: HardDrive,
    title: 'Preferências no seu aparelho',
    text: 'Listas de documentos marcadas e avisos fechados ficam guardados apenas no seu navegador. Nada disso é enviado ao CRF-AL.',
  },
];

/** Cookies e tecnologias semelhantes usados pelo site. */
const COOKIES: { icon: ComponentType<{ className?: string }>; tipo: string; finalidade: string; duracao: string }[] = [
  {
    icon: Lock,
    tipo: 'Essenciais',
    finalidade: 'Entregar o site com segurança e protegê-lo contra acessos automatizados abusivos. Definidos pela infraestrutura de hospedagem (Cloudflare), não identificam o visitante.',
    duracao: 'Até 30 minutos',
  },
  {
    icon: BarChart3,
    tipo: 'Estatísticas de navegação',
    finalidade: 'Contar visitas, páginas mais acessadas, tipo de aparelho e país de origem, sempre de forma agregada e anônima (Cloudflare Web Analytics), sem perfis individuais.',
    duracao: 'Não grava identificador no aparelho',
  },
  {
    icon: HardDrive,
    tipo: 'Armazenamento local',
    finalidade: 'Lembrar os documentos marcados no checklist dos requerimentos, o perfil escolhido na página inicial (Empresas, Farmacêuticos ou Cidadão) e não repetir um aviso já fechado. Fica só no seu navegador.',
    duracao: 'Até você limpar os dados do navegador (avisos: 1 dia)',
  },
];

const DIREITOS = [
  'Confirmar se tratamos dados seus',
  'Acessar os dados que temos',
  'Corrigir dados incompletos, inexatos ou desatualizados',
  'Pedir anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos',
  'Saber com quem seus dados foram compartilhados',
  'Revogar o consentimento, quando ele for a base do tratamento',
  'Pedir a revisão de decisões tomadas apenas de forma automatizada',
  'Peticionar à Autoridade Nacional de Proteção de Dados (ANPD)',
];

interface Secao {
  id: string;
  title: string;
  content: ReactNode;
}

function Paragrafo({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-[15px] leading-relaxed text-crfal-gray-700">{children}</p>;
}

function Lista({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3 text-[15px] leading-relaxed text-crfal-gray-700">
          <span aria-hidden className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-crfal-gold" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {children}
      <ArrowUpRight className="ml-0.5 inline h-3.5 w-3.5 align-[-2px]" aria-hidden />
      <span className="sr-only"> (abre em uma nova aba)</span>
    </a>
  );
}

function CopyEmail({ email }: { email: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try { await navigator.clipboard.writeText(email); setCopiado(true); } catch { window.prompt('Copie o e-mail:', email); }
        window.setTimeout(() => setCopiado(false), 2000);
      }}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-crfal-gray-300 bg-white px-4 text-[13px] font-semibold text-crfal-blue hover:border-crfal-blue ${motion} ${focusRing}`}
    >
      {copiado ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
      <span aria-live="polite">{copiado ? 'E-mail copiado' : 'Copiar e-mail'}</span>
    </button>
  );
}

const SECOES: Secao[] = [
  {
    id: 'quem-somos',
    title: 'Quem é o responsável pelos seus dados',
    content: (
      <>
        <Paragrafo>
          O Conselho Regional de Farmácia do Estado de Alagoas (CRF-AL), autarquia federal com sede na Rua Oldemburgo da Silva Paranhos, 290, Farol, Maceió/AL, é o controlador dos dados pessoais tratados neste site, nos termos da Lei Geral de Proteção de Dados Pessoais (LGPD, Lei nº 13.709/2018).
        </Paragrafo>
        <Paragrafo>
          Esta política vale para o portal institucional. Os sistemas com login, como o{' '}
          <ExternalLink href={CRF_EM_CASA_URL}>CRF AL em Casa</ExternalLink> e o{' '}
          <ExternalLink href={TRANSPARENCIA_URL}>Portal da Transparência</ExternalLink>, são acessados por links deste site e têm regras próprias de uso e privacidade.
        </Paragrafo>
        <Paragrafo>
          O encarregado pelo tratamento de dados pessoais (art. 41 da LGPD) é <strong className="font-semibold text-crfal-blue-dark">{ENCARREGADO.nome}</strong>, que pode ser contatado pelo e-mail{' '}
          <a href={`mailto:${ENCARREGADO.email}`} className={linkClass}>{ENCARREGADO.email}</a>. Ele recebe os pedidos dos titulares e as comunicações da ANPD.
        </Paragrafo>
      </>
    ),
  },
  {
    id: 'dados-coletados',
    title: 'Quais dados tratamos',
    content: (
      <>
        <Paragrafo>Ao visitar o site, você não precisa se identificar. Tratamos apenas:</Paragrafo>
        <Lista
          items={[
            <><strong className="font-semibold text-crfal-blue-dark">Dados técnicos de navegação</strong>, como página visitada, navegador, tipo de aparelho e país, usados de forma agregada para estatísticas. Não usamos esses dados para identificar quem você é.</>,
            <><strong className="font-semibold text-crfal-blue-dark">Registros de acesso</strong> (endereço IP, data e hora), mantidos pela hospedagem por questões de segurança e pelo prazo exigido no Marco Civil da Internet (Lei nº 12.965/2014).</>,
            <><strong className="font-semibold text-crfal-blue-dark">Dados que você nos envia</strong> ao escrever para o CRF-AL por e-mail, telefone ou WhatsApp, como nome, contato, número de inscrição e o conteúdo da mensagem.</>,
          ]}
        />
        <Paragrafo>
          Requerimentos, manifestações de Ouvidoria e pedidos de acesso à informação são registrados nos sistemas oficiais indicados no site, e não neste portal.
        </Paragrafo>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies e tecnologias semelhantes',
    content: (
      <>
        <Paragrafo>
          Cookies são pequenos arquivos que um site grava no navegador. O CRF-AL não utiliza cookies para identificação pessoal ou rastreamento dos visitantes, apenas cookies essenciais ao funcionamento do site e à produção de estatísticas de navegação. Não usamos cookies de publicidade nem de redes sociais.
        </Paragrafo>
        <div className="mt-5 overflow-hidden rounded-xl border border-crfal-gray-200">
          <ul className="divide-y divide-crfal-gray-100">
            {COOKIES.map(({ icon: Icon, tipo, finalidade, duracao }) => (
              <li key={tipo} className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_200px] sm:gap-6 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-crfal-blue-lighter text-crfal-blue"><Icon className="h-[18px] w-[18px]" aria-hidden /></span>
                  <div>
                    <p className="text-[15px] font-bold text-crfal-blue-dark">{tipo}</p>
                    <p className="mt-1 text-[14px] leading-relaxed text-crfal-gray-700">{finalidade}</p>
                  </div>
                </div>
                <div className="pl-12 sm:pl-0">
                  <p className={goldLabel}>Duração</p>
                  <p className="mt-1 text-[14px] font-semibold text-crfal-blue-dark">{duracao}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <Paragrafo>
          <strong className="font-semibold text-crfal-blue-dark">Conteúdo de terceiros.</strong> Os vídeos do YouTube são exibidos no modo de privacidade reforçada (youtube-nocookie.com), e as imagens de publicações do Instagram e das notícias do Conselho Federal de Farmácia são carregadas dos servidores dessas plataformas. Ao abrir links externos, valem as políticas de cada site.
        </Paragrafo>
        <Paragrafo>
          <strong className="font-semibold text-crfal-blue-dark">Como gerenciar.</strong> Você pode apagar ou bloquear cookies e dados de sites nas configurações do seu navegador. Os cookies essenciais são necessários para a segurança; sem eles, algumas páginas podem não carregar corretamente.
        </Paragrafo>
      </>
    ),
  },
  {
    id: 'finalidades',
    title: 'Para que usamos os dados',
    content: (
      <>
        <Lista
          items={[
            'Responder a pedidos, dúvidas e solicitações enviados ao CRF-AL',
            'Executar as atribuições legais do Conselho, como registro, fiscalização e orientação profissional (Lei nº 3.820/1960)',
            'Manter o site funcionando com segurança e prevenir fraudes e ataques',
            'Entender, de forma agregada, quais conteúdos são mais procurados, para melhorar o site',
          ]}
        />
        <Paragrafo>
          Como órgão público, o CRF-AL trata dados principalmente para cumprir obrigações legais e executar suas competências (arts. 7º, II e III, e 23 da LGPD), além do exercício regular de direitos e, quando for o caso, com o seu consentimento.
        </Paragrafo>
      </>
    ),
  },
  {
    id: 'compartilhamento',
    title: 'Com quem compartilhamos',
    content: (
      <>
        <Paragrafo>Os dados só são compartilhados quando necessário e na medida do necessário:</Paragrafo>
        <Lista
          items={[
            'Com fornecedores que operam serviços para o CRF-AL, como hospedagem e sistemas de atendimento, que só podem usar os dados para prestar esses serviços',
            'Com o Conselho Federal de Farmácia e outros órgãos públicos, quando a lei exigir ou a atividade institucional depender disso',
            'Com autoridades, para cumprir ordem judicial ou requisição legal',
          ]}
        />
        <Paragrafo>Dados pessoais nunca são vendidos, alugados ou usados para publicidade.</Paragrafo>
      </>
    ),
  },
  {
    id: 'seguranca',
    title: 'Segurança e armazenamento',
    content: (
      <>
        <Paragrafo>
          O site usa conexão criptografada (HTTPS) em todas as páginas e políticas de segurança que impedem a execução de códigos de origem não autorizada. O acesso interno aos dados é restrito às pessoas que precisam deles para trabalhar.
        </Paragrafo>
        <Paragrafo>
          Os dados ficam guardados pelo tempo necessário para cumprir a finalidade que justificou a coleta ou pelo prazo exigido em lei e nas normas de arquivo público. Depois disso, são eliminados ou anonimizados.
        </Paragrafo>
      </>
    ),
  },
  {
    id: 'direitos',
    title: 'Seus direitos',
    content: (
      <>
        <Paragrafo>Pela LGPD (art. 18), você pode, a qualquer momento e sem custo:</Paragrafo>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {DIREITOS.map((direito) => (
            <li key={direito} className="flex items-start gap-3 rounded-lg border border-crfal-gray-200 bg-crfal-gray-50/60 px-3.5 py-3 text-[14.5px] leading-snug text-crfal-gray-700">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#8A6A12]" aria-hidden />
              {direito}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: 'contato',
    title: 'Como exercer seus direitos',
    content: (
      <>
        <Paragrafo>
          Envie seu pedido ao encarregado de dados do CRF-AL, informando seu nome e o que deseja. Para confirmar que o pedido é seu, podemos solicitar um documento de identificação. A resposta é enviada no prazo legal.
        </Paragrafo>
        <div className="mt-5 flex flex-col gap-4 rounded-xl border border-crfal-gold/40 bg-[#FBF7EC] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#8A6A12] ring-1 ring-crfal-gold/40"><Mail className="h-5 w-5" aria-hidden /></span>
            <div>
              <p className={goldLabel}>Encarregado de dados (LGPD)</p>
              <p className="mt-0.5 text-[15px] font-semibold text-crfal-blue-dark">{ENCARREGADO.nome}</p>
              <a href={`mailto:${ENCARREGADO.email}`} className={`inline-block text-[17px] font-bold text-crfal-blue hover:underline ${focusRing} rounded-sm`}>{ENCARREGADO.email}</a>
            </div>
          </div>
          <CopyEmail email={ENCARREGADO.email} />
        </div>
        <Paragrafo>
          Também é possível registrar o pedido pelo <ExternalLink href={ESIC_URL}>e-SIC</ExternalLink> ou pela <Link to="/servicos/ouvidoria" className={linkClass}>Ouvidoria</Link> (<a href={`mailto:${OUVIDORIA_EMAIL}`} className={linkClass}>{OUVIDORIA_EMAIL}</a>). Para dúvidas gerais, escreva para{' '}
          <a href={`mailto:${ATENDIMENTO_EMAIL}`} className={linkClass}>{ATENDIMENTO_EMAIL}</a>. Se não ficar satisfeito com a resposta, você pode procurar a{' '}
          <ExternalLink href="https://www.gov.br/anpd">Autoridade Nacional de Proteção de Dados</ExternalLink>.
        </Paragrafo>
      </>
    ),
  },
  {
    id: 'atualizacoes',
    title: 'Atualizações desta política',
    content: (
      <Paragrafo>
        Esta política pode ser revista para acompanhar mudanças no site ou na legislação. A data da última atualização fica sempre no topo desta página. Leia também os <Link to="/termos-de-uso" className={linkClass}>Termos de Uso</Link>.
      </Paragrafo>
    ),
  },
];

/** Acompanha a seção visível para destacar o item no sumário fixo (só a partir de 1024px). */
function useSecaoAtiva(ids: string[]) {
  const [ativa, setAtiva] = useState(ids[0]);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visivel = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visivel) setAtiva(visivel.target.id);
      },
      { rootMargin: '-20% 0px -65% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return ativa;
}

const IDS = SECOES.map((secao) => secao.id);

export default function PrivacyPolicyPage() {
  const ativa = useSecaoAtiva(IDS);

  return (
    <div className="min-h-screen">
      <SEO
        title="Política de Privacidade"
        description="Política de Privacidade do CRFAL — saiba como tratamos seus dados pessoais em conformidade com a LGPD."
        path={PATH}
        noindex
      />
      <PageHero
        breadcrumb={[{ label: 'Início', href: '/' }, { label: 'Política de Privacidade' }]}
        title="Política de Privacidade"
        eyebrow="Seus dados"
        lead="Como o CRF-AL trata e protege seus dados pessoais neste site, em conformidade com a LGPD."
        meta={[
          { value: ATUALIZACAO, label: 'última atualização' },
          { value: 'Lei nº 13.709/2018', label: 'LGPD' },
        ]}
        actions={
          <>
            <PageHeroAction href="#contato">Exercer meus direitos</PageHeroAction>
            <PageHeroAction href="#cookies" variant="secondary">Sobre cookies</PageHeroAction>
          </>
        }
      />

      <div className="container-crfal py-10 md:py-14">
        <section aria-labelledby="avisos-title">
          <p className={goldLabel}>Em resumo</p>
          <h2 id="avisos-title" className="mt-1.5 text-[22px] font-bold leading-tight tracking-tight text-crfal-blue sm:text-[26px]">O essencial sobre sua privacidade</h2>
          <span aria-hidden className="mt-2.5 block h-0.5 w-10 rounded-full bg-crfal-gold" />
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {AVISOS.map(({ icon: Icon, title, text }, index) => (
              <li
                key={title}
                className={
                  index === 0
                    ? 'relative overflow-hidden rounded-2xl bg-linear-to-br/srgb from-crfal-blue to-crfal-blue-dark p-5 text-white shadow-xs sm:col-span-2 lg:col-span-1'
                    : 'rounded-2xl border border-crfal-gray-200 bg-white p-5 shadow-xs'
                }
              >
                {index === 0 && <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-crfal-gold" />}
                {index === 0 && <Icon className="pointer-events-none absolute -bottom-6 -right-6 h-28 w-28 text-white/6" />}
                <span className={`flex h-10 w-10 items-center justify-center rounded-full ${index === 0 ? 'bg-white/10 text-crfal-gold ring-1 ring-crfal-gold/50' : 'bg-crfal-blue-lighter text-crfal-blue'}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className={`mt-4 text-[16px] font-bold leading-snug ${index === 0 ? 'text-white' : 'text-crfal-blue-dark'}`}>{title}</h3>
                <p className={`mt-1.5 text-[14px] leading-relaxed ${index === 0 ? 'text-white/80' : 'text-crfal-gray-700'}`}>{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-10 grid gap-6 lg:mt-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
          <nav aria-labelledby="sumario-title" className="h-fit rounded-xl border border-crfal-gray-200 bg-white p-5 shadow-xs lg:sticky lg:top-[calc(var(--header-offset)+24px)]">
            <p id="sumario-title" className={goldLabel}>Nesta política</p>
            <ol className="mt-3 grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
              {SECOES.map((secao, index) => {
                const atual = ativa === secao.id;
                return (
                  <li key={secao.id}>
                    <a
                      href={`#${secao.id}`}
                      aria-current={atual ? 'location' : undefined}
                      className={`flex min-h-10 items-center gap-3 rounded-lg border-l-2 px-3 py-1.5 text-[13.5px] leading-snug ${motion} ${focusRing} ${
                        atual
                          ? 'border-transparent text-crfal-gray-700 hover:bg-crfal-gray-50 hover:text-crfal-blue lg:border-crfal-gold lg:bg-crfal-blue-lighter lg:font-semibold lg:text-crfal-blue'
                          : 'border-transparent text-crfal-gray-700 hover:bg-crfal-gray-50 hover:text-crfal-blue'
                      }`}
                    >
                      <span className="w-5 shrink-0 text-[12px] font-bold tabular-nums text-[#8A6A12]">{String(index + 1).padStart(2, '0')}</span>
                      {secao.title}
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="space-y-4 md:space-y-5">
            {SECOES.map((secao, index) => (
              <section
                key={secao.id}
                id={secao.id}
                aria-labelledby={`${secao.id}-title`}
                className="scroll-mt-[calc(var(--header-offset)+24px)] rounded-2xl border border-crfal-gray-200 bg-white p-5 shadow-xs sm:p-8"
              >
                <p className={goldLabel}>{String(index + 1).padStart(2, '0')}</p>
                <h2 id={`${secao.id}-title`} className="mt-1 text-[20px] font-bold leading-tight tracking-tight text-crfal-blue sm:text-[22px]">{secao.title}</h2>
                <span aria-hidden className="mt-2.5 block h-0.5 w-10 rounded-full bg-crfal-gold" />
                {secao.content}
              </section>
            ))}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-crfal-gray-200 bg-white px-5 py-4 text-[13px] text-crfal-gray-600">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#8A6A12]" aria-hidden />Última atualização: {ATUALIZACAO}</span>
              <span className="inline-flex items-center gap-2"><MonitorSmartphone className="h-4 w-4 text-[#8A6A12]" aria-hidden />Vale para institucional.crf-al.org.br</span>
              <span className="inline-flex items-center gap-2"><FileSearch className="h-4 w-4 text-[#8A6A12]" aria-hidden /><Link to="/termos-de-uso" className={linkClass}>Termos de Uso</Link></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
