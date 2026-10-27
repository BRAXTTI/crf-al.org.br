import assert from 'node:assert/strict';
import { moduleUrl } from './load-typescript.mjs';
const fakeNews = `data:text/javascript;base64,${Buffer.from(`export async function newsPage() { return { posts: [{ slug: 'noticia', title: { rendered: '<b>Título</b>' }, excerpt: { rendered: '<p>Resumo & informação</p>' } }] }; }`).toString('base64')}`;
const { onRequest } = await import(await moduleUrl('../functions/api/rss.ts', {
  "'../_news'": JSON.stringify(fakeNews),
  "'../../src/config/site'": JSON.stringify(await moduleUrl('../src/config/site.ts')),
}));
const request = method => onRequest({ request: new Request('https://portal.example/api/rss', { method }) });
const response = await request('GET');
assert.equal(response.status, 200);
assert.match(response.headers.get('Content-Type'), /application\/rss\+xml/);
const xml = await response.text();
assert.match(xml, /<title>Título<\/title>/);
assert.match(xml, /&lt;p&gt;Resumo &amp; informação/);
assert.equal(await (await request('HEAD')).text(), '');
assert.equal((await request('POST')).status, 405);
console.log('RSS: XML escapado, conteúdo, HEAD e métodos validados offline.');
