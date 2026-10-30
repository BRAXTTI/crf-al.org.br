import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { marcarMostradas } from './estado';
import { EVENTO_BANNER_FIM, EVENTO_NOVIDADE, abrirPainel, bannerBloqueado, marcarSessaoBanner, observarSinal, lerSinal } from './sinal';

/*
  Banner único de novidades: avisa que há o que ver, sem listar o conteúdo, que fica só no
  painel do sino. Sobe da borda de baixo no celular e desce de sob o cabeçalho no desktop,
  perto do sino. A animação é CSS (`[data-notification-banner]` em src/index.css).

  Some sozinho depois de VISIVEL_MS (pausa com ponteiro, foco ou aba oculta; ao retomar,
  pelo menos RETOMADA_MS) e assim que o visitante rola a página (ROLAGEM_PX), porque fica
  sobre o conteúdo e não pode atrapalhar o que está por baixo. O sino continua com o contador.
*/

const VISIVEL_MS = 8000;
const RETOMADA_MS = 2000;
/** Igual à duração de `banner-saida` em src/index.css. */
const SAIDA_MS = 160;
/** A região viva precisa existir antes do texto para o leitor de tela anunciar. */
const ANUNCIO_MS = 150;
const RESPIRO_PX = 10;
/** Rolagem que tira o banner do caminho (menos que isso pode ser só um toque impreciso). */
const ROLAGEM_PX = 80;

/** O sino visível (há um no desktop e outro no celular; o outro fica oculto por CSS). */
function sinoVisivel() {
  return [...document.querySelectorAll<HTMLElement>('[data-notification-bell] > button')].find((botao) => botao.getBoundingClientRect().width > 0);
}

const medirTopo = () => Math.round(document.querySelector('header')?.getBoundingClientRect().bottom ?? 0) + RESPIRO_PX;

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
  const [topo, setTopo] = useState(medirTopo);
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

  // Bloqueado ao montar (pop-up ou menu abriram enquanto os dados chegavam): nada aparece e a sessão não conta.
  useLayoutEffect(() => {
    if (iniciou.current) return;
    iniciou.current = true;
    if (bannerBloqueado()) return terminar();
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

  // Desktop: o topo acompanha o cabeçalho (a faixa utilitária recolhe ao rolar).
  useEffect(() => {
    let quadro = 0;
    const inicio = window.scrollY;
    const atualizar = () => {
      // Com foco de teclado dentro do banner, a rolagem não o tira de baixo do visitante.
      if (Math.abs(window.scrollY - inicio) > ROLAGEM_PX && !raizRef.current?.contains(document.activeElement)) setSaindo(true);
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => setTopo(medirTopo()));
    };
    window.addEventListener('scroll', atualizar, { passive: true });
    window.addEventListener('resize', atualizar);
    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener('scroll', atualizar);
      window.removeEventListener('resize', atualizar);
    };
  }, []);

  return (
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
        className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-[432px] items-center overflow-hidden rounded-2xl border border-crfal-gray-200 bg-white shadow-[0_12px_32px_-12px_rgba(11,25,44,0.45)] lg:inset-x-auto lg:bottom-auto lg:right-[max(2rem,calc((100vw_-_80rem)/2_+_2rem))] lg:top-(--banner-topo) lg:mx-0 lg:w-[320px] lg:transition-[top] lg:duration-300 motion-reduce:transition-none"
        style={{ '--banner-topo': `${topo}px` } as React.CSSProperties}
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
          className="group flex min-h-14 min-w-0 flex-1 items-center gap-3 py-2 pl-3 pr-1 text-left transition-colors hover:bg-crfal-blue-lighter/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-crfal-blue"
        >
          <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-crfal-blue-lighter text-crfal-blue">
            <Bell className="size-[18px]" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold leading-5 text-crfal-blue-dark">Há novidades no site</span>
            <span className="block text-[13px] font-semibold leading-[18px] text-crfal-blue tabular-nums group-hover:underline">Ver {texto}</span>
          </span>
        </button>
        <button
          type="button"
          data-banner-close
          aria-label="Fechar aviso de novidades"
          onClick={fechar}
          className="mr-1 grid size-11 shrink-0 place-items-center rounded-xl text-crfal-gray-600 transition-colors hover:bg-crfal-blue-lighter hover:text-crfal-blue focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-crfal-blue"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </>
  );
}
