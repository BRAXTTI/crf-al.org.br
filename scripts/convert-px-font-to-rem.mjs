/**
 * Converte tamanhos de fonte travados em `px` para `rem` (1rem = 16px).
 *
 * Motivo: com `<meta name="text-scale" content="scale">`, o navegador escala a
 * fonte da raiz conforme a preferência de texto do sistema operacional. Só o que
 * está em `rem`/`em` acompanha essa escala; `px` fica preso.
 *
 * A conversão é 1:1 (13px -> 0.8125rem): o desenho não muda na escala padrão.
 * Uso: node scripts/convert-px-font-to-rem.mjs [--dry-run]
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const RAIZ = new URL('..', import.meta.url).pathname;
const ALVO = 'src';
const IGNORAR = new Set(['node_modules', 'dist', '.git']);
const dryRun = process.argv.includes('--dry-run');

const EXTENSOES = new Set(['.tsx', '.ts', '.jsx', '.js', '.css', '.html']);

/** Converte px em rem com precisão exata; null quando não é exato. */
function pxParaRem(px) {
  const rem = px / 16;
  const texto = Number(rem.toFixed(5)).toString();
  if (Math.abs(Number(texto) - rem) > 1e-9) return null;
  return texto;
}

async function* arquivos(dir) {
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    if (IGNORAR.has(entrada.name)) continue;
    const caminho = join(dir, entrada.name);
    if (entrada.isDirectory()) yield* arquivos(caminho);
    else if (EXTENSOES.has(extname(entrada.name))) yield caminho;
  }
}

let alterados = 0;
let substituicoes = 0;
const relatorio = [];

for await (const caminho of arquivos(join(RAIZ, ALVO))) {
  const antes = await readFile(caminho, 'utf8');
  const indeveis = [];
  const depois = antes.replace(/text-\[(\d+(?:\.\d+)?)px\]/g, (achado, px) => {
    const rem = pxParaRem(Number(px));
    if (rem === null) {
      indeveis.push(`${achado} (${px}px não é exato em rem)`);
      return achado;
    }
    substituicoes += 1;
    return `text-[${rem}rem]`;
  });
  if (depois !== antes) {
    alterados += 1;
    relatorio.push(`${caminho.replace(RAIZ, '')}`);
    if (!dryRun) await writeFile(caminho, depois);
  }
  for (const aviso of indeveis) console.warn(`aviso: ${caminho.replace(RAIZ, '')}: ${aviso}`);
}

console.log(`${substituicoes} tamanhos de fonte convertidos de px para rem em ${alterados} arquivos.`);
if (dryRun) {
  console.log('Dry-run: nenhum arquivo foi gravado.');
  console.log(relatorio.join('\n'));
}
