import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const assetsDir = path.join(distDir, 'assets');
const indexHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtmlPath) || !fs.existsSync(assetsDir)) {
  console.error(
    '[verify-menu-migration] Build não encontrado. Execute `npm run build` antes.'
  );
  process.exit(1);
}

const jsBundle = fs
  .readdirSync(assetsDir)
  .filter((file) => file.startsWith('index-') && file.endsWith('.js'))
  .sort()
  .at(-1);

if (!jsBundle) {
  console.error('[verify-menu-migration] Bundle JS não encontrado em dist/assets.');
  process.exit(1);
}

const bundlePath = path.join(assetsDir, jsBundle);
const bundleContent = fs.readFileSync(bundlePath, 'utf8');
const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

const forbiddenTerms = ['Legislação'];
const requiredTerms = ['Fiscalização', 'Leis Federais', 'Resoluções', 'Normativas', 'Pareceres'];

const forbiddenFound = forbiddenTerms.filter((term) => bundleContent.includes(term));
if (forbiddenFound.length > 0) {
  console.error(
    `[verify-menu-migration] Falha: menu antigo ainda encontrado no bundle (${forbiddenFound.join(', ')}).`
  );
  process.exit(1);
}

const missingRequired = requiredTerms.filter((term) => !bundleContent.includes(term));
if (missingRequired.length > 0) {
  console.error(
    `[verify-menu-migration] Falha: itens esperados não encontrados no bundle (${missingRequired.join(', ')}).`
  );
  process.exit(1);
}

if (!indexHtmlContent.includes(jsBundle)) {
  console.error(
    `[verify-menu-migration] Falha: dist/index.html não referencia o bundle atual (${jsBundle}).`
  );
  process.exit(1);
}

console.log(`[verify-menu-migration] OK: bundle validado (${jsBundle}).`);
