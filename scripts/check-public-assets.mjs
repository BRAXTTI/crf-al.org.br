import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

async function check(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    assert.ok(!/^(?:\.DS_Store|Thumbs\.db|\._.*)$|\.(?:md|ts|tsx|php|py)$/i.test(entry.name), `Arquivo não publicável: ${file}`);
    if (entry.isDirectory()) await check(file);
  }
}
await check('public');
console.log('Assets públicos: nenhum resíduo de sistema ou fonte/documentação.');
