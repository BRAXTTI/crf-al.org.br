import assert from 'node:assert/strict';
import { moduleUrl } from './load-typescript.mjs';

const httpUrl = await moduleUrl('../src/services/http.ts');
const { requestJson, HttpError } = await import(httpUrl);
const client = await import(await moduleUrl('../src/services/wordpress/client.ts', {
  "'../http'": JSON.stringify(httpUrl),
  "'./image-set'": JSON.stringify(await moduleUrl('../src/services/wordpress/image-set.ts')),
  'import.meta.env.VITE_WP_SITE_URL': JSON.stringify('https://wordpress.example'),
}));
const originalFetch = globalThis.fetch;
try {
  globalThis.fetch = async () => Response.json({ ok: true });
  assert.deepEqual(await requestJson('/test'), { ok: true });
  for (const status of [404, 503]) {
    globalThis.fetch = async () => new Response(null, { status });
    await assert.rejects(requestJson('/test'), error => error instanceof HttpError && error.status === status);
  }
  globalThis.fetch = async () => new Response(null, { status: 404 });
  assert.equal(await client.fetchPostBySlug('missing'), null);
  globalThis.fetch = async () => new Response(null, { status: 503 });
  await assert.rejects(client.fetchPostBySlug('existing'), error => error.status === 503);

  let receivedSignal;
  globalThis.fetch = async (_url, { signal }) => {
    receivedSignal = signal;
    signal.throwIfAborted();
    // Headers chegam imediatamente, mas o corpo só termina depois do prazo.
    return {
      ok: true,
      json: () => new Promise((resolve, reject) => {
        signal.throwIfAborted();
        const timer = setTimeout(() => resolve({ late: true }), 200);
        signal.addEventListener('abort', () => { clearTimeout(timer); reject(signal.reason); }, { once: true });
      }),
    };
  };
  await assert.rejects(requestJson('/slow-body', { timeoutMs: 10 }), error => error.name === 'TimeoutError');
  const controller = new AbortController();
  const pending = requestJson('/cancelled', { signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, error => error.name === 'AbortError');
  assert.ok(receivedSignal.aborted);
  await assert.rejects(requestJson('/already-cancelled', { signal: controller.signal }), error => error.name === 'AbortError');

  let request;
  globalThis.fetch = async url => {
    request = new URL(url, 'https://portal.example');
    return Response.json([{ id: 123, slug: 'evento-de-teste', event_details: { online: true } }]);
  };
  assert.equal((await client.fetchEventBySlug('evento-de-teste')).id, 123);
  assert.equal(request.pathname, '/api/events');
  assert.equal(request.searchParams.get('slug'), 'evento-de-teste');
  globalThis.fetch = async () => Response.json([]);
  assert.equal(await client.fetchEventBySlug('missing'), null);
  // Simula 20 s de leitura sem esperar em tempo real: a listagem do acervo
  // precisa sobreviver ao cache frio, mantendo 15 s para as demais APIs.
  const timers = new Map();
  const savedTimers = { setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout };
  try {
    let timerId = 0;
    globalThis.setTimeout = (callback, delay) => { timers.set(++timerId, { callback, delay }); return timerId; };
    globalThis.clearTimeout = id => timers.delete(id);
    globalThis.fetch = async (_url, { signal }) => ({ ok: true, json: async () => {
      for (const { callback, delay } of timers.values()) if (delay <= 20_000) callback();
      signal.throwIfAborted();
      return { posts: [], total: 0, totalPages: 0 };
    } });
    assert.deepEqual(await client.fetchPosts(), { posts: [], total: 0, totalPages: 0 });
    assert.equal(timers.size, 0);
    await assert.rejects(requestJson('/other-api'), error => error.name === 'TimeoutError');
  } finally {
    globalThis.setTimeout = savedTimers.setTimeout;
    globalThis.clearTimeout = savedTimers.clearTimeout;
  }
  console.log('HTTP: erros, cancelamento, timeout durante o corpo e evento por slug validados.');
} finally {
  globalThis.fetch = originalFetch;
}
