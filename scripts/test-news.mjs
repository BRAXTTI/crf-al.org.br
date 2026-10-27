import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { moduleUrl } from './load-typescript.mjs';
import { loadNews } from './load-news.mjs';
const { NEWS_MAP, BLOCKED_NEWS_SLUGS, OCCUPIED_HISTORICAL_IDS } = await import(await moduleUrl('../functions/_news-map.ts'));
const { newsIndex, newsPage, newsPost, newsApi, newsSitemapIndex, searchNews } = await import(await loadNews());
const find = id => NEWS_MAP.find(row => row.oldId === id);
const selected = [16028, 16193, 16150, 16108, 7108].map(find);
const post = row => ({ id: row.newId, slug: row.newSlug, date: '2020-01-01T00:00:00', date_gmt: '2020-01-01T03:00:00', title: { rendered: row.title ? '' : 'Título' }, excerpt: { rendered: '<p>Resumo</p>' }, content: { rendered: '<img src="https://www.crf-al.org.br/app/uploads/2020/a.jpg" srcset="https://crf-al.org.br/wp-content/uploads/a.jpg 2x">' }, categories: [1], _embedded: { 'wp:featuredmedia': [{ source_url: 'https://www.crf-al.org.br/app/uploads/2020/a.jpg' }] } });
let posts = [...selected.map(post), post(find(2534)), { ...post(find(16023)), id: 999999, slug: 'spam-novo', categories: [3] }];
let requests = []; let fail = false;
const original = globalThis.fetch; const error = console.error; console.error = () => {};
globalThis.fetch = async input => {
  const url = new URL(input); requests.push(url);
  assert.equal(url.hostname, 'wordpress.crf-al.org.br');
  if (fail) return new Response('', { status: 503 });
  const route = url.searchParams.get('rest_route');
  if (route === '/wp/v2/categories') return Response.json([{ id: 42, slug: 'noticias-do-portal' }, { id: 3, slug: 'dating-online' }]);
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
  assert.equal(await newsPost('2534'), null); assert.equal(await newsPost('best-dating-sites'), null);
  assert.equal(await newsPost(String(find(107698).oldId)), null);
  assert.equal((await newsApi(new Request('https://example.test/api/news?slug=best-dating-sites'))).status, 410);
  const index = await newsIndex(); assert.equal(index.length, selected.length);
  const page = await newsPage(1, 5); assert.deepEqual(page.posts.map(p => p.id), index.map(p => p.id));
  assert.equal((await searchNews('farmacia')).length, selected.length);
  assert.deepEqual((await newsSitemapIndex()).map(p => p.slug), index.map(p => p.slug));
  assert.ok(BLOCKED_NEWS_SLUGS.includes('ola-mundo-2'));
  // Um dos ausentes passa a existir por slug, sem atualização manual do ID.
  posts.push({ ...post(find(107698)), id: 999998 });
  assert.equal((await newsPost('107698')).id, 999998);
  fail = true; assert.equal((await newsApi(new Request('https://example.test/api/news'))).status, 503);
  for (const dir of ['functions', 'src']) for (const file of await readdir(dir, { recursive: true })) {
    if (!/\.(?:ts|tsx|js|mjs)$/.test(file)) continue;
    const text = await readFile(`${dir}/${file}`, 'utf8');
    assert.ok(!text.includes(['www.crf-al.org.br', 'wp-json'].join('/')), `${dir}/${file}: origem antiga em runtime`);
  }
  console.log('Notícias: IDs, conflitos, títulos, include ordenado, bloqueios, ausentes, busca, mídia e falhas validados.');
} finally { globalThis.fetch = original; console.error = error; }
