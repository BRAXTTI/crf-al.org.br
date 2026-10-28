/** Notificações do sino: novidades versionadas apontam para páginas publicadas e o estado local é robusto. */
import assert from 'node:assert/strict';
import { moduleUrl } from './load-typescript.mjs';

const { NOVIDADES } = await import(await moduleUrl('../src/config/novidades.ts'));
const { PAGE_METADATA } = await import(await moduleUrl('../src/config/page-metadata.ts'));

const hoje = new Date().toISOString().slice(0, 10);
assert.ok(NOVIDADES.length > 0 && NOVIDADES.length <= 6, 'Poucas novidades (até 6): cada uma aparece como não lida para todos');
assert.equal(new Set(NOVIDADES.map(n => n.id)).size, NOVIDADES.length, 'ids de novidades únicos');
for (const novidade of NOVIDADES) {
  assert.match(novidade.id, /^[a-z0-9-]+$/, `id estável: ${novidade.id}`);
  assert.ok(['novidade', 'servico'].includes(novidade.tipo), `tipo: ${novidade.id}`);
  assert.match(novidade.data, /^\d{4}-\d{2}-\d{2}$/, `data YYYY-MM-DD: ${novidade.id}`);
  assert.ok(!Number.isNaN(Date.parse(novidade.data)) && novidade.data <= hoje, `data válida e não futura: ${novidade.id}`);
  assert.ok(novidade.titulo.trim() && novidade.resumo.trim(), `título e resumo: ${novidade.id}`);
  assert.ok(novidade.href in PAGE_METADATA, `rota publicada: ${novidade.href}`);
  if (novidade.contagem) assert.equal(novidade.tipo, 'servico', `contagem só em serviço: ${novidade.id}`);
}

// Estado no localStorage: navegador simulado, sem React.
const store = new Map();
let bloqueado = false;
globalThis.window = {
  localStorage: {
    getItem: key => store.get(key) ?? null,
    setItem: (key, value) => { if (bloqueado) throw new Error('QuotaExceededError'); store.set(key, value); },
  },
  addEventListener() {},
  removeEventListener() {},
};
const carregarEstado = async () => import(await moduleUrl('../src/features/notificacoes/estado.ts', {
  "import { useSyncExternalStore } from 'react';": `const useSyncExternalStore = () => {}; // ${Math.random()}`,
}));

store.set('crfal:notificacoes', '{corrompido');
let estado = await carregarEstado();
estado.marcarLidas(['evento-1', 'evento-1', 'novidade-a']);
estado.dispensar(['noticia-9']);
let salvo = JSON.parse(store.get(estado.STORAGE_KEY));
assert.deepEqual(salvo, { lidas: ['evento-1', 'novidade-a'], dispensadas: ['noticia-9'], vistas: [] }, 'JSON corrompido é descartado e ids não se repetem');

estado.marcarVistas(Array.from({ length: 250 }, (_, i) => `evento-${i}`));
salvo = JSON.parse(store.get(estado.STORAGE_KEY));
assert.equal(salvo.vistas.length, 200, 'Lista limitada a 200 ids');
assert.equal(salvo.vistas[0], 'evento-50', 'Os ids mais antigos saem primeiro');

store.set('crfal:notificacoes', JSON.stringify({ lidas: ['x', 3, null], dispensadas: 'y' }));
estado = await carregarEstado();
bloqueado = true;
assert.doesNotThrow(() => estado.marcarLidas(['z']), 'Armazenamento bloqueado não quebra o site');
assert.deepEqual(JSON.parse(store.get(estado.STORAGE_KEY)), { lidas: ['x', 3, null], dispensadas: 'y' }, 'Nada gravado com o armazenamento bloqueado');

console.log(`Notificações: ${NOVIDADES.length} novidades com rota publicada; estado local validado.`);
