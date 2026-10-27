import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { moduleUrl } from './load-typescript.mjs';

const source = (await readFile(new URL('../functions/api/_parse.ts', import.meta.url), 'utf8')).replace("'../../src/config/site'", JSON.stringify(await moduleUrl('../src/config/site.ts')));
const parserUrl = `data:text/javascript;base64,${Buffer.from(ts.transpile(source, { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 })).toString('base64')}`;
const handlerSource = (await readFile(new URL('../functions/api/instagram.js', import.meta.url), 'utf8')).replace("'./_parse'", JSON.stringify(parserUrl));
const { onRequestGet } = await import(`data:text/javascript;base64,${Buffer.from(handlerSource).toString('base64')}`);
const { parseItems, getInstagramItems } = await import(parserUrl);
const html = '<a class="sbi_photo" href="https://www.instagram.com/p/example/" data-full-res="https://www.crf-al.org.br/app/uploads/example.jpg">';
assert.equal(parseItems(html).length, 1);

const richHtml = '<div class="sbi_item sbi_type_video sbi_new" role="listitem" id="sbi_1" data-date="1791829881"><div class="sbi_photo_wrap"><a class="sbi_photo" href="https://www.instagram.com/p/rich/" data-full-res="https://example.com/rich.jpg"><img src="x.png" alt="Dia de Nossa Senhora &amp; homenagem\n\nTexto"></a></div></div><div class="sbi_item sbi_type_image" data-date="1791483801"><a class="sbi_photo" href="https://www.instagram.com/p/plain/" data-full-res="https://example.com/plain.jpg"><img src="x.png" alt="Instagram post 123"></a></div>';
const [rich, plain] = parseItems(richHtml);
assert.equal(rich.type, 'video');
assert.equal(rich.date, 1791829881000);
assert.equal(rich.caption, 'Dia de Nossa Senhora & homenagem Texto');
assert.equal(plain.type, 'image');
assert.equal(plain.caption, undefined, 'legenda genérica é descartada');

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
  globalThis.fetch = async () => new Response(JSON.stringify([{ content: { rendered: html } }]), { headers: { 'content-type': 'application/json; charset=UTF-8' } });
  assert.deepEqual(await getInstagramItems(), parseItems(html), 'WordPress REST page content supplies the feed');
  globalThis.fetch = async () => new Response(JSON.stringify([]), { headers: { 'content-type': 'application/json' } });
  await assert.rejects(getInstagramItems(), /no publications/);
  globalThis.fetch = async () => { requests++; return new Response(originHtml, { status: originStatus }); };
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
  assert.equal(response.headers.get('cache-control'), 'public, max-age=60');
  await Promise.all(pending.splice(0));
  assert.deepEqual((await stored.clone().json()).items, backup.items, 'Falha na atualização preserva a reserva');

  // Reserva antiga com origem saudável: responde já, atualiza em segundo plano, uma vez.
  originStatus = 200; requests = 0;
  stored = new Response(JSON.stringify(backup));
  let release; const gate = new Promise(resolve => { release = resolve; });
  globalThis.fetch = async () => { requests++; await gate; return new Response(originHtml); };
  response = await onRequestGet(context);
  assert.equal(response.status, 200, 'Não espera a origem');
  assert.equal((await response.json()).fetchedAt, backup.fetchedAt);
  await onRequestGet(context);
  release(); await Promise.all(pending.splice(0));
  assert.equal(requests, 1, 'Atualização em segundo plano single-flight');
  assert.ok((await stored.clone().json()).fetchedAt > backup.fetchedAt, 'Reserva atualizada');
  globalThis.fetch = async () => { requests++; return new Response(originHtml, { status: originStatus }); };
  originStatus = 503;
  stored = new Response(JSON.stringify({ ...backup, checkedAt: Date.now() }));
  requests = 0; await onRequestGet(context); await Promise.all(pending.splice(0));
  assert.equal(requests, 0, 'Tentativa recente não é repetida por outro isolate');

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
