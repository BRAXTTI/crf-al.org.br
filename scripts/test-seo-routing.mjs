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
const imageSetUrl = moduleUrl(await readFile(new URL('../src/services/wordpress/image-set.ts', import.meta.url), 'utf8'));
const siteUrl = moduleUrl(await readFile(new URL('../src/config/site.ts', import.meta.url), 'utf8'));
const bannersUrl = moduleUrl((await readFile(new URL('../src/data/banners.ts', import.meta.url), 'utf8')).replace("'../config/site'", JSON.stringify(siteUrl)));
const source = (await readFile(new URL('../functions/_middleware.ts', import.meta.url), 'utf8'))
  .replace("'../src/config/site'", JSON.stringify(siteUrl))
  .replace("'../src/data/banners'", JSON.stringify(bannersUrl))
  .replace("'../src/config/page-metadata'", JSON.stringify(metadataUrl))
  .replace("'../src/services/wordpress/image-set'", JSON.stringify(imageSetUrl))
  .replace("'./_news'", JSON.stringify(await loadNews()));
const { onRequest, buildMeta, buildPreload, newsPreload, homePreload } = await import(moduleUrl(source));
const { banners, bannerMobileSrcSet, BANNER_MOBILE_SIZES, BANNER_MOBILE_MEDIA, BANNER_DESKTOP_MEDIA } = await import(bannersUrl);
const { mediaImageSet, NEWS_COVER_SIZES } = await import(imageSetUrl);
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

let forwarded;
async function request(path, options = {}) {
  background = [];
  return onRequest({
    request: new Request(`https://institucional.crf-al.org.br${path}`, { method: options.method || 'GET', headers: options.headers }),
    next: async upstream => { forwarded = upstream; return options.response || shell(); },
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
  const headers = await readFile(new URL('../public/_headers', import.meta.url), 'utf8');
  const csp = headers.match(/Content-Security-Policy: (.+)/)[1];
  for (const directive of ['img-src', 'media-src']) {
    const sources = csp.split(';').map(value => value.trim().split(/\s+/)).find(value => value[0] === directive);
    assert.ok(sources.includes('https://midias.crf-al.org.br'), `${directive}: permitir mídias após o redirect dos uploads legados`);
    assert.equal(sources.filter(source => source === 'https://midias.crf-al.org.br').length, 1, `${directive}: domínio de mídias sem duplicação`);
  }
  const routes = await readFile(new URL('../src/router/app-router.tsx', import.meta.url), 'utf8');
  const sitemap = await readFile(new URL('../public/sitemap-pages.xml', import.meta.url), 'utf8');
  const sitemapPaths = new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => new URL(url).pathname));
  for (const [, path] of routes.matchAll(/\{ path: '([^':*]+)', (?:element|lazy):/g)) {
    if (!['instituicao/missao-visao', 'imprensa/noticias-cff', 'instituicao/estatuto'].includes(path)) assert.ok(Object.hasOwn(PAGE_METADATA, `/${path}`), `route coverage: ${path}`);
  }
  for (const path of Object.keys(PAGE_METADATA)) {
    assert.equal(sitemapPaths.has(path), !['/eventos', '/imprensa/galeria-de-fotos'].includes(path), `Static sitemap coverage: ${path}`);
    assert.equal((await request(path)).status, 200, path);
    if (path !== '/') assert.equal((await request(`${path}/?utm_source=test`)).status, 200, path);
  }
  for (const path of ['/eventos', '/imprensa/galeria-de-fotos']) assert.equal((await request(path)).headers.get('X-Robots-Tag'), 'noindex');
  assert.ok(!sitemapPaths.has('/instituicao/estatuto'));
  assert.equal(fetches, 0, 'Static pages must not query WordPress');

  for (const path of ['/instituicao/estatuto', '/pagina-inexistente', '/constructor', '/__proto__', '/404', '/eventos/slug/extra', '/imprensa/noticias/%ZZ', '/imprensa/noticias/%2F', '/imprensa/galeria-de-fotos/slug/extra']) {
    await expectMissing(path);
  }
  for (const path of ['/assets/missing.js', '/images/missing.webp', '/fonts/missing.woff2', '/api/missing']) await expectMissing(path, true);
  assert.equal((await request('/missing', { method: 'HEAD' })).status, 404);

  for (const [path, type] of [['/assets/main.js', 'application/javascript'], ['/images/logo.png', 'image/png'], ['/api/instagram', 'application/json'], ['/robots.txt', 'text/plain'], ['/sitemap.xml', 'application/xml']]) {
    const asset = new Response('resource', { headers: { 'Content-Type': type } });
    assert.equal(await request(path, { response: asset }), asset, `Preserve real resource: ${path}`);
  }
  // Assets estáticos preservam validadores (304); rotas HTML os descartam para injetar metadados.
  const validators = { 'If-None-Match': '"abc"', 'If-Modified-Since': 'Tue, 27 Oct 2026 00:00:00 GMT' };
  for (const path of ['/images/logo.png', '/documentos/manual.pdf', '/fonts/inter-400.woff2', '/assets/main.js']) {
    const notModified = new Response(null, { status: 304 });
    assert.equal(await request(path, { headers: validators, response: notModified }), notModified, `304 preservado: ${path}`);
    assert.equal(forwarded.headers.get('If-None-Match'), '"abc"', path);
    assert.ok(forwarded.headers.get('If-Modified-Since'), path);
  }
  for (const path of ['/', '/instituicao/sobre-conselho', '/pagina-inexistente', '/imprensa/noticias/noticia.v2']) {
    await request(path, { headers: validators });
    assert.equal(forwarded.headers.get('If-None-Match'), null, path);
    assert.equal(forwarded.headers.get('If-Modified-Since'), null, path);
  }
  const existing404 = new Response('Not found', { status: 404 });
  assert.equal(await request('/images/missing.png', { response: existing404 }), existing404);
  const postResponse = Response.json({ ok: true });
  assert.equal(await request('/api/instagram', { method: 'POST', response: postResponse }), postResponse);

  for (const [path, target] of [['/instituicao/missao-visao', '/instituicao/sobre-conselho'], ['/publicacao/noticia', '/imprensa/noticias/noticia'], ['/imprensa/noticias-cff', '/imprensa/publicacoes-cff']]) {
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

  const post = { id: 16028, slug: 'esclarecimentos-acerca-do-registro-de-responsabilidade-tecnica-do-farmaceutico-atraves-do-contrato-de-trabalho', date: '2026-10-10T09:00:00', title: { rendered: 'Título &amp; notícia' }, excerpt: { rendered: '<p>Resumo</p>' }, categories: [1] };
  origin = url => new URL(url).searchParams.get('rest_route') === '/wp/v2/categories' ? Response.json([]) : Response.json(post);
  let response = await request('/imprensa/noticias/16028');
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('Location'), `https://institucional.crf-al.org.br/imprensa/noticias/${post.slug}`);
  response = await request('/?p=16028');
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('Location'), `https://institucional.crf-al.org.br/imprensa/noticias/${post.slug}`);
  assert.equal((await request('/imprensa/noticias/best-dating-sites')).status, 410);
  assert.equal((await request('/?p=2534')).status, 410);
  origin = () => new Response('', { status: 503 });
  assert.equal((await request('/?p=16193')).status, 301, 'O mapa garante o redirect durante falha da origem');
  assert.equal((await request('/imprensa/noticias/16150')).status, 301);
  assert.equal((await request('/?p=107698')).status, 503, 'Ausente precisa ser verificado na origem');
  origin = url => new URL(url).searchParams.get('rest_route') === '/wp/v2/categories' ? Response.json([]) : Response.json(post);
  response = await request(`/imprensa/noticias/${post.slug}`);
  assert.equal(response.status, 200);
  await Promise.all(background);
  const before = fetches;
  assert.equal((await request(`/imprensa/noticias/${post.slug}?utm_source=test`)).status, 200);
  assert.equal(fetches, before, 'Metadata cache ignores tracking query strings');

  // Sitemap e RSS passam pela implementação real do índice e dos lotes.
  stored = new Map();
  const spam = { ...post, id: 2534, slug: 'best-dating-sites', categories: [3] };
  origin = url => {
    const u = new URL(url); const route = u.searchParams.get('rest_route');
    if (route === '/wp/v2/categories') return Response.json([{ id: 3, slug: 'dating-online' }]);
    return Response.json([post, spam], { headers: { 'x-wp-total': '2', 'x-wp-totalpages': '1' } });
  };
  const sitemapResponse = await request('/sitemap-news.xml');
  const sitemapText = await sitemapResponse.text();
  assert.equal(sitemapResponse.status, 200);
  assert.ok(sitemapText.includes(post.slug));
  assert.ok(!sitemapText.includes(spam.slug));
  assert.ok(!sitemapText.includes(['www.crf-al.org.br', 'wp-json'].join('/')));
  const rssSource = (await readFile(new URL('../functions/api/rss.ts', import.meta.url), 'utf8'))
    .replace("'../_news'", JSON.stringify(await loadNews()))
    .replace("'../../src/config/site'", JSON.stringify(siteUrl));
  const rss = await import(moduleUrl(rssSource));
  const feed = await rss.onRequest({ request: new Request('https://example.org/api/rss'), waitUntil: promise => background.push(promise) });
  const feedText = await feed.text();
  assert.equal(feed.status, 200); assert.ok(feedText.includes(post.slug));
  assert.ok(!feedText.includes(spam.slug));
  assert.ok(!feedText.includes(['www.crf-al.org.br', 'wp-json'].join('/')));

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
  const cover = mediaImageSet({ source_url: 'https://example.org/full.jpg', alt_text: 'Capa', media_details: { width: 1600, height: 900, sizes: {
    thumbnail: { source_url: 'https://example.org/t.jpg', width: 150, height: 150 },
    crop: { source_url: 'https://example.org/c.jpg', width: 930, height: 620 },
    full: { source_url: 'https://example.org/full.jpg', width: 1600, height: 900 },
    large: { source_url: 'https://example.org/l.jpg', width: 1024, height: 576 },
    medium: { source_url: 'https://example.org/m.jpg', width: 300, height: 169 },
  } } });
  assert.deepEqual(cover, { src: 'https://example.org/l.jpg', srcSet: 'https://example.org/m.jpg 300w, https://example.org/l.jpg 1024w, https://example.org/full.jpg 1600w', width: 1024, height: 576, alt: 'Capa' });
  const preload = buildPreload(newsPreload({ title: 'x', canonical: 'https://example.org/n', preloadImage: cover.src, preloadSrcset: cover.srcSet }));
  assert.ok(preload.includes(`imagesrcset="${cover.srcSet}"`) && preload.includes(`imagesizes="${NEWS_COVER_SIZES}"`) && !preload.includes('data-page-metadata'));
  assert.equal(buildPreload(newsPreload({ title: 'x', canonical: 'https://example.org/n' })), '');
  const home = buildPreload(homePreload());
  assert.ok(home.includes(`href="${banners[0].imageMobile}"`) && home.includes(`media="${BANNER_MOBILE_MEDIA.replaceAll('<', '&lt;')}"`));
  assert.ok(home.includes(`href="${banners[0].image}"`) && home.includes(`media="${BANNER_DESKTOP_MEDIA.replaceAll('>', '&gt;')}"`));
  assert.ok(home.includes(`imagesrcset="${bannerMobileSrcSet(banners[0])}"`) && home.includes(`imagesizes="${BANNER_MOBILE_SIZES}"`));
  assert.equal((home.match(/as="image"/g) || []).length, 2);
  assert.equal((home.match(/type="image\/webp"/g) || []).length, 2);
  // Uma reordenação deve mudar o preload sem editar o middleware.
  const firstBanner = banners.shift();
  try {
    assert.equal(homePreload()[0].href, banners[0].imageMobile);
    assert.equal(homePreload()[1].href, banners[0].image);
    assert.ok(!buildPreload(homePreload()).includes(firstBanner.image));
  } finally {
    banners.unshift(firstBanner);
  }
  console.log(`SEO: ${Object.keys(PAGE_METADATA).length} static routes, genuine 404s, resources/APIs, redirects, metadata cache and origin failures passed (offline handler tests).`);
} finally {
  globalThis.fetch = saved.fetch;
  globalThis.caches = saved.caches;
  globalThis.HTMLRewriter = saved.rewriter;
  console.error = saved.error;
}
