import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { loadNews } from './load-news.mjs';

// Offline handler tests. HTMLRewriter is a pass-through here; use a Pages
// preview and test-page-metadata.mjs to validate Cloudflare's HTML transformation.
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(ts.transpile(source, {
  module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022,
})).toString('base64')}`;
const metadataUrl = moduleUrl(await readFile(new URL('../src/config/page-metadata.ts', import.meta.url), 'utf8'));
const source = (await readFile(new URL('../functions/_middleware.ts', import.meta.url), 'utf8'))
  .replace("'../src/config/page-metadata'", JSON.stringify(metadataUrl))
  .replace("'./_news'", JSON.stringify(await loadNews()));
const { onRequest, buildMeta } = await import(moduleUrl(source));
const { PAGE_METADATA } = await import(metadataUrl);
const saved = { fetch: globalThis.fetch, caches: globalThis.caches, rewriter: globalThis.HTMLRewriter, error: console.error };
let fetches = 0;
let origin = () => Response.json([]);
let stored = new Map();
let background = [];

globalThis.HTMLRewriter = class {
  on() { return this; }
  transform(response) { return response; }
};
globalThis.caches = { default: {
  match: async request => stored.get(request.url)?.clone(),
  put: async (request, response) => { stored.set(request.url, response); },
} };
globalThis.fetch = async (...args) => { fetches++; return origin(...args); };
console.error = () => {};

function shell() {
  return new Response('<html><head><title>CRFAL</title></head><body><div id="root"></div></body></html>', {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=31536000, immutable', ETag: 'shell' },
  });
}

async function request(path, options = {}) {
  background = [];
  return onRequest({
    request: new Request(`https://institucional.crf-al.org.br${path}`, { method: options.method || 'GET' }),
    next: async () => options.response || shell(),
    waitUntil: promise => background.push(promise),
  });
}

async function expectMissing(path, plainText = false) {
  const response = await request(path);
  assert.equal(response.status, 404, path);
  assert.equal(response.headers.get('Cache-Control'), 'no-store', path);
  assert.equal(response.headers.get('X-Robots-Tag'), 'noindex', path);
  assert.equal(response.headers.get('ETag'), null, path);
  if (plainText) assert.match(response.headers.get('Content-Type'), /^text\/plain/);
}

try {
  const routes = await readFile(new URL('../src/router/app-router.tsx', import.meta.url), 'utf8');
  const sitemap = await readFile(new URL('../public/sitemap-pages.xml', import.meta.url), 'utf8');
  const sitemapPaths = new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => new URL(url).pathname));
  for (const [, path] of routes.matchAll(/\{ path: '([^':*]+)', element:/g)) {
    if (path !== 'instituicao/missao-visao') assert.ok(Object.hasOwn(PAGE_METADATA, `/${path}`), `route coverage: ${path}`);
  }
  for (const path of Object.keys(PAGE_METADATA)) {
    assert.ok(sitemapPaths.has(path), `Static sitemap coverage: ${path}`);
    assert.equal((await request(path)).status, 200, path);
    if (path !== '/') assert.equal((await request(`${path}/?utm_source=test`)).status, 200, path);
  }
  assert.equal(fetches, 0, 'Static pages must not query WordPress');

  for (const path of ['/pagina-inexistente', '/constructor', '/__proto__', '/404', '/eventos/slug/extra', '/imprensa/noticias/%ZZ', '/imprensa/noticias/%2F', '/imprensa/galeria-de-fotos/slug/extra']) {
    await expectMissing(path);
  }
  for (const path of ['/assets/missing.js', '/images/missing.webp', '/fonts/missing.woff2', '/api/missing']) await expectMissing(path, true);
  assert.equal((await request('/missing', { method: 'HEAD' })).status, 404);

  for (const [path, type] of [['/assets/main.js', 'application/javascript'], ['/images/logo.png', 'image/png'], ['/api/instagram', 'application/json'], ['/robots.txt', 'text/plain'], ['/sitemap.xml', 'application/xml']]) {
    const asset = new Response('resource', { headers: { 'Content-Type': type } });
    assert.equal(await request(path, { response: asset }), asset, `Preserve real resource: ${path}`);
  }
  const existing404 = new Response('Not found', { status: 404 });
  assert.equal(await request('/images/missing.png', { response: existing404 }), existing404);
  const postResponse = Response.json({ ok: true });
  assert.equal(await request('/api/instagram', { method: 'POST', response: postResponse }), postResponse);

  for (const [path, target] of [['/instituicao/missao-visao', '/instituicao/sobre-conselho'], ['/publicacao/noticia', '/imprensa/noticias/noticia']]) {
    const response = await request(path);
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('Location'), `https://institucional.crf-al.org.br${target}`);
  }

  origin = () => Response.json([]);
  await expectMissing('/imprensa/noticias/noticia-inexistente');
  await expectMissing('/eventos/evento-inexistente');
  origin = () => new Response('', { status: 404 });
  await expectMissing('/imprensa/noticias/999999999');
  await expectMissing('/imprensa/galeria-de-fotos/album-inexistente');

  const post = { id: 8155, slug: 'noticia', date: '2026-10-10T09:00:00', title: { rendered: 'Título &amp; notícia' }, excerpt: { rendered: '<p>Resumo</p>' } };
  origin = () => Response.json(post);
  let response = await request('/imprensa/noticias/8155');
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('Location'), 'https://institucional.crf-al.org.br/imprensa/noticias/noticia');
  let originUrl;
  origin = url => { originUrl = new URL(url); return Response.json(originUrl.searchParams.get('rest_route') === '/wp/v2/categories' ? [{id: 10, slug: 'noticias-do-portal'}] : [post]); };
  response = await request('/imprensa/noticias/noticia');
  assert.equal(response.status, 200);
  assert.equal(originUrl.searchParams.get('categories'), '10', 'Current metadata must use editorial category');
  await Promise.all(background);
  const before = fetches;
  assert.equal((await request('/imprensa/noticias/noticia?utm_source=test')).status, 200);
  assert.equal(fetches, before, 'Metadata cache ignores tracking query strings');

  for (const status of [404, 403, 500, 503]) {
    stored = new Map();
    origin = () => new Response('', { status });
    // A missing API collection means the integration is broken, not that all
    // articles/events disappeared. Individual 404s were covered above.
    for (const path of ['/imprensa/noticias/noticia', '/eventos/evento']) {
      response = await request(path);
      assert.equal(response.status, 503, `${path}: origin ${status}`);
      assert.equal(response.headers.get('Cache-Control'), 'no-store');
      assert.equal(response.headers.get('Retry-After'), '60');
      assert.equal(response.headers.get('X-Robots-Tag'), null, 'Do not deindex valid content during an outage');
      assert.equal(response.headers.get('ETag'), null);
    }
    assert.equal(stored.size, 0, 'Never cache origin errors');
  }
  origin = () => { throw new TypeError('Network unavailable'); };
  assert.equal((await request('/imprensa/galeria-de-fotos/album')).status, 503);

  const tags = buildMeta({ title: 'Título <teste>', description: 'Texto "citado" & seguro', canonical: 'https://example.org/noticia', noindex: true });
  assert.ok(tags.includes('Texto &quot;citado&quot; &amp; seguro'));
  assert.ok(tags.includes('Título &lt;teste&gt;'));
  assert.equal((tags.match(/rel="canonical"/g) || []).length, 1);
  assert.ok(tags.includes('content="noindex, nofollow"'));
  console.log(`SEO: ${Object.keys(PAGE_METADATA).length} static routes, genuine 404s, resources/APIs, redirects, metadata cache and origin failures passed (offline handler tests).`);
} finally {
  globalThis.fetch = saved.fetch;
  globalThis.caches = saved.caches;
  globalThis.HTMLRewriter = saved.rewriter;
  console.error = saved.error;
}
