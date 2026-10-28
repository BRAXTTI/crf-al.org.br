/**
 * Gera dist/_routes.json: exclusões estáveis de public/_routes.json + bundles com hash do build.
 * Só caminhos exatos de arquivos existentes: um curinga (`/assets/*`) também tiraria do middleware
 * os arquivos ausentes, que hoje respondem 404 text/plain, e o Pages serviria o index.html com 200.
 */
import assert from 'node:assert/strict';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/** Limite do Pages: include + exclude somados. */
export const MAX_RULES = 100;

export function validateRoutes(routes) {
  assert.deepEqual(Object.keys(routes).sort(), ['exclude', 'include', 'version'], '_routes.json: somente version/include/exclude');
  assert.equal(routes.version, 1, '_routes.json: version 1');
  assert.deepEqual(routes.include, ['/*'], '_routes.json: Functions continuam recebendo todo o resto');
  assert.ok(Array.isArray(routes.exclude), '_routes.json: exclude é lista');
  assert.ok(routes.include.length + routes.exclude.length <= MAX_RULES, `_routes.json: mais de ${MAX_RULES} regras`);
  assert.equal(new Set(routes.exclude).size, routes.exclude.length, '_routes.json: exclusões duplicadas');
  for (const rule of routes.exclude) {
    assert.ok(rule.length <= 100, `Regra com mais de 100 caracteres: ${rule}`);
    // Sem `*` nem `:param`; com extensão, como os assets que o middleware apenas repassa.
    assert.match(rule, /^(\/[A-Za-z0-9._-]+)+$/, `Exclusão deve ser caminho exato de arquivo: ${rule}`);
    assert.match(rule, /\.[a-z0-9]+$/i, `Exclusão sem extensão seria rota HTML: ${rule}`);
    assert.ok(!rule.split('/').some(part => part === '.' || part === '..' || part.startsWith('_')), `Exclusão inválida: ${rule}`);
  }
}

/** Assets do index.html (carregados em toda primeira visita) primeiro; o restante até o limite. */
export function buildRoutes(base, assets, entryAssets = []) {
  const valid = new Set(assets.filter(name => /^[A-Za-z0-9._-]+$/.test(name)));
  const ordered = [...new Set([...entryAssets, ...[...valid].sort()])].filter(name => valid.has(name));
  const budget = Math.max(0, MAX_RULES - base.include.length - base.exclude.length);
  return { ...base, exclude: [...base.exclude, ...ordered.slice(0, budget).map(name => `/assets/${name}`)] };
}

async function isFile(path) {
  return (await stat(path).catch(() => null))?.isFile() ?? false;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const output = process.argv[2] || 'dist';
  const base = JSON.parse(await readFile(new URL('../public/_routes.json', import.meta.url), 'utf8'));
  validateRoutes(base);
  for (const rule of base.exclude) assert.ok(await isFile(join(output, rule)), `Exclusão sem arquivo no build: ${rule}`);
  const assets = (await readdir(join(output, 'assets'), { withFileTypes: true })).filter(entry => entry.isFile()).map(entry => entry.name);
  const entry = [...(await readFile(join(output, 'index.html'), 'utf8')).matchAll(/["']\/assets\/([^"'?#]+)["']/g)].map(match => match[1]);
  const routes = buildRoutes(base, assets, entry);
  validateRoutes(routes);
  for (const name of entry) assert.ok(routes.exclude.includes(`/assets/${name}`), `Asset inicial fora do _routes.json: ${name}`);
  await writeFile(join(output, '_routes.json'), `${JSON.stringify(routes, null, 2)}\n`);
  const hashed = routes.exclude.length - base.exclude.length;
  console.log(`_routes.json: ${routes.exclude.length} exclusões exatas (${base.exclude.length} fixas, ${hashed}/${assets.length} assets com hash); ${routes.include.length + routes.exclude.length}/${MAX_RULES} regras.`);
}
