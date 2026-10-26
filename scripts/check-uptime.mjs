/** Smoke HTTP online e agendável; não pertence a npm test. */
import assert from 'node:assert/strict';
import { siteConfig } from './load-config.mjs';
const { SITE_URL } = await siteConfig();
const base = process.argv[2] || SITE_URL;
for (const [path, expected] of [['/', 200], ['/api/news?per_page=1', 200], ['/instituicao/estatuto', 404], ['/pagina-inexistente-uptime', 404], ['/instituicao/missao-visao', 301]]) {
  const start = Date.now();
  const response = await fetch(base + path, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
  console.log(JSON.stringify({ event: 'uptime_check', path, status: response.status, elapsedMs: Date.now() - start }));
  assert.equal(response.status, expected, path);
  if (expected === 404) assert.equal(response.headers.get('X-Robots-Tag'), 'noindex');
  if (expected === 301) assert.equal(response.headers.get('Location'), `${SITE_URL}/instituicao/sobre-conselho`);
  await response.body?.cancel();
}
