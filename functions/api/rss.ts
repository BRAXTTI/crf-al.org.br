import { newsPage, withNewsBudget, API_BUDGET_MS } from '../_news';
import { SITE_URL } from '../../src/config/site';
const escape = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
export const onRequest: PagesFunction<{ NEWS_ARCHIVE_API_URL?: string }> = async context => {
  if (!['GET', 'HEAD'].includes(context.request.method)) return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
  try {
    const { posts } = await newsPage(1, 20, withNewsBudget(context, API_BUDGET_MS, true));
    const items = posts.map(post => {
      const url = `${SITE_URL}/imprensa/noticias/${post.slug}`;
      return `<item><title>${escape(post.title.rendered.replace(/<[^>]*>/g, ''))}</title><link>${escape(url)}</link><guid isPermaLink="true">${escape(url)}</guid><description>${escape(post.excerpt.rendered)}</description></item>`;
    }).join('');
    const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Notícias CRF-AL</title><link>${SITE_URL}/imprensa/noticias</link><description>Notícias do Conselho Regional de Farmácia de Alagoas</description><language>pt-BR</language>${items}</channel></rss>`;
    return new Response(context.request.method === 'HEAD' ? null : body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=60' } });
  } catch {
    return new Response('Feed temporariamente indisponível.', { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '60' } });
  }
};
