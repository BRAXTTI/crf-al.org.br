/**
 * Verifica a página com o texto do sistema escalado (até 200%).
 *
 * O guia "Respect Operating System Text Scale" do Chrome Modern Web Guidance
 * exige que os contêineres de texto cresçam junto com o texto: sem corte,
 * sem sobreposição e sem rolagem horizontal. Como toda a tipografia está em
 * rem, a escala do sistema é simulada trocando a fonte da raiz por 32px
 * (equivalente a 200% com raiz de 16px).
 *
 * Cada cenário é conferido em quatro pontos:
 * 1. rolagem horizontal (o documento não pode ficar mais largo que a tela);
 * 2. estouro de conteúdo fora da tela;
 * 3. corte de texto (conteúdo maior que a caixa, com `overflow: hidden`);
 * 4. cabeçalho invadindo o conteúdo e rótulo cortado com reticências.
 *
 * Uso: npm run check:scale
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { setTimeout as espera } from 'node:timers/promises';

const PREVIEW = 'http://127.0.0.1:4179';
const PORTA_CDP = 9341;
const ROTAS = ['/', '/instituicao', '/servicos/requerimentos'];
const CENARIOS = [
  { nome: '320px 100%', largura: 320, altura: 720, escala: false },
  { nome: '320px 200%', largura: 320, altura: 720, escala: true },
  { nome: '412px 200%', largura: 412, altura: 823, escala: true },
  { nome: '768px 200%', largura: 768, altura: 1024, escala: true },
  { nome: '1280px 200%', largura: 1280, altura: 900, escala: true },
];

const CHROME = [process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(caminho => caminho && existsSync(caminho));
if (!CHROME) {
  console.error('Chrome não encontrado: defina CHROME_PATH para rodar a verificação de escala.');
  process.exit(1);
}

const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4179', '--strictPort'], { stdio: 'ignore', detached: true });
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORTA_CDP}`, '--no-sandbox', '--disable-dev-shm-usage',
  '--disable-gpu', '--hide-scrollbars', '--user-data-dir=/tmp/chrome-escala-crfal', 'about:blank',
], { stdio: 'ignore', detached: true });

async function esperar(teste, tentativas = 80) {
  for (let i = 0; i < tentativas; i++) {
    try { if (await teste()) return true; } catch { /* ainda subindo */ }
    await espera(100);
  }
  throw new Error('não subiu');
}

function cdp(url) {
  const ws = new WebSocket(url);
  const pendentes = new Map();
  let id = 0;
  const pronto = new Promise((resolve, reject) => {
    ws.addEventListener('open', () => resolve());
    ws.addEventListener('error', evento => reject(evento));
  });
  ws.addEventListener('message', evento => {
    const msg = JSON.parse(evento.data);
    if (msg.id && pendentes.has(msg.id)) {
      const { resolve, reject } = pendentes.get(msg.id);
      pendentes.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    }
  });
  return {
    pronto,
    enviar(method, params = {}, sessionId) {
      const idMsg = ++id;
      return new Promise((resolve, reject) => {
        pendentes.set(idMsg, { resolve, reject });
        ws.send(JSON.stringify({ id: idMsg, method, params, ...(sessionId ? { sessionId } : {}) }));
      });
    },
    fechar() { ws.close(); },
  };
}

const MEDIR = `(() => {
  const doc = document.documentElement;
  const larguraTela = window.innerWidth;
  const nome = (el) => el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.split(' ').slice(0, 3).join('.') : '');

  const contido = (el) => {
    for (let p = el.parentElement; p; p = p.parentElement) {
      const e = getComputedStyle(p);
      if (/hidden|clip|auto|scroll/.test(e.overflowX + e.overflowY)) return true;
      if (e.position === 'fixed') return true;
    }
    return false;
  };

  const estouros = [];
  const cortados = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const estilo = getComputedStyle(el);
    if (estilo.position === 'fixed') continue;
    if (el.classList.contains('sr-only')) continue;
    if (r.right > larguraTela + 1 && !contido(el)) {
      estouros.push({ seletor: nome(el), direita: Math.round(r.right), texto: (el.textContent || '').trim().slice(0, 40) });
    }
    const alturaFixa = estilo.height !== 'auto' && !/auto/.test(estilo.height) && el.clientHeight > 0;
    if (alturaFixa && estilo.overflowY === 'hidden' && el.scrollHeight > el.clientHeight + 2) {
      const base = el.getBoundingClientRect();
      const textoCortado = [...el.querySelectorAll('*')].some(d => {
        if (d.children.length) return false;
        if (d.namespaceURI === 'http://www.w3.org/2000/svg') return false; // <title> dos ícones
        if (!(d.textContent || '').trim()) return false;
        const dr = d.getBoundingClientRect();
        if (dr.width === 0 || dr.height === 0) return false;
        return dr.bottom > base.bottom + 1 || dr.top < base.top - 1;
      });
      if (textoCortado) cortados.push({ seletor: nome(el), texto: (el.textContent || '').trim().slice(0, 60) });
    }
  }

  // Cabeçalho x conteúdo: o cabeçalho é fixo; texto acima da base dele fica escondido.
  const header = document.querySelector('header');
  const perfis = document.querySelector('nav[aria-label="Acesso rápido por perfil"]');
  const barras = [header, perfis].filter(Boolean);
  const base = barras.length ? Math.max(...barras.map(b => b.getBoundingClientRect().bottom)) : 0;
  const sobreposicoes = [];
  for (const el of document.querySelectorAll('#root *')) {
    if (barras.some(b => b.contains(el))) continue;
    if (el.children.length) continue;
    if (el.classList.contains('sr-only')) continue;
    if (getComputedStyle(el).position === 'fixed') continue;
    const texto = (el.textContent || '').trim();
    if (texto.length < 3) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.top < base - 1) sobreposicoes.push({ seletor: nome(el), top: Math.round(r.top), texto: texto.slice(0, 40) });
  }

  const rotulosCortados = [...document.querySelectorAll('.header-profiles-grid span')]
    .filter(s => s.scrollWidth > s.clientWidth + 1)
    .map(s => (s.textContent || '').trim().slice(0, 20));

  return JSON.stringify({
    larguraTela,
    larguraConteudo: doc.scrollWidth,
    rolagemHorizontal: doc.scrollWidth > larguraTela + 1,
    fonteRaiz: getComputedStyle(doc).fontSize,
    sobreposicoes: sobreposicoes.slice(0, 6),
    rotulosCortados,
    estouros: estouros.slice(0, 8),
    cortados: cortados.slice(0, 8),
  });
})()`;

async function main() {
  await esperar(async () => (await fetch(PREVIEW)).ok);
  let wsUrl = null;
  await esperar(async () => {
    const r = await fetch(`http://127.0.0.1:${PORTA_CDP}/json/version`);
    if (!r.ok) return false;
    wsUrl = (await r.json()).webSocketDebuggerUrl;
    return true;
  });
  const cliente = cdp(wsUrl);
  await cliente.pronto;

  let falhas = 0;
  let total = 0;
  for (const cenario of CENARIOS) {
    for (const rota of ROTAS) {
      total++;
      const { targetId } = await cliente.enviar('Target.createTarget', { url: 'about:blank' });
      const { sessionId } = await cliente.enviar('Target.attachToTarget', { targetId, flatten: true });
      await cliente.enviar('Page.enable', {}, sessionId);
      await cliente.enviar('Emulation.setDeviceMetricsOverride', {
        width: cenario.largura, height: cenario.altura, deviceScaleFactor: 1, mobile: cenario.largura < 1024,
      }, sessionId);
      if (cenario.escala) {
        await cliente.enviar('Page.addScriptToEvaluateOnNewDocument', {
          source: `document.addEventListener('DOMContentLoaded', () => {
            const s = document.createElement('style');
            s.textContent = 'html{font-size:32px !important}';
            document.head.appendChild(s);
          });`,
        }, sessionId);
      }
      await cliente.enviar('Page.navigate', { url: PREVIEW + rota }, sessionId);
      await espera(2000);
      const { result } = await cliente.enviar('Runtime.evaluate', { expression: MEDIR, returnByValue: true }, sessionId);
      const dados = JSON.parse(result.value);
      const problemas = [];
      if (dados.rolagemHorizontal) problemas.push(`rolagem horizontal (${dados.larguraConteudo}px > ${dados.larguraTela}px)`);
      if (dados.sobreposicoes.length) problemas.push(`${dados.sobreposicoes.length} sobreposição(ões) do cabeçalho`);
      if (dados.rotulosCortados.length) problemas.push(`rótulo truncado: ${dados.rotulosCortados.join(', ')}`);
      if (dados.estouros.length) problemas.push(`${dados.estouros.length} estouro(s)`);
      if (dados.cortados.length) problemas.push(`${dados.cortados.length} corte(s)`);
      if (problemas.length) {
        falhas++;
        console.log(`❌ ${cenario.nome.padEnd(10)} ${rota.padEnd(22)} ${problemas.join(' | ')}`);
        for (const s of dados.sobreposicoes.slice(0, 2)) console.log(`      sobreposição: ${s.seletor} top=${s.top} "${s.texto}"`);
        for (const e of dados.estouros.slice(0, 2)) console.log(`      estouro: ${e.seletor} → ${e.direita}px "${e.texto}"`);
        for (const c of dados.cortados.slice(0, 2)) console.log(`      cortado: ${c.seletor} "${c.texto}"`);
      } else {
        console.log(`✅ ${cenario.nome.padEnd(10)} ${rota.padEnd(22)} fonte ${dados.fonteRaiz}`);
      }
      await cliente.enviar('Target.closeTarget', { targetId });
    }
  }
  cliente.fechar();
  console.log(`\n${total - falhas} de ${total} cenários sem problema.`);
  if (falhas) process.exitCode = 1;
}

try {
  await main();
} finally {
  try { process.kill(-chrome.pid, 'SIGKILL'); } catch { chrome.kill(); }
  try { process.kill(-preview.pid, 'SIGTERM'); } catch { preview.kill(); }
}
