import { NEWS_ARCHIVE } from './_news-archive';
import type { WPPost, WPPostsPage } from '../src/services/wordpress/types';

export const NEWS_CATEGORY_SLUG = 'noticias-do-portal';
type Source = 'legacy' | 'current';
type Entry = { id: number; slug: string; date: string; date_gmt: string; modified?: string; newsSource: Source };
const archive: Entry[] = NEWS_ARCHIVE.map(post => ({ ...post, newsSource: 'legacy' }));
const reserved = new Map(archive.map(post => [post.slug, post]));
const fields = 'id,date,modified,slug,link,title,excerpt,content,_links,_embedded';

function endpoint(source: Source, path: string, params: Record<string, string> = {}) {
  const url = new URL(source === 'legacy' ? `https://www.crf-al.org.br/wp-json/wp/v2/${path}` : 'https://wordpress.crf-al.org.br/index.php');
  if (source === 'current') url.searchParams.set('rest_route', `/wp/v2/${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url.href;
}

async function request(source: Source, path: string, params: Record<string, string> = {}, missing = false): Promise<Response | null> {
  const response = await fetch(endpoint(source, path, params), { signal: AbortSignal.timeout(15000) });
  if (missing && response.status === 404) return null;
  if (!response.ok) throw new Error(`News ${source} HTTP ${response.status}`);
  return response;
}

// Cache only successful public data. No module-level mutable request state.
interface NewsContext { waitUntil: (promise: Promise<unknown>) => void }
interface PublicCache { match: (request: Request) => Promise<Response | undefined>; put: (request: Request, response: Response) => Promise<void> }
async function cached<T>(key: string, context: NewsContext | undefined, load: () => Promise<T>): Promise<T> {
  const cache = (globalThis as typeof globalThis & { caches?: { default?: PublicCache } }).caches?.default;
  const request = new Request(`https://institucional.crf-al.org.br/__news/v1/${key}`);
  const hit = cache && context ? await cache.match(request) : undefined;
  if (hit) return hit.json() as Promise<T>;
  const value = await load();
  if (cache && context && value !== null) context.waitUntil(cache.put(request, Response.json(value, { headers: { 'Cache-Control': 'public, max-age=60' } })).catch(() => undefined));
  return value;
}

async function currentCategory(): Promise<number | null> {
  const response = await request('current', 'categories', { slug: NEWS_CATEGORY_SLUG, _fields: 'id,slug', per_page: '1' });
  const categories = await response!.json() as Array<{id: number; slug: string}>;
  return categories.find(category => category.slug === NEWS_CATEGORY_SLUG)?.id ?? null;
}

export async function newsIndex(context?: NewsContext): Promise<Entry[]> {
  const current = await cached<Entry[]>('current-index', context, async () => {
    const category = await currentCategory();
    if (!category) return []; // Never expose imported posts when the category is absent.
    const rows: Entry[] = [];
    let pages = 1;
    let total = 0;
    for (let page = 1; page <= pages; page++) {
      const response = (await request('current', 'posts', { categories: String(category), per_page: '100', page: String(page), _fields: 'id,slug,date,date_gmt,modified' }))!;
      const pageCount = Number(response.headers.get('x-wp-totalpages'));
      total = Number(response.headers.get('x-wp-total'));
      if (!Number.isInteger(pageCount) || pageCount < 0 || pageCount > 40) throw new Error('News index exceeds supported size');
      pages = Math.max(1, pageCount);
      rows.push(...(await response.json() as Omit<Entry, 'newsSource'>[]).map(post => ({ ...post, newsSource: 'current' as const })));
    }
    if (rows.length !== total) throw new Error('News index changed during pagination');
    // Historical URLs retain their original owner, even during an origin outage.
    const collisions = rows.filter(post => reserved.has(post.slug) || /^\d+$/.test(post.slug));
    if (collisions.length) console.warn(JSON.stringify({ event: 'news_slug_collision', posts: collisions.map(post => ({ id: post.id, slug: post.slug })) }));
    return rows.filter(post => !reserved.has(post.slug) && !/^\d+$/.test(post.slug));
  });
  return [...archive, ...current].sort((a, b) => b.date_gmt.localeCompare(a.date_gmt) || a.newsSource.localeCompare(b.newsSource) || b.id - a.id);
}

export async function newsPost(slug: string, context?: NewsContext, metadataOnly = false): Promise<WPPost | null> {
  const postFields = metadataOnly ? fields.replace('content,', '') : fields;
  const embed = metadataOnly ? 'wp:featuredmedia' : 'wp:featuredmedia,wp:term,author';
  return cached(`${metadataOnly ? 'metadata' : 'post'}/${encodeURIComponent(slug)}`, context, async () => {
    const historical = reserved.get(slug);
    if (historical || /^\d+$/.test(slug)) {
      const response = await request('legacy', `posts/${historical?.id ?? slug}`, { _fields: postFields, _embed: embed }, true);
      return response ? { ...await response.json() as WPPost, newsSource: 'legacy' } : null;
    }
    const category = await currentCategory();
    if (!category) return null;
    const response = await request('current', 'posts', { slug, categories: String(category), _fields: postFields, _embed: embed });
    const posts = await response!.json() as WPPost[];
    return posts[0] ? { ...posts[0], newsSource: 'current' } : null;
  });
}

export async function newsPage(page = 1, perPage = 12, context?: NewsContext): Promise<WPPostsPage> {
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(perPage) || perPage < 1 || perPage > 100) throw new RangeError('Invalid news pagination');
  const index = await newsIndex(context);
  const entries = index.slice((page - 1) * perPage, page * perPage);
  const groups = await Promise.all((['legacy', 'current'] as const).map(async source => {
    const ids = entries.filter(post => post.newsSource === source).map(post => post.id);
    if (!ids.length) return [];
    return cached<WPPost[]>(`list/${source}/${ids.join(',')}`, context, async () => {
      const response = await request(source, 'posts', { include: ids.join(','), per_page: String(ids.length), _fields: fields.replace('content,', ''), _embed: 'wp:featuredmedia,wp:term' });
      const posts = await response!.json() as WPPost[];
      if (posts.length !== ids.length) throw new Error('Archive snapshot needs refresh: unpublished or missing news');
      return posts.map(post => ({ ...post, newsSource: source }));
    });
  }));
  const posts = new Map(groups.flat().map(post => [`${post.newsSource}:${post.id}`, post]));
  return { posts: entries.map(entry => posts.get(`${entry.newsSource}:${entry.id}`)!), total: index.length, totalPages: Math.ceil(index.length / perPage) };
}

export async function newsApi(request: Request, context?: NewsContext): Promise<Response> {
  if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
  const url = new URL(request.url);
  try {
    const slug = url.searchParams.get('slug');
    if (slug !== null && (!slug || slug.length > 200 || /[/?#]/.test(slug))) return Response.json({ error: 'Slug inválido.' }, { status: 400 });
    const result = slug !== null ? await newsPost(slug, context) : await newsPage(Number(url.searchParams.get('page') ?? 1), Number(url.searchParams.get('per_page') ?? 12), context);
    return new Response(request.method === 'HEAD' ? null : JSON.stringify(result), { status: result ? 200 : 404, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': result ? 'public, max-age=60' : 'no-store' } });
  } catch (error) {
    if (error instanceof RangeError) return Response.json({ error: 'Paginação inválida.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    console.error(JSON.stringify({ event: 'news_api_failed', message: String(error) }));
    return Response.json({ error: 'Notícias temporariamente indisponíveis.' }, { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '60' } });
  }
}
