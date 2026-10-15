import DOMPurify from 'dompurify';

/**
 * Sanitiza HTML do WordPress para uso seguro com dangerouslySetInnerHTML.
 * Módulo separado do client para o DOMPurify ir só nos chunks das páginas de detalhe.
 */
export function sanitizeWP(html: string): string {
  return DOMPurify.sanitize(html);
}
