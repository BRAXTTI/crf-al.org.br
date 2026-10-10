/**
 * Atualiza os sitemaps estáticos sob demanda (npm run sitemap:refresh):
 *  - public/sitemap-news.xml (URLs do acervo reservado e das novas notícias da categoria do portal)
 *  - public/sitemap.xml      (índice referenciando sitemap-pages.xml + sitemap-news.xml)
 *
 * Não roda durante o build: a lista de notícias só precisa ser atualizada quando
 * houver mudanças editoriais no WordPress. Se a API falhar, os arquivos atuais
 * são preservados para não publicar um índice incompleto.
 */
import { writeFileSync, existsSync, renameSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { loadNews } from './load-news.mjs';

const SITE_URL = (process.env.VITE_SITE_URL || 'https://institucional.crf-al.org.br').replace(/\/$/, '');
const OUTPUT_DIR = process.argv[2] || 'public';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function fetchAllPosts() {
  const { newsIndex } = await import(await loadNews());
  return newsIndex();
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
