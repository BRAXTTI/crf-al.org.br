/**
 * Pré-render das rotas estáticas (SEO): o HTML de cada página sai do build dentro de #root e o
 * navegador hidrata (src/client.tsx). Roda depois do `vite build`, sobre o dist/index.html.
 *
 * - `/` reescreve o próprio dist/index.html; as demais viram `dist/<rota>.html`, que o Pages
 *   serve em `/<rota>` (sem barra final, igual ao canonical).
 * - O dist/index.html também é o fallback do SPA (notícias, eventos, 404...): `data-prerender`
 *   diz a qual rota o conteúdo pertence. O middleware esvazia #root nas outras rotas e o
 *   navegador, sem a marca certa, renderiza do zero como antes.
 * - Fora: rotas cujo conteúdo principal vem de API (src/config/prerender.ts) e as dinâmicas.
 */
import assert from 'node:assert/strict';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { moduleUrl } from './load-typescript.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/** PAGE_METADATA, rotas alvo, exclusões e SITE_URL, sem bundler. */
export async function loadPrerenderConfig() {
  const metadataUrl = await moduleUrl('../src/config/page-metadata.ts');
  const { PAGE_METADATA } = await import(metadataUrl);
  const { PRERENDER_ROUTES, PRERENDER_EXCLUDED } = await import(await moduleUrl('../src/config/prerender.ts', { "'./page-metadata'": JSON.stringify(metadataUrl) }));
  const { SITE_URL } = await import(await moduleUrl('../src/config/site.ts'));
  for (const path of Object.keys(PRERENDER_EXCLUDED)) assert.ok(Object.hasOwn(PAGE_METADATA, path), `Exclusão sem rota: ${path}`);
  return { pageMetadata: PAGE_METADATA, routes: PRERENDER_ROUTES, excluded: PRERENDER_EXCLUDED, siteUrl: SITE_URL };
}

export function outputFile(dist, path) {
  return path === '/' ? join(dist, 'index.html') : join(dist, `${path.slice(1)}.html`);
}

const escapeHtml = value => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Coloca o HTML renderizado em #root e title/description/canonical no <head> do template. */
export function injectPage(template, path, body, metadata, siteUrl, instante) {
  assert.ok(Number.isFinite(instante), `${path}: instante do pré-render ausente`);
  assert.equal(template.match(/<div id="root"><\/div>/g)?.length, 1, 'Template precisa de um <div id="root"></div> vazio');
  const canonical = `${siteUrl}${path === '/' ? '' : path}`;
  // data-page-metadata: o middleware troca/remove essas tags e o React as recria ao montar.
  const head = [
    `<meta data-page-metadata="true" name="description" content="${escapeHtml(metadata.description)}" />`,
    `<link data-page-metadata="true" rel="canonical" href="${escapeHtml(canonical)}" />`,
  ].join('\n    ');
  const withTitle = template.replace(/<title data-page-metadata="true">[^<]*<\/title>/, () => `<title data-page-metadata="true">${escapeHtml(`${metadata.title} | CRFAL`)}</title>\n    ${head}`);
  assert.notEqual(withTitle, template, 'Template sem <title data-page-metadata>');
  return withTitle.replace('<div id="root"></div>', () => `<div id="root" data-prerender="${escapeHtml(path)}" data-prerender-at="${instante}">${body}</div>`);
}

/** Conteúdo de #root: do <div id="root"> até o último </div> antes dos scripts e do </body>. */
export function rootContent(html) {
  const match = html.match(/<div id="root"(?: data-prerender="([^"]*)")?(?: data-prerender-at="(\d+)")?>([\s\S]*)<\/div>\s*(?:<script\b[^>]*>[^<]*<\/script>\s*)*<\/body>/);
  return match ? { route: match[1], at: match[2] && Number(match[2]), html: match[3] } : null;
}

const textOf = html => html.replace(/<(script|style)\b[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/\s+/g, ' ').trim();

/** Falha se #root estiver vazio, sem um <h1>, com pouco texto ou só com o "Carregando" do fallback. */
export function assertPrerendered(html, path) {
  const root = rootContent(html);
  assert.ok(root, `${path}: #root não encontrado`);
  assert.equal(root.route, path, `${path}: data-prerender deve ser a própria rota`);
  assert.ok(Number.isFinite(root.at), `${path}: data-prerender-at ausente`);
  assert.ok(root.html.trim(), `${path}: #root vazio`);
  const h1 = [...root.html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map(match => textOf(match[1]));
  assert.equal(h1.length, 1, `${path}: esperado um <h1> no conteúdo, há ${h1.length}`);
  assert.ok(h1[0].length > 2, `${path}: <h1> sem texto`);
  assert.ok(!root.html.includes('Carregando página'), `${path}: saiu o fallback de carregamento`);
  // Texto principal: o de <main>, sem contar cabeçalho e rodapé.
  const main = root.html.match(/<main\b[^>]*>([\s\S]*)<\/main>/);
  assert.ok(main, `${path}: sem <main>`);
  const text = textOf(main[1]);
  assert.ok(text.length > 120, `${path}: pouco texto em <main> (${text.length} caracteres)`);
  // <title> de SVG (ícones) é conteúdo; o da página fica no <head>.
  const semSvg = root.html.replace(/<svg\b[\s\S]*?<\/svg>/g, '');
  assert.ok(!/<(title|meta)\b/.test(semSvg), `${path}: <title>/<meta> da página dentro de #root`);
  assert.ok(!/<link\b[^>]*rel="canonical"/.test(semSvg), `${path}: canonical dentro de #root`);
  assert.ok(!/<script\b/.test(root.html), `${path}: <script> dentro de #root (a CSP bloqueia inline)`);
  return { h1: h1[0], text };
}

/** Bundle SSR de src/entry-server.tsx, fora do dist (não é publicado). */
export async function buildServerEntry(outDir = join(ROOT, 'node_modules/.cache/crfal-prerender')) {
  const { build } = await import('vite');
  await rm(outDir, { recursive: true, force: true });
  await build({
    root: ROOT,
    configFile: join(ROOT, 'vite.config.ts'),
    logLevel: 'warn',
    // Tudo no bundle (React, router, helmet, lucide...): sem depender da interop ESM/CJS do Node.
    ssr: { noExternal: true },
    // manualChunks do cliente não serve aqui (e `undefined` não sobrescreve no mergeConfig).
    build: { ssr: 'src/entry-server.tsx', outDir, emptyOutDir: true, copyPublicDir: false, minify: false, rollupOptions: { output: { manualChunks: () => undefined } } },
  });
  return { entry: await import(pathToFileURL(join(outDir, 'entry-server.js')).href), cleanup: () => rm(outDir, { recursive: true, force: true }) };
}

/** Renderiza as rotas alvo sobre o template e valida cada uma; devolve [path, html] sem escrever nada. */
export async function renderPages(entry, template, { routes, pageMetadata, siteUrl }) {
  const pages = [];
  for (const path of routes) {
    const { html, status, instante } = await entry.render(path);
    assert.equal(status, 200, `${path}: status ${status} no pré-render`);
    const page = injectPage(template, path, html, pageMetadata[path], siteUrl, instante);
    assertPrerendered(page, path);
    pages.push([path, page]);
  }
  return pages;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dist = resolve(process.argv[2] || 'dist');
  const template = await readFile(join(dist, 'index.html'), 'utf8');
  assert.ok(!template.includes('data-prerender='), 'dist/index.html já pré-renderizado: rode o vite build antes');
  const config = await loadPrerenderConfig();
  const { entry, cleanup } = await buildServerEntry();
  try {
    const pages = await renderPages(entry, template, config);
    for (const [path, html] of pages) {
      const file = outputFile(dist, path);
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, html);
    }
    console.log(`Pré-render: ${pages.length} rotas com HTML em #root. Fora: ${Object.entries(config.excluded).map(([path, why]) => `${path} (${why})`).join('; ')}; e as rotas dinâmicas.`);
  } finally {
    await cleanup();
  }
}
