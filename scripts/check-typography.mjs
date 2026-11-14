/**
 * Impede que tamanhos de font travados em `px` voltem a entrar no código.
 *
 * Com `<meta name="text-scale" content="scale">` no head, o navegador escala a
 * fonte da raiz conforme a preferência de texto do sistema operacional. Tamanho
 * em `px` não acompanha essa escala: o texto fica pequeno enquanto o resto do
 * layout cresce. Por isso toda fonte do projeto está em `rem`/`em`.
 *
 * Também checa que a raiz não ganha font-size fixo: isso cancelaria a escala.
 */
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const RAIZ = new URL('..', import.meta.url).pathname;
const IGNORAR = new Set(['node_modules', 'dist', '.git']);
const EXTENSOES = new Set(['.tsx', '.ts', '.jsx', '.js', '.css', '.html']);

async function* percorrer(dir) {
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    if (IGNORAR.has(entrada.name)) continue;
    const caminho = join(dir, entrada.name);
    if (entrada.isDirectory()) yield* percorrer(caminho);
    else if (EXTENSOES.has(extname(entrada.name))) yield caminho;
  }
}

const problemas = [];

/** 1) Nenhum tamanho de fonte em px dentro de src/. */
for await (const caminho of percorrer(join(RAIZ, 'src'))) {
  const linhas = (await readFile(caminho, 'utf8')).split('\n');
  linhas.forEach((linha, indice) => {
    const achado = linha.match(/text-\[(\d+(?:\.\d+)?)px\]/);
    if (achado) {
      problemas.push(`${caminho.replace(RAIZ, '')}:${indice + 1} — fonte em px (${achado[1]}px); use rem`);
    }
  });
}

/** 2) A raiz (html/:root) não pode declarar font-size: cancela a escala do text-scale. */
for await (const caminho of percorrer(join(RAIZ, 'src'))) {
  const conteudo = await readFile(caminho, 'utf8');
  const re = /(^|\})\s*(:root|html)\b[^{]*\{[^}]*font-size\s*:/gm;
  let achado;
  while ((achado = re.exec(conteudo)) !== null) {
    const linha = conteudo.slice(0, achado.index).split('\n').length;
    problemas.push(`${caminho.replace(RAIZ, '')}:${linha} — font-size na raiz cancela a escala do text-scale`);
  }
}

/** 3) A meta de escala de texto continua no head. */
const html = await readFile(join(RAIZ, 'index.html'), 'utf8');
assert.match(html, /<meta\s+name="text-scale"\s+content="scale"\s*\/?>/, 'Falta <meta name="text-scale" content="scale"> no index.html');

assert.equal(problemas.length, 0, `Tipografia fora do padrão:\n${problemas.join('\n')}`);
console.log('Tipografia: fontes em rem/em, raiz sem font-size fixo, meta text-scale presente.');
