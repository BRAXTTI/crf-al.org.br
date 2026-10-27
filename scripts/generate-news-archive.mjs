import { readFile } from 'node:fs/promises';
// Valida o mapa versionado contra o inventário público atual, sem recriar IDs históricos.
const source = await readFile(new URL('../functions/_news-map.ts', import.meta.url), 'utf8');
const rows = JSON.parse(source.match(/export const NEWS_MAP: HistoricalNews\[\] = (.*);/)[1]);
const current = new Map(); let pages = 1; let total = 0;
for (let page = 1; page <= pages; page++) {
  const url = new URL('https://wordpress.crf-al.org.br/index.php');
  for (const [key, value] of Object.entries({ rest_route: '/wp/v2/posts', per_page: '100', page: String(page), _fields: 'id,slug' })) url.searchParams.set(key, value);
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`WP novo HTTP ${response.status}`);
  pages = Number(response.headers.get('x-wp-totalpages')); total = Number(response.headers.get('x-wp-total'));
  if (!Number.isInteger(pages) || pages < 1 || pages > 100) throw new Error('Paginação inválida');
  for (const post of await response.json()) current.set(post.id, post.slug);
}
if (current.size !== total) throw new Error('Inventário incompleto');
const mismatches = rows.filter(row => row.newId !== null && current.get(row.newId) !== row.newSlug);
if (mismatches.length) throw new Error(`Identidades divergentes: ${JSON.stringify(mismatches)}`);
// Entradas sem ID também são URLs públicas reservadas. Validar apenas os pares
// conhecidos aprovaria o corte mesmo com notícias históricas ainda ausentes.
const currentBySlug = new Map([...current].map(([id, slug]) => [slug, id]));
const reservedIds = new Set(rows.filter(row => row.newId !== null).map(row => row.newId));
const missing = rows.filter(row => !row.blocked && row.newId === null &&
  (!currentBySlug.has(row.newSlug) || reservedIds.has(currentBySlug.get(row.newSlug))));
if (missing.length) throw new Error(`Migração incompleta: notícias históricas ausentes: ${JSON.stringify(missing.map(({ oldId, slug }) => ({ oldId, slug })))}`);
console.log(`${rows.length} identidades verificadas; ${rows.filter(row => !row.blocked && row.newId === null).length} resolvidas por slug.`);
