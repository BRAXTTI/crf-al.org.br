import assert from 'node:assert/strict';
import { moduleUrl } from './load-typescript.mjs';
const site = await moduleUrl('../src/config/site.ts');
const url = await moduleUrl('../functions/_news-response-cache.ts', { "'../src/config/site'": JSON.stringify(site) });
const { newsResponseKey, cachedNewsResponse } = await import(url);
const key = path => newsResponseKey(new Request(`https://example.org${path}`), 'wp', 'deploy-1');
assert.equal(key('/api/news?per_page=12&page=2&utm_source=x&gclid=y').url, key('/api/news?page=2&fbclid=z&per_page=12').url);
assert.notEqual(key('/api/news?page=3').url, key('/api/news?page=2').url);
assert.equal(key('/imprensa/noticias/abc?utm_medium=x').url, key('/imprensa/noticias/abc?gclid=y').url);
assert.notEqual(key('/imprensa/noticias/abc').url, newsResponseKey(new Request('https://example.org/imprensa/noticias/abc'), 'wp', 'deploy-2').url);
const saved = globalThis.caches; const entries = new Map(); const tasks = [];
globalThis.caches = { default: { async match(req) { return entries.get(req.url)?.clone(); }, async put(req, res) { entries.set(req.url, res.clone()); } } };
const ctx = { waitUntil(task) { tasks.push(task); } }; let calls = 0;
try {
  const cacheKey = key('/api/news?slug=abc');
  const load = async () => { calls++; return Response.json({ title: 'Notícia' }, { headers: { 'Cache-Control': 'public, max-age=60' } }); };
  assert.equal((await cachedNewsResponse(ctx, cacheKey, load)).status, 200);
  await Promise.all(tasks.splice(0));
  assert.deepEqual(await (await cachedNewsResponse(ctx, cacheKey, load)).json(), { title: 'Notícia' });
  assert.equal(calls, 1);
  const stale = entries.get(cacheKey.url); stale.headers.set('X-News-Cached-At', '1');
  const response = await cachedNewsResponse(ctx, cacheKey, async () => { throw new Error('WP indisponível'); });
  assert.equal(response.status, 200); assert.deepEqual(await response.json(), { title: 'Notícia' });
  await Promise.all(tasks.splice(0)); assert.equal(entries.size, 1);
  const fallback = key('/api/news?slug=fallback');
  await cachedNewsResponse(ctx, fallback, async () => new Response('fallback', { headers: { 'Cache-Control': 'no-store' } }));
  await Promise.all(tasks.splice(0)); assert.equal(entries.has(fallback.url), false);
  // O consumidor recebe um corpo independente do armazenamento, mesmo que put nunca termine.
  const put = globalThis.caches.default.put;
  globalThis.caches.default.put = () => new Promise(() => {});
  const streamed = await cachedNewsResponse(ctx, key('/api/news?slug=stream'), async () => new Response(new ReadableStream({
    start(controller) { controller.enqueue(new TextEncoder().encode('corpo completo')); controller.close(); },
  })));
  assert.equal(await streamed.text(), 'corpo completo');
  globalThis.caches.default.put = put;
} finally { globalThis.caches = saved; }
console.log('Cache HTTP: chaves, isolamento de deploy, SWR e falhas validados.');
