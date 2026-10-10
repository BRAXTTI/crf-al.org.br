import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(ts.transpile(source, { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 })).toString('base64')}`;
export async function loadNews() {
  const archive = moduleUrl(await readFile(new URL('../functions/_news-archive.ts', import.meta.url), 'utf8'));
  const source = (await readFile(new URL('../functions/_news.ts', import.meta.url), 'utf8')).replace("'./_news-archive'", JSON.stringify(archive));
  return moduleUrl(source);
}
