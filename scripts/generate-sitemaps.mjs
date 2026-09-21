/**
 * Gera os sitemaps no build:
 *  - dist/sitemap-news.xml  (URLs das notícias, vindas da API do WordPress antigo)
 *  - dist/sitemap.xml       (índice referenciando sitemap-pages.xml + sitemap-news.xml)
 *
 * É "best-effort": se a API do WordPress falhar, o build continua e o índice
 * sai apenas com o sitemap de páginas. Não quebra o deploy por causa disso.
 */
import { writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SITE_URL = (process.env.VITE_SITE_URL || 'https://institucional.crf-al.org.br').replace(/\/$/, '');
const NEWS_WP = (process.env.VITE_WP_NEWS_SITE_URL || 'https://www.crf-al.org.br').replace(/\/$/, '');
const DIST = 'dist';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function fetchAllPosts() {
  const perPage = 100;
  let page = 1;
  let totalPages = 1;
  const out = [];
  while (page <= totalPages) {
    const url = `${NEWS_WP}/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&_fields=id,date,modified`;
    const res = await fetch(url, { headers: { 'user-agent': 'crfal-sitemap/1.0' } });
    if (!res.ok) throw new Error(`WordPress respondeu ${res.status} na página ${page}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('resposta inesperada da API');
    for (const p of data) out.push(p);
    totalPages = Number(res.headers.get('X-WP-TotalPages') || 1);
    page += 1;
  }
  return out;
}

function newsSitemap(posts) {
  const body = posts
    .map((p) => {
      const lastmod = String(p.modified || p.date || '').slice(0, 10);
      return `  <url>\n    <loc>${esc(`${SITE_URL}/imprensa/noticias/${p.id}`)}</loc>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}    <changefreq>weekly</changefreq>\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function indexSitemap(entries) {
  const body = entries.map((e) => `  <sitemap>\n    <loc>${esc(e)}</loc>\n  </sitemap>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

async function main() {
  let posts = [];
  try {
    posts = await fetchAllPosts();
    console.log(`[sitemap] ${posts.length} notícias obtidas do WordPress`);
  } catch (error) {
    console.warn(`[sitemap] falha ao obter notícias (seguindo só com páginas): ${error.message}`);
  }

  if (posts.length > 0) {
    writeFileSync(join(DIST, 'sitemap-news.xml'), newsSitemap(posts));
  }

  const entries = [];
  if (existsSync(join(DIST, 'sitemap-pages.xml'))) entries.push(`${SITE_URL}/sitemap-pages.xml`);
  if (posts.length > 0) entries.push(`${SITE_URL}/sitemap-news.xml`);

  writeFileSync(join(DIST, 'sitemap.xml'), indexSitemap(entries));
  console.log(`[sitemap] índice gerado com ${entries.length} sitemap(s)`);
}

main();
