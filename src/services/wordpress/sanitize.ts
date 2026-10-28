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
  ADD_ATTR: ['target', 'allow', 'allowfullscreen', 'frameborder', 'loading', 'referrerpolicy'],
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
  const target = node.getAttribute('target')?.toLowerCase();
  if (target) node.setAttribute('target', target === '_blank' ? '_blank' : '_self');
  if (target === '_blank') node.setAttribute('rel', 'noopener noreferrer');
  const href = node.getAttribute('href');
  if (!href) return;
  if (href.startsWith('#')) {
    if (href.length > 1 && !href.startsWith(`#${NAMED_PROPS_PREFIX}`)) node.setAttribute('href', `#${NAMED_PROPS_PREFIX}${href.slice(1)}`);
    return;
  }
  let url: URL;
  try { url = new URL(href, SITE_URL); } catch { return; }
  if (!['http:', 'https:'].includes(url.protocol)) return;
  // Do site antigo, só /publicacao/<slug> tem destino no portal (301 para a notícia). Uploads e
  // demais páginas continuam no domínio legado, que segue no ar.
  const legacy = ['crf-al.org.br', 'www.crf-al.org.br'].includes(url.hostname) && /^\/publicacao\/[^/]+\/?$/.test(url.pathname);
  const internal = legacy || origins.includes(url.origin);
  if (internal && url.hash.length > 1 && !url.hash.startsWith(`#${NAMED_PROPS_PREFIX}`)) {
    url.hash = `#${NAMED_PROPS_PREFIX}${url.hash.slice(1)}`;
    node.setAttribute('href', href.split('#')[0] + url.hash);
  }
  if (legacy) node.setAttribute('href', url.pathname + url.search + url.hash);
  if (!internal) node.setAttribute('rel', 'noopener noreferrer');
}

type Purifier = ReturnType<typeof DOMPurify>;
let purifier: Purifier | undefined;
/** Instância própria: os hooks não vazam para outros usos do DOMPurify global. */
function instance(): Purifier {
  if (purifier) return purifier;
  // Origem do deploy atual (ex.: preview) e o domínio canônico; "null" (about:blank) é ignorado.
  const origins = [...new Set([globalThis.location?.origin, new URL(SITE_URL).origin].filter((value): value is string => Boolean(value) && /^https?:/.test(value!)))];
  purifier = DOMPurify();
  purifier.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName === 'iframe') filterIframe(node as Element);
  });
  purifier.addHook('afterSanitizeAttributes', node => {
    if ((node as Element).tagName === 'A') secureLink(node as Element, origins);
  });
  return purifier;
}

/**
 * Sanitiza HTML do WordPress para uso seguro com dangerouslySetInnerHTML.
 * Módulo separado do client para o DOMPurify ir só nos chunks das páginas de detalhe.
 */
export function sanitizeWP(html: string): string {
  return instance().sanitize(html, SANITIZE_CONFIG);
}
