/**
 * Pré-render (scripts/prerender.mjs): falha se #root sair vazio, sem <h1> ou sem texto em
 * qualquer rota alvo. Compila o bundle SSR real (sem window, como no build) e renderiza sobre o
 * index.html; se o dist/ já foi pré-renderizado (npm run build), confere também os arquivos.
 * A hidratação sem divergência é coberta em src/prerender.test.tsx.
 */
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertPrerendered, buildServerEntry, injectPage, loadPrerenderConfig, outputFile, renderPages, rootContent } from './prerender.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const config = await loadPrerenderConfig();
const { routes, excluded, pageMetadata, siteUrl } = config;

// Alvos: rotas fixas principais, sem as dependentes de API.
for (const path of ['/', '/instituicao', '/instituicao/sobre-conselho', '/instituicao/diretoria', '/servicos/requerimentos', '/servicos/ouvidoria', '/contato', '/fiscalizacao', '/legislacao']) {
  assert.ok(routes.includes(path), `Rota principal fora do pré-render: ${path}`);
}
for (const path of Object.keys(excluded)) assert.ok(!routes.includes(path), `Rota com API no pré-render: ${path}`);
assert.equal(routes.length + Object.keys(excluded).length, Object.keys(pageMetadata).length, 'Toda rota de PAGE_METADATA é alvo ou exclusão justificada');
assert.ok(!routes.some(path => /[:*]/.test(path)), 'Sem rotas dinâmicas');

// Saída: `/rota` → dist/rota.html (o Pages serve sem barra final, igual ao canonical).
assert.equal(outputFile('dist', '/'), join('dist', 'index.html'));
assert.equal(outputFile('dist', '/instituicao/diretoria'), join('dist', 'instituicao', 'diretoria.html'));

// Helpers: template, marca da rota e validação.
const template = '<html><head><title data-page-metadata="true">CRFAL</title></head><body><div id="root"></div><script type="module" src="/assets/index.js"></script></body></html>';
const body = `<header>Menu</header><main id="conteudo"><h1>Contato</h1><p>${'Atendimento ao farmacêutico. '.repeat(20)}</p><svg><title>Instagram</title></svg></main>`;
const page = injectPage(template, '/contato', body, { title: 'Contato', description: 'Fale "conosco" & cia' }, siteUrl, 1767225600000);
assert.ok(page.includes('<title data-page-metadata="true">Contato | CRFAL</title>'));
assert.ok(page.includes(`<link data-page-metadata="true" rel="canonical" href="${siteUrl}/contato" />`));
assert.ok(page.includes('content="Fale &quot;conosco&quot; &amp; cia"'));
assert.deepEqual(rootContent(page), { route: '/contato', at: 1767225600000, html: body });
assert.equal(assertPrerendered(page, '/contato').h1, 'Contato');
assert.ok(injectPage(template, '/', body, pageMetadata['/'], siteUrl, 1).includes(`href="${siteUrl}"`), 'Canonical da home sem barra');
assert.throws(() => assertPrerendered(template, '/contato'), /#root|data-prerender/, 'Template sem pré-render');
assert.throws(() => assertPrerendered(injectPage(template, '/contato', '', pageMetadata['/contato'], siteUrl, 1), '/contato'), /#root vazio/);
assert.throws(() => assertPrerendered(injectPage(template, '/contato', '<main><p>texto</p></main>', pageMetadata['/contato'], siteUrl, 1), '/contato'), /<h1>/);
assert.throws(() => assertPrerendered(injectPage(template, '/contato', '<div role="status">Carregando página…</div>', pageMetadata['/contato'], siteUrl, 1), '/contato'), /<h1>|Carregando/);
assert.throws(() => assertPrerendered(injectPage(template, '/contato', body.replace('</main>', '<title>Contato | CRFAL</title></main>'), pageMetadata['/contato'], siteUrl, 1), '/contato'), /<title>/);
assert.throws(() => assertPrerendered(page, '/instituicao'), /data-prerender/, 'Marca de outra rota');
assert.throws(() => injectPage(template.replace('<div id="root"></div>', ''), '/x', body, pageMetadata['/'], siteUrl, 1), /root/);
assert.throws(() => injectPage(template, '/x', body, pageMetadata['/'], siteUrl, undefined), /instante/);

// Bundle SSR real sobre o index.html do projeto: toda rota alvo sai com conteúdo.
const source = await readFile(join(ROOT, 'index.html'), 'utf8');
const { entry, cleanup } = await buildServerEntry(join(ROOT, 'node_modules/.cache/crfal-prerender-test'));
let pages;
try {
  pages = await renderPages(entry, source, config);
  const home = Object.fromEntries(pages)['/'];
  assert.ok(rootContent(home).html.includes('Conselho Regional de Farmácia do Estado de Alagoas'), 'Home: <h1> e texto principal');
  for (const [path, html] of pages) {
    const { h1 } = assertPrerendered(html, path);
    // O <h1> do HTML é o da página (PageHero), não um texto genérico.
    if (path !== '/') assert.ok(h1.length > 3, `${path}: <h1> curto demais: ${h1}`);
    assert.ok(html.includes(`<title data-page-metadata="true">`), `${path}: <title> no <head>`);
  }
} finally {
  await cleanup();
}

// dist/ já pré-renderizado (npm run build): cada rota alvo tem arquivo com conteúdo.
const distIndex = await readFile(join(ROOT, 'dist/index.html'), 'utf8').catch(() => null);
let checkedDist = 0;
if (distIndex?.includes('data-prerender=')) {
  for (const path of routes) {
    assertPrerendered(await readFile(outputFile(join(ROOT, 'dist'), path), 'utf8'), path);
    checkedDist++;
  }
  for (const path of Object.keys(excluded)) {
    assert.equal(await stat(outputFile(join(ROOT, 'dist'), path)).catch(() => null), null, `dist/ não deve ter ${path}.html`);
  }
}

console.log(`Pré-render: ${pages.length} rotas com #root preenchido (bundle SSR)${checkedDist ? `; dist/: ${checkedDist} arquivos conferidos` : '; dist/ sem pré-render, conferido só o bundle'}. Fora: ${Object.keys(excluded).join(', ')}.`);
