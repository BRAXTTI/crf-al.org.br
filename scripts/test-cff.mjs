import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../functions/api/_cff.ts', import.meta.url), 'utf8');
const parserUrl = `data:text/javascript;base64,${Buffer.from(ts.transpile(source, { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 })).toString('base64')}`;
const { parseCffList, parseSummary, getCffNews } = await import(parserUrl);

const card = (category, slug, title, day = '09/10/2026') => `
<div class="card border-0 blog-two mb-5 rounded-3 overflow-hidden shadow-sm">
  <div class="blog-two-img"><a href="https://site.cff.org.br/noticia/${category}/${day}/${slug}"><img class="img-fluid" src="https://admin.cff.org.br/src/uploads/noticia/${slug}.jpeg" alt="${title}"></a></div>
  <div class="card-body"><div class="mb-5 font-14 w-100"><div class="w-70 float-start">x</div></div>
  <div class="card-title" style="height: 100px"><h6><a href="https://site.cff.org.br/noticia/${category}/${day}/${slug}">${title}</a></h6></div></div>
</div>`;

const page1 = card('noticias-do-cff', 'a', 'Cuidado farmacêutico  no envelhecimento &amp; menopausa') + card('Noticias-gerais', 'b', 'Vaga de trainee') + card('noticias-do-cff', 'c', 'Saúde mental', '08/10/2026');
const page2 = card('Noticias-gerais', 'd', 'Anvisa') + card('noticias-do-cff', 'e', 'Golpe usa nome do CFF', '29/09/2026');

const parsed = parseCffList(page1);
assert.equal(parsed.total, 3);
assert.equal(parsed.items.length, 2, 'só Notícias do CFF');
assert.equal(parsed.items[0].title, 'Cuidado farmacêutico no envelhecimento & menopausa');
assert.equal(parsed.items[0].date, '2026-10-09');
assert.equal(parsed.items[0].image, 'https://admin.cff.org.br/src/uploads/noticia/a.jpeg');
assert.equal(parseSummary('<meta property="og:description" content="“Envelhecimento” será palestra no IV Congresso &amp; mais">'), '“Envelhecimento” será palestra no IV Congresso & mais');
assert.equal(parseSummary('<meta name="x">'), undefined);

const originalFetch = globalThis.fetch;
const requested = [];
globalThis.fetch = async (url) => {
  requested.push(String(url));
  const u = String(url);
  if (u.includes('/noticias?page=1')) return new Response(page1);
  if (u.includes('/noticias?page=2')) return new Response(page2);
  if (u.includes('/noticias?page=')) return new Response('<html></html>');
  if (u.includes('/c')) return new Response('erro', { status: 500 });
  return new Response('<meta property="og:description" content="Resumo oficial da matéria publicada pelo CFF">');
};
try {
  const result = await getCffNews({ limit: 3 });
  assert.deepEqual(result.items.map((i) => i.link.split('/').pop()), ['a', 'c', 'e'], 'percorre páginas até completar o limite');
  assert.equal(result.items[0].summary, 'Resumo oficial da matéria publicada pelo CFF');
  assert.equal(result.items[1].summary, undefined, 'falha no resumo não derruba a lista');
  assert.equal(result.nextCursor, 3);
  const end = await getCffNews({ limit: 5, cursor: 3 });
  assert.equal(end.items.length, 0);
  assert.equal(end.nextCursor, null, 'fim da listagem');
} finally {
  globalThis.fetch = originalFetch;
}
console.log('CFF: filtro de categoria, datas, resumos, paginação e falhas parciais passaram.');
