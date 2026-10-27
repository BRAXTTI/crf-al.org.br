import DOMPurify from 'dompurify';
import { SITE_URL } from '@/config/site';

/** Única origem de iframe aceita; a CSP (`frame-src`) permite só ela. */
const YOUTUBE_EMBED = /^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]+(?:[?#][^\s"'<>]*)?$/;
/** Embeds antigos do YouTube passam a usar o domínio sem cookies em vez de sumirem. */
const YOUTUBE_LEGACY = /^(?:https?:)?\/\/(?:www\.)?youtube(?:-nocookie)?\.com\/embed\//i;
const NAMED_PROPS_PREFIX = 'user-content-';

/** Configuração aplicada ao HTML do WordPress (exportada para os testes). */
export const SANITIZE_CONFIG = {
  // Estilos globais e formulários não pertencem ao conteúdo editorial.
  FORBID_TAGS: ['style', 'link', 'meta', 'base', 'form', 'input', 'button', 'textarea', 'select', 'option', 'optgroup', 'datalist', 'fieldset', 'output', 'dialog', 'template'],
  FORBID_ATTR: ['autofocus', 'formaction'],
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'loading', 'referrerpolicy'],
  // Prefixa id/name (DOM clobbering); âncoras internas são reescritas abaixo.
  SANITIZE_NAMED_PROPS: true,
};

type HookElement = Pick<Element, 'getAttribute' | 'setAttribute' | 'hasAttribute' | 'tagName'> & { parentNode: { removeChild(node: unknown): unknown } | null };

/** Mantém só iframes do youtube-nocookie; retorna false quando o elemento foi removido. */
export function filterIframe(node: HookElement): boolean {
  const src = (node.getAttribute('src') ?? '').trim().replace(YOUTUBE_LEGACY, 'https://www.youtube-nocookie.com/embed/');
  if (!YOUTUBE_EMBED.test(src)) {
    node.parentNode?.removeChild(node);
    return false;
  }
  node.setAttribute('src', src);
  node.setAttribute('loading', 'lazy');
  // O player do YouTube exige o referrer da página que incorpora.
  node.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  return true;
}

/** Links externos sem acesso ao opener/referrer; âncoras internas seguem os ids prefixados. */
export function secureLink(node: HookElement, origins: string[]): void {
  const href = node.getAttribute('href');
  if (!href) return;
  if (href.startsWith('#')) {
    if (href.length > 1 && !href.startsWith(`#${NAMED_PROPS_PREFIX}`)) node.setAttribute('href', `#${NAMED_PROPS_PREFIX}${href.slice(1)}`);
    return;
  }
  let url: URL;
  try { url = new URL(href, SITE_URL); } catch { return; }
  if (['http:', 'https:'].includes(url.protocol) && !origins.includes(url.origin)) node.setAttribute('rel', 'noopener noreferrer');
}

let configured = false;
function configure() {
  if (configured) return;
  configured = true;
  // Origem do deploy atual (ex.: preview) e o domínio canônico; "null" (about:blank) é ignorado.
  const origins = [...new Set([globalThis.location?.origin, new URL(SITE_URL).origin].filter((value): value is string => Boolean(value) && /^https?:/.test(value!)))];
  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName === 'iframe') filterIframe(node as Element);
  });
  DOMPurify.addHook('afterSanitizeAttributes', node => {
    if ((node as Element).tagName === 'A') secureLink(node as Element, origins);
  });
}

/**
 * Sanitiza HTML do WordPress para uso seguro com dangerouslySetInnerHTML.
 * Módulo separado do client para o DOMPurify ir só nos chunks das páginas de detalhe.
 */
export function sanitizeWP(html: string): string {
  configure();
  return DOMPurify.sanitize(html, SANITIZE_CONFIG);
}
