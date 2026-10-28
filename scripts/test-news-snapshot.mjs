import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadNews } from './load-news.mjs';
const { newsApi, newsPost } = await import(await loadNews());
const cards = JSON.parse(await readFile(new URL('../public/news-snapshot/index.json', import.meta.url)));
const manifest = JSON.parse(await readFile(new URL('../public/news-snapshot/manifest.json', import.meta.url)));
assert.equal(cards.length, manifest.count); assert.ok(cards.length > 2000); assert.ok(manifest.largestBytes < 25 * 1024 * 1024);
const old = cards.find(post => post.date.startsWith('2013')); assert.ok(old);
const saved = globalThis.fetch; globalThis.fetch = () => { throw Error('WP must not be called'); };
const values = new Map();
const ctx = { request: new Request('https://preview.example/api/news'), waitUntil() {}, env: { NEWS_INDEX: { async get(key) { return values.get(key) ?? null; }, async put(key, value) { values.set(key, JSON.parse(value)); } } }, async next(request) { try { const path = new URL(request.url).pathname.replace('/news-snapshot/', ''); const body = await readFile(new URL(`../public/news-snapshot/${path}`, import.meta.url)); return new Response(body, {headers:{'Content-Type':'application/json'}}); } catch { return new Response('missing',{status:404}); } } };
try {
  const post = await newsPost(old.slug,ctx); assert.equal(post.slug,old.slug); assert.ok(post.content);
  const api = await newsApi(new Request(`https://preview.example/api/news?slug=${old.slug}`),ctx); assert.equal(api.status,200); assert.equal((await api.json()).slug,old.slug);
  const page = await newsApi(new Request('https://preview.example/api/news?page=50&per_page=50'),ctx); assert.equal(page.status,200); assert.equal((await page.json()).posts.length,50);
  const search = await newsApi(new Request('https://preview.example/api/news?search=farmacia'),ctx); assert.equal(search.status,200); assert.ok(Array.isArray(await search.json()));
  const newer = {...post, modified:'2099-01-01T00:00:00',title:{rendered:'Editada'}};
  values.set(`news:cache:v1:post/${encodeURIComponent(old.slug)}`,{storedAt:Date.now(),value:newer});
  assert.equal((await newsPost(old.slug,ctx)).title.rendered,'Editada');
  ctx.env.NEWS_INDEX.get = () => new Promise(() => {});
  const start = Date.now();
  assert.equal((await newsPost(old.slug,ctx)).slug,old.slug);
  assert.ok(Date.now() - start < 1000, 'KV lento não bloqueia o snapshot');
  // A mesma promise compartilhada de snapshot travada não prende as próximas chamadas.
  const stuck = { ...ctx, next: () => new Promise(() => {}) };
  const [a, b] = await Promise.all([
    newsApi(new Request(`https://preview.example/api/news?slug=${old.slug}`), stuck),
    newsApi(new Request(`https://preview.example/api/news?slug=${old.slug}`), stuck),
  ]);
  assert.equal(a.status, 503); assert.equal(b.status, 503);
} finally { globalThis.fetch=saved; }
console.log('Snapshot: detalhes históricos, página, busca e edição em KV sem WP.');
