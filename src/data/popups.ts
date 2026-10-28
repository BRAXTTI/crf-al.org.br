/**
 * Popups do site (avisos, campanhas, comunicados).
 *
 * COMO ADICIONAR/ALTERAR (sem mexer em mais nada):
 *  1. Coloque as artes em `public/images/popups/`.
 *  2. Edite a lista abaixo.
 *  3. Commit/push — o deploy cuida do resto.
 *
 * Comportamento:
 *  - Exibe UM popup por vez: o primeiro da lista com `active !== false` e dentro do prazo.
 *  - `ate` (opcional, "AAAA-MM-DD") tira o popup do ar sozinho: vale até 23:59:59 desse
 *    dia no horário de Maceió (America/Maceio), qualquer que seja o fuso do visitante.
 *  - Abre após `delayMs` (padrão 3000 ms) do carregamento da página E depois da primeira
 *    interação em área neutra (rolagem por roda ou toque, clique fora de controles), para
 *    não virar o LCP da página. Toques, cliques e teclas em controles (links, botões,
 *    campos, `summary`, `[role=button]`, `[role=menuitem]`), no cabeçalho, no menu ou em
 *    qualquer `[role=dialog]` não contam: o popup nunca abre por cima dessa ação.
 *  - Depois da interação, espera ~1,5 s sem nova interação antes de abrir, e não abre
 *    enquanto o menu, o megamenu, o painel do sino ou outro diálogo estiverem abertos.
 *    Um toque, clique ou tecla num controle nesse meio-tempo cancela a abertura pendente:
 *    é preciso uma nova interação em área neutra.
 *  - Se estiver aberto quando o prazo `ate` vencer, fecha sozinho.
 *  - Ao fechar, não aparece de novo por `dismissDays` dias (padrão 1).
 *    Use `0` para não repetir na mesma sessão do navegador.
 *  - Sem `title`/`description`/`ctaLabel`, a arte inteira vira um link.
 *
 * Formato das artes (mesma regra dos banners do topo):
 *  - `image`       → paisagem (ex.: 1200×800)
 *  - `imageMobile` → retrato  (ex.: 900×1200), opcional
 *
 * Testar de novo no navegador: apague as chaves `crfal:popup:*` no
 * DevTools → Application → Storage (Local/Session Storage).
 */

export interface Popup {
  /** Identificador único (usado para lembrar que o usuário já fechou). */
  id: string;
  /** Arte desktop. Caminho em /public. */
  image: string;
  /** Arte mobile (opcional). Se ausente, usa `image`. */
  imageMobile?: string;
  /** Descrição acessível da arte. */
  alt: string;
  /** Destino ao clicar. Interno (`/...`) ou externo (`https://...`). */
  href?: string;
  /** Abrir link externo em nova aba. */
  external?: boolean;
  /** Texto sobreposto (opcional). Sem ele, a arte inteira vira link. */
  title?: string;
  description?: string;
  ctaLabel?: string;
  /** Delay em ms antes de abrir. Padrão 3000. */
  delayMs?: number;
  /** Dias até reaparecer após fechado. Padrão 1 (`0` = só a sessão). */
  dismissDays?: number;
  /** Desative com `false` para tirar do ar sem apagar. */
  active?: boolean;
  /** Último dia no ar ("AAAA-MM-DD"), inclusive, no horário de Maceió. Sem ele, não expira. */
  ate?: string;
}

const diaEmMaceio = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Maceio',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Ativo e, se tiver `ate`, ainda dentro do prazo (dia corrente em Maceió ≤ `ate`). */
export function popupNoAr(popup: Popup, agora: Date = new Date()) {
  if (popup.active === false) return false;
  return !popup.ate || diaEmMaceio.format(agora) <= popup.ate;
}

/**
 * Primeiro instante fora do ar (ms desde a época): 00:00 do dia seguinte a `ate` em Maceió
 * (UTC−3 fixo, sem horário de verão). `null` sem `ate` ou com data inválida.
 */
export function fimDoPrazo(popup: Popup) {
  if (!popup.ate) return null;
  const fim = Date.parse(`${popup.ate}T00:00:00-03:00`) + 24 * 60 * 60 * 1000;
  return Number.isFinite(fim) ? fim : null;
}

/** O popup da vez: o primeiro da lista que está no ar. */
export function popupDaVez(lista: Popup[] = popups, agora: Date = new Date()) {
  return lista.find((popup) => popupNoAr(popup, agora)) ?? null;
}

export const popups: Popup[] = [
  {
    id: 'alerta-golpe-anuidade-2026-10',
    image: '/images/banners/banner-golpe-nova-resolucao-desktop.webp',
    imageMobile: '/images/banners/banner-golpe-mobile.webp',
    alt: 'Alerta: golpe de cobrança de anuidade. Desconfie de boletos e links falsos, confira sempre o beneficiário e emita a 2ª via só pelo site oficial. Em caso de dúvida, fale com o CRF/AL pelos canais oficiais.',
    href: '/imprensa/noticias/crf-al-alerta-farmaceuticos-sobre-golpes-envolvendo-cobrancas-de-anuidades-pelo-whatsapp',
    dismissDays: 1,
    active: false,
  },
  {
    id: 'simposio-einstein-2026-10',
    // Parceria com o Einstein: VIII Simpósio Internacional de Farmácia (29 e 30/10/2026).
    image: '/images/popups/Farmacia_Feed_Inscreva-se.webp',
    alt: 'VIII Simpósio Internacional Einstein de Farmácia Hospitalar, 29 e 30 de outubro de 2026. Cupom FARMACIA20OFF.',
    href: 'https://ensino.einstein.br/evento_simposio_internacional_farmacia_p0961/p',
    title: '',
    description: 'Cupom: FARMACIA20OFF',
    ctaLabel: '',
    external: true,
    dismissDays: 1,
    ate: '2026-10-30',
  },
];
