import { readFile } from 'node:fs/promises';
import ts from 'typescript';
export async function siteConfig() {
  const source = await readFile(new URL('../src/config/site.ts', import.meta.url), 'utf8');
  return import(`data:text/javascript;base64,${Buffer.from(ts.transpile(source, { module: ts.ModuleKind.ESNext })).toString('base64')}`);
}
