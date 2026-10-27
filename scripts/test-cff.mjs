import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { moduleUrl } from './load-typescript.mjs';

const source = (await readFile(new URL('../functions/api/_cff.ts', import.meta.url), 'utf8')).replace("'../../src/config/site'", JSON.stringify(await moduleUrl('../src/config/site.ts')));
const parserUrl = `data:text/javascript;base64,${Buffer.from(ts.transpile(source, { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 })).toString('base64')}`;
const { parseCffPublications, getCffPublications } = await import(parserUrl);

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
} finally {
  globalThis.fetch = originalFetch;
}
console.log('CFF: coleções, edições, links repetidos/inválidos, junção entre páginas e fim da listagem passaram.');
