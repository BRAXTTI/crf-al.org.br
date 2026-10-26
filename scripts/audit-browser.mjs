/** Lighthouse inclui axe; execução separada dos testes unitários offline. */
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4178', '--strictPort'], { stdio: 'ignore', detached: true });
const run = (command, args) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { stdio: 'inherit', env: process.env });
  child.on('error', reject);
  child.on('exit', code => code === 0 ? resolve() : reject(new Error(`${command}: ${code}`)));
});
try {
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    try { ready = (await fetch('http://127.0.0.1:4178')).ok; } catch { /* aguarda servidor */ }
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, 'Preview não iniciou');
  await run('npx', ['--no-install', 'lighthouse', 'http://127.0.0.1:4178/instituicao', '--only-categories=performance,accessibility', '--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage', '--output=json', '--output-path=/tmp/crfal-lighthouse.json', '--quiet']);
  const report = JSON.parse(await readFile('/tmp/crfal-lighthouse.json', 'utf8'));
  console.log(Object.fromEntries(Object.entries(report.categories).map(([key, value]) => [key, value.score])));
  assert.ok(report.categories.accessibility.score >= 0.9, 'Acessibilidade abaixo de 90');
  assert.ok(report.categories.performance.score >= 0.7, 'Desempenho abaixo de 70');
} finally {
  try { process.kill(-preview.pid, 'SIGTERM'); } catch { preview.kill(); }
}
