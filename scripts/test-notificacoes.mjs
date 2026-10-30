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
assert.deepEqual(salvo.mostradas, ['evento-1', 'novidade-a'], 'Avisados pelo banner ficam guardados sem repetição');

estado.marcarVistas(Array.from({ length: 250 }, (_, i) => `evento-${i}`));
salvo = JSON.parse(store.get(estado.STORAGE_KEY));
assert.equal(salvo.vistas.length, 200, 'Lista limitada a 200 ids');
assert.equal(salvo.vistas[0], 'evento-50', 'Os ids mais antigos saem primeiro');

store.set('crfal:notificacoes', JSON.stringify({ lidas: ['x', 3, null], dispensadas: 'y' }));
estado = await carregarEstado();
bloqueado = true;
assert.doesNotThrow(() => estado.marcarLidas(['z']), 'Armazenamento bloqueado não quebra o site');
assert.deepEqual(JSON.parse(store.get(estado.STORAGE_KEY)), { lidas: ['x', 3, null], dispensadas: 'y' }, 'Nada gravado com o armazenamento bloqueado');

// Banner: conta como o sino e só aparece para o que ainda não foi lido, dispensado, visto nem avisado.
const fontesIds = ['a', 'b', 'c', 'd', 'e'];
const estadoBanner = { lidas: ['a'], dispensadas: ['b'], vistas: ['c'], mostradas: ['d'] };
assert.deepEqual(estado.candidatasDoBanner(fontesIds, estadoBanner), ['e'], 'Banner ignora o que já foi lido, dispensado, visto ou avisado');
assert.equal(estado.contarNaoLidas(fontesIds, estadoBanner), 3, 'Contagem igual à do sino: vistas e avisadas seguem não lidas');
assert.deepEqual(estado.candidatasDoBanner(['d'], estadoBanner), [], 'Fechado ou expirado, o banner não volta para os mesmos ids');

// Sinais sino ↔ banner: painel, diálogo e pop-up bloqueiam; sessão sem storage não mostra o banner.
const sessao = new Map();
let sessaoBloqueada = false;
let dialogoAberto = false;
globalThis.window.sessionStorage = {
  getItem: key => { if (sessaoBloqueada) throw new Error('SecurityError'); return sessao.get(key) ?? null; },
  setItem: (key, value) => { if (sessaoBloqueada) throw new Error('SecurityError'); sessao.set(key, value); },
};
globalThis.document = { querySelector: seletor => (seletor.includes('[data-site-popup]') && seletor.includes('[role="dialog"]') && dialogoAberto ? {} : null) };
const sinal = await import(await moduleUrl('../src/features/notificacoes/sinal.ts', {
  "import { useSyncExternalStore } from 'react';": 'const useSyncExternalStore = () => {};',
}));
let avisos = 0;
const parar = sinal.observarSinal(() => { avisos += 1; });
assert.equal(sinal.bannerBloqueado(), false, 'Sem painel nem diálogo, o banner pode aparecer');
sinal.definirPainelAberto(true);
sinal.definirPainelAberto(true);
assert.equal(avisos, 1, 'Painel aberto avisa uma vez');
assert.equal(sinal.bannerBloqueado(), true, 'Painel do sino aberto bloqueia o banner');
sinal.definirPainelAberto(false);
dialogoAberto = true;
assert.equal(sinal.bannerBloqueado(), true, 'Pop-up ou diálogo aberto bloqueia o banner');
dialogoAberto = false;
parar();
assert.equal(sinal.bannerJaMostradoNaSessao(), false, 'Sessão nova: banner liberado');
sinal.marcarSessaoBanner();
assert.equal(sinal.bannerJaMostradoNaSessao(), true, 'Uma vez por sessão');
sessaoBloqueada = true;
assert.equal(sinal.bannerJaMostradoNaSessao(), true, 'Sem sessionStorage, nada de banner (não repete a cada página)');
assert.doesNotThrow(() => sinal.marcarSessaoBanner(), 'Sessão bloqueada não quebra o site');

// Capas reais: tamanhos do WordPress (sem Cloudflare Images).
const capas = await import(await moduleUrl('../src/features/notificacoes/capas.ts', {
  "'@/services/wordpress/image-set'": `'${await moduleUrl('../src/services/wordpress/image-set.ts')}'`,
}));
const UP = 'https://wordpress.crf-al.org.br/wp-content/uploads/2026/10';
assert.deepEqual(capas.capaDoBanner(`${UP}/farmacia-popular-1024x576.jpg`), { src: `${UP}/farmacia-popular-1024x576.jpg` }, 'Banner de evento: só a URL da API, sem variantes deduzidas pelo nome');
assert.deepEqual(capas.capaDoBanner(`${UP}/original.jpg`), { src: `${UP}/original.jpg` }, 'Banner sem sufixo de tamanho: só a URL da API');
assert.deepEqual(capas.capaDoBanner('https://exemplo.com/foto-1024x576.jpg'), { src: 'https://exemplo.com/foto-1024x576.jpg' }, 'Banner fora do WordPress: só a URL da API');
assert.equal(capas.capaDoBanner('http://wordpress.crf-al.org.br/a-1024x576.jpg'), undefined, 'Sem HTTPS: sem capa');
assert.equal(capas.capaDoBanner(''), undefined, 'Banner vazio: sem capa');
assert.equal(capas.capaDoBanner('nao é url'), undefined, 'Banner inválido: sem capa');
const midia = {
  source_url: `${UP}/crfsp.jpeg`,
  media_details: { width: 1024, height: 602, sizes: {
    thumbnail: { source_url: `${UP}/crfsp-150x150.jpeg`, width: 150, height: 150 },
    medium: { source_url: `${UP}/crfsp-300x176.jpeg`, width: 300, height: 176 },
    medium_large: { source_url: `${UP}/crfsp-768x452.jpeg`, width: 768, height: 452 },
    large: { source_url: `${UP}/crfsp-1024x602.jpeg`, width: 1024, height: 602 },
  } },
};
const capaNoticia = capas.capaDaMidia(midia);
assert.equal(capaNoticia.src, `${UP}/crfsp-1024x602.jpeg`, 'Notícia: src é a variante large do WordPress');
assert.equal(capaNoticia.original, `${UP}/crfsp.jpeg`, 'Notícia: URL original da API (source_url) preservada à parte');
assert.notEqual(capaNoticia.src, capaNoticia.original, 'Notícia: variante e source_url são URLs diferentes');
const soOriginal = capas.capaDaMidia({ source_url: `${UP}/so-original.jpeg`, media_details: { width: 800, height: 400, sizes: {} } });
assert.deepEqual(soOriginal, { src: `${UP}/so-original.jpeg`, srcSet: undefined }, 'Mídia sem tamanhos: src já é a source_url, sem original repetido');
assert.match(capaNoticia.srcSet, /crfsp-300x176\.jpeg 300w, .*crfsp-768x452\.jpeg 768w/, 'Notícia: srcset dos tamanhos proporcionais');
assert.equal(capas.capaDaMidia(undefined), undefined, 'Notícia sem mídia embutida: sem capa');

// Nenhuma moldura de navegador nem endereço nas notificações.
const { readFile } = await import('node:fs/promises');
const feed = await readFile(new URL('../src/components/ui/live-notification-feed.tsx', import.meta.url), 'utf8');
assert.doesNotMatch(feed, /\bhost\b|Endereço:|font-mono/, 'Sem barra de endereço simulada');
assert.doesNotMatch(feed, /loading="eager"|fetchPriority|fetchpriority/, 'Capas nunca disputam o LCP');

// Movimento reduzido: o banner esmaece, sem deslocamento, mesmo com a regra global que zera as animações.
const css = await readFile(new URL('../src/index.css', import.meta.url), 'utf8');
const bannerReduzido = css.match(/@media \(prefers-reduced-motion: reduce\) \{\s*\[data-notification-banner\] \{[\s\S]*?\n\}/)?.[0] ?? '';
assert.match(bannerReduzido, /--banner-desde: 0px/, 'Banner com movimento reduzido: sem deslocamento');
assert.match(bannerReduzido, /\[data-notification-banner\] \{[^}]*animation-duration: 200ms !important/, 'Banner com movimento reduzido: entrada esmaece');
assert.match(bannerReduzido, /\[data-state="saindo"\] \{ animation-duration: 160ms !important/, 'Banner com movimento reduzido: saída igual a SAIDA_MS');
assert.ok(css.indexOf('animation-duration: 0.01ms !important') > -1, 'A regra global de movimento reduzido continua valendo para o resto do site');

// Gradientes das notificações: todo token usado existe (sem ele, a faixa "Agora no site" fica transparente).
for (const [, token] of feed.matchAll(/var\((--notif-[a-z-]+)\)/g)) assert.match(css, new RegExp(`${token}:`), `Token definido: ${token}`);

// Painel renderizado de verdade (jsdom + React).
const { JSDOM } = await import('jsdom');
const { createRequire } = await import('node:module');
const ts = (await import('typescript')).default;
const require = createRequire(import.meta.url);
const dom = new JSDOM('<!doctype html><body></body>', { pretendToBeVisual: true });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true });
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
dom.window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
dom.window.HTMLElement.prototype.animate = () => ({ cancel() {}, finished: Promise.resolve() });
globalThis.__React = require('react');
globalThis.__jsx = require('react/jsx-runtime');
const fonteFeed = ts.transpile(feed, { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX })
  .replace('import * as React from "react";', 'const React = globalThis.__React;')
  .replace(/import \{([^}]+)\} from "react\/jsx-runtime";/, (_, nomes) => `const {${nomes.replace(/ as /g, ': ')}} = globalThis.__jsx;`);
assert.doesNotMatch(fonteFeed, /^import /m, 'Feed só depende do React');
const ui = await import(`data:text/javascript;base64,${Buffer.from(fonteFeed).toString('base64')}`);
const { act, createElement } = globalThis.__React;
const { createRoot } = require('react-dom/client');

const montarNo = async elemento => {
  const host = dom.window.document.createElement('div');
  dom.window.document.body.append(host);
  const root = createRoot(host);
  await act(async () => root.render(elemento));
  return { host, desmontar: () => act(async () => root.unmount()) };
};
const falhar = async img => act(async () => { img.dispatchEvent(new dom.window.Event('error')); });
const noticia = { id: 'noticia-1', kind: 'noticia', app: 'Notícias', title: 'Farmácia Popular', image: capaNoticia };
const evento = { id: 'evento-1', kind: 'evento', app: 'Eventos', title: 'Simpósio', date: '2026-11-20', image: capas.capaDoBanner(`${UP}/farmacia-popular-1024x576.jpg`) };

// Painel do sino: capa larga com srcset; se falhar, a URL original da API; se falhar de novo, o card fica sem foto.
for (const item of [noticia]) {
  const { host, desmontar } = await montarNo(createElement(ui.LiveNotificationFeed, { items: [item] }));
  const capa = () => host.querySelector(`[data-detail="${item.kind}"] img`);
  const original = item.kind === 'noticia' ? `${UP}/crfsp.jpeg` : item.image.src;
  assert.equal(capa().getAttribute('src'), item.image.src, `Painel (${item.kind}): capa larga`);
  assert.equal(capa().getAttribute('srcset'), item.image.srcSet, `Painel (${item.kind}): srcset dos tamanhos do WordPress`);
  await falhar(capa());
  assert.equal(capa().getAttribute('src'), original, `Painel (${item.kind}): srcset/variante falhou, tenta a URL original da API`);
  if (item.kind === 'noticia') assert.notEqual(capa().getAttribute('src'), item.image.src, 'Painel (noticia): 2ª tentativa é a source_url, não a variante large');
  assert.equal(capa().hasAttribute('srcset'), false, `Painel (${item.kind}): segunda tentativa sem srcset`);
  await falhar(capa());
  assert.equal(capa(), null, `Painel (${item.kind}): capa falhou, card segue sem foto`);
  assert.ok(host.querySelector(`[data-detail="${item.kind}"]`), `Painel (${item.kind}): detalhe do tipo continua`);
  await desmontar();
}

// Evento: o banner da API, sem srcset deduzido; se falhar, o card fica sem foto (nenhuma outra URL é chutada).
{
  const { host, desmontar } = await montarNo(createElement(ui.LiveNotificationFeed, { items: [evento] }));
  const capa = () => host.querySelector('[data-detail="evento"] img');
  assert.equal(capa().getAttribute('src'), evento.image.src, 'Painel (evento): banner original da API');
  assert.equal(capa().hasAttribute('srcset'), false, 'Painel (evento): sem srcset deduzido');
  await falhar(capa());
  assert.equal(capa(), null, 'Painel (evento): banner falhou, card segue sem foto');
  assert.ok(host.querySelector('[data-detail="evento"]'), 'Painel (evento): detalhe do tipo continua');
  await desmontar();
}

// Variante sem srcset diferente da source_url: 1ª tentativa a variante, 2ª a original, depois sem foto.
{
  const item = { ...noticia, image: { src: `${UP}/v-1024x512.jpeg`, original: `${UP}/v.jpeg` } };
  const { host, desmontar } = await montarNo(createElement(ui.LiveNotificationFeed, { items: [item] }));
  const capa = () => host.querySelector('[data-detail="noticia"] img');
  assert.equal(capa().getAttribute('src'), `${UP}/v-1024x512.jpeg`, 'Painel sem srcset: começa pela variante');
  await falhar(capa());
  assert.equal(capa().getAttribute('src'), `${UP}/v.jpeg`, 'Painel sem srcset: variante falhou, tenta a source_url');
  await falhar(capa());
  assert.equal(capa(), null, 'Painel sem srcset: source_url falhou, sem foto');
  await desmontar();
}

// Mesmo ID, capa nova com o painel aberto: tentativas e "sem foto" recomeçam pela nova URL.
{
  const host = dom.window.document.createElement('div');
  dom.window.document.body.append(host);
  const root = createRoot(host);
  const render = image => act(async () => root.render(createElement(ui.LiveNotificationFeed, { items: [{ ...noticia, image }] })));
  const capa = () => host.querySelector('[data-detail="noticia"] img');
  await render(capaNoticia);
  await falhar(capa());
  await falhar(capa());
  assert.equal(capa(), null, 'Troca de capa: a primeira falhou de vez');
  const nova = { src: `${UP}/nova-1024x512.jpeg`, srcSet: `${UP}/nova-300x150.jpeg 300w, ${UP}/nova-1024x512.jpeg 1024w`, original: `${UP}/nova.jpeg` };
  await render(nova);
  assert.equal(capa()?.getAttribute('src'), nova.src, 'Troca de capa: a nova URL volta a aparecer');
  assert.equal(capa().getAttribute('srcset'), nova.srcSet, 'Troca de capa: recomeça pela 1ª tentativa (srcset)');
  assert.equal(capa().getAttribute('width'), '600', 'Troca de capa: dimensões fixas (sem CLS)');
  await falhar(capa());
  assert.equal(capa().getAttribute('src'), nova.original, 'Troca de capa: 2ª tentativa da nova é a original dela');
  const outra = { src: `${UP}/outra-1024x512.jpeg`, srcSet: `${UP}/outra-300x150.jpeg 300w, ${UP}/outra-1024x512.jpeg 1024w` };
  await render(outra);
  assert.equal(capa().getAttribute('srcset'), outra.srcSet, 'Troca de capa no meio das tentativas: zera o contador');
  await act(async () => root.unmount());
}
// A → B → A com o mesmo ID: a capa A volta a ser tentada, após falha definitiva ou transitória.
{
  const host = dom.window.document.createElement('div');
  dom.window.document.body.append(host);
  const root = createRoot(host);
  const render = image => act(async () => root.render(createElement(ui.LiveNotificationFeed, { items: [{ ...noticia, image }] })));
  const capa = () => host.querySelector('[data-detail="noticia"] img');
  const b = { src: `${UP}/b-1024x512.jpeg`, srcSet: `${UP}/b-300x150.jpeg 300w, ${UP}/b-1024x512.jpeg 1024w` };
  await render(capaNoticia);
  await falhar(capa());
  await falhar(capa());
  assert.equal(capa(), null, 'Painel A → B → A: A falhou de vez');
  await render(b);
  assert.equal(capa()?.getAttribute('srcset'), b.srcSet, 'Painel A → B → A: B aparece');
  await render(capaNoticia);
  assert.equal(capa()?.getAttribute('srcset'), capaNoticia.srcSet, 'Painel A → B → A: A volta a ser tentada desde o srcset');
  // Falha transitória: A falha só a 1ª tentativa, troca para B e volta; A recomeça do zero.
  await falhar(capa());
  assert.equal(capa().getAttribute('src'), `${UP}/crfsp.jpeg`, 'Painel A → B → A (transitória): A na 2ª tentativa');
  await render(b);
  await render(capaNoticia);
  assert.equal(capa()?.getAttribute('srcset'), capaNoticia.srcSet, 'Painel A → B → A (transitória): A recomeça pela 1ª tentativa');
  // B também falha de vez no caminho: ao voltar para B depois, B é tentada de novo.
  await render(b);
  await falhar(capa());
  await falhar(capa());
  assert.equal(capa(), null, 'Painel B falhou de vez');
  await render(capaNoticia);
  await render(b);
  assert.equal(capa()?.getAttribute('srcset'), b.srcSet, 'Painel B → A → B: B volta a ser tentada');
  await act(async () => root.unmount());
}

console.log(`Notificações: ${NOVIDADES.length} novidades com rota publicada; estado local, regras e sinais do banner, capas e fallbacks de imagem validados.`);
