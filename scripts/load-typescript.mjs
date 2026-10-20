import { readFile } from 'node:fs/promises';
import ts from 'typescript';

/** Pequenos módulos sem bundler; os testes declaram suas dependências explicitamente. */
export async function moduleUrl(file, replacements = {}) {
  let source = await readFile(new URL(file, import.meta.url), 'utf8');
  for (const [from, to] of Object.entries(replacements)) source = source.replaceAll(from, to);
  return `data:text/javascript;base64,${Buffer.from(ts.transpile(source, {
    module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022,
  })).toString('base64')}`;
}
