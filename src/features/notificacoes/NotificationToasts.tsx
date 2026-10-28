import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { NotificationToastCard } from '@/components/ui/live-notification-feed';
import { marcarLidas, marcarMostradas } from './estado';
import type { FontesNotificacoes } from './fontes';
import { montarNotificacoes } from './montar';
import { EVENTO_CHEGADA, EVENTO_TOASTS_FIM, MAX_TOASTS, definirEmTransito, lerSinal, marcarSessaoToasts, observarSinal, toastsBloqueados } from './sinal';

/*
  Toasts do carregamento, no estilo do banner do iPhone: as não lidas entram uma a uma
  abaixo do cabeçalho (canto direito no desktop, centro no celular) com mola, leve escala
  e desfoque, empilhando-se como no iOS. Depois de alguns segundos a pilha se funde numa
  pílula escura (Dynamic Island), que encolhe e voa até o sino; o sino dá um "bump" e o
  contador volta a contá-las. Só Web Animations API e transições CSS, sem biblioteca.

  Tempos (ms): ENTRADA_MS mola de entrada · INTERVALO_MS entre chegadas · PILHA_MS
  re-empilhamento · ESPERA_MS antes de recolher (pausa com ponteiro/foco; ao retomar,
  pelo menos RETOMADA_MS) · FUSAO_MS → COMPACTA_MS → LEITURA_MS → VOO_MS no recolhimento.
  Movimento reduzido: só esmaecimento curto (REDUZIDO_MS), sem mola, pilha, voo ou bump.
*/

const ENTRADA_MS = 620;
const INTERVALO_MS = 700;
const PILHA_MS = 420;
const SAIDA_MS = 260;
const ESPERA_MS = 4500;
const RETOMADA_MS = 1500;
const FUSAO_MS = 280;
const COMPACTA_MS = 340;
const LEITURA_MS = 180;
const VOO_MS = 560;
const RAPIDO_MS = 240;
const REDUZIDO_MS = 150;
/** Cards de trás: deslocamento visível abaixo do da frente e redução de escala por nível. */
const ESPIA_PX = 10;
const ESCALA_POR_NIVEL = 0.06;
const VAO_PX = 8;
const ARRASTE_LIMIAR_PX = 6;
const ARRASTE_DISPENSA_PX = 48;
/** Fling: velocidade (px/ms) só vale depois de um deslocamento mínimo. */
const ARRASTE_VELOCIDADE = 0.5;
const ARRASTE_FLING_PX = 20;
const RESPIRO_PX = 10;
const PILULA = { largura: 184, altura: 40, ponto: 22 };

const SETTLE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
const EXIT = 'cubic-bezier(0.4, 0, 0.2, 1)';
const SPRING_FALLBACK = 'cubic-bezier(0.2, 0.9, 0.25, 1.12)';

/** Mola subamortecida (resposta ~0,5 s, amortecimento 0,72 ≈ 4% de sobressalto) como `linear()`. */
function mola(duracao: number, amortecimento = 0.72, resposta = 0.5) {
  if (typeof CSS === 'undefined' || !CSS.supports('animation-timing-function', 'linear(0, 1)')) return SPRING_FALLBACK;
  const w0 = (2 * Math.PI) / resposta;
  const wd = w0 * Math.sqrt(1 - amortecimento ** 2);
  const pontos = Array.from({ length: 41 }, (_, i) => {
    const t = (i / 40) * (duracao / 1000);
    const x = 1 - Math.exp(-amortecimento * w0 * t) * (Math.cos(wd * t) + ((amortecimento * w0) / wd) * Math.sin(wd * t));
    return i === 40 ? '1' : x.toFixed(4);
  });
  return `linear(${pontos.join(', ')})`;
}

const esperar = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));
const reduzido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Pausa/expande com ponteiro sobre a pilha ou foco de teclado nela (foco de clique não segura a pausa). */
const engajada = (raiz: HTMLElement) => {
  const ativo = document.activeElement;
  return raiz.matches(':hover') || (raiz.contains(ativo) && Boolean(ativo?.matches(':focus-visible')));
};

/** O sino visível (há um no desktop e outro no celular; o outro fica oculto por CSS). */
function sinoVisivel() {
  return [...document.querySelectorAll<HTMLElement>('[data-notification-bell] > button')].find((botao) => botao.getBoundingClientRect().width > 0);
}

/** Topo dos toasts: abaixo do cabeçalho e de faixas fixas logo abaixo dele (ex.: acesso rápido da home). */
function medirTopo() {
  const header = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
  const faixas = [...document.querySelectorAll('[data-toasts-abaixo]')].map((faixa) => faixa.getBoundingClientRect().bottom);
  return Math.round(Math.max(header, ...faixas.filter((fim) => fim > header && fim < window.innerHeight / 2))) + RESPIRO_PX;
}

type Fase = 'mostrando' | 'fundindo' | 'sumindo' | 'voando';

interface NotificationToastsProps {
  fontes: FontesNotificacoes;
  /** Candidatas (não lidas, não dispensadas, nunca mostradas), já decididas pelo portão. */
  ids: string[];
  onFim: () => void;
}

export default function NotificationToasts({ fontes, ids, onFim }: NotificationToastsProps) {
  const navigate = useNavigate();
  // Retrato na montagem: as mais recentes até três, da mais antiga para a mais nova (a mais nova termina na frente).
  const [itens] = useState(() => {
    const candidatas = new Set(ids);
    return montarNotificacoes(fontes, Date.now())
      .filter(({ item }) => candidatas.has(item.id))
      .slice(-MAX_TOASTS)
      .map(({ item }) => item);
  });
  const [mola620] = useState(() => mola(ENTRADA_MS));
  const [molaCompacta] = useState(() => mola(COMPACTA_MS, 0.8, 0.36));
  const [cursor, setCursor] = useState(0);
  const [saindo, setSaindo] = useState<string[]>([]);
  const [fechados, setFechados] = useState<string[]>([]);
  const [fase, setFase] = useState<Fase>('mostrando');
  const [aberto, setAberto] = useState(false);
  const [alturas, setAlturas] = useState<Record<string, number>>({});
  const [topo, setTopo] = useState(medirTopo);
  const [aviso, setAviso] = useState('');
  const [arraste, setArraste] = useState<{ id: string; dy: number } | null>(null);
  const [semMovimento] = useState(reduzido);

  const raizRef = useRef<HTMLDivElement>(null);
  const pilulaRef = useRef<HTMLDivElement>(null);
  const pilulaConteudoRef = useRef<HTMLSpanElement>(null);
  const vivo = useRef(true);
  const terminou = useRef(false);
  const restanteEspera = useRef(ESPERA_MS);
  const gesto = useRef<{ id: string; pointerId: number; y0: number; y: number; t: number; v: number; ativo: boolean } | null>(null);
  const arrastou = useRef(false);

  const visiveis = useMemo(() => itens.slice(0, cursor).filter((item) => !fechados.includes(item.id)), [itens, cursor, fechados]);
  // Frente primeiro: a última a chegar fica na frente.
  const pilha = useMemo(() => [...visiveis].reverse(), [visiveis]);
  const entradaCompleta = cursor >= itens.length;
  const pausado = aberto || arraste !== null;

  const estadoRef = useRef({ visiveis, fase, entradaCompleta });
  useLayoutEffect(() => {
    estadoRef.current = { visiveis, fase, entradaCompleta };
  });

  const terminar = useCallback(() => {
    if (terminou.current) return;
    terminou.current = true;
    definirEmTransito([]);
    window.dispatchEvent(new Event(EVENTO_TOASTS_FIM));
    onFim();
  }, [onFim]);

  useEffect(() => {
    vivo.current = true;
    return () => {
      vivo.current = false;
      definirEmTransito([]);
      if (!terminou.current) window.dispatchEvent(new Event(EVENTO_TOASTS_FIM));
    };
  }, []);

  /** Tira os ids do "em trânsito": o contador do sino volta a contá-los. */
  const liberar = useCallback((liberados: string[]) => {
    const atuais = new Set(estadoRef.current.visiveis.map((item) => item.id));
    liberados.forEach((id) => atuais.delete(id));
    definirEmTransito([...atuais]);
  }, []);

  // Some sem voo (movimento reduzido, painel aberto, sem sino visível).
  const sumir = useCallback(
    async (ms: number) => {
      setFase('sumindo');
      await esperar(ms);
      if (vivo.current) terminar();
    },
    [terminar],
  );

  const recolher = useCallback(async () => {
    const { visiveis: atuais, fase: faseAtual } = estadoRef.current;
    if (faseAtual !== 'mostrando') return;
    if (atuais.length === 0) return terminar();
    const sino = sinoVisivel();
    const frente = raizRef.current?.querySelector(`[data-toast="${CSS.escape(atuais[atuais.length - 1]!.id)}"] article`)?.getBoundingClientRect();
    const pilula = pilulaRef.current;
    const conteudo = pilulaConteudoRef.current;
    if (semMovimento || !sino || !frente || !pilula || !conteudo) return sumir(semMovimento ? REDUZIDO_MS : RAPIDO_MS);

    const px = (valor: number) => `${Math.round(valor)}px`;
    const caixa = (x: number, y: number, w: number, h: number) => ({ left: px(x), top: px(y), width: px(w), height: px(h) });
    try {
      // 1. Fusão: os cards se juntam na posição da frente e dão lugar à pílula escura do mesmo tamanho.
      setFase('fundindo');
      const inicial = caixa(frente.left, frente.top, frente.width, frente.height);
      Object.assign(pilula.style, inicial, { display: 'flex' });
      await pilula.animate([{ opacity: 0, transform: 'scale(0.97)', borderRadius: '22px' }, { opacity: 1, transform: 'none', borderRadius: '22px' }], { duration: FUSAO_MS, easing: SETTLE, fill: 'forwards' }).finished;
      // 2. Encolhe para a ilha compacta ("3 novas"), centrada no card.
      const cx = frente.left + frente.width / 2;
      const cy = frente.top + frente.height / 2;
      const compacta = caixa(cx - PILULA.largura / 2, cy - PILULA.altura / 2, PILULA.largura, PILULA.altura);
      conteudo.animate([{ opacity: 0, transform: 'scale(0.9)' }, { opacity: 1, transform: 'none' }], { duration: 200, delay: COMPACTA_MS * 0.45, easing: SETTLE, fill: 'both' });
      await pilula.animate([{ ...inicial, borderRadius: '22px' }, { ...compacta, borderRadius: '999px' }], { duration: COMPACTA_MS, easing: molaCompacta, fill: 'forwards' }).finished;
      await esperar(LEITURA_MS);
      if (!vivo.current) return;
      // 3. Voo até o sino em arco (x acelera, y desacelera) e vira o ponto dourado do contador.
      setFase('voando');
      const alvo = sino.getBoundingClientRect();
      const ax = alvo.left + alvo.width / 2 - PILULA.ponto / 2;
      const ay = alvo.top + alvo.height / 2 - PILULA.ponto / 2;
      conteudo.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: EXIT, fill: 'forwards' });
      await Promise.all([
        pilula.animate([{ left: compacta.left, width: compacta.width }, { left: px(ax), width: px(PILULA.ponto) }], { duration: VOO_MS, easing: 'cubic-bezier(0.55, 0, 0.25, 1)', fill: 'forwards' }).finished,
        pilula.animate([{ top: compacta.top, height: compacta.height }, { top: px(ay), height: px(PILULA.ponto) }], { duration: VOO_MS, easing: 'cubic-bezier(0.2, 0.7, 0.25, 1)', fill: 'forwards' }).finished,
        pilula.animate(
          [
            { backgroundColor: '#0b192c', opacity: 1, transform: 'none', borderRadius: '999px' },
            { backgroundColor: '#0b192c', opacity: 1, transform: 'none', borderRadius: '999px', offset: 0.6 },
            { backgroundColor: '#c59b27', opacity: 1, transform: 'scale(1)', borderRadius: '999px', offset: 0.88 },
            { backgroundColor: '#c59b27', opacity: 0, transform: 'scale(0.4)', borderRadius: '999px' },
          ],
          { duration: VOO_MS, easing: 'linear', fill: 'forwards' },
        ).finished,
      ]);
    } catch {
      /* animação cancelada (página fechada ou elemento removido) */
    }
    if (!vivo.current) return;
    definirEmTransito([]);
    window.dispatchEvent(new Event(EVENTO_CHEGADA));
    terminar();
  }, [molaCompacta, semMovimento, sumir, terminar]);

  // Bloqueado ao montar (pop-up abriu enquanto o chunk carregava): nada aparece.
  useEffect(() => {
    if (toastsBloqueados() || itens.length === 0) terminar();
  }, [itens.length, terminar]);

  // Painel do sino aberto no meio: os toasts somem rápido (o painel já mostra tudo).
  useEffect(
    () =>
      observarSinal(() => {
        if (lerSinal().painelAberto && estadoRef.current.fase !== 'sumindo') {
          void sumir(semMovimento ? REDUZIDO_MS : RAPIDO_MS);
        }
      }),
    [semMovimento, sumir],
  );

  // Chegadas uma a uma; a fila também pausa com ponteiro/foco.
  useEffect(() => {
    if (fase !== 'mostrando' || pausado || entradaCompleta || terminou.current) return;
    const timer = window.setTimeout(
      () => {
        const item = itens[cursor];
        if (!item || toastsBloqueados()) {
          // Antes do primeiro toast, desiste (a sessão não conta); depois, o painel aberto já recolhe tudo.
          if (cursor === 0) terminar();
          return;
        }
        if (cursor === 0) marcarSessaoToasts();
        setCursor(cursor + 1);
        marcarMostradas([item.id]);
        definirEmTransito([...estadoRef.current.visiveis.map((visivel) => visivel.id), item.id]);
        setAviso(`Nova notificação. ${item.app}: ${item.title}`);
      },
      cursor === 0 ? 0 : INTERVALO_MS,
    );
    return () => window.clearTimeout(timer);
  }, [fase, pausado, entradaCompleta, cursor, itens, terminar]);

  // Espera antes de recolher, pausável; ao retomar, sobra pelo menos RETOMADA_MS.
  useEffect(() => {
    if (fase !== 'mostrando' || pausado || !entradaCompleta) return;
    const inicio = performance.now();
    const espera = restanteEspera.current;
    const timer = window.setTimeout(() => void recolher(), espera);
    return () => {
      window.clearTimeout(timer);
      restanteEspera.current = Math.max(RETOMADA_MS, espera - (performance.now() - inicio));
    };
  }, [fase, pausado, entradaCompleta, recolher]);

  // Topo acompanha o cabeçalho (a faixa utilitária do desktop recolhe ao rolar).
  useEffect(() => {
    let quadro = 0;
    const atualizar = () => {
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

  // Altura de cada card, para a pilha e para a lista aberta.
  useEffect(() => {
    const raiz = raizRef.current;
    if (!raiz || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      const proximas: Record<string, number> = {};
      raiz.querySelectorAll<HTMLElement>('[data-toast]').forEach((card) => {
        proximas[card.dataset.toast!] = card.offsetHeight;
      });
      setAlturas((anteriores) => (Object.keys(proximas).every((id) => anteriores[id] === proximas[id]) && Object.keys(anteriores).length === Object.keys(proximas).length ? anteriores : proximas));
    });
    raiz.querySelectorAll('[data-toast]').forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [cursor]);

  const dispensarToast = useCallback(
    (id: string) => {
      if (saindo.includes(id)) return;
      const raiz = raizRef.current;
      // Dispensado pelo teclado: o foco segue para o próximo toast (não cai no <body>).
      const comFoco = Boolean(raiz?.querySelector(`[data-toast="${CSS.escape(id)}"]`)?.contains(document.activeElement));
      setSaindo((anteriores) => [...anteriores, id]);
      liberar([id]);
      window.setTimeout(
        () => {
          if (!vivo.current) return;
          setSaindo((anteriores) => anteriores.filter((saida) => saida !== id));
          setFechados((anteriores) => [...anteriores, id]);
          const proximo = estadoRef.current.visiveis.filter((item) => item.id !== id).at(-1);
          if (comFoco && raiz && proximo) raiz.querySelector<HTMLElement>(`[data-toast="${CSS.escape(proximo.id)}"] [data-open]`)?.focus({ preventScroll: true });
          if (raiz) setAberto(engajada(raiz));
          const { visiveis: atuais, entradaCompleta: completa } = estadoRef.current;
          if (completa && atuais.every((item) => item.id === id)) terminar();
        },
        semMovimento ? REDUZIDO_MS : SAIDA_MS,
      );
    },
    [saindo, liberar, semMovimento, terminar],
  );

  const abrirToast = (id: string, href?: string) => {
    marcarLidas([id]);
    liberar([id]);
    setFechados((anteriores) => [...anteriores, id]);
    if (href) navigate(href);
    const restantes = estadoRef.current.visiveis.filter((item) => item.id !== id);
    estadoRef.current = { ...estadoRef.current, visiveis: restantes };
    if (restantes.length === 0 && estadoRef.current.entradaCompleta) terminar();
    else void recolher();
  };

  // Arrastar para cima dispensa (limiar de distância ou de velocidade); para baixo, resistência.
  const onPointerDown = (id: string) => (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if ((event.target as Element).closest('[data-dismiss]')) return;
    arrastou.current = false;
    gesto.current = { id, pointerId: event.pointerId, y0: event.clientY, y: event.clientY, t: event.timeStamp, v: 0, ativo: false };
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const atual = gesto.current;
    if (!atual || atual.pointerId !== event.pointerId) return;
    const bruto = event.clientY - atual.y0;
    if (!atual.ativo && Math.abs(bruto) < ARRASTE_LIMIAR_PX) return;
    if (!atual.ativo) {
      atual.ativo = true;
      arrastou.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const dt = Math.max(8, event.timeStamp - atual.t);
    atual.v = (event.clientY - atual.y) / dt;
    atual.y = event.clientY;
    atual.t = event.timeStamp;
    setArraste({ id: atual.id, dy: bruto < 0 ? bruto : bruto * 0.25 });
  };
  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const atual = gesto.current;
    gesto.current = null;
    if (!atual || atual.pointerId !== event.pointerId || !atual.ativo) return;
    const dy = event.clientY - atual.y0;
    setArraste(null);
    if (dy < -ARRASTE_DISPENSA_PX || (dy < -ARRASTE_FLING_PX && atual.v < -ARRASTE_VELOCIDADE)) dispensarToast(atual.id);
  };

  const fundindo = fase === 'fundindo' || fase === 'voando';
  const sumindo = fase === 'sumindo';
  const expandida = aberto && fase === 'mostrando';
  const alturaFrente = pilha[0] ? (alturas[pilha[0].id] ?? 0) : 0;
  const alturaDe = (id: string) => alturas[id] ?? alturaFrente;
  const posicoes = pilha.map((item, nivel) => ({
    y: expandida
      ? pilha.slice(0, nivel).reduce((soma, anterior) => soma + alturaDe(anterior.id) + VAO_PX, 0)
      : alturaFrente - alturaDe(item.id) + nivel * ESPIA_PX,
    escala: expandida ? 1 : 1 - nivel * ESCALA_POR_NIVEL,
  }));
  const alturaRaiz = expandida
    ? pilha.reduce((soma, item) => soma + alturaDe(item.id), 0) + Math.max(0, pilha.length - 1) * VAO_PX
    : alturaFrente + Math.max(0, pilha.length - 1) * ESPIA_PX;
  const transicao = semMovimento
    ? `opacity ${REDUZIDO_MS}ms ease`
    : fundindo
      ? `transform ${FUSAO_MS}ms ${SETTLE}, opacity ${Math.round(FUSAO_MS * 0.8)}ms ease`
      : `transform ${PILHA_MS}ms ${SETTLE}, opacity ${sumindo ? RAPIDO_MS : PILHA_MS}ms ease`;

  return (
    <>
      <div
        ref={raizRef}
        role="region"
        aria-label="Notificações recentes"
        data-notification-toasts
        data-state={fase}
        data-expanded={expandida ? '' : undefined}
        className="fixed inset-x-3 z-40 mx-auto max-w-[432px] lg:left-auto lg:right-[max(2rem,calc((100vw_-_80rem)/2_+_2rem))] lg:mx-0 lg:w-[380px]"
        style={{ top: topo, height: alturaRaiz, transition: semMovimento ? undefined : `top 300ms ${SETTLE}, height ${PILHA_MS}ms ${SETTLE}`, pointerEvents: fase === 'mostrando' ? undefined : 'none' }}
        // Ponteiro (mouse/caneta) ou foco abrem a pilha em lista e pausam; no toque, o arraste pausa.
        onPointerEnter={(event) => event.pointerType !== 'touch' && setAberto(true)}
        onPointerLeave={(event) => event.pointerType !== 'touch' && setAberto(engajada(event.currentTarget))}
        onFocus={(event) => (event.target as Element).matches(':focus-visible') && setAberto(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setAberto(event.currentTarget.matches(':hover'));
        }}
      >
        {pilha.map((item, nivel) => {
          const { y, escala } = posicoes[nivel]!;
          const saiu = saindo.includes(item.id);
          const dy = arraste?.id === item.id ? arraste.dy : 0;
          const transform = saiu
            ? semMovimento
              ? `translateY(${y}px)`
              : `translateY(calc(${y}px - 100% - 24px)) scale(${escala})`
            : fundindo
              ? 'translateY(0) scale(0.96)'
              : `translateY(${y + dy}px) scale(${escala})`;
          return (
            <div
              key={item.id}
              data-toast={item.id}
              data-depth={nivel}
              data-leaving={saiu ? '' : undefined}
              className="absolute inset-x-0 top-0 touch-none select-none"
              style={{
                zIndex: MAX_TOASTS - nivel,
                transform,
                transformOrigin: expandida ? '50% 0%' : '50% 100%',
                opacity: saiu || fundindo || sumindo ? 0 : 1,
                transition: dy !== 0 ? 'none' : saiu && !semMovimento ? `transform ${SAIDA_MS}ms ${EXIT}, opacity ${SAIDA_MS}ms ease` : transicao,
              }}
              onPointerDown={onPointerDown(item.id)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={() => {
                gesto.current = null;
                setArraste(null);
              }}
              onClickCapture={(event) => {
                if (!arrastou.current) return;
                arrastou.current = false;
                event.preventDefault();
                event.stopPropagation();
              }}
            >
              <Entrada reduzido={semMovimento} easing={mola620}>
                <NotificationToastCard
                  item={item}
                  play={1}
                  reduced={semMovimento}
                  behind={nivel > 0 && !expandida}
                  onOpen={() => abrirToast(item.id)}
                  onNavigate={(href) => abrirToast(item.id, href)}
                  onDismiss={() => dispensarToast(item.id)}
                />
              </Entrada>
            </div>
          );
        })}
        <p aria-live="polite" className="sr-only">
          {aviso}
        </p>
      </div>
      {/* Pílula da Dynamic Island: posicionada e animada só no recolhimento. */}
      <div
        ref={pilulaRef}
        aria-hidden
        data-notification-pill
        data-state={fundindo ? fase : 'idle'}
        className="pointer-events-none fixed z-[60] hidden items-center justify-center overflow-hidden bg-crfal-blue-dark text-white opacity-0 shadow-[0_18px_40px_-14px_rgba(11,25,44,0.7)] ring-1 ring-white/10"
      >
        <span aria-hidden className="absolute inset-x-5 top-0 h-px bg-linear-to-r/srgb from-crfal-gold/0 via-crfal-gold/80 to-crfal-gold/0" />
        <span ref={pilulaConteudoRef} className="flex items-center gap-2 whitespace-nowrap text-[13px] font-bold opacity-0">
          <span className="grid size-6 place-items-center rounded-full bg-white/10 ring-1 ring-crfal-gold/50">
            <Bell className="size-3.5 text-crfal-gold" aria-hidden />
          </span>
          <span data-pill-count className="tabular-nums">
            {visiveis.length} {visiveis.length === 1 ? 'nova' : 'novas'}
          </span>
          <span aria-hidden className="size-1.5 rounded-full bg-crfal-gold shadow-[0_0_8px_2px_rgba(197,155,39,0.6)]" />
        </span>
      </div>
    </>
  );
}

/** Entrada do banner: desce de baixo do cabeçalho com mola, de escala 0,92 e desfoque 8px. */
function Entrada({ reduzido: semMovimento, easing, children }: { reduzido: boolean; easing: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const animacao = semMovimento
      ? el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: REDUZIDO_MS, easing: 'ease-out' })
      : el.animate(
          [
            { transform: 'translateY(calc(-100% - 24px)) scale(0.92)', filter: 'blur(8px)', opacity: 0 },
            { filter: 'blur(0)', opacity: 1, offset: 0.45 },
            { transform: 'none', filter: 'blur(0)', opacity: 1 },
          ],
          { duration: ENTRADA_MS, easing },
        );
    return () => animacao.cancel();
  }, [semMovimento, easing]);
  return (
    <div ref={ref} data-toast-enter>
      {children}
    </div>
  );
}
