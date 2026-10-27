import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Fotografias públicas do levantamento; nenhuma requisição ao WordPress.
// O WordPress novo herdou o _thumbnail_id dos posts, mas não os anexos acima do ID 9578:
// /wp/v2/media/{id} responde 404 e a notícia fica sem capa. O antigo tem o mesmo anexo (mesmo ID)
// e os arquivos continuam em midias.crf-al.org.br, no mesmo caminho de /app/uploads.
const dir = resolve(process.argv[2] || '/workspace/crf-al-noticias/dados');
const read = async file => JSON.parse(await readFile(resolve(dir, file), 'utf8'));
const [oldPosts, newPosts] = await Promise.all(['antigo/posts-all.json', 'novo/posts-all.json'].map(read));
const prefix = 'https://www.crf-al.org.br/app/uploads/';
const embedded = post => post?._embedded?.['wp:featuredmedia']?.[0];
const oldMedia = new Map(oldPosts.map(post => [post.featured_media, embedded(post)]).filter(([id, media]) => id && media?.source_url));
const missing = [...new Set(newPosts.filter(post => post.featured_media && !embedded(post)?.source_url).map(post => post.featured_media))].sort((a, b) => a - b);
const covers = {};
for (const id of missing) {
  const media = oldMedia.get(id);
  if (!media) continue;
  if (!media.source_url.startsWith(prefix)) throw new Error(`Capa fora de /app/uploads: ${id}`);
  const path = media.source_url.slice(prefix.length);
  const folder = path.slice(0, path.lastIndexOf('/') + 1);
  const { width = 0, height = 0 } = media.media_details ?? {};
  // Só os tamanhos que mediaImageSet aproveita: largura >= 300 e mesma proporção do original.
  const sizes = Object.fromEntries(Object.entries(media.media_details?.sizes ?? {})
    .filter(([, size]) => size?.source_url === `${prefix}${folder}${size.file}` && `${folder}${size.file}` !== path && size.width >= 300 && size.height > 0)
    .filter(([, size]) => !width || !height || Math.abs(size.width / size.height - width / height) / (width / height) <= 0.02)
    .map(([name, size]) => [name, [size.file, size.width, size.height]]));
  covers[id] = [path, width, height, media.alt_text ?? '', sizes];
}
const count = Object.keys(covers).length;
const posts = newPosts.filter(post => covers[post.featured_media] && !embedded(post)?.source_url).length;
if (posts < 900 || count < missing.length - 5) throw new Error(`Inventário inesperado: ${count} de ${missing.length} anexos`);
const output = `// Gerado por scripts/generate-news-covers.mjs a partir do levantamento público.\n// Anexos de capa que existem só no WordPress antigo; caminhos relativos a /app/uploads/.\nexport type LegacyCover = [path: string, width: number, height: number, alt: string, sizes: Record<string, [file: string, width: number, height: number]>];\nexport const LEGACY_COVERS: Record<number, LegacyCover> = ${JSON.stringify(covers)};\n`;
await writeFile(new URL('../functions/_news-covers.ts', import.meta.url), output);
console.log(`${count} capas recuperadas de ${missing.length} anexos ausentes no WordPress novo (${posts} posts).`);
