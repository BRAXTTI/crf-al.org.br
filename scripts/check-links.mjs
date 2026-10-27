/** Verifica destinos internos literais sem rede; URLs externas exigem smoke online. */
import assert from 'node:assert/strict';
import { readdir, readFile, access } from 'node:fs/promises';
import { moduleUrl } from './load-typescript.mjs';
const { PAGE_METADATA } = await import(await moduleUrl('../src/config/page-metadata.ts'));
const { NEWS_MAP } = await import(await moduleUrl('../functions/_news-map.ts'));
const NEWS_ARCHIVE = NEWS_MAP.filter(post => !post.blocked);
const paths = new Set([...Object.keys(PAGE_METADATA), ...NEWS_ARCHIVE.map(post => `/imprensa/noticias/${post.slug}`)]);
const files = (await readdir('src', { recursive: true })).filter(file => /\.(tsx|ts)$/.test(file));
let count = 0;
for (const file of files) {
  const source = await readFile(`src/${file}`, 'utf8');
  for (const [, value] of source.matchAll(/(?:\b(?:to|href)=["']|\bhref:\s*["'])(\/[^"']*)["']/g)) {
    const path = value.split(/[?#]/)[0];
    let valid = paths.has(path);
    if (!valid) { try { await access(`public${path}`); valid = true; } catch { /* não é asset */ } }
    if (!valid && /^\/api\/[a-z-]+$/.test(path)) { try { await access(`functions${path}.ts`); valid = true; } catch { /* não é API */ } }
    assert.ok(valid, `${file}: destino interno não publicado ${value}`);
    count++;
  }
}
console.log(`Links: ${count} destinos internos literais conferidos sem rede.`);
