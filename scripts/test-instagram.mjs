import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../functions/api/_parse.ts', import.meta.url), 'utf8');
const parserUrl = `data:text/javascript;base64,${Buffer.from(ts.transpile(source, { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 })).toString('base64')}`;
const handlerSource = (await readFile(new URL('../functions/api/instagram.js', import.meta.url), 'utf8')).replace("'./_parse'", JSON.stringify(parserUrl));
const { onRequestGet } = await import(`data:text/javascript;base64,${Buffer.from(handlerSource).toString('base64')}`);
const { parseItems } = await import(parserUrl);
const html = '<a class="sbi_photo" href="https://www.instagram.com/p/example/" data-full-res="https://www.crf-al.org.br/app/uploads/example.jpg">';
assert.equal(parseItems(html).length, 1);

const originalFetch = globalThis.fetch;
const originalCaches = globalThis.caches;
const originalError = console.error;
let stored;
let requests = 0;
let originStatus = 200;
let originHtml = html;
const pending = [];
globalThis.caches = { default: { match: async () => stored?.clone(), put: async (_, response) => { stored = response; } } };
globalThis.fetch = async () => { requests++; return new Response(originHtml, { status: originStatus }); };
console.error = () => {};
const context = { request: new Request('https://example.org/api/instagram'), env: {}, waitUntil: promise => pending.push(promise) };
try {
  let response = await onRequestGet(context);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).items.length, 1);
  await Promise.all(pending);
  response = await onRequestGet(context);
  assert.equal(response.status, 200);
  assert.equal(requests, 1, 'Fresh cache avoids origin requests');

  const backup = { items: parseItems(html), fetchedAt: Date.now() - 1800_000 };
  stored = new Response(JSON.stringify(backup));
  originStatus = 503;
  response = await onRequestGet(context);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).stale, true);
  assert.equal(response.headers.get('cache-control'), 'no-store');

  stored = undefined;
  response = await onRequestGet(context);
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('retry-after'), '60');
  assert.equal(stored, undefined, 'Origin failure must not create an empty cache');

  stored = new Response(JSON.stringify({ ...backup, fetchedAt: Date.now() - 90000_000 }));
  response = await onRequestGet(context);
  assert.equal(response.status, 503, 'Do not serve backup older than 24 hours');

  stored = undefined;
  originStatus = 200;
  originHtml = '<html>Hospedagem indisponível</html>';
  response = await onRequestGet(context);
  assert.equal(response.status, 503, 'Invalid/empty feed must not be reported as success');
  assert.equal(stored, undefined);
  console.log('Instagram: parsing, fresh cache, stale fallback, expired backup and origin failures passed.');
} finally {
  globalThis.fetch = originalFetch;
  globalThis.caches = originalCaches;
  console.error = originalError;
}
