import assert from 'node:assert/strict';
import { loadNews } from './load-news.mjs';

const { newsIndex, newsPage, newsPost, newsApi } = await import(await loadNews());
const savedFetch = globalThis.fetch;
const savedError = console.error;
console.error = () => {};
const historicalSlug = 'crf-al-alerta-farmaceuticos-sobre-golpes-envolvendo-cobrancas-de-anuidades-pelo-whatsapp';
const post = (id, slug, date = '2026-10-10T12:00:00') => ({ id, slug, date, date_gmt: date, title: { rendered: slug }, excerpt: { rendered: '' }, link: '', _embedded: { 'wp:featuredmedia': [{ source_url: 'https://example.org/original.jpg' }] } });
let category = true;
let current = [post(107698, 'nova-noticia'), post(99, historicalSlug), post(100, '12345')];
let legacyFailure = false;
let currentFailure = false;
let requests = [];
globalThis.fetch = async input => {
  const url = new URL(input);
  requests.push(url);
  const legacy = url.hostname === 'www.crf-al.org.br';
  if ((legacy && legacyFailure) || (!legacy && currentFailure)) return new Response(null, { status: 503 });
  const route = legacy ? url.pathname.replace('/wp-json/wp/v2/', '') : url.searchParams.get('rest_route').replace('/wp/v2/', '');
  if (route === 'categories') {
    assert.equal(url.searchParams.get('slug'), 'noticias-do-portal');
    return Response.json(category ? [{ id: 42, slug: 'noticias-do-portal' }] : []);
  }
  if (route.startsWith('posts/')) return route === 'posts/999999999' ? new Response(null, { status: 404 }) : Response.json(post(Number(route.split('/')[1]), historicalSlug));
  if (!legacy) assert.ok(url.searchParams.get('categories') === '42' || url.searchParams.has('include'));
  if (url.searchParams.has('slug')) return Response.json(current.filter(post => post.slug === url.searchParams.get('slug')));
  if (url.searchParams.has('include')) {
    const ids = url.searchParams.get('include').split(',').map(Number);
    return Response.json(legacy ? ids.map(id => post(id, id === 107698 ? historicalSlug : `legacy-${id}`)) : current.filter(post => ids.includes(post.id)));
  }
  return Response.json(current, { headers: { 'x-wp-total': String(current.length), 'x-wp-totalpages': current.length ? '1' : '0' } });
};
try {
  let index = await newsIndex();
  assert.equal(index.length, 2809);
  assert.equal(index[0].slug, 'nova-noticia');
  assert.equal(index.filter(post => post.slug === historicalSlug).length, 1);
  assert.equal(index.find(post => post.slug === historicalSlug).newsSource, 'legacy');
  let page = await newsPage(1, 2);
  assert.deepEqual(page.posts.map(post => `${post.newsSource}:${post.id}`), ['current:107698', 'legacy:107698']);
  assert.equal(page.total, 2809);
  assert.equal(page.totalPages, 1405);
  assert.equal(page.posts[1]._embedded['wp:featuredmedia'][0].source_url, 'https://example.org/original.jpg');
  const second = await newsPage(2, 2);
  assert.equal(new Set([...page.posts, ...second.posts].map(post => `${post.newsSource}:${post.id}`)).size, 4);
  requests = [];
  currentFailure = true;
  assert.equal((await newsPost(historicalSlug)).newsSource, 'legacy');
  assert.ok(requests.every(url => url.hostname === 'www.crf-al.org.br'));
  currentFailure = false; legacyFailure = true;
  assert.equal((await newsPost('nova-noticia')).newsSource, 'current');
  await assert.rejects(newsPost(historicalSlug), /legacy HTTP 503/);
  assert.equal((await newsApi(new Request('https://example.org/api/news'))).status, 503);
  legacyFailure = false;
  assert.equal(await newsPost('999999999'), null);
  category = false;
  requests = [];
  index = await newsIndex();
  assert.equal(index.length, 2808);
  assert.equal(await newsPost('nova-noticia'), null);
  assert.ok(requests.every(url => url.searchParams.get('rest_route') === '/wp/v2/categories'), 'Missing category never queries imported posts');
  assert.equal((await newsApi(new Request('https://example.org/api/news?slug=nova-noticia'))).status, 404);
  for (const query of ['page=0', 'page=1.5', 'per_page=101', 'slug=a%2Fb']) assert.equal((await newsApi(new Request(`https://example.org/api/news?${query}`))).status, 400);
  assert.equal((await newsApi(new Request('https://example.org/api/news', { method: 'POST' }))).status, 405);
  category = true; current = [];
  assert.equal((await newsIndex()).length, 2808);
  page = await newsPage(9999, 12);
  assert.equal(page.posts.length, 0);
  console.log('News: editorial category, chronological pagination, duplicate slugs/IDs, original media, source isolation, missing category and failures passed.');
} finally { globalThis.fetch = savedFetch; console.error = savedError; }
