import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { moduleUrl } from './load-typescript.mjs';
import { loadNews } from './load-news.mjs';
const { NEWS_MAP, BLOCKED_NEWS_SLUGS, OCCUPIED_HISTORICAL_IDS } = await import(await moduleUrl('../functions/_news-map.ts'));
const { newsIndex, newsPage, newsPost, newsApi, newsSitemapIndex, searchNews, refreshNewsIndex, warmNewsPosts, withNewsBudget, normalizeSearch, clearNewsIndexMemo, NEWS_INDEX_MAX_PAGES, NEWS_INDEX_RETRY_MS, PAGE_BUDGET_MS, API_BUDGET_MS, NEWS_INDEX_KEY, NEWS_INDEX_LOCK, NEWS_RECENT_CARDS_KEY, NEWS_REFRESH_QUOTA_PREFIX } = await import(await loadNews());
const find = id => NEWS_MAP.find(row => row.oldId === id);
const selected = [16028, 16193, 16150, 16108, 7108].map(find);
const post = row => ({ id: row.newId, slug: row.newSlug, date: '2020-01-01T00:00:00', date_gmt: '2020-01-01T03:00:00', modified: '2020-01-01T03:00:00', title: { rendered: row.title ? '' : 'Título' }, excerpt: { rendered: '<p>Resumo</p>' }, content: { rendered: '<img src="https://www.crf-al.org.br/app/uploads/2020/a.jpg" srcset="https://crf-al.org.br/wp-content/uploads/a.jpg 2x">' }, categories: [1], featured_media: 55, author: 7, _embedded: { 'wp:featuredmedia': [{ source_url: 'https://www.crf-al.org.br/app/uploads/2020/a.jpg' }] } });
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
  posts.push(post(find(107698)));
  assert.equal((await newsPost('107698')).id, 16768);
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
  const reads = [];
  const kv = {
    async get(key, options) { reads.push({ key, options }); return values.has(key) ? JSON.parse(values.get(key)) : null; },
    async put(key, value, options) { writes.push({ key, options }); values.set(key, value); },
  };
  const pending = [];
  const context = { env: { NEWS_INDEX: kv }, waitUntil: task => pending.push(task) };
  requests = [];
  const cold = await newsIndex(context);
  await Promise.all(pending.splice(0));
  assert.ok(cold.length);
  assert.ok(values.has(NEWS_INDEX_KEY));
  assert.equal(writes.find(row => row.key === NEWS_INDEX_KEY).options, undefined, 'Índice sem expiração');
  requests = [];
  assert.deepEqual(await newsIndex(context), cold);
  assert.equal(requests.length, 0, 'KV fresco não consulta WP');
  // Cópia em memória por isolate; leitura do KV com cache de borda.
  clearNewsIndexMemo(kv); reads.length = 0;
  await newsIndex(context); await newsIndex(context); await newsIndex(context);
  const indexReads = reads.filter(row => row.key === NEWS_INDEX_KEY);
  assert.equal(indexReads.length, 1, 'Índice decodificado uma vez por isolate');
  assert.deepEqual(indexReads[0].options, { type: 'json', cacheTtl: 60 });
  const stale = { storedAt: 1, value: cold };
  values.set(NEWS_INDEX_KEY, JSON.stringify(stale));
  assert.deepEqual(await newsIndex(context), cold);
  assert.equal(pending.length, 0, 'Dentro da janela da memória o KV não é relido');
  clearNewsIndexMemo(kv);
  assert.deepEqual(await newsIndex(context), cold);
  assert.equal(pending.length, 1, 'Índice antigo agenda refresh');
  await Promise.all(pending.splice(0));
  assert.equal(requests.length, 0, 'Lease ativo impede refresh');
  values.delete(NEWS_INDEX_LOCK);
  fail = true;
  clearNewsIndexMemo(kv);
  assert.deepEqual(await newsIndex(context), cold, 'KV antigo disponível durante falha');
  assert.equal(pending.length, 1);
  await Promise.all(pending.splice(0));
  assert.deepEqual(JSON.parse(values.get(NEWS_INDEX_KEY)), stale, 'Falha preserva índice');
  // Falha libera o lease após um intervalo curto (KV vazio não fica 2 min em 503).
  const released = JSON.parse(values.get(NEWS_INDEX_LOCK));
  const remaining = released + 120_000 - Date.now();
  assert.ok(remaining > 0 && remaining <= NEWS_INDEX_RETRY_MS, `Lease restante após falha: ${remaining} ms`);
  assert.equal(writes.at(-1).key, NEWS_INDEX_LOCK); assert.equal(writes.at(-1).options.expirationTtl, 60);
  values.set(NEWS_INDEX_LOCK, JSON.stringify(released - NEWS_INDEX_RETRY_MS));
  fail = false;
  assert.ok((await refreshNewsIndex(context)).length, 'Novo refresh permitido depois do intervalo');
  await Promise.all(pending.splice(0));
  fail = true;
  fail = false;
  values.delete(NEWS_INDEX_LOCK);
  requests = [];
  const refreshA = refreshNewsIndex(context);
  const refreshB = refreshNewsIndex(context);
  assert.equal(refreshA, refreshB, 'Refresh concorrente compartilha promise');
  const writesBefore = writes.filter(row => row.key === NEWS_INDEX_KEY).length;
  await refreshA;
  await Promise.all(pending.splice(0));
  assert.equal(writes.filter(row => row.key === NEWS_INDEX_KEY).length, writesBefore, 'Índice igual não regrava payload');
  assert.equal(requests.filter(url => url.searchParams.get('rest_route') === '/wp/v2/posts').length, 1);
  // Cartões recentes têm o mesmo formato da listagem e não consultam a origem.
  {
    const expected = await newsPage(1, 5);
    requests = [];
    assert.deepEqual(await newsPage(1, 5, context), expected);
    assert.equal(requests.length, 0);
    const cardRead = reads.find(row => row.key === NEWS_RECENT_CARDS_KEY);
    assert.deepEqual(cardRead.options, { type: 'json', cacheTtl: 60 });
    assert.equal(writes.find(row => row.key === NEWS_RECENT_CARDS_KEY).options.expirationTtl, 30 * 24 * 3600);
    const originalCards = JSON.parse(values.get(NEWS_RECENT_CARDS_KEY));
    values.set(NEWS_RECENT_CARDS_KEY, JSON.stringify({ ...originalCards, value: originalCards.value.slice(0, 1) }));
    clearNewsIndexMemo(kv); requests = [];
    assert.deepEqual(await newsPage(1, 5, context), expected);
    assert.ok(requests.some(url => url.searchParams.has('include')), 'Fatia não coberta usa caminho antigo');
    values.set(NEWS_RECENT_CARDS_KEY, JSON.stringify(originalCards));
    // Legacy arrays remain readable and are migrated on refresh; fresh entries avoid writes.
    for (const [stored, shouldWrite] of [
      [{ ...originalCards, storedAt: Date.now() }, false],
      [{ ...originalCards, storedAt: Date.now() - 24 * 3600_000 - 1 }, true],
      [originalCards.value, true],
    ]) {
      values.set(NEWS_RECENT_CARDS_KEY, JSON.stringify(stored));
      clearNewsIndexMemo(kv); values.delete(NEWS_INDEX_LOCK);
      const before = writes.filter(row => row.key === NEWS_RECENT_CARDS_KEY).length;
      await refreshNewsIndex(context); await Promise.all(pending.splice(0));
      assert.equal(writes.filter(row => row.key === NEWS_RECENT_CARDS_KEY).length - before, Number(shouldWrite));
      assert.ok(Array.isArray(JSON.parse(values.get(NEWS_RECENT_CARDS_KEY)).value));
    }
    values.set(NEWS_RECENT_CARDS_KEY, JSON.stringify(originalCards));
    const savedIndex = values.get(NEWS_INDEX_KEY);
    const indexEntry = JSON.parse(savedIndex);
    indexEntry.value = [...Array.from({ length: 60 }, (_, i) => ({ ...cold[0], id: 990000 + i })), ...cold];
    values.set(NEWS_INDEX_KEY, JSON.stringify(indexEntry));
    values.set(NEWS_RECENT_CARDS_KEY, JSON.stringify([]));
    clearNewsIndexMemo(kv); requests = [];
    assert.deepEqual((await newsPage(13, 5, context)).posts, expected.posts);
    assert.ok(requests.some(url => url.searchParams.has('include')), 'Página antiga usa caminho anterior');
    values.set(NEWS_INDEX_KEY, savedIndex);
    values.set(NEWS_RECENT_CARDS_KEY, JSON.stringify(originalCards));
    clearNewsIndexMemo(kv); values.delete(NEWS_INDEX_LOCK);
    const changedPost = posts.find(p => p.id === cold[0].id);
    const originalModified = changedPost.modified;
    changedPost.modified = '2021-01-01T00:00:00';
    requests = [];
    await refreshNewsIndex(context); await Promise.all(pending.splice(0));
    const includes = requests.filter(url => url.searchParams.get('rest_route') === '/wp/v2/posts' && url.searchParams.has('include'));
    assert.equal(includes.length, 1);
    assert.equal(includes[0].searchParams.get('include'), String(changedPost.id));
    changedPost.modified = originalModified;
    const quotaKey = NEWS_REFRESH_QUOTA_PREFIX + new Date().toISOString().slice(0, 10);
    values.set(quotaKey, '500'); values.delete(NEWS_INDEX_LOCK); requests = [];
    assert.equal(await refreshNewsIndex(context), null);
    assert.equal(requests.length, 0, 'Cota impede refresh');
    values.delete(quotaKey);
  }
  {
    const quotaValues = new Map([[NEWS_REFRESH_QUOTA_PREFIX + new Date().toISOString().slice(0, 10), '500']]);
    const quotaWrites = [];
    const quotaKV = {
      async get(key) { return quotaValues.has(key) ? JSON.parse(quotaValues.get(key)) : null; },
      async put(...args) { quotaWrites.push(args); },
    };
    const quotaPending = [];
    const result = await newsIndex({ env: { NEWS_INDEX: quotaKV }, waitUntil: task => quotaPending.push(task) });
    await Promise.all(quotaPending);
    assert.ok(result.length, 'KV frio com cota esgotada constrói índice');
    assert.equal(quotaWrites.length, 0, 'KV frio com cota esgotada não grava');
  }
  // Detalhe: mídia e autor em paralelo; reserva no KV com SWR e escrita só quando muda.
  {
    const slug = find(16028).slug; const postKey = `news:cache:v1:post/${encodeURIComponent(slug)}`;
    const mockFetch = globalThis.fetch; let active = 0; let peak = 0;
    globalThis.fetch = async input => {
      const route = new URL(input).searchParams.get('rest_route');
      if (route !== '/wp/v2/media' && route !== '/wp/v2/users/7') return mockFetch(input);
      active++; peak = Math.max(peak, active); await new Promise(resolve => setTimeout(resolve, 10)); active--;
      return mockFetch(input);
    };
    try { await newsPost(slug); } finally { globalThis.fetch = mockFetch; }
    assert.equal(peak, 2, 'Mídia e autor consultados em paralelo');
    writes.length = 0; requests = [];
    const burst = await Promise.all(Array.from({ length: 12 }, () => newsPost(slug, context)));
    const first = burst[0];
    assert.ok(burst.every(post => post === first), 'Rajada fria compartilha o mesmo resultado');
    assert.equal(requests.filter(url => url.searchParams.get('rest_route').startsWith('/wp/v2/posts/')).length, 1);
    await Promise.all(pending.splice(0));
    assert.equal(first.content.rendered.length > 0, true, 'Detalhe completo (com conteúdo) também serve os metadados');
    assert.equal(writes.filter(row => row.key === postKey).length, 1);
    assert.equal(writes.find(row => row.key === postKey).options.expirationTtl, 30 * 24 * 3600);
    fail = true;
    assert.deepEqual(await newsPost(slug, context), first, 'Reserva do KV servida mesmo com a origem fora');
    await Promise.all(pending.splice(0));
    fail = false; requests = [];
    assert.deepEqual(await newsPost(slug, context), first);
    await Promise.all(pending.splice(0));
    assert.ok(requests.length, 'Revalidação em segundo plano');
    assert.equal(writes.filter(row => row.key === postKey).length, 1, 'Conteúdo igual não regrava o KV');
    const original = posts.find(p => p.id === find(16028).newId); const title = original.title;
    original.title = { rendered: 'Título editado' };
    try {
      assert.deepEqual(await newsPost(slug, context), first, 'Edição: primeiro acesso ainda recebe a reserva');
      await Promise.all(pending.splice(0));
      assert.equal((await newsPost(slug, context)).title.rendered, 'Título editado', 'Edição aparece após a revalidação');
      await Promise.all(pending.splice(0));
      assert.equal(writes.filter(row => row.key === postKey).length, 2);
    } finally { original.title = title; }
    // Middleware e API usam a mesma chave local: a API reaproveita o post buscado no SSR.
    const local = new Map();
    const previousCaches = globalThis.caches;
    globalThis.caches = { default: {
      async match(req) { return local.get(req.url)?.clone(); },
      async put(req, response) { local.set(req.url, response); },
      async delete(req) { return local.delete(req.url); },
    } };
    try {
      values.delete(postKey);
      await newsPost(slug, context); await Promise.all(pending.splice(0)); requests = [];
      const api = await newsApi(new Request(`https://example.test/api/news?slug=${encodeURIComponent(slug)}`), context);
      assert.equal(api.status, 200); assert.equal(requests.length, 0, 'Cache fresco compartilhado');
      values.delete(postKey); writes.length = 0;
      await newsPost(slug, context); await Promise.all(pending.splice(0));
      assert.equal(requests.length, 0, 'Cache local fresco não consulta KV nem origem');
      const entry = [...local.keys()].find(key => key.endsWith(`/post/${encodeURIComponent(slug)}`));
      assert.match(local.get(entry).headers.get('Cache-Control'), /max-age=604800/);
      const body = await local.get(entry).clone().json();
      local.set(entry, Response.json({ ...body, storedAt: Date.now() - 240_000 }));
      await newsPost(slug, context);
      assert.equal(pending.length, 0, 'Cache fresco por cinco minutos');
      local.set(entry, Response.json({ ...body, storedAt: Date.now() - 301_000 }));
      await Promise.all([newsPost(slug, context), newsPost(slug, context)]);
      assert.equal(pending.length, 1, 'Revalidação single-flight');
      await Promise.all(pending.splice(0));
      assert.ok(values.has(postKey), 'Revalidação recompõe a reserva do KV');
      const saved = await local.get(entry).clone().json();
      const old = Date.now() - 360_000;
      local.set(entry, Response.json({ ...saved, storedAt: old, checkedAt: old }));
      fail = true;
      await newsPost(slug, context); await Promise.all(pending.splice(0));
      const checked = await local.get(entry).clone().json();
      assert.equal(checked.storedAt, old, 'Falha não renova a idade');
      assert.ok(checked.checkedAt > old);
      local.set(entry, Response.json({ ...saved, storedAt: Date.now() - 86400_001 }));
      await assert.rejects(newsPost(slug, context), /503/);
      fail = false;

    } finally { globalThis.caches = previousCaches; }
    // Cron: uma consulta `include` aquece os mais recentes.
    values.clear(); writes.length = 0; requests = [];
    const recent = await refreshNewsIndex(context);
    await Promise.all(pending.splice(0));
    requests = [];
    const warmed = await warmNewsPosts(context);
    assert.equal(warmed, recent.length);
    assert.equal(requests.filter(url => url.searchParams.get('rest_route') === '/wp/v2/posts').length, 1);
    assert.ok(requests.find(url => url.searchParams.get('rest_route') === '/wp/v2/posts').searchParams.get('_fields').includes('content'));
    for (const row of recent) assert.ok(values.has(`news:cache:v1:post/${encodeURIComponent(row.slug)}`), row.slug);
    writes.length = 0;
    assert.equal(await warmNewsPosts(context), recent.length);
    assert.equal(writes.length, 0, 'Pré-aquecimento sem mudanças não escreve no KV');
    fail = true;
    assert.equal((await newsPost(selected[1].slug, context)).id, selected[1].newId, 'Post pré-aquecido servido do KV');
    await Promise.all(pending.splice(0));
    fail = false;
    await assert.rejects(warmNewsPosts({ env: {}, waitUntil() {} }), /binding required/);
  }
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
  // Posts privados, removidos e na lixeira não podem sobreviver no fallback.
  {
    const previousFetch = globalThis.fetch;
    try {
      for (const status of [401, 403, 404, 410]) {
        globalThis.fetch = async input => new URL(input).searchParams.get('rest_route').startsWith('/wp/v2/posts/')
          ? new Response(null, { status }) : previousFetch(input);
        assert.equal(await newsPost(find(16028).slug), null, String(status));
      }
    } finally { globalThis.fetch = previousFetch; }
  }
  {
    const previousFetch = globalThis.fetch;
    const hosts = [];
    globalThis.fetch = async input => {
      const url = new URL(input);
      hosts.push(url.origin);
      url.hostname = 'wordpress.crf-al.org.br';
      return previousFetch(url);
    };
    try {
      const staging = { env: { WP_SITE_URL: 'https://staging.example' }, waitUntil() {} };
      await newsPost(find(16028).slug, staging);
      await newsIndex(staging);
      assert.ok(hosts.length > 2);
      assert.ok(hosts.every(host => host === 'https://staging.example'), 'Todas as chamadas respeitam WP_SITE_URL');
    } finally { globalThis.fetch = previousFetch; }
  }
  // Teto de páginas: inventário maior que o limite gera índice com as mais recentes, sem falhar.
  {
    const mockFetch = globalThis.fetch; const seen = new Set(); let order;
    const logged = []; const previousError = console.error; console.error = message => logged.push(message);
    try {
      globalThis.fetch = async input => {
        const url = new URL(input);
        if (url.searchParams.get('rest_route') === '/wp/v2/categories') return Response.json([{ id: 42, slug: 'noticias-do-portal' }]);
        const page = Number(url.searchParams.get('page')); seen.add(page); order = `${url.searchParams.get('orderby')} ${url.searchParams.get('order')}`;
        return Response.json([{ ...inventory[0], id: 800000 + page, slug: `pagina-${page}`, date_gmt: `2020-01-01T00:00:${String(page % 60).padStart(2, '0')}` }], { headers: { 'x-wp-totalpages': String(NEWS_INDEX_MAX_PAGES + 50) } });
      };
      const result = await newsIndex();
      assert.equal(result.length, NEWS_INDEX_MAX_PAGES);
      assert.equal(Math.max(...seen), NEWS_INDEX_MAX_PAGES, 'Não passa do teto');
      assert.equal(order, 'date desc', 'Páginas mais recentes primeiro');
      assert.ok(logged.some(message => message.includes('news_index_truncated')));
      globalThis.fetch = async () => Response.json([], { headers: { 'x-wp-totalpages': 'abc' } });
      await assert.rejects(newsIndex(), /Invalid news inventory/);
    } finally { globalThis.fetch = mockFetch; console.error = previousError; }
  }
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
    globalThis.fetch = async (input, options) => {
      calls++;
      assert.ok(options.signal, 'Toda consulta ao WP tem timeout');
      if (calls === 1) throw new DOMException('timeout', 'TimeoutError');
      return workingFetch(input, options);
    };
    assert.ok((await newsIndex()).length); assert.ok(calls >= 3, 'Timeout recuperado com nova tentativa');
    calls = 0;
    globalThis.fetch = async () => { calls++; throw new TypeError('network error'); };
    await assert.rejects(newsIndex(), /network error/); assert.equal(calls, 2);
    calls = 0;
    globalThis.fetch = async () => {
      calls++;
      return new Response(new ReadableStream({ start(controller) { controller.error(new DOMException('body timeout', 'TimeoutError')); } }));
    };
    await assert.rejects(newsIndex(), /body timeout/); assert.equal(calls, 2);
  } finally { globalThis.fetch = workingFetch; }
  // Orçamentos: SSR sem repetição, prazo total compartilhado; recarga em segundo plano sem prazo.
  {
    assert.ok(PAGE_BUDGET_MS >= 4000 && PAGE_BUDGET_MS <= 5000); assert.equal(API_BUDGET_MS, 20000);
    const workingFetch = globalThis.fetch; let calls = 0;
    const page = withNewsBudget({ waitUntil() {} }, PAGE_BUDGET_MS, false);
    try {
      globalThis.fetch = async () => { calls++; return new Response('', { status: 503 }); };
      await assert.rejects(newsPost('noticia-sem-repeticao', page), /503/);
      assert.equal(calls, 2, 'Post e categorias em paralelo, sem repetição');
      calls = 0;
      await assert.rejects(newsPost('noticia-api', withNewsBudget({ waitUntil() {} }, API_BUDGET_MS, true)), /503/);
      assert.equal(calls, 4, 'API repete uma vez dentro do prazo');
      calls = 0;
      const expired = { waitUntil() {}, budget: { deadline: Date.now() - 1, retry: true } };
      await assert.rejects(newsPost('noticia-prazo', expired), error => error.name === 'TimeoutError');
      assert.equal(calls, 0, 'Prazo esgotado não consulta a origem');
      // Com reserva disponível, o prazo esgotado não importa e a recarga roda sem ele.
      globalThis.fetch = workingFetch;
      const tasks = [];
      const store = new Map(); const kvStore = { async get(key) { return store.has(key) ? JSON.parse(store.get(key)) : null; }, async put(key, value) { store.set(key, value); }, async delete(key) { store.delete(key); } };
      const slug = find(16028).slug;
      await newsPost(slug, { env: { NEWS_INDEX: kvStore }, waitUntil: task => tasks.push(task) }); await Promise.all(tasks.splice(0));
      requests = [];
      const served = await newsPost(slug, { env: { NEWS_INDEX: kvStore }, waitUntil: task => tasks.push(task), budget: { deadline: Date.now() - 1, retry: false } });
      assert.equal(served.slug, slug);
      await Promise.all(tasks.splice(0));
      assert.ok(requests.some(url => url.searchParams.get('rest_route') === '/wp/v2/media'), 'Revalidação completa apesar do prazo da requisição');
    } finally { globalThis.fetch = workingFetch; }
  }
  // "Não encontrado" fica 5 min no cache local (sem escrita no KV); busca normalizada e limitada.
  {
    const local = new Map(); const previousCaches = globalThis.caches; const tasks = [];
    globalThis.caches = { default: {
      async match(req) { return local.get(req.url)?.clone(); },
      async put(req, response) { local.set(req.url, response); },
      async delete(req) { return local.delete(req.url); },
    } };
    const kvWrites = []; const kvStore = { async get() { return null; }, async put(key) { kvWrites.push(key); }, async delete(key) { kvWrites.push(key); } };
    const ctx = { env: { NEWS_INDEX: kvStore }, waitUntil: task => tasks.push(task) };
    try {
      requests = [];
      assert.equal(await newsPost('slug-inexistente', ctx), null);
      await Promise.all(tasks.splice(0));
      const before = requests.length; assert.ok(before);
      assert.equal(await newsPost('slug-inexistente', ctx), null);
      assert.equal(requests.length, before, 'Não encontrado servido do cache');
      assert.equal(tasks.length, 0, 'Não encontrado não dispara revalidação');
      assert.equal(kvWrites.length, 0, 'Não encontrado não escreve no KV');
      const missingKey = [...local.keys()].find(key => key.endsWith('/post/slug-inexistente'));
      local.set(missingKey, Response.json({ storedAt: Date.now() - 301_000, value: null }));
      assert.equal(await newsPost('slug-inexistente', ctx), null);
      assert.ok(requests.length > before, 'Após 5 min consulta a origem de novo');
      await Promise.all(tasks.splice(0));
      // Busca: variações compartilham a chave; termos extras são descartados.
      assert.equal(normalizeSearch('  Farmácia   CRF '), 'farmácia crf');
      assert.equal(normalizeSearch('a b c d e f g h i j'), 'a b c d e f g h');
      assert.equal(normalizeSearch('ab'), null); assert.equal(normalizeSearch('x'.repeat(121)), null); assert.equal(normalizeSearch('abc\u0000'), null);
      requests = [];
      await searchNews('Farmácia CRF', ctx); await Promise.all(tasks.splice(0));
      const searches = requests.filter(url => url.searchParams.has('search')).length;
      await searchNews('  farmácia   crf', ctx);
      assert.equal(requests.filter(url => url.searchParams.has('search')).length, searches, 'Busca normalizada reaproveita o cache');
      assert.equal(requests.find(url => url.searchParams.has('search')).searchParams.get('search'), 'farmácia crf');
      for (const term of ['ab', '   a ', 'x'.repeat(121), 'abc\u0007']) assert.equal((await newsApi(new Request(`https://example.test/api/news?search=${encodeURIComponent(term)}`), ctx)).status, 400, JSON.stringify(term));
    } finally { globalThis.caches = previousCaches; }
  }
  const cronUrl = await moduleUrl('../workers/news-index-cron/index.ts', { "'../../functions/_news'": JSON.stringify(await loadNews()) });
  const cron = (await import(cronUrl)).default;
  values.delete(NEWS_INDEX_LOCK);
  await cron.scheduled({}, context.env, context);
  await assert.rejects(cron.scheduled({}, {}, context), /binding required/);
  // A auditoria de corte precisa reprovar perdas e identidades divergentes.
  const audit = inventory => spawnSync(process.execPath, ['--input-type=module'], { encoding: 'utf8', input: `
    const inventory = ${JSON.stringify(inventory)};
    globalThis.fetch = async () => Response.json(inventory, { headers: {
      'x-wp-total': String(inventory.length), 'x-wp-totalpages': '1'
    } });
    await import(${JSON.stringify(new URL('./generate-news-archive.mjs', import.meta.url).href)});
  ` });
  const mapped = NEWS_MAP.filter(row => row.newId !== null).map(row => ({ id: row.newId, slug: row.newSlug }));
  const incomplete = audit(mapped.filter(row => row.id !== 16768));
  assert.equal(incomplete.status, 1);
  assert.match(incomplete.stderr, /Identidades divergentes/);
  assert.ok(incomplete.stderr.includes("107698"));
  const complete = [...mapped, ...NEWS_MAP.filter(row => row.newId === null).map((row, i) => ({ id: 900000 + i, slug: row.newSlug }))];
  const success = audit(complete);
  assert.equal(success.status, 0, success.stderr);
  assert.match(success.stdout, /0 resolvidas por slug/);
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
