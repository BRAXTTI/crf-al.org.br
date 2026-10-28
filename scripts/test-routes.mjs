/**
 * _routes.json: as exclusões são arquivos reais que o middleware apenas repassa, e o
 * public/_headers já entrega a eles todos os headers que o middleware completaria.
 */
import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { moduleUrl } from './load-typescript.mjs';
import { loadNews } from './load-news.mjs';
import { MAX_RULES, buildRoutes, validateRoutes } from './generate-routes.mjs';

const siteUrl = await moduleUrl('../src/config/site.ts');
const metadataUrl = await moduleUrl('../src/config/page-metadata.ts');
const { onRequest, SECURITY_HEADERS } = await import(await moduleUrl('../functions/_middleware.ts', {
  "'../src/config/site'": JSON.stringify(siteUrl),
  "'../src/data/banners'": JSON.stringify(await moduleUrl('../src/data/banners.ts', { "'../config/site'": JSON.stringify(siteUrl) })),
  "'../src/config/page-metadata'": JSON.stringify(metadataUrl),
  "'../src/services/wordpress/image-set'": JSON.stringify(await moduleUrl('../src/services/wordpress/image-set.ts')),
  "'./_news'": JSON.stringify(await loadNews()),
  "'./_news-response-cache'": JSON.stringify(await moduleUrl('../functions/_news-response-cache.ts', { "'../src/config/site'": JSON.stringify(siteUrl) })),
  "'./_news-shell'": JSON.stringify(await moduleUrl('../functions/_news-shell.ts')),
}));
const { PAGE_METADATA } = await import(metadataUrl);

const isFile = async path => (await stat(new URL(`..${path}`, import.meta.url)).catch(() => null))?.isFile() ?? false;

/** Regras do _headers na ordem do arquivo; `*` casa qualquer sequência, inclusive `/`. */
function parseHeaders(text) {
  return text.split(/\n(?=\S)/).filter(block => block.trim()).map(block => {
    const [pattern, ...lines] = block.trim().split('\n');
    const regex = new RegExp(`^${pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/:\w+/g, '[^/]+')}$`);
    return { pattern, regex, headers: lines.map(line => line.trim().split(/: (.*)/s).slice(0, 2)) };
  });
}
function headersFor(rules, path) {
  const headers = new Headers();
  for (const rule of rules.filter(({ regex }) => regex.test(path))) {
    for (const [name, value] of rule.headers) {
      assert.ok(!headers.has(name), `${path}: ${name} definido por mais de uma regra do _headers`);
      headers.set(name, value);
    }
  }
  return headers;
}

const saved = { fetch: globalThis.fetch, caches: globalThis.caches, rewriter: globalThis.HTMLRewriter };
globalThis.fetch = async () => assert.fail('Asset excluído não deve consultar a origem');
globalThis.caches = { get default() { return assert.fail('Asset excluído não deve usar a Cache API'); } };
globalThis.HTMLRewriter = class { on() { return this; } transform(response) { return response; } };

try {
  // Schema e limites, inclusive o efeito do curinga que validateRoutes recusa.
  const base = JSON.parse(await readFile(new URL('../public/_routes.json', import.meta.url), 'utf8'));
  validateRoutes(base);
  for (const rule of ['/assets/*', '/images/*.webp', '/fonts/:name', '/instituicao', '/_headers']) {
    assert.throws(() => validateRoutes({ ...base, exclude: [rule] }), `Recusa ${rule}`);
  }
  assert.throws(() => validateRoutes({ ...base, exclude: Array.from({ length: MAX_RULES }, (_, i) => `/assets/a${i}.js`) }), 'Mais de 100 regras');

  const entries = ['index-AAA.js', 'index-BBB.css'];
  const many = Array.from({ length: 200 }, (_, i) => `chunk-${String(i).padStart(3, '0')}.js`);
  const built = buildRoutes(base, [...many, ...entries, 'bad name.js'], entries);
  validateRoutes(built);
  assert.equal(built.include.length + built.exclude.length, MAX_RULES, 'Ocupa o limite sem ultrapassar');
  assert.deepEqual(built.exclude.slice(0, base.exclude.length), base.exclude, 'Exclusões fixas preservadas');
  assert.deepEqual(built.exclude.slice(base.exclude.length, base.exclude.length + 2), entries.map(name => `/assets/${name}`), 'Assets do index.html primeiro');
  assert.deepEqual(buildRoutes(base, [], ['ausente.js']).exclude, base.exclude, 'Só arquivos presentes no build');

  // Cada exclusão fixa é um arquivo publicado: ausente, o Pages serviria o index.html (200) sem o 404 do middleware.
  for (const rule of base.exclude) assert.ok(await isFile(`/public${rule}`), `Arquivo inexistente em public/: ${rule}`);
  const dist = await readFile(new URL('../dist/_routes.json', import.meta.url), 'utf8').then(JSON.parse, () => null);
  if (dist) {
    validateRoutes(dist);
    for (const rule of dist.exclude) assert.ok(await isFile(`/dist${rule}`), `dist/_routes.json sem arquivo: ${rule}`);
  }
  const hashed = dist?.exclude.filter(rule => rule.startsWith('/assets/'))
    ?? (await readdir(new URL('../dist/assets', import.meta.url)).catch(() => ['index-Abc123.js', 'index-Abc123.css'])).map(name => `/assets/${name}`);
  const excluded = [...base.exclude, ...hashed];

  // Nenhuma exclusão coincide com rotas que o middleware trata de forma especial.
  for (const rule of excluded) {
    assert.ok(!Object.hasOwn(PAGE_METADATA, rule), `Rota com metadados: ${rule}`);
    assert.ok(!/^\/(imprensa|eventos|publicacao|instituicao|api)(\/|$)|^\/sitemap-news\.xml$/.test(rule), `Rota do middleware: ${rule}`);
  }

  const rules = parseHeaders(await readFile(new URL('../public/_headers', import.meta.url), 'utf8'));
  for (const rule of excluded) {
    const headers = headersFor(rules, rule);
    // _headers cobre todo header que o middleware acrescentaria (SECURITY_HEADERS), com o mesmo valor.
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) assert.equal(headers.get(name), value, `${rule}: ${name}`);
    if (rule.startsWith('/assets/')) assert.equal(headers.get('Cache-Control'), 'public, max-age=31536000, immutable', rule);
    if (rule.startsWith('/fonts/')) assert.equal(headers.get('Cache-Control'), 'public, max-age=2592000', rule);
    if (rule.startsWith('/images/')) assert.match(headers.get('Cache-Control') ?? '', /^public, max-age=\d+/, rule);

    // Pelo middleware, o asset real (com os headers do _headers) volta intacto: mesmo objeto,
    // mesma requisição repassada (validadores preservados, 304 possível), sem origem nem cache.
    for (const [method, status] of [['GET', 200], ['GET', 304], ['HEAD', 200]]) {
      const request = new Request(`https://institucional.crf-al.org.br${rule}`, { method, headers: { 'If-None-Match': '"v1"' } });
      const asset = new Response(status === 304 || method === 'HEAD' ? null : 'asset', { status, headers: new Headers([...headers, ['Content-Type', 'application/octet-stream'], ['ETag', '"v1"']]) });
      let forwarded;
      const response = await onRequest({ request, env: {}, next: async upstream => { forwarded = upstream; return asset; }, waitUntil: () => assert.fail('waitUntil') });
      assert.equal(response, asset, `${method} ${rule} ${status}: resposta inalterada`);
      assert.equal(forwarded, request, `${method} ${rule}: requisição repassada sem alterações`);
    }
  }
  console.log(`Routes: ${base.exclude.length} exclusões fixas + ${hashed.length} assets com hash, todas arquivos reais repassados sem alteração pelo middleware e cobertas pelo _headers (limite ${MAX_RULES}).`);
} finally {
  globalThis.fetch = saved.fetch;
  globalThis.caches = saved.caches;
  globalThis.HTMLRewriter = saved.rewriter;
}
