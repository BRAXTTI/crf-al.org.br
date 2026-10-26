/** Somente sitemaps fixos. Notícias são sempre geradas pela Pages Function. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import ts from 'typescript';
import { siteConfig } from './load-config.mjs';
const { SITE_URL } = await siteConfig();
const source = await readFile(new URL('../src/config/page-metadata.ts', import.meta.url), 'utf8');
const { PAGE_METADATA } = await import(`data:text/javascript;base64,${Buffer.from(ts.transpile(source, { module: ts.ModuleKind.ESNext })).toString('base64')}`);
const output = process.argv[2] || 'public';
await mkdir(output, { recursive: true });
const excluded = new Set(['/eventos', '/imprensa/galeria-de-fotos']);
const urls = Object.keys(PAGE_METADATA).filter(path => !excluded.has(path));
await writeFile(join(output, 'sitemap-pages.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(path => `  <url><loc>${SITE_URL}${path === '/' ? '' : path}</loc></url>`).join('\n')}\n</urlset>\n`);
await writeFile(join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['pages', 'news'].map(name => `<sitemap><loc>${SITE_URL}/sitemap-${name}.xml</loc></sitemap>`).join('')}</sitemapindex>\n`);
await writeFile(join(output, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
