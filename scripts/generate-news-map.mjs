import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Fotografias públicas do levantamento; nenhuma requisição ao WordPress.
const dir = resolve(process.argv[2] || '/workspace/crf-al-noticias/dados');
const read = async file => JSON.parse(await readFile(resolve(dir, file), 'utf8'));
const [pairs, oldPosts, newPosts, conflicts] = await Promise.all(['mapa-posts-candidatos.json', 'antigo/posts-all.json', 'novo/posts-all.json', 'conflitos-id.json'].map(read));
const oldById = new Map(oldPosts.map(post => [post.id, post]));
const newById = new Map(newPosts.map(post => [post.id, post]));
// Critérios da auditoria: categoria dating-online ou expressões de spam/teste
// em slug, título ou conteúdo. Nomes isolados de medicamentos não são suficientes.
const spam = /dating sites?|online dating|lorem ipsum|welcome to wordpress|online casino|casino online|buy viagra|payday loans/i;
const suspects = (posts, category) => new Set(posts.filter(post => post.categories?.includes(category) || spam.test([post.slug, post.title?.rendered, post.content?.rendered].join(' '))).map(post => post.id));
const blockedOld = suspects(oldPosts, 22);
const blockedNew = suspects(newPosts, 3);
// IDs identificados na seção "11 posts sem título no novo" do levantamento.
const titleIds = new Set([8657, 8453, 8215, 7571, 7466, 7334, 7108, 6991, 6774, 6610, 6227]);
// Importações posteriores à fotografia do levantamento, verificadas na REST do WP novo.
const imported = new Map([[107698, 16768], [5967, 16769], [8995, 16770]]);
const rows = pairs.map(pair => {
  const old = oldById.get(pair.antigo_id), current = pair.novo_id == null ? null : newById.get(pair.novo_id);
  if (!old || (pair.novo_id != null && !current) || pair.candidatos.length > 1) throw new Error(`Par inválido ou ambíguo: ${pair.antigo_id}`);
  return { oldId: old.id, newId: current?.id ?? imported.get(old.id) ?? null, slug: old.slug, newSlug: current?.slug ?? old.slug, ...(titleIds.has(old.id) ? { title: old.title.rendered } : {}), ...(blockedOld.has(old.id) || (current && blockedNew.has(current.id)) ? { blocked: true } : {}) };
});
if (rows.length !== oldPosts.length || rows.filter(row => row.title).length !== 11 || rows.filter(row => row.newId === null).length !== 0 || conflicts.length !== 3) throw new Error('Inventário inesperado');
const blockedSlugs = [...new Set([...oldPosts.filter(post => blockedOld.has(post.id)), ...newPosts.filter(post => blockedNew.has(post.id))].map(post => post.slug))].sort();
const output = `// Gerado por scripts/generate-news-map.mjs a partir do levantamento público.\nexport interface HistoricalNews { oldId: number; newId: number | null; slug: string; newSlug: string; title?: string; blocked?: boolean }\nexport const NEWS_MAP: HistoricalNews[] = ${JSON.stringify(rows)};\nexport const BLOCKED_NEWS_SLUGS: string[] = ${JSON.stringify(blockedSlugs)};\nexport const BLOCKED_NEW_IDS: number[] = ${JSON.stringify([...blockedNew].sort((a,b)=>a-b))};\nexport const OCCUPIED_HISTORICAL_IDS = ${JSON.stringify(conflicts)};\n`;
await writeFile(new URL('../functions/_news-map.ts', import.meta.url), output);
console.log(`${rows.length} pares, ${blockedSlugs.length} slugs bloqueados, ${titleIds.size} títulos, ${conflicts.length} IDs ocupados.`);
