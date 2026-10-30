import * as React from "react";

/*
  Feed de notificações ao vivo, portado do componente original `live-notification-feed`
  (handoff em crfal_handoff/notificacoes). A mecânica é a mesma do original: entradas
  com mola, saída lateral, varredura escalonada do "Limpar", sino que balança a cada
  chegada, anúncio `aria-live`, pausa com ponteiro/foco e autoplay opcional (desligado
  por padrão). Mudou o visual (tokens do CRF-AL), os textos (pt-BR) e os kinds: cada
  kind continua com o seu detalhe animado, agora para eventos, novidades do site,
  serviços e notícias. Notícias e eventos mostram a foto de capa real (WordPress);
  novidades do site, sem foto, ganham uma faixa da marca. Com movimento reduzido nada
  anima e tudo nasce no estado final.
*/

export interface NotificationAction {
  label: string;
  /** Exibido no lugar dos botões depois que a ação é escolhida, ex.: "Inscrição aberta". */
  done?: string;
}

/** Foto de capa real: `src`/`srcSet` para a capa larga. */
export interface NotificationImage {
  src: string;
  srcSet?: string;
  /** URL original da API, quando `src` é uma variante (ex.: `large`): última tentativa da capa larga. */
  original?: string;
}

/** Identidade da capa: muda quando qualquer URL muda, para reiniciar as tentativas e o "sem foto". */
const coverKey = (image: NotificationImage) => [image.src, image.srcSet, image.original].join("|");

/**
 * Falha da imagem atual, presa à URL: zera sempre que a URL muda (inclusive A → B → A),
 * então uma capa que já falhou volta a ser tentada quando reaparece.
 */
function useImageFailure(key: string | undefined) {
  const [failure, setFailure] = React.useState({ key, failed: false });
  if (failure.key !== key) setFailure({ key, failed: false });
  return [failure.key === key && failure.failed, () => setFailure({ key, failed: true })] as const;
}

interface NotificationBase {
  id: string;
  /** Origem exibida acima do título, ex.: "Eventos". */
  app: string;
  title: string;
  body?: string;
  /** Rótulo de tempo, ex.: "há 3 dias". Itens que chegam com o feed aberto dizem "agora". */
  time?: string;
  /** Cor da origem (ícone e detalhe animado). Qualquer cor CSS. */
  accent?: string;
  read?: boolean;
  /** Destino ao abrir a notificação. Com `onNavigate`, cliques simples navegam pelo SPA. */
  href?: string;
  actions?: NotificationAction[];
  /** Capa (notícias e eventos). Sem ela, ou se não carregar, o card usa o detalhe do tipo. */
  image?: NotificationImage;
}

/** Evento da agenda: capa do evento e folhinha que é arrancada até a data. */
export type EventoNotification = NotificationBase & { kind: "evento"; date: string; tags?: string[]; locale?: string };
/** Página nova ou renovada: faixa da marca com a seção do site e o selo "Nova". */
export type NovidadeNotification = NotificationBase & { kind: "novidade"; section?: string };
/** Serviço ou requerimento: itens conferidos um a um, com contagem em rolo. */
export type ServicoNotification = NotificationBase & { kind: "servico"; counts: { label: string; value: number }[] };
/** Notícia: a capa é revelada por uma varredura e os dados entram palavra a palavra. */
export type NoticiaNotification = NotificationBase & {
  kind: "noticia";
  category?: string;
  date?: string;
};

export type LiveNotification = EventoNotification | NovidadeNotification | ServicoNotification | NoticiaNotification;

export type NotificationKind = LiveNotification["kind"];

export interface LiveNotificationFeedProps extends React.ComponentProps<"div"> {
  /** Notificações na ordem em que chegaram. A mais nova fica no topo; itens acrescentados depois chegam com a sua animação. */
  items: LiveNotification[];
  title?: string;
  /** Não lidas no contador do cabeçalho, para incluir itens que ainda vão chegar. Sem ela, conta os itens já no feed. */
  unreadCount?: number;
  /** Reproduz os itens um a um como se chegassem agora. Desligado por padrão: notificações reais aparecem como vieram. */
  autoplay?: boolean;
  /** Com autoplay, quantos itens já estão no feed ao começar. */
  initial?: number;
  /** Milissegundos entre chegadas no autoplay. */
  interval?: number;
  /** Com autoplay, limpa o feed e recomeça depois da última chegada. */
  loop?: boolean;
  /** Altura máxima da lista rolável, qualquer medida CSS. */
  height?: string;
  onOpen?: (id: string) => void;
  onAction?: (id: string, label: string) => void;
  onDismiss?: (id: string) => void;
  /** "Marcar todas como lidas": ids marcados. */
  onReadAll?: (ids: string[]) => void;
  /** "Limpar": ids varridos do feed. */
  onClear?: (ids: string[]) => void;
  /** Clique simples num item com `href` (sem Ctrl/⌘/Shift nem botão do meio). */
  onNavigate?: (href: string, id: string) => void;
}

interface Entry {
  id: string;
  key: string;
  play: number;
  fresh: boolean;
  leaving: boolean;
  arrived: boolean;
  delay: number;
  leaveDelay: number;
}

type StoryProps = {
  play: number;
  delay: number;
  reduced: boolean;
};

const FIRST_ARRIVAL_MS = 450;
const ENTER_MS = 460;
const LEAVE_MS = 340;
const SWEEP_STAGGER_MS = 60;
const STORY_DELAY_MS = 260;
const RESTART_HOLD = 2.2;
const CHECK_STAGGER_MS = 220;
const SPRING = "cubic-bezier(0.2, 0.9, 0.25, 1.12)";
const SETTLE = "cubic-bezier(0.2, 0.8, 0.2, 1)";
const EXIT = "cubic-bezier(0.4, 0, 0.2, 1)";
/* Cabe abaixo do cabeçalho do site com folga: cabeçalho do painel (~4.5rem), faixa "Mais notificações" (2.25rem) e margem inferior (~4rem). */
const DEFAULT_HEIGHT = "min(480px, calc(100svh - var(--header-offset, 64px) - 10.5rem))";
const FADE_PX = 40;
const TINT = "color-mix(in oklab, currentColor 12%, transparent)";
const REEL = Array.from({ length: 20 }, (_, i) => i % 10);
const POP: Keyframe[] = [
  { transform: "scale(0)", opacity: 0 },
  { transform: "scale(1.15)", opacity: 1, offset: 0.6 },
  { transform: "scale(1)", opacity: 1 },
];
const WORD_IN: Keyframe[] = [
  { opacity: 0, transform: "translateY(4px)", filter: "blur(2px)" },
  { opacity: 1, transform: "none", filter: "blur(0)" },
];

const ICONS: { [K in NotificationKind]: string } = {
  evento: "M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z M4 10h16 M8.5 4v4 M15.5 4v4",
  novidade: "M5.5 5h13A1.5 1.5 0 0 1 20 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-11A1.5 1.5 0 0 1 5.5 5Z M4 9h16 M7 7h.01 M9.5 7h.01 M12 12.2l.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2-1.45-1.4 2-.3Z",
  servico: "M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5a1.5 1.5 0 0 1 1-1.5Z M14 3.5V8h4 M9 13.5l2 2 4-4",
  noticia: "M5 5.5h11v13H6.5A1.5 1.5 0 0 1 5 17Z M16 9h2.5a.5.5 0 0 1 .5.5V17a1.5 1.5 0 0 1-3 0 M8 9h5 M8 12h5 M8 15h3",
};

function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function parseDay(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year ?? 2000, (month ?? 1) - 1, day ?? 1);
}

function addDays(day: Date, amount: number) {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() + amount);
}

/** "out." → "out": abreviações do pt-BR sem o ponto, como no resto do site. */
function shortLabel(day: Date, locale: string, option: "month" | "weekday") {
  return day.toLocaleDateString(locale, { [option]: "short" }).replace(".", "");
}

function staticEntry(id: string, generation: number, fresh = false, delay = 0): Entry {
  return { id, key: `${id}:${generation}`, play: 0, fresh, leaving: false, arrived: false, delay, leaveDelay: 0 };
}

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const BELL = "M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 1.5h-15Z M10 20.5a2.2 2.2 0 0 0 4 0";
const CLOSE = "M7 7l10 10M17 7 7 17";
const CHECK = "M5 12.5l4.2 4.2L19 7";
const ARROW = "M5 12h14 M13 6l6 6-6 6";
const CHEVRON_DOWN = "M7 10l5 5 5-5";

/* -------------------------------------------------------------------------- */
/* Foto de capa real                                                           */
/* -------------------------------------------------------------------------- */

/** Capa larga do painel: proporção fixa 2:1, recortada pelo centro-topo (onde costuma estar o título da arte). */
const COVER_SIZES = "(max-width: 480px) 80vw, 300px";

/**
 * Foto real com recorte fixo, sem prioridade (lazy, decodificação assíncrona, nunca
 * pré-carregada: não disputa o LCP). Tentativas em ordem: `srcSet`/variante, depois a URL
 * original da API (`original`, ou `src` sem `srcSet`); se todas falharem, `onFail` e o card
 * volta ao detalhe sem foto. Aparece com um esmaecimento curto ao carregar.
 */
function CoverImage({
  image,
  width,
  height,
  sizes,
  className,
  onFail,
}: {
  image: NotificationImage;
  width: number;
  height: number;
  sizes?: string;
  className?: string;
  onFail: () => void;
}) {
  const attempts = React.useMemo(() => {
    const list: { src: string; srcSet?: string }[] = [{ src: image.src, srcSet: image.srcSet }];
    const fallback = image.original ?? image.src;
    if (image.srcSet || fallback !== image.src) list.push({ src: fallback });
    return list;
  }, [image]);
  const [attempt, setAttempt] = React.useState(0);
  const [loaded, setLoaded] = React.useState(false);
  const current = attempts[Math.min(attempt, attempts.length - 1)];
  return (
    <img
      key={current.src + (current.srcSet ?? "")}
      src={current.src}
      srcSet={current.srcSet}
      sizes={current.srcSet ? sizes : undefined}
      width={width}
      height={height}
      alt=""
      loading="lazy"
      decoding="async"
      draggable={false}
      onLoad={() => setLoaded(true)}
      onError={() => {
        if (attempt + 1 < attempts.length) setAttempt(attempt + 1);
        else onFail();
      }}
      className={cx("size-full object-cover object-[50%_30%] motion-safe:transition-opacity motion-safe:duration-300", !loaded && "opacity-0", className)}
    />
  );
}

/** Moldura da capa: cantos arredondados, fundo neutro enquanto carrega e borda interna sutil. */
function CoverFrame({ children, className, frameRef }: { children: React.ReactNode; className?: string; frameRef?: React.Ref<HTMLSpanElement> }) {
  return (
    <span ref={frameRef} aria-hidden className={cx("relative block overflow-hidden bg-crfal-gray-100", className)}>
      {children}
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-black/[0.06]" />
    </span>
  );
}

function AppTile({
  kind,
  accent,
  play,
  delay,
  reduced,
}: {
  kind: NotificationKind;
  accent?: string;
  play: number;
  delay: number;
  reduced: boolean;
}) {
  const ringRef = React.useRef(null as HTMLSpanElement | null);
  React.useEffect(() => {
    if (play === 0 || reduced) return;
    const animation = ringRef.current?.animate(
      [
        { transform: "scale(1)", opacity: 0.6 },
        { transform: "scale(1.75)", opacity: 0 },
      ],
      { duration: 900, delay, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" },
    );
    return () => animation?.cancel();
  }, [play, delay, reduced]);
  return (
    <span
      data-tile
      className={cx("relative mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl ring-1 ring-inset ring-current/15", !accent && "text-crfal-blue")}
      style={{ color: accent, background: TINT }}
    >
      <Icon d={ICONS[kind]} className="size-[18px]" />
      <span ref={ringRef} aria-hidden className="pointer-events-none absolute inset-0 rounded-xl border-2 border-current opacity-0" />
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Evento: a folhinha do calendário original, em pt-BR                         */
/* -------------------------------------------------------------------------- */

function DateSheet({ day, locale }: { day: Date; locale: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-lg border border-crfal-gray-200 bg-white shadow-sm" style={{ transformOrigin: "50% 0%", backfaceVisibility: "hidden" }}>
      <div style={{ background: "currentColor" }}>
        <span className="block text-center text-[9px] font-semibold uppercase leading-[15px] tracking-wide text-white">{shortLabel(day, locale, "month")}</span>
      </div>
      <div className="flex flex-col items-center pt-1">
        <span className="text-lg font-bold leading-none text-crfal-blue-dark tabular-nums">{day.getDate()}</span>
        <span className="mt-0.5 text-[9px] uppercase leading-none text-crfal-gray-600">{shortLabel(day, locale, "weekday")}</span>
      </div>
    </div>
  );
}

/** Capa larga revelada de cima para baixo, com um brilho que desce junto (notícias e eventos). */
function useCoverReveal(animate: boolean, play: number, delay: number) {
  const coverRef = React.useRef(null as HTMLSpanElement | null);
  const scanRef = React.useRef(null as HTMLSpanElement | null);
  React.useEffect(() => {
    if (!animate) return;
    const start = Math.max(80, delay);
    const effects = [
      coverRef.current?.animate([{ clipPath: "inset(0 0 100% 0 round 12px)" }, { clipPath: "inset(0 0 0 0 round 12px)" }], { duration: 560, delay: start, easing: SETTLE, fill: "backwards" }),
      scanRef.current?.animate(
        [
          { transform: "translateY(-100%)", opacity: 0 },
          { transform: "translateY(40%)", opacity: 1, offset: 0.6 },
          { transform: "translateY(200%)", opacity: 0 },
        ],
        { duration: 760, delay: start, easing: "cubic-bezier(0.3, 0.7, 0.2, 1)" },
      ),
    ];
    return () => effects.forEach((effect) => effect?.cancel());
  }, [play, animate, delay]);
  return { coverRef, scanRef };
}

function WideCover({
  image,
  coverRef,
  scanRef,
  onFail,
}: {
  image: NotificationImage;
  coverRef: React.Ref<HTMLSpanElement>;
  scanRef: React.Ref<HTMLSpanElement>;
  onFail: () => void;
}) {
  return (
    <CoverFrame frameRef={coverRef} className="aspect-[2/1] w-full rounded-xl">
      <CoverImage image={image} width={600} height={300} sizes={COVER_SIZES} onFail={onFail} />
      <span
        ref={scanRef}
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 opacity-0"
        style={{ background: "linear-gradient(to bottom, transparent, color-mix(in oklab, white 35%, transparent))" }}
      />
    </CoverFrame>
  );
}

function EventoDetail({ item, play, delay, reduced }: StoryProps & { item: EventoNotification }) {
  const animate = play > 0 && !reduced;
  const cover = item.image && coverKey(item.image);
  const [noCover, setNoCover] = useImageFailure(cover);
  const { coverRef, scanRef } = useCoverReveal(animate && Boolean(cover) && !noCover, play, delay);
  const locale = item.locale ?? "pt-BR";
  const event = React.useMemo(() => parseDay(item.date), [item.date]);
  const torn = React.useMemo(() => [1, 2, 3, 4].map((back) => addDays(event, -back)), [event]);
  const sheetsRef = React.useRef(null as HTMLDivElement | null);
  const tagsRef = React.useRef(null as HTMLDivElement | null);
  const tags = item.tags ?? [];

  React.useEffect(() => {
    if (!animate) return;
    const start = Math.max(80, delay);
    const sheets = Array.from(sheetsRef.current?.children ?? []);
    const tears = sheets.map((sheet, i) =>
      sheet.animate(
        [
          { transform: "rotateX(0deg) translateY(0)", opacity: 1 },
          { transform: "rotateX(-70deg) translateY(-3px)", opacity: 1, offset: 0.55 },
          { transform: "rotateX(-110deg) translateY(-12px)", opacity: 0 },
        ],
        { duration: 300, delay: start + (sheets.length - 1 - i) * 150, easing: "cubic-bezier(0.4, 0, 0.6, 1)", fill: "both" },
      ),
    );
    const afterTears = start + sheets.length * 150 + 120;
    const pops = Array.from(tagsRef.current?.children ?? []).map((tag, i) =>
      tag.animate(POP, { duration: 320, delay: afterTears + i * 90, easing: "ease-out", fill: "backwards" }),
    );
    return () => [...tears, ...pops].forEach((animation) => animation.cancel());
  }, [play, animate, delay]);

  return (
    <div data-detail="evento" className="space-y-2.5">
      {item.image && cover && !noCover && <WideCover key={cover} image={item.image} coverRef={coverRef} scanRef={scanRef} onFail={setNoCover} />}
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-12 shrink-0 [perspective:420px]">
          <DateSheet day={event} locale={locale} />
          {animate && (
            <div ref={sheetsRef} data-sheets aria-hidden className="absolute inset-0">
              {torn.map((day) => (
                <DateSheet key={day.getTime()} day={day} locale={locale} />
              ))}
            </div>
          )}
        </div>
        {tags.length > 0 && (
          <div ref={tagsRef} className="flex min-w-0 flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span key={tag} className="max-w-full truncate rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: TINT }}>
                <span className="text-crfal-blue-dark">{tag}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Novidade no site: faixa da marca (sem foto), com brilho e selo "Nova"       */
/* -------------------------------------------------------------------------- */

function NovidadeDetail({ item, play, delay, reduced }: StoryProps & { item: NovidadeNotification }) {
  const animate = play > 0 && !reduced;
  const sheenRef = React.useRef(null as HTMLSpanElement | null);
  const tileRef = React.useRef(null as HTMLSpanElement | null);
  const textRef = React.useRef(null as HTMLSpanElement | null);
  const badgeRef = React.useRef(null as HTMLSpanElement | null);

  React.useEffect(() => {
    if (!animate) return;
    const start = Math.max(80, delay);
    const effects = [
      sheenRef.current?.animate(
        [
          { transform: "translateX(-120%) skewX(-18deg)", opacity: 0 },
          { transform: "translateX(60%) skewX(-18deg)", opacity: 1, offset: 0.5 },
          { transform: "translateX(320%) skewX(-18deg)", opacity: 0 },
        ],
        { duration: 1100, delay: start, easing: "cubic-bezier(0.3, 0.6, 0.2, 1)" },
      ),
      tileRef.current?.animate(POP, { duration: 380, delay: start + 80, easing: "ease-out", fill: "backwards" }),
      ...Array.from(textRef.current?.children ?? []).map((part, i) => part.animate(WORD_IN, { duration: 260, delay: start + 180 + i * 70, easing: "ease-out", fill: "backwards" })),
      badgeRef.current?.animate(POP, { duration: 380, delay: start + 420, easing: "ease-out", fill: "backwards" }),
    ];
    return () => effects.forEach((effect) => effect?.cancel());
  }, [play, animate, delay]);

  return (
    <div className="@container">
    {/* Faixa estreita: sem os ícones repetidos, a seção e o selo ficam legíveis. */}
    <div data-detail="novidade" className="relative isolate flex items-center gap-2 overflow-hidden rounded-xl px-2.5 py-2.5 text-white @xs:gap-3 @xs:px-3" style={{ background: "var(--notif-grad-pill)" }}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-70 [background-image:radial-gradient(circle_at_85%_-20%,rgb(232_203_118/0.28),transparent_55%),linear-gradient(to_right,rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.05)_1px,transparent_1px)] [background-size:100%_100%,14px_14px,14px_14px]"
      />
      <span aria-hidden className="pointer-events-none absolute inset-x-4 top-0 h-px bg-linear-to-r/srgb from-crfal-gold/0 via-crfal-gold/80 to-crfal-gold/0" />
      <span ref={sheenRef} aria-hidden className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-1/3 bg-linear-to-r/srgb from-white/0 via-white/15 to-white/0 opacity-0" />
      <span ref={tileRef} aria-hidden className="hidden size-8 shrink-0 place-items-center rounded-lg bg-white/10 text-crfal-gold ring-1 ring-inset ring-white/15 backdrop-blur-sm @3xs:grid">
        <Icon d={ICONS.novidade} className="size-4" />
      </span>
      <span ref={textRef} className="min-w-0 flex-1 leading-tight">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">Agora no site</span>
        <span className="mt-0.5 block truncate text-[13px] font-semibold">{item.section ?? "Portal do CRF-AL"}</span>
      </span>
      <span ref={badgeRef} className="shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-crfal-blue-dark" style={{ background: "var(--notif-grad-badge)" }}>
        Nova
      </span>
      <span aria-hidden className="hidden size-6 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-inset ring-white/15 @3xs:grid">
        <Icon d={ARROW} className="size-3" />
      </span>
    </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Serviço: itens conferidos um a um, com o rolo de dígitos do original        */
/* -------------------------------------------------------------------------- */

function RollingNumber({ value, rolled, animate, lag }: { value: number; rolled: boolean; animate: boolean; lag: number }) {
  const rollMs = (order: number) => 900 + order * 110;
  return (
    <span aria-hidden className="flex items-baseline gap-0 tracking-normal tabular-nums">
      {Array.from(String(value)).map((ch, i) => {
        const digit = Number(ch);
        return (
          <span key={i} className="relative inline-block h-[1.15em] overflow-hidden leading-[1.15]">
            <span className="invisible">{ch}</span>
            <span
              data-reel={digit}
              className="absolute inset-x-0 top-0 flex flex-col text-center"
              style={{
                transform: `translateY(-${(rolled ? 10 + digit : 0) * 1.15}em)`,
                transition: rolled && animate ? `transform ${rollMs(i)}ms cubic-bezier(0.15, 0.85, 0.25, 1) ${lag}ms` : "none",
              }}
            >
              {REEL.map((n, k) => (
                <span key={k}>{n}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

function ServicoDetail({ item, play, delay, reduced }: StoryProps & { item: ServicoNotification }) {
  const animate = play > 0 && !reduced;
  const [rolled, setRolled] = React.useState(!animate);
  const listRef = React.useRef(null as HTMLUListElement | null);

  React.useEffect(() => {
    if (!animate) {
      setRolled(true);
      return;
    }
    setRolled(false);
    const start = Math.max(80, delay);
    const timer = window.setTimeout(() => setRolled(true), start);
    const checks = Array.from(listRef.current?.querySelectorAll("[data-check]") ?? []).flatMap((check, i) => [
      check.animate([{ transform: "scale(0.4)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }], { duration: 260, delay: start + i * CHECK_STAGGER_MS, easing: SPRING, fill: "backwards" }),
      check.querySelector("path")!.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 320, delay: start + 120 + i * CHECK_STAGGER_MS, easing: "ease-out", fill: "backwards" }),
    ]);
    return () => {
      window.clearTimeout(timer);
      checks.forEach((animation) => animation.cancel());
    };
  }, [play, animate, delay]);

  return (
    <ul ref={listRef} data-detail="servico" className="grid grid-cols-2 gap-1.5">
      {item.counts.map((count, i) => (
        <li key={count.label} className="flex min-w-0 items-center gap-2 rounded-xl border border-crfal-gray-200 bg-white px-2 py-1.5">
          <span data-check aria-hidden className="grid size-5 shrink-0 place-items-center rounded-full" style={{ background: "currentColor" }}>
            <svg viewBox="0 0 24 24" className="size-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
              <path d={CHECK} pathLength={1} strokeDasharray={1} />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block text-base font-bold leading-none text-crfal-blue-dark">
              <span className="sr-only">{count.value}</span>
              <RollingNumber value={count.value} rolled={rolled} animate={animate} lag={i * CHECK_STAGGER_MS} />
            </span>
            <span className="mt-0.5 block text-[10.5px] leading-tight text-crfal-gray-600">{count.label}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/* Notícia: capa revelada por varredura, dados palavra a palavra               */
/* -------------------------------------------------------------------------- */

function NoticiaDetail({ item, play, delay, reduced }: StoryProps & { item: NoticiaNotification }) {
  const animate = play > 0 && !reduced;
  const cover = item.image && coverKey(item.image);
  const [noCover, setNoCover] = useImageFailure(cover);
  const { coverRef, scanRef } = useCoverReveal(animate && Boolean(cover) && !noCover, play, delay);
  const metaRef = React.useRef(null as HTMLSpanElement | null);

  React.useEffect(() => {
    if (!animate) return;
    const start = Math.max(80, delay);
    const words = Array.from(metaRef.current?.children ?? []).map((part, i) => part.animate(WORD_IN, { duration: 260, delay: start + 320 + i * 60, easing: "ease-out", fill: "backwards" }));
    return () => words.forEach((word) => word.cancel());
  }, [play, animate, delay]);

  const meta = [item.category, item.date].filter((part): part is string => Boolean(part));
  return (
    <div data-detail="noticia" className="space-y-2.5">
      {item.image && cover && !noCover && <WideCover key={cover} image={item.image} coverRef={coverRef} scanRef={scanRef} onFail={setNoCover} />}
      {meta.length > 0 && (
        <span ref={metaRef} className="flex min-w-0 flex-wrap items-center gap-1.5 text-[11px]">
          {meta.map((part, i) => (
            <span
              key={part}
              className={cx("inline-block max-w-full truncate", i === 0 ? "rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide" : "text-crfal-gray-600")}
              style={i === 0 ? { background: TINT } : undefined}
            >
              {i === 0 ? <span className="text-crfal-blue-dark">{part}</span> : part}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}

function Detail({ item, play, delay, reduced }: { item: LiveNotification; play: number; delay: number; reduced: boolean }) {
  switch (item.kind) {
    case "evento":
      return <EventoDetail item={item} play={play} delay={delay} reduced={reduced} />;
    case "novidade":
      return <NovidadeDetail item={item} play={play} delay={delay} reduced={reduced} />;
    case "servico":
      return <ServicoDetail item={item} play={play} delay={delay} reduced={reduced} />;
    case "noticia":
      return <NoticiaDetail item={item} play={play} delay={delay} reduced={reduced} />;
  }
}

const FOCUS_RING = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue";
const OPEN_CLASS =
  "mt-1 block w-full text-left text-sm leading-[1.35] text-crfal-blue-dark outline-none after:absolute after:-inset-px after:rounded-2xl after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-crfal-blue focus-visible:after:ring-offset-2 focus-visible:after:ring-offset-crfal-gray-50";

function NotificationCard({
  item,
  entry,
  read,
  done,
  reduced,
  onOpen,
  onNavigate,
  onAction,
  onDismiss,
}: {
  item: LiveNotification;
  entry: Entry;
  read: boolean;
  done: string | undefined;
  reduced: boolean;
  onOpen: () => void;
  onNavigate?: (href: string) => void;
  onAction: (action: NotificationAction) => void;
  onDismiss: () => void;
}) {
  const [entered, setEntered] = React.useState(!entry.fresh || reduced);
  React.useEffect(() => {
    if (entered) return;
    let second = 0;
    const first = window.requestAnimationFrame(() => {
      second = window.requestAnimationFrame(() => setEntered(true));
    });
    return () => {
      window.cancelAnimationFrame(first);
      window.cancelAnimationFrame(second);
    };
  }, [entered]);

  const shown = entered && !entry.leaving;
  const duration = entry.leaving ? LEAVE_MS : ENTER_MS;
  const lag = entry.leaving ? entry.leaveDelay : entry.delay;
  const rowTransition = reduced ? "none" : `grid-template-rows ${duration}ms ${entry.leaving ? EXIT : SETTLE} ${lag}ms`;
  const cardTransition = reduced
    ? "none"
    : `transform ${duration}ms ${entry.leaving ? EXIT : SPRING} ${lag}ms, opacity ${Math.round(duration * 0.7)}ms ease ${lag}ms, border-color 200ms ease, box-shadow 200ms ease, background-color 200ms ease`;
  const storyDelay = entry.fresh ? STORY_DELAY_MS + entry.delay : 0;
  const accentScope = { color: item.accent };
  const accentClass = item.accent ? undefined : "text-crfal-blue";
  const dismissOnDelete = (event: React.KeyboardEvent) => {
    if (event.key !== "Delete" && event.key !== "Backspace") return;
    event.preventDefault();
    onDismiss();
  };

  return (
    <div
      role="listitem"
      data-notification={item.id}
      data-kind={item.kind}
      data-read={read ? "" : undefined}
      data-leaving={entry.leaving ? "" : undefined}
      data-play={entry.play}
      className="grid"
      style={{ gridTemplateRows: shown ? "1fr" : "0fr", transition: rowTransition }}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="px-1 pb-2.5 pt-0.5">
          <article
            aria-label={`${item.app}: ${item.title}${read ? "" : ", não lida"}`}
            className={cx(
              "group relative rounded-2xl border border-crfal-gray-200/80 p-3.5 text-crfal-gray-800",
              "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_24px_-20px_rgba(11,25,44,0.35)] hover:border-crfal-blue/25 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_32px_-20px_rgba(0,51,102,0.45)]",
            )}
            style={{ transform: shown ? "none" : entry.leaving ? "translateX(18%) scale(0.98)" : "translateY(-16px) scale(0.96)", opacity: shown ? 1 : 0, transition: cardTransition }}
          >
            <div className="flex gap-3">
              <AppTile kind={item.kind} accent={item.accent} play={entry.play} delay={storyDelay} reduced={reduced} />
              <div className="min-w-0 flex-1">
                <div className="flex h-4 items-center gap-1.5 pr-7 text-xs leading-4 text-crfal-gray-600 [@media(hover:none)]:pr-10">
                  <span className="truncate text-[11px] font-semibold uppercase tracking-[0.08em]" style={accentScope}>
                    <span className={accentClass}>{item.app}</span>
                  </span>
                  <span aria-hidden className="text-crfal-gold">·</span>
                  <span data-time className="shrink-0 tabular-nums">
                    {item.time ?? (entry.arrived ? "agora" : "")}
                  </span>
                </div>
                {item.href ? (
                  <a
                    href={item.href}
                    data-open
                    onClick={(event) => {
                      onOpen();
                      if (!onNavigate || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                      event.preventDefault();
                      onNavigate(item.href!);
                    }}
                    onKeyDown={dismissOnDelete}
                    className={cx(OPEN_CLASS, read ? "font-semibold" : "font-bold")}
                  >
                    {item.title}
                  </a>
                ) : (
                  <button type="button" data-open onClick={onOpen} onKeyDown={dismissOnDelete} className={cx(OPEN_CLASS, read ? "font-semibold" : "font-bold")}>
                    {item.title}
                  </button>
                )}
                {item.body && <p className="mt-1 line-clamp-3 text-[13px] leading-normal text-crfal-gray-600">{item.body}</p>}
                <div className={cx("mt-3", accentClass)} style={accentScope}>
                  <Detail item={item} play={entry.play} delay={storyDelay} reduced={reduced} />
                  {item.actions && item.actions.length > 0 && (
                    <div className="relative z-[1] mt-2.5 flex flex-wrap items-center gap-2">
                      {done ? (
                        <span data-done className="inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium" style={{ background: TINT }}>
                          <Icon d={CHECK} className="size-3.5" />
                          <span className="text-crfal-blue-dark">{done}</span>
                        </span>
                      ) : (
                        item.actions.map((action, i) => (
                          <button
                            key={action.label}
                            type="button"
                            data-action={action.label}
                            onClick={(event) => {
                              event.stopPropagation();
                              onAction(action);
                            }}
                            className={cx(
                              "h-7 rounded-full px-3 text-xs font-semibold transition-colors",
                              FOCUS_RING,
                              i === 0 ? "bg-crfal-blue text-white hover:bg-crfal-blue-dark" : "border border-crfal-gray-200 bg-white text-crfal-blue hover:bg-crfal-blue-lighter",
                            )}
                          >
                            {action.label}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {!read && (
              <span
                data-unread
                aria-hidden
                className={cx(
                  // Centro na linha do rótulo (22px), no lugar do "Dispensar" que surge no hover; sem hover, ao lado dele.
                  "absolute right-[18px] top-[18px] size-2 rounded-full ring-2 ring-white transition-opacity group-focus-within:opacity-0 group-hover:opacity-0 [@media(hover:none)]:right-10 [@media(hover:none)]:group-focus-within:opacity-100",
                  !item.accent && "bg-crfal-blue",
                )}
                style={item.accent ? { background: item.accent } : undefined}
              />
            )}
            <button
              type="button"
              data-dismiss
              aria-label={`Dispensar ${item.title}`}
              onClick={(event) => {
                event.stopPropagation();
                onDismiss();
              }}
              className={cx(
                // 28px visíveis; no toque, a área de clique cresce para 40px sem empurrar o layout.
                "absolute right-2 top-2 z-[2] grid size-7 place-items-center rounded-full text-crfal-gray-600 opacity-0 transition-[opacity,background-color,color] hover:bg-crfal-blue-lighter hover:text-crfal-blue focus-visible:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100 pointer-coarse:before:absolute pointer-coarse:before:-inset-1.5 pointer-coarse:before:content-[''] [@media(hover:none)]:opacity-100",
                FOCUS_RING,
              )}
            >
              <Icon d={CLOSE} className="size-3.5" />
            </button>
          </article>
        </div>
      </div>
    </div>
  );
}

/* 32px com mouse, 44px em telas de toque. */
const HEADER_BUTTON = cx(
  "inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold text-crfal-blue pointer-coarse:h-11 transition-colors hover:bg-crfal-blue-lighter disabled:pointer-events-none disabled:text-crfal-gray-500 disabled:opacity-60",
  FOCUS_RING,
);

export function LiveNotificationFeed({
  items,
  title = "Notificações",
  unreadCount,
  autoplay = false,
  initial = 2,
  interval = 1500,
  loop = false,
  height = DEFAULT_HEIGHT,
  onOpen,
  onAction,
  onDismiss,
  onReadAll,
  onClear,
  onNavigate,
  ref,
  className,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...rest
}: LiveNotificationFeedProps) {
  const reduced = useReducedMotion();
  const startCount = autoplay ? Math.min(Math.max(0, Math.round(initial)), items.length) : items.length;
  const [entries, setEntries] = React.useState(() => items.slice(0, startCount).map((item) => staticEntry(item.id, 0)));
  const [readIds, setReadIds] = React.useState(() => new Set(items.filter((item) => item.read).map((item) => item.id)));
  const [done, setDone] = React.useState((): { [id: string]: string } => ({}));
  const [announcement, setAnnouncement] = React.useState("");
  const cursor = React.useRef(startCount);
  const generation = React.useRef(0);
  const paused = React.useRef(false);
  const timers = React.useRef([] as number[]);
  const bellRef = React.useRef(null as SVGSVGElement | null);
  const itemsRef = React.useRef(items);
  const initialRef = React.useRef(initial);
  const reducedRef = React.useRef(reduced);
  const entriesRef = React.useRef(entries);
  const handlers = React.useRef({ onOpen, onAction, onDismiss, onReadAll, onClear, onNavigate });
  // Os refs acompanham as props depois de cada commit (e antes dos efeitos que os leem),
  // em vez de serem reescritos durante a renderização como no original.
  React.useLayoutEffect(() => {
    itemsRef.current = items;
    initialRef.current = initial;
    reducedRef.current = reduced;
    entriesRef.current = entries;
    handlers.current = { onOpen, onAction, onDismiss, onReadAll, onClear, onNavigate };
  });

  const itemsKey = items.map((item) => item.id).join("\u0000");
  const byId = React.useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const showAll = !autoplay || reduced;

  React.useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const later = React.useCallback((run: () => void, ms: number) => {
    timers.current.push(window.setTimeout(run, ms));
  }, []);

  const ringBell = React.useCallback(() => {
    if (reducedRef.current) return;
    bellRef.current?.animate(
      [
        { transform: "rotate(0deg)" },
        { transform: "rotate(16deg)" },
        { transform: "rotate(-12deg)" },
        { transform: "rotate(7deg)" },
        { transform: "rotate(-3deg)" },
        { transform: "rotate(0deg)" },
      ],
      { duration: 720, easing: "ease-out" },
    );
  }, []);

  const arrive = React.useCallback(
    (id: string) => {
      const item = itemsRef.current.find((candidate) => candidate.id === id);
      if (!item) return;
      generation.current += 1;
      const entry: Entry = { id, key: `${id}:${generation.current}`, play: 1, fresh: !reducedRef.current, leaving: false, arrived: true, delay: 0, leaveDelay: 0 };
      setEntries((prev) => [...prev.filter((e) => e.id !== id), entry]);
      setReadIds((prev) => {
        if (prev.has(id) === Boolean(item.read)) return prev;
        const next = new Set(prev);
        if (item.read) next.add(id);
        else next.delete(id);
        return next;
      });
      setDone((prev) => {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setAnnouncement(`${item.app}: ${item.title}`);
      ringBell();
    },
    [ringBell],
  );

  const removeKeys = React.useCallback(
    (keys: string[], after: number) => {
      later(() => setEntries((prev) => prev.filter((e) => !keys.includes(e.key))), after);
    },
    [later],
  );

  const clearAll = React.useCallback(() => {
    const visible = entriesRef.current.filter((e) => !e.leaving).reverse();
    if (visible.length === 0) return 0;
    const step = reducedRef.current ? 0 : SWEEP_STAGGER_MS;
    const order = new Map(visible.map((e, i) => [e.key, i]));
    setEntries((prev) => prev.map((e) => (order.has(e.key) ? { ...e, leaving: true, leaveDelay: order.get(e.key)! * step } : e)));
    const total = reducedRef.current ? 0 : LEAVE_MS + (visible.length - 1) * step;
    removeKeys(
      visible.map((e) => e.key),
      total,
    );
    return total;
  }, [removeKeys]);

  const restart = React.useCallback(() => {
    const list = itemsRef.current;
    const count = Math.min(Math.max(0, Math.round(initialRef.current)), list.length);
    cursor.current = count;
    generation.current += 1;
    const gen = generation.current;
    setEntries(list.slice(0, count).map((item, i) => staticEntry(item.id, gen, !reducedRef.current, (count - 1 - i) * 90)));
    setReadIds(new Set(list.filter((item) => item.read).map((item) => item.id)));
    setDone({});
  }, []);

  React.useEffect(() => {
    if (showAll || itemsRef.current.length === 0) return;
    let timer = 0;
    const step = () => {
      if (paused.current) {
        timer = window.setTimeout(step, 300);
        return;
      }
      const list = itemsRef.current;
      if (cursor.current < list.length) {
        const next = list[cursor.current]!;
        cursor.current += 1;
        arrive(next.id);
        timer = window.setTimeout(step, cursor.current < list.length ? interval : interval * RESTART_HOLD);
        return;
      }
      if (!loop) return;
      const took = clearAll();
      timer = window.setTimeout(() => {
        restart();
        timer = window.setTimeout(step, FIRST_ARRIVAL_MS + 500);
      }, took + 200);
    };
    timer = window.setTimeout(step, FIRST_ARRIVAL_MS);
    return () => window.clearTimeout(timer);
  }, [showAll, interval, loop, itemsKey, arrive, clearAll, restart]);

  const lastShowAll = React.useRef(showAll);
  const lastItemsKey = React.useRef(itemsKey);
  React.useEffect(() => {
    const modeChanged = lastShowAll.current !== showAll;
    const itemsChanged = lastItemsKey.current !== itemsKey;
    const previousIds = new Set(lastItemsKey.current.split("\u0000"));
    lastShowAll.current = showAll;
    lastItemsKey.current = itemsKey;
    if (!modeChanged && !itemsChanged) return;
    const list = itemsRef.current;
    if (!showAll) {
      restart();
      return;
    }
    if (modeChanged) {
      generation.current += 1;
      const gen = generation.current;
      setEntries((prev) => {
        const kept = new Map(prev.filter((e) => !e.leaving).map((e) => [e.id, e]));
        return list.map((item) => kept.get(item.id) ?? staticEntry(item.id, gen));
      });
      cursor.current = list.length;
      return;
    }
    const ids = new Set(list.map((item) => item.id));
    setEntries((prev) => prev.filter((e) => ids.has(e.id)));
    list.filter((item) => !previousIds.has(item.id)).forEach((item) => arrive(item.id));
  }, [showAll, itemsKey, restart, arrive]);

  const markRead = (id: string) => setReadIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));

  const live = entries.filter((e) => !e.leaving);
  const unread = unreadCount ?? live.filter((e) => !readIds.has(e.id)).length;
  const itemOrder = new Map(items.map((item, index) => [item.id, index]));
  const ordered = autoplay ? [...entries].reverse() : [...entries].sort((a, b) => (itemOrder.get(b.id) ?? -1) - (itemOrder.get(a.id) ?? -1));
  const pause = (value: boolean) => {
    paused.current = value;
  };

  // Rolagem: o esmaecimento e o "Mais notificações" só aparecem quando há itens abaixo;
  // no fim da lista o último card fica inteiro. O fio sob o cabeçalho marca a lista rolada.
  const listRef = React.useRef(null as HTMLDivElement | null);
  const [scroll, setScroll] = React.useState({ scrolled: false, more: false, overflow: false });
  const measure = React.useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const scrolled = list.scrollTop > 1;
    const more = list.scrollTop + list.clientHeight < list.scrollHeight - 2;
    const overflow = list.scrollHeight > list.clientHeight + 2;
    setScroll((prev) => (prev.scrolled === scrolled && prev.more === more && prev.overflow === overflow ? prev : { scrolled, more, overflow }));
  }, []);
  React.useLayoutEffect(measure, [measure, entries]);
  React.useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [measure]);
  const fade = scroll.more ? `linear-gradient(to bottom, black calc(100% - ${FADE_PX}px), transparent)` : undefined;

  return (
    <div
      ref={ref}
      data-slot="live-notification-feed"
      data-unread={unread}
      className={cx(
        "relative isolate w-full overflow-hidden rounded-[28px] border border-crfal-gray-200/80 bg-crfal-gray-50/90 p-2 text-crfal-gray-800 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_28px_60px_-24px_rgba(11,25,44,0.45)] backdrop-blur-xl",
        className,
      )}
      onPointerEnter={(event) => {
        pause(true);
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        pause(event.currentTarget.contains(document.activeElement));
        onPointerLeave?.(event);
      }}
      onFocus={(event) => {
        pause(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) pause(event.currentTarget.matches(":hover"));
        onBlur?.(event);
      }}
      {...rest}
    >
      {/* Acabamento: fio dourado no topo, brilho azul e grade fina mascarada, como nos cabeçalhos do site. */}
      <span aria-hidden className="pointer-events-none absolute inset-x-8 top-0 -z-10 h-px bg-linear-to-r/srgb from-crfal-gold/0 via-crfal-gold to-crfal-gold/0" />
      <span aria-hidden className="pointer-events-none absolute -right-16 -top-20 -z-10 size-48 rounded-full bg-crfal-blue-light/15 blur-3xl" />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 opacity-60 [background-image:linear-gradient(to_right,rgb(0_51_102/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(0_51_102/0.06)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />
      {/* Sem espaço para tudo numa linha, as ações descem para a de baixo e o título fica inteiro. */}
      <div className="flex flex-wrap items-center gap-x-2 pb-2 pl-3 pr-1.5 pt-2.5">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-crfal-blue text-white ring-1 ring-crfal-gold/50">
          <svg
            ref={bellRef}
            viewBox="0 0 24 24"
            aria-hidden
            className="size-4"
            style={{ transformOrigin: "50% 12%" }}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={BELL} />
          </svg>
        </span>
        <h2 className="truncate text-[15px] font-bold leading-5 tracking-tight text-crfal-blue-dark">{title}</h2>
        <span
          data-count
          aria-label={`${unread} ${unread === 1 ? "não lida" : "não lidas"}`}
          className={cx("min-w-5 shrink-0 rounded-full bg-crfal-blue px-1.5 text-center text-[11px] font-bold leading-5 text-white tabular-nums transition-opacity", unread === 0 && "opacity-0")}
        >
          {unread}
        </span>
        <div className="ml-auto flex shrink-0 items-center whitespace-nowrap">
          <button
            type="button"
            data-read-all
            disabled={unread === 0}
            onClick={() => {
              const ids = live.map((e) => e.id);
              setReadIds((prev) => new Set([...prev, ...ids]));
              handlers.current.onReadAll?.(ids);
            }}
            className={HEADER_BUTTON}
          >
            {/* No celular, "Marcar lidas": o trecho oculto sai também do nome acessível. */}
            <span>
              Marcar <span className="hidden sm:inline">todas como </span>lidas
            </span>
          </button>
          <button
            type="button"
            data-clear
            disabled={live.length === 0}
            onClick={() => {
              const ids = live.map((e) => e.id);
              clearAll();
              handlers.current.onClear?.(ids);
            }}
            className={HEADER_BUTTON}
          >
            Limpar
          </button>
        </div>
      </div>
      <div className="relative">
        <span aria-hidden className={cx("pointer-events-none absolute inset-x-3 top-0 z-[3] h-px bg-crfal-gray-200 motion-safe:transition-opacity", !scroll.scrolled && "opacity-0")} />
        <div
          ref={listRef}
          role="list"
          aria-label={title}
          onScroll={measure}
          onTransitionEnd={measure}
          className="overflow-y-auto overscroll-contain px-0.5 pb-1 pt-1 [scrollbar-width:thin]"
          style={{ maxHeight: height, scrollPaddingTop: 8, scrollPaddingBottom: FADE_PX, maskImage: fade, WebkitMaskImage: fade }}
        >
          {ordered.map((entry) => {
            const item = byId.get(entry.id);
            if (!item) return null;
            return (
              <NotificationCard
                key={entry.key}
                item={item}
                entry={entry}
                read={readIds.has(entry.id)}
                done={done[entry.id]}
                reduced={reduced}
                onOpen={() => {
                  markRead(entry.id);
                  setEntries((prev) => prev.map((e) => (e.key === entry.key ? { ...e, play: e.play + 1, fresh: false, delay: 0 } : e)));
                  handlers.current.onOpen?.(entry.id);
                }}
                onNavigate={onNavigate ? (href) => handlers.current.onNavigate?.(href, entry.id) : undefined}
                onAction={(action) => {
                  markRead(entry.id);
                  setDone((prev) => ({ ...prev, [entry.id]: action.done ?? action.label }));
                  handlers.current.onAction?.(entry.id, action.label);
                }}
                onDismiss={() => {
                  setEntries((prev) => prev.map((e) => (e.key === entry.key ? { ...e, leaving: true, leaveDelay: 0 } : e)));
                  removeKeys([entry.key], reduced ? 0 : LEAVE_MS);
                  handlers.current.onDismiss?.(entry.id);
                }}
              />
            );
          })}
        </div>
        {entries.length === 0 && (
          // No fluxo (a lista tem altura variável): é ele quem dá altura ao painel vazio.
          <div data-empty className="px-6 pb-12 pt-10 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-white text-crfal-blue shadow-[0_8px_20px_-12px_rgba(0,51,102,0.45)] ring-1 ring-crfal-gold/40">
              <Icon d={CHECK} className="size-6" />
            </span>
            <p className="mt-3 text-sm font-bold text-crfal-blue-dark">Tudo em dia</p>
            <p className="mt-1 text-[13px] leading-normal text-crfal-gray-600">Novas notificações aparecerão aqui.</p>
          </div>
        )}
      </div>
      {/* Faixa própria abaixo da lista, fora da área rolável: nunca cobre um card. A altura fica
          reservada enquanto a lista rola (a pílula só aparece com itens abaixo) e abre/fecha
          suave quando a lista passa a rolar ou deixa de rolar. */}
      <div
        data-more-strip
        aria-hidden
        className="grid"
        style={{ gridTemplateRows: scroll.overflow ? "1fr" : "0fr", transition: reduced ? "none" : `grid-template-rows 220ms ${SETTLE}` }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex h-9 items-center justify-center">
            {/* Só para ponteiro: quem navega pelo teclado percorre os cards com Tab e a lista rola junto. */}
            <span
              data-more
              onClick={() => {
                const list = listRef.current;
                list?.scrollBy({ top: list.clientHeight * 0.75, behavior: reduced ? "auto" : "smooth" });
              }}
              className={cx(
                "inline-flex h-7 cursor-pointer select-none items-center gap-1 rounded-full bg-white/60 pl-3 pr-2 text-[11px] font-semibold text-crfal-blue ring-1 ring-crfal-gray-200 hover:bg-crfal-blue-lighter motion-safe:transition-[opacity,background-color] motion-safe:duration-200",
                !scroll.more && "pointer-events-none opacity-0",
              )}
            >
              Mais notificações
              <Icon d={CHEVRON_DOWN} className="size-3.5" />
            </span>
          </div>
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}

export default LiveNotificationFeed;
