/**
 * Atualiza os sitemaps estáticos sob demanda (npm run sitemap:refresh):
 *  - public/sitemap-news.xml (URLs das notícias, vindas da API do WordPress antigo)
 *  - public/sitemap.xml      (índice referenciando sitemap-pages.xml + sitemap-news.xml)
 *
 * Não roda durante o build: a lista de notícias só precisa ser atualizada quando
 * houver mudanças editoriais no WordPress. Se a API falhar, os arquivos atuais
 * são preservados para não publicar um índice incompleto.
 */
import { writeFileSync, existsSync, renameSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const SITE_URL = (process.env.VITE_SITE_URL || 'https://institucional.crf-al.org.br').replace(/\/$/, '');
const NEWS_WP = (process.env.VITE_WP_NEWS_SITE_URL || 'https://www.crf-al.org.br').replace(/\/$/, '');
const OUTPUT_DIR = process.argv[2] || 'public';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function fetchAllPosts() {
  const perPage = 100;
  let page = 1;
  let totalPages = 1;
  const out = [];
  while (page <= totalPages) {
    const url = `${NEWS_WP}/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&_fields=id,slug,date,modified`;
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
      return `  <url>\n    <loc>${esc(`${SITE_URL}/imprensa/noticias/${p.slug}`)}</loc>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}    <changefreq>weekly</changefreq>\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function indexSitemap(entries) {
  const body = entries.map((e) => `  <sitemap>\n    <loc>${esc(e)}</loc>\n  </sitemap>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

async function main() {
  // Busca primeiro; se o WordPress falhar, não altera os sitemaps já publicados.
  const posts = await fetchAllPosts();
  console.log(`[sitemap] ${posts.length} notícias obtidas do WordPress`);

  const entries = [];
  const pagesPath = join(OUTPUT_DIR, 'sitemap-pages.xml');
  const newsPath = join(OUTPUT_DIR, 'sitemap-news.xml');
  const indexPath = join(OUTPUT_DIR, 'sitemap.xml');
  const newsTempPath = `${newsPath}.tmp`;
  const indexTempPath = `${indexPath}.tmp`;

  if (existsSync(pagesPath)) entries.push(`${SITE_URL}/sitemap-pages.xml`);
  if (posts.length > 0) entries.push(`${SITE_URL}/sitemap-news.xml`);

  if (posts.length > 0) writeFileSync(newsTempPath, newsSitemap(posts));
  writeFileSync(indexTempPath, indexSitemap(entries));

  if (posts.length > 0) renameSync(newsTempPath, newsPath);
  renameSync(indexTempPath, indexPath);
  if (posts.length === 0 && existsSync(newsPath)) unlinkSync(newsPath);
  console.log(`[sitemap] índice gerado com ${entries.length} sitemap(s)`);
}

main().catch((error) => {
  console.error(`[sitemap] atualização cancelada; arquivos existentes foram preservados: ${error.message}`);
  process.exitCode = 1;
});
