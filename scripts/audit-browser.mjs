/** Lighthouse inclui axe; execução separada dos testes unitários offline.
 *
 * Por padrão roda contra o preview local (dist/ servido por Vite). A aferição
 * oficial de performance é contra o domínio publicado: o número local varia
 * ±0,08 conforme a carga da máquina. Para medir no domínio, use a URL base:
 *
 *   LH_URL=https://institucional.crf-al.org.br npm run audit:browser
 *
 * Com LH_URL, o script não sobe o preview local: mede a URL informada.
 */
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const URL_BASE = process.env.LH_URL?.replace(/\/$/, '');
const ALVO = `${URL_BASE ?? 'http://127.0.0.1:4178'}/instituicao`;
const preview = URL_BASE
  ? null
  : spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4178', '--strictPort'], { stdio: 'ignore', detached: true });

const run = (command, args) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { stdio: 'inherit', env: process.env });
  child.on('error', reject);
  child.on('exit', code => code === 0 ? resolve() : reject(new Error(`${command}: ${code}`)));
});
try {
  if (!URL_BASE) {
    let ready = false;
    for (let attempt = 0; attempt < 50; attempt++) {
      try { ready = (await fetch('http://127.0.0.1:4178')).ok; } catch { /* aguarda servidor */ }
      if (ready) break;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(ready, 'Preview não iniciou');
  }
  await run('npx', ['--no-install', 'lighthouse', ALVO, '--only-categories=performance,accessibility', '--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage', '--output=json', '--output-path=/tmp/crfal-lighthouse.json', '--quiet']);
  const report = JSON.parse(await readFile('/tmp/crfal-lighthouse.json', 'utf8'));
  console.log(Object.fromEntries(Object.entries(report.categories).map(([key, value]) => [key, value.score])));
  console.log(`Medido em: ${ALVO}`);
  if (!URL_BASE) console.log('Medida local: a aferição oficial de performance é contra o domínio publicado (o número local varia ±0,08 conforme a carga da máquina).');
  assert.ok(report.categories.accessibility.score >= 0.9, 'Acessibilidade abaixo de 90');
  assert.ok(report.categories.performance.score >= 0.7, 'Desempenho abaixo de 70');
} finally {
  if (preview) {
    try { process.kill(-preview.pid, 'SIGTERM'); } catch { preview.kill(); }
  }
}
