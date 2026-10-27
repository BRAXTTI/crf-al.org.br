import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/csp-report.js';
const saved = console.log;
const logs = [];
console.log = message => logs.push(message);
const send = (body, type = 'application/csp-report') => onRequest({
  request: new Request('https://portal.example/api/csp-report', {
    method: 'POST', headers: { 'Content-Type': type }, body,
  }),
});
try {
  const response = await send(JSON.stringify({ 'csp-report': {
    'effective-directive': 'frame-src',
    'document-uri': 'https://portal.example/private?token=secret',
    'blocked-uri': 'https://blocked.example/path?secret=1',
    'script-sample': 'secret',
  } }));
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual(JSON.parse(logs[0]), {
    event: 'csp_report', directive: 'frame-src',
    documentOrigin: 'https://portal.example', blockedOrigin: 'https://blocked.example',
  });
  assert.ok(!logs[0].includes('secret'));
  assert.equal((await send('invalid')).status, 400);
  assert.equal((await send('{}')).status, 400);
  assert.equal((await send('x'.repeat(16385))).status, 413);
  assert.equal((await send('{}', 'text/plain')).status, 415);
  assert.equal((await onRequest({ request: new Request('https://portal.example/api/csp-report') })).status, 405);
  assert.equal(logs.length, 1, 'Só relatório válido produz log');
} finally { console.log = saved; }
console.log('CSP: relatório local, limites, métodos e remoção de dados de URL validados.');
