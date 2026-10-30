import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X } from 'lucide-react';
import { marcarMostradas } from './estado';
import { EVENTO_BANNER_FIM, EVENTO_NOVIDADE, abrirPainel, bannerBloqueado, marcarSessaoBanner, observarSinal, lerSinal } from './sinal';

/*
  Banner único de novidades: avisa que há o que ver, sem listar o conteúdo, que fica só no
  painel do sino. Mora dentro do cabeçalho, em espaço livre, para nunca cobrir controles nem
  títulos da página: na faixa utilitária no desktop; abaixo disso, no vão entre o menu e o
  sino (abaixo de 768px o vão só existe com o logo oculto, ver `[data-site-logo]` em
  src/index.css). A animação é CSS (`[data-notification-banner]` em src/index.css).

  Some sozinho depois de VISIVEL_MS (pausa com ponteiro, foco ou aba oculta; ao retomar,
  pelo menos RETOMADA_MS) e ao rolar a página: no desktop assim que a faixa utilitária recolhe
  (FAIXA_RECOLHE_PX), abaixo disso depois de ROLAGEM_PX. O sino continua com o contador.
*/

const VISIVEL_MS = 8000;
const RETOMADA_MS = 2000;
/** Igual à duração de `banner-saida` em src/index.css. */
const SAIDA_MS = 160;
/** A região viva precisa existir antes do texto para o leitor de tela anunciar. */
const ANUNCIO_MS = 150;
/** Mesma largura do `lg` e do menu móvel do cabeçalho. */
const DESKTOP_PX = 1024;
/** Igual ao limite de `scrolled` do cabeçalho: depois disso a faixa utilitária recolhe. */
const FAIXA_RECOLHE_PX = 8;
/** Rolagem que tira o banner do caminho (menos que isso pode ser só um toque impreciso). */
const ROLAGEM_PX = 80;

/** O sino visível (há um no desktop e outro no celular; o outro fica oculto por CSS). */
function sinoVisivel() {
  return [...document.querySelectorAll<HTMLElement>('[data-notification-bell] > button')].find((botao) => botao.getBoundingClientRect().width > 0);
}

const faixaRecolhida = () => window.innerWidth >= DESKTOP_PX && window.scrollY > FAIXA_RECOLHE_PX;

interface NotificationBannerProps {
  /** Candidatas do portão: ficam como já avisadas assim que o banner aparece. */
  ids: string[];
  /** Mesmo número do contador do sino. */
  naoLidas: number;
  onFim: () => void;
}

export default function NotificationBanner({ ids, naoLidas, onFim }: NotificationBannerProps) {
  const [saindo, setSaindo] = useState(false);
  const [aviso, setAviso] = useState('');
  const [ponteiro, setPonteiro] = useState(false);
  const [foco, setFoco] = useState(false);
  const [oculta, setOculta] = useState(() => document.hidden);
  const raizRef = useRef<HTMLDivElement>(null);
  const iniciou = useRef(false);
  const terminou = useRef(false);
  const restante = useRef(VISIVEL_MS);

  // Tudo já lido em outra aba: não há mais do que avisar.
  if (naoLidas === 0 && !saindo) setSaindo(true);

  const texto = naoLidas === 1 ? '1 não lida' : `${naoLidas} não lidas`;

  const terminar = useCallback(() => {
    if (terminou.current) return;
    terminou.current = true;
    window.dispatchEvent(new Event(EVENTO_BANNER_FIM));
    onFim();
  }, [onFim]);

  // Bloqueado ao montar (pop-up ou menu abriram enquanto os dados chegavam, ou a faixa do desktop já recolheu): nada aparece e a sessão não conta.
  useLayoutEffect(() => {
    if (iniciou.current) return;
    iniciou.current = true;
    if (bannerBloqueado() || faixaRecolhida()) return terminar();
    marcarSessaoBanner();
    marcarMostradas(ids);
    window.dispatchEvent(new Event(EVENTO_NOVIDADE));
  }, [ids, terminar]);

  useEffect(() => {
    const timer = window.setTimeout(() => setAviso(`Há novidades no site: ${texto}. Veja no sino de notificações.`), ANUNCIO_MS);
    return () => window.clearTimeout(timer);
  }, [texto]);

  useEffect(() => {
    if (!saindo) return;
    const timer = window.setTimeout(terminar, SAIDA_MS);
    return () => window.clearTimeout(timer);
  }, [saindo, terminar]);

  useEffect(() => observarSinal(() => lerSinal().painelAberto && setSaindo(true)), []);

  const pausado = ponteiro || foco || oculta;
  useEffect(() => {
    if (saindo || pausado) return;
    const inicio = performance.now();
    const espera = restante.current;
    const timer = window.setTimeout(() => setSaindo(true), espera);
    return () => {
      window.clearTimeout(timer);
      restante.current = Math.max(RETOMADA_MS, espera - (performance.now() - inicio));
    };
  }, [saindo, pausado]);

  /** Fechado pelo teclado: o foco vai para o sino, que é onde o conteúdo continua. */
  const fechar = useCallback(() => {
    if (raizRef.current?.contains(document.activeElement)) sinoVisivel()?.focus({ preventScroll: true });
    setSaindo(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) fechar();
    };
    const onVisibilidade = () => setOculta(document.hidden);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('visibilitychange', onVisibilidade);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', onVisibilidade);
    };
  }, [fechar]);

  useEffect(() => {
    const inicio = window.scrollY;
    const atualizar = () => {
      // Sem a faixa utilitária não há onde ficar: sai mesmo com foco, que volta para o sino.
      if (faixaRecolhida()) return fechar();
      // Com foco de teclado dentro do banner, a rolagem não o tira de baixo do visitante.
      if (window.innerWidth < DESKTOP_PX && Math.abs(window.scrollY - inicio) > ROLAGEM_PX && !raizRef.current?.contains(document.activeElement)) setSaindo(true);
    };
    window.addEventListener('scroll', atualizar, { passive: true });
    window.addEventListener('resize', atualizar);
    return () => {
      window.removeEventListener('scroll', atualizar);
      window.removeEventListener('resize', atualizar);
    };
  }, [fechar]);

  const conteudo = (
    <>
      <p role="status" aria-live="polite" className="sr-only">
        {aviso}
      </p>
      <div
        ref={raizRef}
        role="region"
        aria-label="Aviso de novidades"
        data-notification-banner
        data-state={saindo ? 'saindo' : 'visivel'}
        // Larguras do menu (44px) e do sino com a busca (88px), mais 2px de respiro; no desktop, antes das redes sociais.
        className="fixed left-[calc(1rem+46px)] right-[calc(1rem+90px)] top-2.5 z-10 mx-auto flex h-11 w-fit items-stretch overflow-hidden rounded-xl border border-crfal-gray-200 bg-white shadow-[0_8px_20px_-10px_rgba(11,25,44,0.5)] sm:left-[calc(1.5rem+46px)] sm:right-[calc(1.5rem+90px)] md:left-auto md:mx-0 lg:right-[calc(max(2rem,calc((100vw_-_80rem)/2_+_2rem))+8rem)] lg:top-0.5 lg:h-7 lg:rounded-lg lg:shadow-none"
        onPointerEnter={(event) => event.pointerType !== 'touch' && setPonteiro(true)}
        onPointerLeave={() => setPonteiro(false)}
        onFocus={() => setFoco(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFoco(false);
        }}
      >
        <button
          type="button"
          data-banner-open
          aria-label={`Há novidades no site: ${texto}. Abrir notificações`}
          onClick={() => {
            setSaindo(true);
            abrirPainel();
          }}
          className="group flex min-w-0 flex-1 items-center gap-2 pl-2.5 pr-0.5 text-left whitespace-nowrap transition-colors hover:bg-crfal-blue-lighter/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-crfal-blue"
        >
          <Bell aria-hidden className="hidden size-3.5 shrink-0 text-crfal-blue lg:block" />
          <span className="hidden text-[13px] font-bold text-crfal-blue-dark lg:inline">Há novidades no site</span>
          <span className="truncate text-[13px] font-semibold text-crfal-blue tabular-nums group-hover:underline">Ver {texto}</span>
        </button>
        <button
          type="button"
          data-banner-close
          aria-label="Fechar aviso de novidades"
          onClick={fechar}
          className="grid w-8 shrink-0 place-items-center text-crfal-gray-600 transition-colors hover:bg-crfal-blue-lighter hover:text-crfal-blue focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-crfal-blue"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      </div>
    </>
  );

  const cabecalho = document.querySelector('header');
  return cabecalho ? createPortal(conteudo, cabecalho) : conteudo;
}
