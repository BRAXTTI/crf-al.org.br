import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile('dist/index.html', 'utf8');
const scripts = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
const website = scripts
  .flatMap(([, json]) => JSON.parse(json)['@graph'] ?? [])
  .find(node => node['@type'] === 'WebSite');

assert.ok(website, 'JSON-LD WebSite deve existir em dist/index.html');
assert.equal(website.name, 'Conselho Regional de Farmácia do Estado de Alagoas');
assert.deepEqual(website.alternateName, ['CRF-AL', 'CRFAL']);
console.log('JSON-LD WebSite verificado.');
