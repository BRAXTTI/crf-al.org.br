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
assert.deepEqual(salvo, { lidas: ['evento-1', 'novidade-a'], dispensadas: ['noticia-9'], vistas: [], mostradas: [] }, 'JSON corrompido é descartado e ids não se repetem');

estado.marcarMostradas(['evento-1', 'novidade-a', 'evento-1']);
salvo = JSON.parse(store.get(estado.STORAGE_KEY));
assert.deepEqual(salvo.mostradas, ['evento-1', 'novidade-a'], 'Toasts já mostrados ficam guardados sem repetição');

estado.marcarVistas(Array.from({ length: 250 }, (_, i) => `evento-${i}`));
salvo = JSON.parse(store.get(estado.STORAGE_KEY));
assert.equal(salvo.vistas.length, 200, 'Lista limitada a 200 ids');
assert.equal(salvo.vistas[0], 'evento-50', 'Os ids mais antigos saem primeiro');

store.set('crfal:notificacoes', JSON.stringify({ lidas: ['x', 3, null], dispensadas: 'y' }));
estado = await carregarEstado();
bloqueado = true;
assert.doesNotThrow(() => estado.marcarLidas(['z']), 'Armazenamento bloqueado não quebra o site');
assert.deepEqual(JSON.parse(store.get(estado.STORAGE_KEY)), { lidas: ['x', 3, null], dispensadas: 'y' }, 'Nada gravado com o armazenamento bloqueado');

// Sinais sino ↔ toasts: painel aberto e pop-up bloqueiam; sessão sem storage não mostra toasts.
const sessao = new Map();
let sessaoBloqueada = false;
let popupAberto = false;
globalThis.window.sessionStorage = {
  getItem: key => { if (sessaoBloqueada) throw new Error('SecurityError'); return sessao.get(key) ?? null; },
  setItem: (key, value) => { if (sessaoBloqueada) throw new Error('SecurityError'); sessao.set(key, value); },
};
globalThis.document = { querySelector: seletor => (seletor === '[data-site-popup]' && popupAberto ? {} : null) };
const sinal = await import(await moduleUrl('../src/features/notificacoes/sinal.ts', {
  "import { useSyncExternalStore } from 'react';": 'const useSyncExternalStore = () => {};',
}));
assert.equal(sinal.MAX_TOASTS, 3, 'No máximo 3 toasts');
let avisos = 0;
const parar = sinal.observarSinal(() => { avisos += 1; });
assert.equal(sinal.toastsBloqueados(), false, 'Sem painel nem pop-up, os toasts podem aparecer');
sinal.definirPainelAberto(true);
sinal.definirPainelAberto(true);
assert.equal(avisos, 1, 'Painel aberto avisa uma vez');
assert.equal(sinal.toastsBloqueados(), true, 'Painel do sino aberto bloqueia os toasts');
sinal.definirPainelAberto(false);
popupAberto = true;
assert.equal(sinal.toastsBloqueados(), true, 'Pop-up aberto bloqueia os toasts');
popupAberto = false;
sinal.definirEmTransito(['evento-1']);
assert.deepEqual(sinal.lerSinal().emTransito, ['evento-1'], 'Ids em trânsito ficam fora do contador');
parar();
assert.equal(sinal.toastsJaMostradosNaSessao(), false, 'Sessão nova: toasts liberados');
sinal.marcarSessaoToasts();
assert.equal(sinal.toastsJaMostradosNaSessao(), true, 'Uma vez por sessão');
sessaoBloqueada = true;
assert.equal(sinal.toastsJaMostradosNaSessao(), true, 'Sem sessionStorage, nada de toasts (não repetem a cada página)');
assert.doesNotThrow(() => sinal.marcarSessaoToasts(), 'Sessão bloqueada não quebra o site');

console.log(`Notificações: ${NOVIDADES.length} novidades com rota publicada; estado local e sinais dos toasts validados.`);
