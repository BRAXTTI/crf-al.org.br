import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { moduleUrl } from './load-typescript.mjs';

const configUrl = await moduleUrl('../src/config/cff.ts');
const { CFF_CLIENT_TIMEOUT_MS, CFF_REQUEST_BUDGET_MS } = await import(configUrl);
const source = (await readFile(new URL('../functions/api/_cff.ts', import.meta.url), 'utf8'))
  .replace("'../../src/config/site'", JSON.stringify(await moduleUrl('../src/config/site.ts')))
  .replace("'../../src/config/cff'", JSON.stringify(configUrl));
const parserUrl = `data:text/javascript;base64,${Buffer.from(ts.transpile(source, { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 })).toString('base64')}`;
const { parseCffPublications, getCffPublications, CFF_BACKGROUND_BUDGET_MS } = await import(parserUrl);

const thumb = (cover, href) => `
<div class="team2 shadow-sm"><div class="team-thumb bg-gradient-primary">
  <img src="https://admin.cff.org.br/src/uploads/publicacao/capa/${cover}.jpeg" class="img-fluid" alt="title image">
  <a class="view-profile"
     title="Ver Publicação"
         href="${href}"
     target="_blank"><svg></svg></a>
</div></div>`;
const section = (title, ...thumbs) => `<header><h2 class="h3 fw-bold">${title} </h2><hr></header><div class="row">${thumbs.join('')}</div>`;
const pdf = (id) => `https://admin.cff.org.br/src/uploads/publicacao/arquivo/${id}.pdf`;

const page1 = section('Notas técnicas  - Tricologia', thumb('a', pdf('a')), thumb('b', pdf('b')))
  + section('Pharmacia Brasileira', thumb('r1', 'https://www.cff.org.br/sistemas/geral/revista/pdf/113/revista.pdf'), thumb('r2', 'https://www.cff.org.br/sistemas/geral/revista/pdf/113/revista.pdf'), thumb('x', 'javascript:alert(1)'));
const page2 = section('Pharmacia Brasileira', thumb('r3', 'https://www.cff.org.br/revista.php?id=119&amp;titulo=x')) + section('Eleições &amp; 2025', thumb('e', pdf('e')));

const parsed = parseCffPublications(page1);
assert.equal(parsed.length, 2);
assert.equal(parsed[0].title, 'Notas técnicas – Tricologia');
assert.deepEqual(parsed[0].items[0], { link: pdf('a'), cover: 'https://admin.cff.org.br/src/uploads/publicacao/capa/a.jpeg', edition: undefined });
assert.equal(parsed[1].items.length, 1, 'link repetido e javascript: descartados');
assert.equal(parsed[1].items[0].edition, 113);
assert.deepEqual(parseCffPublications('<html></html>'), []);

const originalFetch = globalThis.fetch;
const requested = [];
globalThis.fetch = async (url) => {
  const u = String(url);
  requested.push(u);
  if (u.endsWith('page=1')) return new Response(page1);
  if (u.endsWith('page=2')) return new Response(page2);
  return new Response('<html></html>');
};
try {
  const result = await getCffPublications();
  assert.deepEqual(result.map((c) => c.title), ['Notas técnicas – Tricologia', 'Pharmacia Brasileira', 'Eleições & 2025']);
  assert.deepEqual(result[1].items.map((i) => i.edition), [113, 119], 'coleção dividida entre páginas é unida');
  assert.ok(result.every((c) => c.items.every((i) => !i.link.includes('/publicacoes'))), 'só links para os PDFs');
  assert.equal(requested.length, 4, 'para no primeiro lote com página vazia');

  globalThis.fetch = async () => new Response('<html></html>');
  await assert.rejects(getCffPublications(), /nenhuma publicação/);
  globalThis.fetch = async (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('timeout', 'AbortError')), { once: true });
  });
  const start = Date.now();
  await assert.rejects(getCffPublications(30), /timeout/);
  assert.ok(Date.now() - start < 1000, 'Prazo total encerra coleta lenta');
  // Com o navegador esperando, o servidor desiste antes dele (folga para a resposta chegar).
  assert.ok(CFF_CLIENT_TIMEOUT_MS - CFF_REQUEST_BUDGET_MS >= 2000, 'Prazo do servidor abaixo do timeout do cliente');
  assert.match(await readFile(new URL('../src/features/press/cff-data.ts', import.meta.url), 'utf8'), /timeoutMs: CFF_CLIENT_TIMEOUT_MS/);
  const realNow = Date.now; let elapsed = 0;
  Date.now = () => realNow() + elapsed;
  try {
    // O primeiro lote consome o prazo padrão; o segundo não começa.
    globalThis.fetch = async () => { elapsed = CFF_REQUEST_BUDGET_MS + 1; return new Response(page1); };
    await assert.rejects(getCffPublications(), /prazo total esgotado/, 'Prazo padrão é o da requisição');
    // Em segundo plano (20 s), a mesma coleta continua.
    elapsed = 0;
    globalThis.fetch = async (url) => { elapsed = CFF_REQUEST_BUDGET_MS + 1; return new Response(/page=[1-4]$/.test(String(url)) ? page1 : '<html></html>'); };
    assert.ok((await getCffPublications(CFF_BACKGROUND_BUDGET_MS)).length, 'Atualização em segundo plano usa o teto de 20 s');
  } finally { Date.now = realNow; }
} finally {
  globalThis.fetch = originalFetch;
}
// Handler: reserva antiga servida de imediato; a coleta (vários lotes) roda em segundo plano.
const handlerSource = (await readFile(new URL('../functions/api/cff-publicacoes.js', import.meta.url), 'utf8')).replace("'./_cff'", JSON.stringify(parserUrl));
const { onRequestGet } = await import(`data:text/javascript;base64,${Buffer.from(handlerSource).toString('base64')}`);
const originalCaches = globalThis.caches; const originalError = console.error;
let stored; const pending = []; let calls = 0;
globalThis.caches = { default: { match: async () => stored?.clone(), put: async (_, response) => { stored = response; } } };
console.error = () => {};
const context = { request: new Request('https://example.org/api/cff-publicacoes'), waitUntil: promise => pending.push(promise) };
try {
  let release; const gate = new Promise(resolve => { release = resolve; });
  globalThis.fetch = async (url) => { calls++; await gate; return new Response(String(url).endsWith('page=1') ? page1 : '<html></html>'); };
  const backup = { collections: [{ title: 'Antiga', items: [{ link: pdf('old') }] }], fetchedAt: Date.now() - 7 * 3600_000 };
  stored = new Response(JSON.stringify(backup));
  let response = await onRequestGet(context);
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).collections, backup.collections, 'Reserva servida sem esperar o CFF');
  assert.equal(response.headers.get('cache-control'), 'public, max-age=60');
  await onRequestGet(context);
  const started = calls;
  release(); await Promise.all(pending.splice(0));
  assert.ok(started > 0 && started <= 4, 'Uma única coleta em segundo plano');
  assert.equal((await stored.clone().json()).collections[0].title, 'Notas técnicas – Tricologia');
  response = await onRequestGet(context);
  assert.equal(response.headers.get('cache-control'), 'public, max-age=1800', 'Reserva atualizada volta a ser fresca');
  stored = new Response(JSON.stringify({ ...backup, fetchedAt: Date.now() - 8 * 86400_000 }));
  globalThis.fetch = async () => new Response('', { status: 503 });
  assert.equal((await onRequestGet(context)).status, 503, 'Reserva vencida não é servida');
} finally {
  globalThis.fetch = originalFetch; globalThis.caches = originalCaches; console.error = originalError;
}
console.log('CFF: coleções, edições, links repetidos/inválidos, junção entre páginas e fim da listagem passaram.');
