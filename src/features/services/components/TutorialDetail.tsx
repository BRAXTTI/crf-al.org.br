import { useState, type MouseEvent, type ReactNode } from 'react';
import { Link, type To } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronDown, ListChecks, Mail, MessageCircle, Phone, Play } from 'lucide-react';
import { ATENDIMENTO, HORARIO_ATENDIMENTO, SETOR_CONTATOS, telefoneHref } from '@/config/contact';
import { caminhoDoTutorial } from '@/config/redirects-servicos';
import { getRequerimento } from '@/data/requerimentos';
import { tutoriais, type Tutorial } from '@/data/servicos';
import { GUIAS, type GuiaTutorial, type VideoGuia } from '@/data/tutoriais-guias';
import { medir } from '@/lib/medir';
import { telaDe } from '../tela';
import PassosComVideo from './PassosComVideo';

const focusRing = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2';
const motion = 'transition duration-200 motion-reduce:transition-none';
const tituloBloco = 'text-lg font-bold text-crfal-blue';

function temVideo(guia: GuiaTutorial): guia is GuiaTutorial & { video: VideoGuia } {
  return Boolean(guia.video);
}

/** Botão de ação do tutorial; com `tarefa`, o clique conta na medição. */
export function BotaoAcao({ href, rotulo, tarefa, destaque, className = '' }: { href: string; rotulo: string; tarefa?: string; destaque: boolean; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => tarefa && medir('acao', { tarefa })}
      className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-crfal-blue px-5 text-[15px] font-bold text-white shadow-xs hover:bg-crfal-blue-dark ${motion} ${focusRing} ${destaque ? 'ring-4 ring-crfal-gold' : ''} ${className}`}
    >
      {rotulo}
      <ArrowUpRight className="h-4 w-4" aria-hidden />
      <span className="sr-only">(abre em uma nova aba)</span>
    </a>
  );
}

/** Destino do "Ver documentos (N)": a página decide (modal da lista ou aba do requerimento). */
export interface LinkDocumentos {
  to: To;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

function Antes({ tutorial, guia, linkDocumentos, onde }: { tutorial: Tutorial; guia: GuiaTutorial; linkDocumentos?: LinkDocumentos; onde?: 'celular' | 'desktop' }) {
  const requerimento = tutorial.requerimentoId ? getRequerimento(tutorial.requerimentoId) : undefined;
  const lista = (
    <>
      <ul className="space-y-1.5">
        {guia.antes.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[15px] leading-snug text-crfal-gray-700">
            <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-crfal-gold" />
            {item}
          </li>
        ))}
      </ul>
      {requerimento && linkDocumentos && (
        <Link to={linkDocumentos.to} onClick={linkDocumentos.onClick} className={`mt-1.5 inline-flex min-h-11 items-center gap-1.5 rounded text-sm font-semibold text-crfal-blue underline-offset-4 hover:underline ${focusRing}`}>
          <ListChecks className="h-4 w-4 text-[#8A6A12]" aria-hidden />
          Ver documentos ({requerimento.documentos.length})
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </>
  );
  return (
    <>
      {onde !== 'celular' && (
        <div className="hidden lg:block">
          <h2 className={`${tituloBloco} mb-3`}>Antes de começar</h2>
          {lista}
        </div>
      )}
      {onde !== 'desktop' && (
        /* No celular com vídeo fixo, recolhe para os passos ficarem à vista; sem vídeo, há espaço. */
        <details open={!guia.video || undefined} className="group rounded-xl border border-crfal-gray-200 bg-crfal-gray-50 lg:hidden">
          <summary className={`flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-3.5 py-2 text-sm font-semibold text-crfal-blue-dark [&::-webkit-details-marker]:hidden ${focusRing}`}>
            <span className="min-w-0 truncate">Antes de começar{guia.video && `: ${guia.antes.join(' · ')}`}</span>
            <ChevronDown className={`h-4 w-4 shrink-0 group-open:rotate-180 ${motion}`} aria-hidden />
          </summary>
          <div className="px-3.5 pb-3">{lista}</div>
        </details>
      )}
    </>
  );
}

function PassosSemVideo({ guia }: { guia: GuiaTutorial }) {
  return (
    <>
      <h2 className={`${tituloBloco} mt-8`}>Passos</h2>
      <ol className="mt-3">
        {guia.passos.map((passo, indice) => (
          <li key={passo.titulo} className="flex gap-3 px-1.5">
            <span className="flex flex-col items-center">
              <span aria-hidden className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-crfal-blue-lighter text-sm font-bold text-crfal-blue">{indice + 1}</span>
              {indice < guia.passos.length - 1 && <span aria-hidden className="mt-1 block w-px flex-1 bg-crfal-gray-200" />}
            </span>
            <span className="block min-w-0 pb-4 pt-1.5">
              <span className="block text-[15px] font-semibold leading-snug text-crfal-blue-dark">{passo.titulo}</span>
              {passo.detalhe && <span className="mt-1 block text-sm leading-snug text-crfal-gray-600">{passo.detalhe}</span>}
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}

function Canal({ href, tarefa, icon, children }: { href: string; tarefa: string; icon: ReactNode; children: ReactNode }) {
  const externo = href.startsWith('http');
  return (
    <a
      href={href}
      onClick={() => medir('contato', { tarefa })}
      {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-crfal-gray-300 bg-white px-4 text-sm font-semibold text-crfal-blue hover:border-crfal-blue ${motion} ${focusRing}`}
    >
      {icon}{children}
      {externo && <span className="sr-only">(abre em uma nova aba)</span>}
    </a>
  );
}

function Retorno({ tutorial, guia }: { tutorial: Tutorial; guia: GuiaTutorial }) {
  const [resposta, setResposta] = useState<'sim' | 'nao' | null>(null);
  const [ajudaAberta, setAjudaAberta] = useState(false);

  const abrirAjuda = () => {
    if (!ajudaAberta) medir('ajuda', { tarefa: tutorial.id });
    setAjudaAberta(!ajudaAberta);
  };
  const responder = (valor: 'sim' | 'nao') => {
    setResposta(valor);
    medir(valor === 'sim' ? 'util_sim' : 'util_nao', { tarefa: tutorial.id });
    if (valor === 'nao' && !ajudaAberta) abrirAjuda();
  };
  const botao = `inline-flex min-h-11 min-w-20 items-center justify-center rounded-full border border-crfal-gray-300 bg-white px-5 text-sm font-semibold text-crfal-blue hover:border-crfal-blue ${motion} ${focusRing}`;

  return (
    <section aria-label="Avaliação e ajuda" className="mt-8 border-t border-crfal-gray-200 pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className={tituloBloco}>Deu certo?</h2>
        {resposta === null && (
          <div className="flex gap-2">
            <button type="button" className={botao} onClick={() => responder('sim')}>Sim</button>
            <button type="button" className={botao} onClick={() => responder('nao')}>Não</button>
          </div>
        )}
        <p role="status" className="text-sm font-medium text-crfal-gray-700">
          {resposta === 'sim' && 'Que bom. Obrigado por responder.'}
          {resposta === 'nao' && 'Obrigado por avisar. Veja abaixo como resolver.'}
        </p>
      </div>

      <button type="button" onClick={abrirAjuda} aria-expanded={ajudaAberta} aria-controls="nao-deu-certo" className={`mt-3 inline-flex min-h-11 items-center gap-1.5 rounded text-sm font-semibold text-crfal-blue underline-offset-4 hover:underline ${focusRing}`}>
        Não deu certo?
        <ChevronDown className={`h-4 w-4 ${motion} ${ajudaAberta ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      <div id="nao-deu-certo" hidden={!ajudaAberta} className="mt-2 rounded-xl border border-crfal-gray-200 bg-crfal-gray-50 p-4">
        <dl className="space-y-3">
          {guia.problemas.map((problema) => (
            <div key={problema.sintoma}>
              <dt className="text-[15px] font-semibold text-crfal-blue-dark">{problema.sintoma}</dt>
              <dd className="mt-0.5 text-sm leading-snug text-crfal-gray-700">{problema.solucao}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm font-semibold text-crfal-blue-dark">Fale com o CRF-AL <span className="font-normal text-crfal-gray-600">({HORARIO_ATENDIMENTO.toLowerCase()})</span></p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Canal href={`https://wa.me/55${ATENDIMENTO.whatsapp.replace(/\D/g, '')}`} tarefa={tutorial.id} icon={<MessageCircle className="h-4 w-4" aria-hidden />}>WhatsApp</Canal>
          <Canal href={telefoneHref(ATENDIMENTO.telefone)} tarefa={tutorial.id} icon={<Phone className="h-4 w-4" aria-hidden />}>{ATENDIMENTO.telefone}</Canal>
          <Canal href={`mailto:${ATENDIMENTO.email}`} tarefa={tutorial.id} icon={<Mail className="h-4 w-4" aria-hidden />}>{ATENDIMENTO.email}</Canal>
          <Canal href={`mailto:${SETOR_CONTATOS.tecnologia.email}`} tarefa={tutorial.id} icon={<Mail className="h-4 w-4" aria-hidden />}>Problema no sistema</Canal>
        </div>
      </div>
    </section>
  );
}

/** Depois da lista de passos: o que acontece a seguir, retorno e continuação. */
function Fechamento({ tutorial, guia }: { tutorial: Tutorial; guia: GuiaTutorial }) {
  const proxima = guia.proxima ? tutoriais.find((t) => t.id === guia.proxima) : undefined;
  return (
    <>
      {guia.depois && (
        <section aria-labelledby="depois-title" className="mt-6">
          <h2 id="depois-title" className={tituloBloco}>{tutorial.id === 'emitir-boletos' ? 'Depois de emitir' : 'O que acontece depois'}</h2>
          <ul className="mt-3 space-y-2">
            {guia.depois.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[15px] leading-snug text-crfal-gray-700">
                <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-crfal-gold" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}
      <Retorno tutorial={tutorial} guia={guia} />
      {proxima && (
        <p className="mt-6 border-t border-crfal-gray-200 pt-5 text-sm text-crfal-gray-600">
          Próxima tarefa:{' '}
          <Link to={caminhoDoTutorial(proxima.id)} className={`inline-flex min-h-11 items-center gap-1.5 rounded font-semibold text-crfal-blue underline-offset-4 hover:underline ${focusRing}`}>
            {proxima.titulo} <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </p>
      )}
    </>
  );
}

/** Sem vídeo curto: link para o vídeo completo, passos e fechamento. */
function CorpoSemVideo({ tutorial, guia }: { tutorial: Tutorial; guia: GuiaTutorial }) {
  return (
    <>
      {guia.videoCompleto && tutorial.videoUrl && (
        <a href={tutorial.videoUrl} target="_blank" rel="noopener noreferrer" onClick={() => medir('video_inicio', { tarefa: tutorial.id })} className={`mt-4 inline-flex min-h-11 items-center gap-1.5 rounded text-sm font-semibold text-crfal-blue underline-offset-4 hover:underline ${focusRing}`}>
          <Play className="h-4 w-4 text-[#8A6A12]" aria-hidden />
          Ver vídeo completo ({guia.videoCompleto})
          <span className="sr-only">no YouTube (abre em uma nova aba)</span>
        </a>
      )}
      <PassosSemVideo guia={guia} />
      <Fechamento tutorial={tutorial} guia={guia} />
    </>
  );
}

interface TutorialDetailProps {
  tutorial: Tutorial;
  /** Botão de ação no desktop; `destaque` quando o último passo do vídeo termina. A barra fixa do celular é da página. */
  acao: (destaque: boolean) => ReactNode;
  linkDocumentos?: LinkDocumentos;
  /** Avisa a página quando o último passo termina (destaque da barra do celular). */
  onConcluir?: () => void;
  /** Falso quando a aba que contém o tutorial está escondida: o vídeo pausa. */
  visivel?: boolean;
  /** Dentro de um painel que já é cartão: sem `section-panel` e o vídeo só baixa ao tocar. */
  embutido?: boolean;
}

/** Conteúdo da tarefa; com vídeo ou capa provisória, duas colunas; sem nenhum dos dois, coluna única. */
export default function TutorialDetail({ tutorial, acao, linkDocumentos, onConcluir, visivel = true, embutido = false }: TutorialDetailProps) {
  const guia = GUIAS[tutorial.id];
  const [concluiu, setConcluiu] = useState(false);
  const capa = guia.capaProvisoria;

  return (
    <section className={embutido ? undefined : 'section-panel overflow-visible! py-5 sm:py-6 lg:py-8'}>
      {temVideo(guia) ? (
        <PassosComVideo
          tarefa={tutorial.id}
          guia={guia}
          visivel={visivel}
          preload={embutido ? 'none' : 'metadata'}
          onConcluir={() => {
            setConcluiu(true);
            onConcluir?.();
          }}
          acao={<div className="mb-4 hidden lg:block">{acao(concluiu)}</div>}
          antesCelular={<Antes tutorial={tutorial} guia={guia} linkDocumentos={linkDocumentos} onde="celular" />}
          antes={<Antes tutorial={tutorial} guia={guia} linkDocumentos={linkDocumentos} onde="desktop" />}
        >
          <Fechamento tutorial={tutorial} guia={guia} />
        </PassosComVideo>
      ) : capa ? (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
          {/* Mesma coluna do vídeo; no celular não fica fixa, pois a imagem não acompanha os passos. */}
          <div className="z-20 -mx-1 min-w-0 self-start bg-white px-1 pb-2 pt-2 lg:pb-0 lg:[@media(min-height:700px)]:sticky lg:[@media(min-height:700px)]:top-[calc(var(--header-offset)+16px)]">
            <div className="mb-4 hidden lg:block">{acao(false)}</div>
            <div className={telaDe('16:9')}>
              <img src={capa.src} alt={capa.alt} width={960} height={540} loading="eager" decoding="async" className="block h-full w-full object-cover" />
            </div>
          </div>
          <div className="min-w-0">
            <Antes tutorial={tutorial} guia={guia} linkDocumentos={linkDocumentos} />
            <CorpoSemVideo tutorial={tutorial} guia={guia} />
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl">
          <div className="sticky top-(--header-offset) z-20 -mx-1 hidden items-center gap-5 bg-white px-1 py-3 lg:flex">
            <div className="w-full max-w-sm">{acao(false)}</div>
          </div>
          <div className="lg:mt-4"><Antes tutorial={tutorial} guia={guia} linkDocumentos={linkDocumentos} /></div>
          <CorpoSemVideo tutorial={tutorial} guia={guia} />
        </div>
      )}
    </section>
  );
}
