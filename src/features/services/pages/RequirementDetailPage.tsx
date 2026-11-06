import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate, useNavigationType, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  Clock,
  Download,
  FileClock,
  FileText,
  Info,
  Link2,
  ListChecks,
  Mail,
  MessageCircle,
  Phone,
  PillBottle,
  Play,
  Workflow,
} from 'lucide-react';
import SEO from '@/components/SEO';
import { rolarAteAlvo } from '@/components/layout/rolarAteAlvo';
import { ArrowFillButton } from '@/components/block/arrow-fill-button';
import PageHero from '@/components/block/page-hero';
import Abas, { type ItemAba } from '@/components/ui/abas';
import { ATENDIMENTO, HORARIO_ATENDIMENTO, telefoneHref } from '@/config/contact';
import { PAGE_METADATA } from '@/config/page-metadata';
import { caminhoDoTutorial } from '@/config/redirects-servicos';
import { CRF_EM_CASA_URL } from '@/config/site';
import {
  caminhoDoRequerimento,
  corporateMenu,
  getRequerimento,
  individualMenu,
  observacoesDoRequerimento,
  perfilDoRequerimento,
  type MenuCategory,
  type RequirementItem,
} from '@/data/requerimentos';
import { tutoriais } from '@/data/servicos';
import { GUIAS } from '@/data/tutoriais-guias';
import { medir } from '@/lib/medir';
import { getYouTubeEmbedUrl } from '@/lib/youtube';
import ChecklistDocumentos from '../components/ChecklistDocumentos';
import TutorialDetail, { BotaoAcao, ROTULO_ACAO_PADRAO } from '../components/TutorialDetail';

const focusRing =
  'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2';
const motion = 'transition duration-200 motion-reduce:transition-none';
const goldLabel = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]';

const PRAZO_GENERICO = 'Conforme análise do CRF-AL';

type AbaRequerimentoId = 'para-que-serve' | 'passo-a-passo' | 'formulario';

function encontrarCategoria(id: string): MenuCategory | undefined {
  return [...individualMenu, ...corporateMenu].find((cat) =>
    cat.items.some((item) => item.id === id),
  );
}

function extrairNomeArquivo(url: string): string {
  try {
    const caminho = new URL(url).pathname;
    const ultimo = caminho.split('/').filter(Boolean).pop();
    return ultimo ? decodeURIComponent(ultimo) : 'formulario.docx';
  } catch {
    const partes = url.split('/');
    return partes[partes.length - 1] || 'formulario.docx';
  }
}

interface LinkRelacionado {
  id: string;
  titulo: string;
  descricao: string;
  href: string;
  tipo: 'Requerimento' | 'Tutorial';
}

function obterRelacionados(item: RequirementItem, categoria?: MenuCategory): LinkRelacionado[] {
  const resultado: LinkRelacionado[] = [];
  const adicionados = new Set<string>([item.id]);

  const adicionarPorId = (id: string) => {
    if (adicionados.has(id) || resultado.length >= 3) return;
    const req = getRequerimento(id);
    if (req) {
      adicionados.add(id);
      resultado.push({
        id: req.id,
        titulo: req.title,
        descricao: req.description,
        href: caminhoDoRequerimento(req.id),
        tipo: 'Requerimento',
      });
      return;
    }
    const tut = tutoriais.find((t) => t.id === id);
    if (tut) {
      adicionados.add(id);
      resultado.push({
        id: tut.id,
        titulo: tut.titulo,
        descricao: tut.description,
        href: caminhoDoTutorial(tut.id),
        tipo: 'Tutorial',
      });
    }
  };

  if (item.relacionados?.length) {
    for (const relId of item.relacionados) adicionarPorId(relId);
  }

  if (categoria) {
    for (const vizinho of categoria.items) {
      if (resultado.length >= 2) break;
      adicionarPorId(vizinho.id);
    }
  }

  adicionarPorId('situacao-protocolos');
  return resultado.slice(0, 3);
}

function CopiarLink({ path }: { path: string }) {
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!copiado) return;
    const timer = window.setTimeout(() => setCopiado(false), 2500);
    return () => window.clearTimeout(timer);
  }, [copiado]);

  const copiar = async () => {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
    } catch {
      window.prompt('Copie o link deste requerimento:', url);
    }
  };

  return (
    <button
      type="button"
      onClick={copiar}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 px-4 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-white"
    >
      {copiado ? (
        <Check className="h-4 w-4 text-crfal-gold" aria-hidden="true" />
      ) : (
        <Link2 className="h-4 w-4" aria-hidden="true" />
      )}
      <span aria-live="polite">{copiado ? 'Link copiado' : 'Copiar link'}</span>
    </button>
  );
}

function AbaParaQueServe({
  item,
  ehPJ,
  categoriaTitulo,
  acessoUrl,
  acessoLabel,
}: {
  item: RequirementItem;
  ehPJ: boolean;
  categoriaTitulo?: string;
  acessoUrl: string;
  acessoLabel: string;
}) {
  const paragrafos = item.paraQueServe?.length ? item.paraQueServe : [item.description];
  const publicoAlvo =
    item.quemPodeSolicitar ??
    (ehPJ ? 'Empresas e estabelecimentos farmacêuticos (Pessoa jurídica)' : 'Farmacêuticos (Pessoa física)');
  const canal =
    item.acesso?.label === 'Fazer pré-inscrição'
      ? 'Pré-inscrição online pelo CRF AL em Casa'
      : 'CRF AL em Casa';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-crfal-blue sm:text-2xl">Para que serve</h2>
        <div className="mt-3 space-y-3">
          {paragrafos.map((paragrafo, idx) => (
            <p key={idx} className="text-[15px] leading-relaxed text-crfal-gray-700 sm:text-base">
              {paragrafo}
            </p>
          ))}
        </div>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-crfal-gray-200 bg-crfal-gray-50/70 p-4">
          <dt className={goldLabel}>Quem pode solicitar</dt>
          <dd className="mt-1 text-sm font-semibold text-crfal-blue-dark">{publicoAlvo}</dd>
        </div>
        <div className="rounded-xl border border-crfal-gray-200 bg-crfal-gray-50/70 p-4">
          <dt className={goldLabel}>Onde solicitar</dt>
          <dd className="mt-1 text-sm font-semibold text-crfal-blue-dark">{canal}</dd>
        </div>
        {item.prazo && (
          <div className="rounded-xl border border-crfal-gray-200 bg-crfal-gray-50/70 p-4">
            <dt className={goldLabel}>Prazo</dt>
            <dd className="mt-1 text-sm font-semibold text-crfal-blue-dark">{item.prazo}</dd>
          </div>
        )}
        {categoriaTitulo && (
          <div className="rounded-xl border border-crfal-gray-200 bg-crfal-gray-50/70 p-4">
            <dt className={goldLabel}>Categoria</dt>
            <dd className="mt-1 text-sm font-semibold text-crfal-blue-dark">{categoriaTitulo}</dd>
          </div>
        )}
      </dl>

      {item.fluxogramaUrl && (
        <section aria-labelledby="fluxograma-heading" className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-[#8A6A12]" aria-hidden="true" />
            <h3 id="fluxograma-heading" className="text-lg font-bold text-crfal-blue">
              Fluxograma do requerimento
            </h3>
          </div>
          <div className="overflow-hidden rounded-xl border border-crfal-gray-200 bg-crfal-gray-50 p-3 sm:p-5">
            <img
              src={item.fluxogramaUrl}
              alt={`Fluxograma do requerimento ${item.title}`}
              loading="lazy"
              decoding="async"
              className="mx-auto h-auto w-full rounded-lg bg-white object-contain shadow-xs"
            />
          </div>
        </section>
      )}

      <div className="hidden border-t border-crfal-gray-200 pt-5 lg:flex lg:items-center lg:justify-between lg:gap-4">
        <p className="text-sm text-crfal-gray-600">
          Confira também o passo a passo e a lista de documentos nas abas ao lado antes de enviar.
        </p>
        <ArrowFillButton href={acessoUrl} target="_blank" rel="noopener noreferrer">
          {acessoLabel}
          <span className="sr-only"> (abre em nova aba)</span>
        </ArrowFillButton>
      </div>
    </div>
  );
}

function AbaPassoAPasso({
  item,
  videoEmbedUrl,
}: {
  item: RequirementItem;
  videoEmbedUrl: string | null;
}) {
  const [videoCarregado, setVideoCarregado] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-crfal-blue sm:text-2xl">Passo a passo</h2>
        <p className="mt-1 text-sm text-crfal-gray-600">
          Siga as etapas abaixo para enviar sua solicitação pelo sistema do CRF-AL.
        </p>
      </div>

      {videoEmbedUrl && (
        <section aria-label="Vídeo tutorial" className="space-y-2.5">
          <div className="overflow-hidden rounded-xl border border-crfal-gray-200 bg-crfal-blue-dark shadow-xs">
            {videoCarregado ? (
              <div className="aspect-video bg-black">
                <iframe
                  src={`${videoEmbedUrl}&autoplay=1`}
                  title={`Vídeo tutorial: ${item.title}`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="relative flex aspect-video flex-col items-center justify-center bg-linear-to-br/srgb from-crfal-blue to-crfal-blue-dark p-6 text-center text-white">
                <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 ring-2 ring-crfal-gold/70">
                  <Play className="h-6 w-6 translate-x-0.5 text-crfal-gold" aria-hidden="true" />
                </span>
                <p className="text-base font-bold sm:text-lg">Tutorial em vídeo: {item.title}</p>
                <p className="mt-1 max-w-md text-xs text-white/75 sm:text-sm">
                  O vídeo do YouTube é carregado apenas quando você clica no botão abaixo.
                </p>
                <button
                  type="button"
                  onClick={() => setVideoCarregado(true)}
                  className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-crfal-blue shadow-xs transition-colors hover:bg-crfal-blue-lighter focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-crfal-blue-dark"
                >
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Assistir vídeo tutorial
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      <ol className="mt-4">
        {item.instrucoes.map((instrucao, index) => (
          <li key={index} className="flex gap-3.5 px-1">
            <span className="flex flex-col items-center">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-crfal-blue text-sm font-bold text-white ring-2 ring-crfal-gold/30"
              >
                {index + 1}
              </span>
              {index < item.instrucoes.length - 1 && (
                <span aria-hidden="true" className="mt-1 block w-px flex-1 bg-crfal-gray-200" />
              )}
            </span>
            <p className="min-w-0 pb-5 pt-1 text-[15px] leading-relaxed text-crfal-gray-700">
              {instrucao}
            </p>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-3 rounded-xl border border-crfal-gray-200 bg-crfal-gray-50/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <FileClock className="mt-0.5 h-5 w-5 shrink-0 text-crfal-blue" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold text-crfal-blue-dark">Acompanhe em Protocolos Web</p>
            <p className="mt-0.5 text-xs leading-relaxed text-crfal-gray-600 sm:text-sm">
              Depois de enviar, acompanhe o andamento da solicitação pelo número de protocolo.
            </p>
          </div>
        </div>
        <Link
          to="/servicos/tutoriais/situacao-protocolos"
          className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-crfal-blue/30 bg-white px-4 py-2 text-sm font-semibold text-crfal-blue hover:border-crfal-blue hover:bg-crfal-blue-lighter/50 ${motion} ${focusRing}`}
        >
          Ver como acompanhar
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {!videoEmbedUrl && (
        <div className="rounded-xl border border-crfal-gray-200 bg-white p-4 sm:p-5">
          <p className="text-sm font-semibold text-crfal-blue-dark">
            Ainda não temos vídeo deste requerimento. Ficou com dúvida? Fale com o atendimento.
          </p>
          <p className="mt-0.5 text-xs text-crfal-gray-600">
            Atendimento: {HORARIO_ATENDIMENTO.toLowerCase()}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={`https://wa.me/55${ATENDIMENTO.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-crfal-gray-300 bg-white px-4 text-sm font-semibold text-crfal-blue hover:border-crfal-blue ${motion} ${focusRing}`}
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
            <a
              href={telefoneHref(ATENDIMENTO.telefone)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-crfal-gray-300 bg-white px-4 text-sm font-semibold text-crfal-blue hover:border-crfal-blue ${motion} ${focusRing}`}
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {ATENDIMENTO.telefone}
            </a>
            <a
              href={`mailto:${ATENDIMENTO.email}`}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-crfal-gray-300 bg-white px-4 text-sm font-semibold text-crfal-blue hover:border-crfal-blue ${motion} ${focusRing}`}
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {ATENDIMENTO.email}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function AbaFormularioEDocumentos({
  item,
  observacoes,
  acessoUrl,
  acessoLabel,
}: {
  item: RequirementItem;
  observacoes: string[];
  acessoUrl: string;
  acessoLabel: string;
}) {
  const nomeArquivo = item.downloadUrl ? extrairNomeArquivo(item.downloadUrl) : null;

  return (
    <div className="space-y-8">
      <section aria-labelledby="formulario-heading" className="space-y-3">
        <h2 id="formulario-heading" className="text-xl font-bold text-crfal-blue sm:text-2xl">
          Formulário
        </h2>
        {item.downloadUrl && nomeArquivo ? (
          <div className="flex flex-col gap-4 rounded-xl border border-crfal-blue/20 bg-crfal-blue-lighter/35 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="min-w-0">
              <p className={goldLabel}>Arquivo para preenchimento (.docx)</p>
              <p className="mt-1 break-all text-sm font-bold text-crfal-blue-dark sm:text-base">
                {nomeArquivo}
              </p>
            </div>
            <a
              href={item.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-crfal-blue px-5 py-3 text-sm font-bold text-white shadow-xs hover:bg-crfal-blue-dark ${motion} ${focusRing}`}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Baixar formulário (.docx)
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-4 rounded-xl border border-crfal-gray-200 bg-crfal-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <p className="text-sm leading-relaxed text-crfal-gray-700 sm:text-[15px]">
              Este requerimento é feito direto no CRF AL em Casa, sem formulário para baixar.
            </p>
            <a
              href={acessoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border-2 border-crfal-blue bg-white px-5 py-2.5 text-sm font-bold text-crfal-blue hover:bg-crfal-blue hover:text-white ${motion} ${focusRing}`}
            >
              {acessoLabel}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          </div>
        )}
      </section>

      <section aria-labelledby="documentos-heading" className="space-y-3">
        <h2 id="documentos-heading" className="text-xl font-bold text-crfal-blue sm:text-2xl">
          Documentos necessários
        </h2>
        <ChecklistDocumentos item={item} observacoes={observacoes} />
      </section>

      <div className="hidden border-t border-crfal-gray-200 pt-5 lg:flex lg:items-center lg:justify-between lg:gap-4">
        <p className="text-sm text-crfal-gray-600">
          Reuniu os documentos? Envie o requerimento pelo sistema online do CRF-AL.
        </p>
        <ArrowFillButton href={acessoUrl} target="_blank" rel="noopener noreferrer">
          {acessoLabel}
          <span className="sr-only"> (abre em nova aba)</span>
        </ArrowFillButton>
      </div>
    </div>
  );
}

function ConteudoRequerimento({ item }: { item: RequirementItem }) {
  const path = caminhoDoRequerimento(item.id);
  const perfil = perfilDoRequerimento(item.id);
  const ehPJ = perfil === 'pessoa-juridica';
  const categoria = useMemo(() => encontrarCategoria(item.id), [item.id]);
  const observacoes = useMemo(() => observacoesDoRequerimento(item), [item]);
  const videoEmbedUrl = useMemo(() => getYouTubeEmbedUrl(item.videoUrl), [item.videoUrl]);
  const relacionados = useMemo(() => obterRelacionados(item, categoria), [item, categoria]);

  const acessoUrl = item.acesso?.url ?? CRF_EM_CASA_URL;
  const acessoLabel = item.acesso?.label ?? ROTULO_ACAO_PADRAO;
  const PerfilIcon = ehPJ ? Building2 : PillBottle;
  const perfilLabel = ehPJ ? 'Empresas' : 'Farmacêuticos';
  // O prazo genérico não diz nada: só vira chip quando é específico.
  const prazoEspecifico = item.prazo && item.prazo !== PRAZO_GENERICO ? item.prazo : undefined;
  const canalLabel =
    item.acesso?.label === 'Fazer pré-inscrição' ? 'Pré-inscrição online' : 'Pelo CRF AL em Casa';

  const navigate = useNavigate();
  const abasRef = useRef<HTMLDivElement>(null);
  // As abas mantêm o `#` em dia; daqui só se lê se o passo a passo está à vista.
  const { hash, key } = useLocation();
  const navigationType = useNavigationType();
  const passoAPassoAberto = hash === '#passo-a-passo';
  const tutorial = item.tutorialId ? tutoriais.find((t) => t.id === item.tutorialId) : undefined;
  const [concluiu, setConcluiu] = useState(false);

  // Chips do hero: troca a aba pelo `#` (sem nova entrada no histórico) e rola até as abas.
  const irParaAba = (event: MouseEvent<HTMLAnchorElement>, aba: AbaRequerimentoId) => {
    event.preventDefault();
    navigate({ hash: `#${aba}` }, { replace: true, preventScrollReset: true });
    abasRef.current?.scrollIntoView({ block: 'start' });
  };

  // Aberta com `#passo-a-passo` ou `#formulario` (link direto, 301 dos tutoriais espelho): o `#` é
  // id de aba, não de elemento, então o HashScroll não acha alvo. Rola até as abas aqui, uma vez,
  // descontando o cabeçalho fixo (scroll-mt). No “Voltar” fica a posição do ScrollRestoration.
  const aberturaRef = useRef({ hash, key, navigationType });
  useEffect(() => {
    const abertura = aberturaRef.current;
    if (abertura.hash !== '#passo-a-passo' && abertura.hash !== '#formulario') return;
    if (abertura.navigationType === 'POP' && abertura.key !== 'default') return;
    return rolarAteAlvo(() => abasRef.current, true);
  }, []);

  // Medição com o id do tutorial (mesma série da página de tutorial); `abrir` uma vez, ao ver a aba.
  const abriuTutorial = useRef(false);
  useEffect(() => {
    if (!tutorial || !passoAPassoAberto || abriuTutorial.current) return;
    abriuTutorial.current = true;
    medir('abrir', { tarefa: tutorial.id });
  }, [tutorial, passoAPassoAberto]);

  // Barra fixa no celular não pode cobrir o rodapé.
  useEffect(() => {
    document.body.classList.add('max-lg:pb-20');
    return () => document.body.classList.remove('max-lg:pb-20');
  }, []);

  const abas: readonly ItemAba<AbaRequerimentoId>[] = [
    {
      id: 'para-que-serve',
      rotulo: 'Para que serve',
      icone: <Info className="h-4 w-4 shrink-0" aria-hidden="true" />,
      conteudo: (
        <AbaParaQueServe
          item={item}
          ehPJ={ehPJ}
          categoriaTitulo={categoria?.title}
          acessoUrl={acessoUrl}
          acessoLabel={acessoLabel}
        />
      ),
    },
    {
      id: 'passo-a-passo',
      rotulo: 'Passo a passo',
      icone: <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />,
      contador: tutorial ? GUIAS[tutorial.id].passos.length : item.instrucoes.length,
      conteudo: tutorial ? (
        // Compensa o padding do painel (20/28 px) para o vídeo fixo do celular sangrar até a borda, como no section-panel (16/24/32 px).
        <div className="-mx-1 md:mx-1 lg:mx-0">
          <TutorialDetail
            tutorial={tutorial}
            embutido
            visivel={passoAPassoAberto}
            onConcluir={() => setConcluiu(true)}
            acao={(destaque) => (
              <BotaoAcao href={acessoUrl} rotulo={acessoLabel} tarefa={tutorial.id} destaque={destaque} />
            )}
            linkDocumentos={{ to: '#formulario', onClick: (e) => irParaAba(e, 'formulario') }}
          />
        </div>
      ) : (
        <AbaPassoAPasso item={item} videoEmbedUrl={videoEmbedUrl} />
      ),
    },
    {
      id: 'formulario',
      rotulo: (
        <>
          Formulário<span className="hidden sm:inline"> e documentos</span>
        </>
      ),
      icone: <ListChecks className="h-4 w-4 shrink-0" aria-hidden="true" />,
      contador: item.documentos.length,
      conteudo: (
        <AbaFormularioEDocumentos
          item={item}
          observacoes={observacoes}
          acessoUrl={acessoUrl}
          acessoLabel={acessoLabel}
        />
      ),
    },
  ];

  const metaSeo = PAGE_METADATA[path] ?? { title: item.title, description: item.description };

  return (
    <div className="min-h-screen">
      <SEO title={metaSeo.title} description={metaSeo.description} path={path} />

      <PageHero
        breadcrumb={[
          { label: 'Início', href: '/' },
          { label: 'Serviços' },
          { label: 'Requerimentos', href: `/servicos/requerimentos?perfil=${perfil}` },
          { label: item.title },
        ]}
        eyebrow={`Requerimento · ${perfilLabel}`}
        section="servicos"
        title={item.title}
        lead={item.description}
        actions={<CopiarLink path={path} />}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
            <PerfilIcon className="h-3.5 w-3.5 text-crfal-gold" aria-hidden="true" />
            {perfilLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
            {canalLabel}
          </span>
          {prazoEspecifico && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
              <Clock className="h-3.5 w-3.5 text-crfal-gold" aria-hidden="true" />
              Prazo: {prazoEspecifico}
            </span>
          )}
          {videoEmbedUrl && (
            <a
              href="#passo-a-passo"
              onClick={(e) => irParaAba(e, 'passo-a-passo')}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-white/30 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-white hover:bg-white/15 focus-visible:outline-white"
            >
              <Play className="h-3.5 w-3.5 text-crfal-gold" aria-hidden="true" />
              Tutorial em vídeo
            </a>
          )}
          {item.downloadUrl && (
            <a
              href="#formulario"
              onClick={(e) => irParaAba(e, 'formulario')}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-white/30 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-white hover:bg-white/15 focus-visible:outline-white"
            >
              <Download className="h-3.5 w-3.5 text-crfal-gold" aria-hidden="true" />
              Formulário .docx
            </a>
          )}
        </div>
      </PageHero>

      <div className="container-crfal py-6 md:py-10">
        {/* Aviso: Leia antes de começar */}
        <section
          aria-labelledby="leia-antes-heading"
          className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3.5 sm:px-5 sm:py-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <h2
                id="leia-antes-heading"
                className="text-xs font-bold uppercase tracking-[0.12em] text-amber-900"
              >
                Leia antes de começar
              </h2>
              {observacoes.map((obs, index) => (
                <p
                  key={index}
                  className="whitespace-pre-line text-[13.5px] leading-relaxed text-amber-950"
                >
                  {obs}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* Três abas do requerimento */}
        <div ref={abasRef} className="scroll-mt-(--header-offset)">
          <Abas ariaLabel="Informações do requerimento" abas={abas} />
        </div>

        {/* Relacionados */}
        {relacionados.length > 0 && (
          <section aria-labelledby="relacionados-heading" className="mt-10 md:mt-12">
            <p className={goldLabel}>Veja também</p>
            <h2
              id="relacionados-heading"
              className="mt-1 text-xl font-bold text-crfal-blue sm:text-2xl"
            >
              Serviços e requerimentos relacionados
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relacionados.map((rel) => (
                <li key={rel.id}>
                  <Link
                    to={rel.href}
                    className={`group flex h-full flex-col justify-between rounded-xl border border-crfal-gray-200 bg-white p-4 shadow-xs hover:border-crfal-blue/40 hover:bg-crfal-blue-lighter/30 ${motion} ${focusRing}`}
                  >
                    <div>
                      <span className={goldLabel}>{rel.tipo}</span>
                      <span className="mt-1 block text-base font-bold text-crfal-blue-dark group-hover:text-crfal-blue">
                        {rel.titulo}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-crfal-gray-600">
                        {rel.descricao}
                      </span>
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-crfal-blue">
                      Acessar
                      <ArrowRight
                        className={`h-3.5 w-3.5 group-hover:translate-x-0.5 ${motion}`}
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Barra de ação fixa no celular (vale para as 3 abas); no passo a passo, mede e destaca como no tutorial. */}
      <div className="glass-light fixed inset-x-0 bottom-0 z-30 border-t border-crfal-gray-200 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:hidden">
        <BotaoAcao
          href={acessoUrl}
          rotulo={acessoLabel}
          tarefa={passoAPassoAberto ? tutorial?.id : undefined}
          destaque={passoAPassoAberto && concluiu}
        />
      </div>
    </div>
  );
}

export default function RequirementDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const item = slug ? getRequerimento(slug) : undefined;

  if (!item) return <Navigate to="/servicos/requerimentos" replace />;
  return <ConteudoRequerimento key={item.id} item={item} />;
}
