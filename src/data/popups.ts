/**
 * Popups do site (avisos, campanhas, comunicados).
 *
 * COMO ADICIONAR/ALTERAR (sem mexer em mais nada):
 *  1. Coloque as artes em `public/images/popups/`.
 *  2. Edite a lista abaixo.
 *  3. Commit/push — o deploy cuida do resto.
 *
 * Comportamento:
 *  - Exibe UM popup por vez: o primeiro da lista com `active !== false`.
 *  - Abre após `delayMs` (padrão 3000 ms) do carregamento da página.
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
}

export const popups: Popup[] = [
  {
    id: 'exemplo-2026-01',
    // Exemplo usando uma arte existente. Troque por `image`/`imageMobile` do popup.
    image: '/images/popups/Farmacia_Feed_Inscreva-se.png',
    alt: 'Simposio Internacional - Albert Eistein CRFAL',
    href: 'https://ensino.einstein.br/evento_simposio_internacional_farmacia_p0961/p',
    title: '',
    description: 'Cupom: FARMACIA20OFF',
    ctaLabel: '',
    active: true,
    external: true,
  },
];
