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
console.log(`Orçamento: ${(total / 1024).toFixed(1)} KiB gzip de JS/CSS; dentro do limite de 400 KiB.`);
