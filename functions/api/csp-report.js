/** Relatórios locais de CSP: somente log, sem persistência ou alteração de política. */
const MAX_BYTES = 16 * 1024;
const headers = { 'Cache-Control': 'no-store' };

/** @param {unknown} value */
function safeOrigin(value) {
  if (typeof value !== 'string') return 'unknown';
  if (['inline', 'eval', 'self'].includes(value)) return value;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.origin : url.protocol;
  } catch {
    return 'unknown';
  }
}

/** @param {{ request: Request }} context */
export async function onRequest({ request }) {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { ...headers, Allow: 'POST' } });
  const type = request.headers.get('Content-Type')?.split(';')[0].trim();
  if (type !== 'application/csp-report') return new Response(null, { status: 415, headers });
  if (Number(request.headers.get('Content-Length')) > MAX_BYTES) return new Response(null, { status: 413, headers });
  const reader = request.body?.getReader();
  if (!reader) return new Response(null, { status: 400, headers });
  try {
    let bytes = 0;
    let text = '';
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BYTES) {
        await reader.cancel();
        return new Response(null, { status: 413, headers });
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    const report = JSON.parse(text)?.['csp-report'];
    if (!report || typeof report !== 'object' || Array.isArray(report)) {
      return new Response(null, { status: 400, headers });
    }
    // Nunca registrar caminhos, query strings, cookies, amostras de script ou o corpo bruto.
    console.log(JSON.stringify({
      event: 'csp_report',
      directive: String(report['effective-directive'] || report['violated-directive'] || '').split(' ')[0].slice(0, 80),
      documentOrigin: safeOrigin(report['document-uri']),
      blockedOrigin: safeOrigin(report['blocked-uri']),
    }));
    return new Response(null, { status: 204, headers });
  } catch {
    return new Response(null, { status: 400, headers });
  } finally {
    reader.releaseLock();
  }
}
