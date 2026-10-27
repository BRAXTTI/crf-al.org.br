/** Orçamento offline do build; não substitui Lighthouse ou métricas reais. */
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
const files = (await readdir('dist/assets')).filter(file => /\.(js|css)$/.test(file));
let total = 0;
for (const file of files) {
  const size = gzipSync(await readFile(`dist/assets/${file}`)).length;
  assert.ok(size < 120 * 1024, `Chunk excede 120 KiB gzip: ${file}`);
  total += size;
}
assert.ok(total < 400 * 1024, `JS/CSS total excede 400 KiB gzip: ${total}`);
// Só os pesos usados em toda página: preload de pesos raros desperdiça banda no carregamento inicial.
const html = await readFile('dist/index.html', 'utf8');
const fonts = [...html.matchAll(/<link rel="preload" href="([^"]+)" as="font" type="font\/woff2" crossorigin ?\/?>/g)].map(match => match[1]);
assert.deepEqual(fonts, ['/fonts/rawline-400-normal.woff2', '/fonts/rawline-700-normal.woff2'], 'Preload das fontes 400/700');
for (const font of fonts) await readFile(`dist${font}`);
console.log(`Orçamento: ${(total / 1024).toFixed(1)} KiB gzip de JS/CSS; dentro do limite de 400 KiB.`);
