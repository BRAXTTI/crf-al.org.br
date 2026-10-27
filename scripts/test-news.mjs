import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { moduleUrl } from './load-typescript.mjs';
import { loadNews } from './load-news.mjs';
const { NEWS_MAP, BLOCKED_NEWS_SLUGS, OCCUPIED_HISTORICAL_IDS } = await import(await moduleUrl('../functions/_news-map.ts'));
const { newsIndex, newsPage, newsPost, newsApi, newsSitemapIndex, searchNews, refreshNewsIndex, NEWS_INDEX_KEY, NEWS_INDEX_LOCK } = await import(await loadNews());
const find = id => NEWS_MAP.find(row => row.oldId === id);
const selected = [16028, 16193, 16150, 16108, 7108].map(find);
const post = row => ({ id: row.newId, slug: row.newSlug, date: '2020-01-01T00:00:00', date_gmt: '2020-01-01T03:00:00', title: { rendered: row.title ? '' : 'Título' }, excerpt: { rendered: '<p>Resumo</p>' }, content: { rendered: '<img src="https://www.crf-al.org.br/app/uploads/2020/a.jpg" srcset="https://crf-al.org.br/wp-content/uploads/a.jpg 2x">' }, categories: [1], featured_media: 55, author: 7, _embedded: { 'wp:featuredmedia': [{ source_url: 'https://www.crf-al.org.br/app/uploads/2020/a.jpg' }] } });
let posts = [...selected.map(post), post(find(2534)), { ...post(find(16023)), id: 999999, slug: 'spam-novo', categories: [3] }];
let requests = []; let fail = false;
const original = globalThis.fetch; const error = console.error; console.error = () => {};
globalThis.fetch = async input => {
  const url = new URL(input); requests.push(url);
  assert.equal(url.hostname, 'wordpress.crf-al.org.br');
  if (fail) return new Response('', { status: 503 });
  assert.equal(url.searchParams.has('_embed'), false);
  const route = url.searchParams.get('rest_route');
  if (route === '/wp/v2/media') return Response.json([{ id: 55, source_url: 'https://www.crf-al.org.br/app/uploads/2020/a.jpg', alt_text: 'Capa', media_details: { sizes: { medium: { source_url: 'https://www.crf-al.org.br/app/uploads/2020/m.jpg', width: 300, height: 200 } } } }]);
  if (route === '/wp/v2/users/7') return Response.json({ name: 'CRF AL' });
  if (route === '/wp/v2/categories') return Response.json([{ id: 1, slug: 'arquivo', name: 'Arquivo' }, { id: 42, slug: 'noticias-do-portal', name: 'Notícias' }, { id: 3, slug: 'dating-online' }]);
  if (route.startsWith('/wp/v2/posts/')) { const item = posts.find(p => p.id === Number(route.split('/').at(-1))); return item ? Response.json(item) : new Response('', { status: 404 }); }
  let result = posts;
  if (url.searchParams.has('slug')) result = result.filter(p => p.slug === url.searchParams.get('slug'));
  if (url.searchParams.has('include')) result = result.filter(p => url.searchParams.get('include').split(',').map(Number).includes(p.id)).reverse();
  return Response.json(result, { headers: { 'x-wp-total': String(result.length), 'x-wp-totalpages': result.length ? '1' : '0' } });
};
try {
  assert.equal(OCCUPIED_HISTORICAL_IDS.length, 3);
  for (const row of selected) {
    requests = []; const result = await newsPost(String(row.oldId));
    assert.equal(result.id, row.newId); assert.equal(result.slug, row.slug);
    assert.ok(requests.some(url => url.searchParams.get('rest_route') === `/wp/v2/posts/${row.newId}`));
  }
  assert.equal((await newsPost(find(7108).slug)).title.rendered, find(7108).title);
  const detail = await newsPost(find(16028).slug);
  assert.match(detail.content.rendered, /https:\/\/midias\.crf-al\.org\.br\/app\/uploads/);
  assert.match(detail.content.rendered, /https:\/\/midias\.crf-al\.org\.br\/wp-content\/uploads/);
  assert.match(detail._embedded['wp:featuredmedia'][0].source_url, /midias/);
  assert.equal(detail._embedded.author[0].name, 'CRF AL');
  assert.equal(detail._embedded['wp:term'][0][0].name, 'Arquivo');
  assert.equal(detail._embedded['wp:featuredmedia'][0].alt_text, 'Capa');
  assert.match(detail._embedded['wp:featuredmedia'][0].media_details.sizes.medium.source_url, /midias/);
  assert.equal(await newsPost('2534'), null); assert.equal(await newsPost('best-dating-sites'), null);
  assert.equal(await newsPost(String(find(107698).oldId)), null);
  assert.equal((await newsApi(new Request('https://example.test/api/news?slug=best-dating-sites'))).status, 410);
  const index = await newsIndex(); assert.equal(index.length, selected.length);
  requests = []; const page = await newsPage(1, 5);
  assert.equal(requests.filter(url => url.searchParams.get('rest_route') === '/wp/v2/media').length, 1);
  assert.equal(requests.find(url => url.searchParams.get('rest_route') === '/wp/v2/media').searchParams.get('include'), '55'); assert.deepEqual(page.posts.map(p => p.id), index.map(p => p.id));
  assert.equal((await searchNews('farmacia')).length, selected.length);
  assert.deepEqual((await newsSitemapIndex()).map(p => p.slug), index.map(p => p.slug));
  assert.ok(BLOCKED_NEWS_SLUGS.includes('ola-mundo-2'));
  // Um dos ausentes passa a existir por slug, sem atualização manual do ID.
  posts.push({ ...post(find(107698)), id: 999998 });
  assert.equal((await newsPost('107698')).id, 999998);
  fail = true; assert.equal((await newsApi(new Request('https://example.test/api/news'))).status, 503);
  const mockFetch = globalThis.fetch;
  const inventory = Array.from({ length: 701 }, (_, i) => ({ ...post(selected[0]), id: 900000 + i, slug: `noticia-nova-${i}`, categories: [42] }));
  let active = 0; let peak = 0;
  const visited = []; const completed = [];
  try {
    globalThis.fetch = async input => {
      const url = new URL(input);
      if (url.searchParams.get('rest_route') === '/wp/v2/categories') return Response.json([{ id: 42, slug: 'noticias-do-portal' }]);
      const page = Number(url.searchParams.get('page'));
      visited.push(page); active++; peak = Math.max(peak, active);
      await new Promise(resolve => setTimeout(resolve, page === 2 ? 30 : 5));
      active--; completed.push(page);
      return Response.json(inventory.slice((page - 1) * 100, page * 100), { headers: { 'x-wp-total': '701', 'x-wp-totalpages': '8' } });
    };
    const result = await newsIndex();
    assert.equal(result.length, 701);
    assert.deepEqual(result.map(row => row.id), inventory.map(row => row.id).reverse());
    assert.deepEqual(visited, [1, 2, 3, 4, 5, 6, 7, 8]);
    assert.equal(peak, 4, 'Pool limitado a quatro páginas');
    assert.ok(completed.indexOf(6) < completed.indexOf(2), 'Pool avança sem esperar a página lenta');
  } finally { globalThis.fetch = mockFetch; }
  fail = false;
  const values = new Map();
  const writes = [];
  const kv = {
    async get(key) { return values.has(key) ? JSON.parse(values.get(key)) : null; },
    async put(key, value, options) { writes.push({ key, options }); values.set(key, value); },
  };
  const pending = [];
  const context = { env: { NEWS_INDEX: kv }, waitUntil: task => pending.push(task) };
  requests = [];
  const cold = await newsIndex(context);
  assert.ok(cold.length);
  assert.ok(values.has(NEWS_INDEX_KEY));
  assert.equal(writes.find(row => row.key === NEWS_INDEX_KEY).options, undefined, 'Índice sem expiração');
  requests = [];
  assert.deepEqual(await newsIndex(context), cold);
  assert.equal(requests.length, 0, 'KV fresco não consulta WP');
  const stale = { storedAt: 1, value: cold };
  values.set(NEWS_INDEX_KEY, JSON.stringify(stale));
  assert.deepEqual(await newsIndex(context), cold);
  await Promise.all(pending.splice(0));
  assert.equal(requests.length, 0, 'Lease ativo impede refresh');
  values.delete(NEWS_INDEX_LOCK);
  fail = true;
  assert.deepEqual(await newsIndex(context), cold, 'KV antigo disponível durante falha');
  await Promise.all(pending.splice(0));
  assert.deepEqual(JSON.parse(values.get(NEWS_INDEX_KEY)), stale, 'Falha preserva índice');
  fail = false;
  values.delete(NEWS_INDEX_LOCK);
  requests = [];
  const refreshA = refreshNewsIndex(context);
  const refreshB = refreshNewsIndex(context);
  assert.equal(refreshA, refreshB, 'Refresh concorrente compartilha promise');
  await refreshA;
  assert.equal(requests.filter(url => url.searchParams.get('rest_route') === '/wp/v2/posts').length, 1);
  // Sem binding continua usando Cache API, inclusive SWR.
  const cacheValues = new Map();
  const previousCaches = globalThis.caches;
  globalThis.caches = { default: {
    async match(req) { return cacheValues.get(req.url)?.clone(); },
    async put(req, response) { cacheValues.set(req.url, response); },
  } };
  try {
    const local = { waitUntil: task => pending.push(task) };
    await newsIndex(local); await Promise.all(pending.splice(0)); requests = [];
    await newsIndex(local); assert.equal(requests.length, 0);
    const key = [...cacheValues.keys()].find(key => key.endsWith('/index'));
    cacheValues.set(key, Response.json({ storedAt: 1, value: cold }));
    assert.deepEqual(await newsIndex(local), cold);
    await Promise.all(pending.splice(0));
    assert.ok(requests.length);
  } finally { globalThis.caches = previousCaches; }
  // Mudança de total, duplicação, página removida e nova página durante a coleta.
  const workingFetch = globalThis.fetch;
  const attempts = new Map();
  try {
    globalThis.fetch = async input => {
      const url = new URL(input);
      if (url.searchParams.get('rest_route') === '/wp/v2/categories') return Response.json([{ id: 42, slug: 'noticias-do-portal' }]);
      const page = Number(url.searchParams.get('page'));
      const count = (attempts.get(page) ?? 0) + 1; attempts.set(page, count);
      if (page === 2 && count === 1) return new Response('', { status: 503 });
      if (page === 3 && count === 1) throw new DOMException('timeout', 'TimeoutError');
      if (page === 4) return Response.json({ code: 'rest_post_invalid_page_number' }, { status: 400 });
      return Response.json([inventory[0], inventory[page]], { headers: { 'x-wp-totalpages': page === 1 ? '4' : '5', 'x-wp-total': String(500 + page) } });
    };
    const result = await newsIndex();
    assert.equal(new Set(result.map(row => row.id)).size, result.length);
    assert.equal(result.length, 5);
    assert.equal(attempts.get(2), 2); assert.equal(attempts.get(3), 2); assert.equal(attempts.get(5), 1);
    let calls = 0;
    globalThis.fetch = async () => { calls++; return new Response('', { status: 403 }); };
    await assert.rejects(newsIndex(), /403/); assert.equal(calls, 1);
    calls = 0;
    globalThis.fetch = async () => { calls++; return new Response('', { status: 503 }); };
    await assert.rejects(newsIndex(), /503/); assert.equal(calls, 2);
    calls = 0;
    globalThis.fetch = async () => {
      calls++;
      return new Response(new ReadableStream({ start(controller) { controller.error(new DOMException('body timeout', 'TimeoutError')); } }));
    };
    await assert.rejects(newsIndex(), /body timeout/); assert.equal(calls, 2);
  } finally { globalThis.fetch = workingFetch; }
  const cronUrl = await moduleUrl('../workers/news-index-cron/index.ts', { "'../../functions/_news'": JSON.stringify(await loadNews()) });
  const cron = (await import(cronUrl)).default;
  values.delete(NEWS_INDEX_LOCK);
  await cron.scheduled({}, context.env, context);
  await assert.rejects(cron.scheduled({}, {}, context), /binding required/);
  // A auditoria de corte precisa reprovar perdas de conteúdo, mas aceitar
  // importações posteriores por slug sem exigir outro mapa de IDs.
  const audit = inventory => spawnSync(process.execPath, ['--input-type=module'], { encoding: 'utf8', input: `
    const inventory = ${JSON.stringify(inventory)};
    globalThis.fetch = async () => Response.json(inventory, { headers: {
      'x-wp-total': String(inventory.length), 'x-wp-totalpages': '1'
    } });
    await import(${JSON.stringify(new URL('./generate-news-archive.mjs', import.meta.url).href)});
  ` });
  const mapped = NEWS_MAP.filter(row => row.newId !== null).map(row => ({ id: row.newId, slug: row.newSlug }));
  const incomplete = audit(mapped);
  assert.equal(incomplete.status, 1);
  assert.match(incomplete.stderr, /Migração incompleta/);
  for (const row of NEWS_MAP.filter(row => !row.blocked && row.newId === null)) assert.ok(incomplete.stderr.includes(String(row.oldId)));
  const complete = [...mapped, ...NEWS_MAP.filter(row => row.newId === null).map((row, i) => ({ id: 900000 + i, slug: row.newSlug }))];
  const success = audit(complete);
  assert.equal(success.status, 0, success.stderr);
  assert.match(success.stdout, /3 resolvidas por slug/);
  const mismatch = audit(complete.map((row, i) => i === 0 ? { ...row, slug: 'identidade-errada' } : row));
  assert.equal(mismatch.status, 1);
  assert.match(mismatch.stderr, /Identidades divergentes/);
  for (const dir of ['functions', 'src']) for (const file of await readdir(dir, { recursive: true })) {
    if (!/\.(?:ts|tsx|js|mjs)$/.test(file)) continue;
    const text = await readFile(`${dir}/${file}`, 'utf8');
    assert.ok(!text.includes(['www.crf-al.org.br', 'wp-json'].join('/')), `${dir}/${file}: origem antiga em runtime`);
  }
  console.log('Notícias: IDs, conflitos, títulos, include ordenado, bloqueios, ausentes, busca, mídia e falhas validados.');
} finally { globalThis.fetch = original; console.error = error; }
