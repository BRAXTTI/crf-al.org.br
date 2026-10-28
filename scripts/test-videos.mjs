/** Vídeos do manual e dos tutoriais: servidos do R2 (midias), nunca de `public/`. */
import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import { moduleUrl } from './load-typescript.mjs';

const MIDIAS = 'https://midias.crf-al.org.br';
const siteUrl = await moduleUrl('../src/config/site.ts');
const { VIDEOS_URL } = await import(siteUrl);
assert.equal(VIDEOS_URL, `${MIDIAS}/site/videos`, 'Base dos vídeos no R2');

const { MANUAL_CRF_EM_CASA } = await import(await moduleUrl('../src/data/manual-crf-em-casa.ts', { "'@/config/site'": JSON.stringify(siteUrl) }));
const manual = ['acesso', 'enviar-documentos', 'protocolos', 'boletos', 'baixa-responsabilidade-tecnica', 'certidao-regularidade'];
assert.deepEqual(MANUAL_CRF_EM_CASA.map(secao => secao.video), manual.map(nome => `${VIDEOS_URL}/manual-crf-em-casa/${nome}.webm`), 'Vídeos do manual no R2');
for (const secao of MANUAL_CRF_EM_CASA) await access(`public${secao.poster}`);

// servicos.ts depende de lucide-react; confere as URLs pelo código-fonte.
const tutoriais = [];
for (const file of ['src/data/servicos.ts', 'src/data/tutoriais-destaque.ts']) {
  const source = await readFile(file, 'utf8');
  for (const [, nome] of source.matchAll(/src: `\$\{VIDEOS_URL\}\/tutoriais\/([a-z-]+)\.mp4`/g)) tutoriais.push(nome);
  for (const [, poster] of source.matchAll(/poster: '(\/images\/tutoriais\/[a-z-]+-poster\.webp)'/g)) await access(`public${poster}`);
}
assert.deepEqual(tutoriais.sort(), ['baixa-rt', 'boletos', 'crf-em-casa', 'protocolos', 'sncr'], 'Vídeos dos tutoriais no R2');

for (const file of (await readdir('src', { recursive: true })).filter(file => /\.(tsx?)$/.test(file))) {
  const source = await readFile(`src/${file}`, 'utf8');
  assert.doesNotMatch(source, /['"`]\/[^'"`\s]*\.(?:mp4|webm)['"`]/, `${file}: vídeo local; use VIDEOS_URL`);
}
const videos = (await readdir('public', { recursive: true })).filter(file => /\.(?:mp4|webm)$/i.test(file));
assert.deepEqual(videos, [], 'Vídeos ficam no R2, não em public/');

const headers = await readFile('public/_headers', 'utf8');
const middleware = await readFile('functions/_middleware.ts', 'utf8');
for (const [origem, csp] of [['public/_headers', headers.match(/Content-Security-Policy: (.+)/)[1]], ['functions/_middleware.ts', middleware.match(/'Content-Security-Policy': "([^"]+)"/)[1]]]) {
  const mediaSrc = csp.split(';').map(value => value.trim().split(/\s+/)).find(value => value[0] === 'media-src');
  assert.ok(mediaSrc?.includes(MIDIAS), `${origem}: media-src permite ${MIDIAS}`);
}
assert.doesNotMatch(headers, /\/images\/\*\.(?:mp4|webm)/, 'Sem regra de cache para vídeos locais');

console.log(`Vídeos: ${manual.length + tutoriais.length} servidos de ${VIDEOS_URL}; nenhum em public/.`);
