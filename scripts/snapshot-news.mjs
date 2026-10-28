import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
const root = new URL('../public/news-snapshot/', import.meta.url);
const source = await readFile(new URL('../functions/_news-map.ts', import.meta.url), 'utf8');
const map = JSON.parse(source.match(/export const NEWS_MAP: HistoricalNews\[\] = (.*);/)[1]);
const blockedIds = JSON.parse(source.match(/export const BLOCKED_NEW_IDS: number\[\] = (.*);/)[1]);
const blockedSlugs = JSON.parse(source.match(/export const BLOCKED_NEWS_SLUGS: string\[\] = (.*);/)[1]);
const byId = new Map(map.filter(x => x.newId !== null).map(x => [x.newId, x]));
const bySlug = new Map(map.map(x => [x.slug, x]));
const byNewSlug = new Map(map.map(x => [x.newSlug, x]));
async function get(path, params) {
  const url = new URL('https://wordpress.crf-al.org.br/index.php');
  url.searchParams.set('rest_route', `/wp/v2/${path}`);
  for (const [k,v] of Object.entries(params)) url.searchParams.set(k, String(v));
  for (let i=0; i<4; i++) try {
    const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
    if (!response.ok) throw Error(`HTTP ${response.status}`);
    return { data: await response.json(), pages: Number(response.headers.get('x-wp-totalpages')), total: Number(response.headers.get('x-wp-total')) };
  } catch (error) { if (i===3) throw error; }
}
const categories = await get('categories', {per_page:100, _fields:'id,slug,name'});
const category = categories.data.find(x => x.slug === 'noticias-do-portal')?.id;
const spam = categories.data.find(x => x.slug === 'dating-online')?.id;
if (!category || categories.pages !== 1) throw Error('Categorias incompletas');
const params = {per_page:100, _embed:1, _fields:'id,date,date_gmt,modified,slug,link,title,excerpt,content,categories,featured_media,author,_links,_embedded'};
const first = await get('posts', {...params,page:1});
if (!first.pages || first.pages > 200) throw Error('Paginação inválida');
const pages = [first.data]; let next = 2;
await Promise.all(Array.from({length:4}, async () => { while(next <= first.pages) { const page=next++; pages[page-1]=(await get('posts',{...params,page})).data; console.log(`Página ${page}/${first.pages}`); } }));
const raw = pages.flat();
if (raw.length !== first.total || new Set(raw.map(x => x.id)).size !== first.total) throw Error('Inventário incompleto');
const posts = raw.flatMap(post => {
  const row = byId.get(post.id) || bySlug.get(post.slug);
  const historical = row && (row.newId === null ? row.slug === post.slug : row.newId === post.id && row.newSlug === post.slug) ? row : null;
  if (row?.blocked || blockedIds.includes(post.id) || blockedSlugs.includes(post.slug) || post.categories?.includes(spam) || (!historical && (byId.has(post.id) || bySlug.has(post.slug) || byNewSlug.has(post.slug) || /^\d+$/.test(post.slug) || !post.categories?.includes(category)))) return [];
  if (!post.title?.rendered?.replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').trim()) return [];
  const plain = {...post};
  const _embedded = plain._embedded;
  delete plain._links; delete plain._embedded;
  const media = _embedded?.['wp:featuredmedia']?.[0];
  const author = _embedded?.author?.[0];
  const terms = _embedded?.['wp:term']?.[0] ?? [];
  const embedded = { ...(media?.source_url ? { 'wp:featuredmedia': [{ id: media.id, source_url: media.source_url, media_details: media.media_details, alt_text: media.alt_text }] } : {}), 'wp:term': [terms.map(({id,slug,name}) => ({id,slug,name}))], ...(author?.name ? {author:[{name:author.name}]} : {}) };
  const value = {...plain,_embedded:embedded,slug:historical?.slug ?? post.slug,...(historical?.title ? {title:{rendered:historical.title}} : {}),newsSource:'current'};
  return [JSON.parse(JSON.stringify(value).replace(/https?:\/\/(?:www\.)?crf-al\.org\.br(?=\/(?:app|wp-content)\/uploads\/)/gi,'https://midias.crf-al.org.br'))];
}).sort((a,b) => b.date_gmt.localeCompare(a.date_gmt) || b.id-a.id);
if (new Set(posts.map(x=>x.slug)).size !== posts.length) throw Error('Slugs duplicados');
await rm(root,{recursive:true,force:true}); await mkdir(new URL('posts/',root),{recursive:true});
let total = 0, largest = 0;
for (const post of posts) { const data=JSON.stringify(post); const bytes=Buffer.byteLength(data); total+=bytes; largest=Math.max(largest,bytes); await writeFile(new URL(`posts/${encodeURIComponent(post.slug)}.json`,root),data); }
const cards = posts.map(post => { const card = {...post}; delete card.content; return card; });
const data=JSON.stringify(cards); total+=Buffer.byteLength(data); largest=Math.max(largest,Buffer.byteLength(data));
await writeFile(new URL('index.json',root),data);
const generatedAt = new Date().toISOString();
await writeFile(new URL('manifest.json',root),JSON.stringify({generatedAt,count:posts.length,totalBytes:total,largestBytes:largest}));
await writeFile(new URL('../workers/news-index-cron/snapshot.json', import.meta.url), JSON.stringify({generatedAt, entries:posts.map(({id,slug,modified}) => ({id,slug,modified}))}));
if (largest >= 25*1024*1024 || posts.length+2 >= 20000) throw Error('Limite do Pages excedido');
console.log(JSON.stringify({count:posts.length,totalBytes:total,largestBytes:largest}));
