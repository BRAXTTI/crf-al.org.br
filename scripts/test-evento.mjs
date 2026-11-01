/** Contador anônimo: lista fechada, limpeza do termo e nada além do previsto no data point. */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { moduleUrl } from './load-typescript.mjs';

const medicaoUrl = await moduleUrl('../src/config/tutoriais-medicao.ts');
const { EVENTOS, TAREFAS, limparTermo, validarEvento } = await import(medicaoUrl);
const { onRequest } = await import(await moduleUrl('../functions/api/evento.ts', { "'../../src/config/tutoriais-medicao'": JSON.stringify(medicaoUrl) }));

assert.deepEqual([...EVENTOS], ['abrir', 'video_inicio', 'video_75', 'passo', 'acao', 'util_sim', 'util_nao', 'ajuda', 'contato', 'busca_vazia']);

const pontos = [];
const dataset = { writeDataPoint: ponto => pontos.push(ponto) };
const enviar = (corpo, { env = { TUTORIAIS_EVENTOS: dataset }, method = 'POST', headers = {} } = {}) => onRequest({
  env,
  request: new Request('https://institucional.crf-al.org.br/api/evento', {
    method,
    headers,
    body: method === 'POST' ? (typeof corpo === 'string' ? corpo : JSON.stringify(corpo)) : undefined,
  }),
});

// Aceitos, gravando só os campos previstos.
assert.equal((await enviar({ evento: 'abrir', tarefa: 'baixa-rt' })).status, 204);
assert.deepEqual(pontos.pop(), { indexes: ['abrir'], blobs: ['abrir', 'baixa-rt', ''], doubles: [0] });
assert.equal((await enviar({ evento: 'passo', tarefa: 'baixa-rt', passo: 3, cpf: '11122233344', ip: '1.1.1.1' })).status, 204);
assert.deepEqual(pontos.pop(), { indexes: ['passo'], blobs: ['passo', 'baixa-rt', ''], doubles: [3] });
for (const evento of EVENTOS.filter(e => e !== 'passo')) assert.equal((await enviar({ evento, tarefa: 'emitir-boletos' })).status, 204, evento);
pontos.length = 0;

// Nada da requisição chega ao data point, mesmo com cabeçalhos identificáveis.
const resposta = await enviar({ evento: 'contato' }, { headers: { 'User-Agent': 'Agente-Secreto', 'CF-Connecting-IP': '203.0.113.9', Cookie: 'sessao=abc' } });
assert.equal(resposta.headers.get('Set-Cookie'), null);
assert.doesNotMatch(JSON.stringify(pontos.pop()), /Agente|203\.0|sessao/);

// Recusados, sem gravar.
for (const corpo of ['nao-json', '[]', 'null', {}, { evento: 'pagina_vista' }, { evento: 'abrir' }, { evento: 'abrir', tarefa: 'inexistente' }, { evento: 'passo', tarefa: 'baixa-rt' }, { evento: 'passo', tarefa: 'baixa-rt', passo: 0 }, { evento: 'passo', tarefa: 'baixa-rt', passo: 1.5 }, { evento: 'passo', tarefa: 'baixa-rt', passo: 99 }]) {
  assert.equal((await enviar(corpo)).status, 400, JSON.stringify(corpo));
}
assert.equal((await enviar({ evento: 'contato', pad: 'x'.repeat(2000) })).status, 413);
assert.equal((await enviar(null, { method: 'GET' })).status, 405);
assert.equal((await enviar({ evento: 'contato' }, { headers: { Origin: 'https://exemplo.com' } })).status, 403);
assert.equal((await enviar({ evento: 'contato' }, { headers: { Origin: 'https://institucional.crf-al.org.br' } })).status, 204);
pontos.pop();
assert.equal(pontos.length, 0, 'Recusados não gravam');

// Sem binding: 204 para evento válido; inválido continua recusado.
assert.equal((await enviar({ evento: 'contato' }, { env: {} })).status, 204);
assert.equal((await enviar({ evento: 'x' }, { env: {} })).status, 400);

// Falha na gravação não vira erro para o visitante.
const erro = console.error;
console.error = () => {};
assert.equal((await enviar({ evento: 'contato' }, { env: { TUTORIAIS_EVENTOS: { writeDataPoint() { throw new Error('falha'); } } } })).status, 204);
console.error = erro;

// Termos de busca.
assert.equal(limparTermo('  Sair da  FARMÁCIA '), 'sair da farmacia');
for (const termo of ['111.222.333-44', 'crf 1234', 'maria@exemplo.com', 'x'.repeat(41), '', '   ', 7, null]) assert.equal(limparTermo(termo), '', String(termo));
assert.deepEqual(validarEvento({ evento: 'busca_vazia', termo: 'CPF 11122233344' }), { evento: 'busca_vazia', termo: '' }, 'Conta a busca, descarta o termo');
await enviar({ evento: 'busca_vazia', termo: 'Certidão' });
assert.deepEqual(pontos.pop().blobs, ['busca_vazia', '', 'certidao']);
await enviar({ evento: 'abrir', tarefa: 'baixa-rt', termo: 'joao' });
assert.deepEqual(pontos.pop().blobs, ['abrir', 'baixa-rt', ''], 'Termo só em busca_vazia');

// Lista de tarefas igual às fontes de dados; servicos.ts depende de lucide-react, então lê o código-fonte.
const servicos = await readFile(new URL('../src/data/servicos.ts', import.meta.url), 'utf8');
const ids = [...servicos.matchAll(/\bid: '([a-z-]+)',\s*\n\s*(?:icon|titulo):/g)].map(match => match[1]);
assert.deepEqual([...TAREFAS].filter(id => !['sncr', 'crf-em-casa'].includes(id)).sort(), ids.sort(), 'TAREFAS sincronizada com servicos.ts');

console.log(`Evento: ${EVENTOS.length} eventos e ${TAREFAS.length} tarefas aceitos; sem binding responde 204; nada além de evento, tarefa, passo e termo limpo é gravado.`);
