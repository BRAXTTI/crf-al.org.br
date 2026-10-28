import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(ts.transpile(source, { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 })).toString('base64')}`;
export async function loadNews() {
  const map = moduleUrl(await readFile(new URL('../functions/_news-map.ts', import.meta.url), 'utf8'));
  const covers = moduleUrl(await readFile(new URL('../functions/_news-covers.ts', import.meta.url), 'utf8'));
  const source = (await readFile(new URL('../functions/_news.ts', import.meta.url), 'utf8')).replaceAll("'./_news-map'", JSON.stringify(map)).replace("'./_news-covers'", JSON.stringify(covers)).replace("'../src/config/site'", JSON.stringify(moduleUrl(await readFile(new URL('../src/config/site.ts', import.meta.url), 'utf8'))));
  return moduleUrl(source);
}
