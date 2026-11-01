/**
 * Contador anônimo de uso dos tutoriais, gravado no Workers Analytics Engine.
 * Grava só evento, tarefa, passo e termo já limpo: nada de cookie, IP, user agent
 * ou identificador. Sem o binding (dev, preview), aceita e descarta.
 */
import { validarEvento } from '../../src/config/tutoriais-medicao';

interface EventoEnv {
  TUTORIAIS_EVENTOS?: AnalyticsEngineDataset;
}

const CORPO_MAX = 1024;

const resposta = (status: number, headers: Record<string, string> = {}) =>
  new Response(null, { status, headers: { 'Cache-Control': 'no-store', ...headers } });

export const onRequest: PagesFunction<EventoEnv> = async ({ request, env }) => {
  if (request.method !== 'POST') return resposta(405, { Allow: 'POST' });
  const origem = request.headers.get('Origin');
  if (origem && origem !== new URL(request.url).origin) return resposta(403);
  if (Number(request.headers.get('Content-Length') ?? 0) > CORPO_MAX) return resposta(413);

  const corpo = await request.text();
  if (corpo.length > CORPO_MAX) return resposta(413);
  let dados: unknown;
  try {
    dados = JSON.parse(corpo);
  } catch {
    return resposta(400);
  }
  const valido = validarEvento(dados);
  if (!valido) return resposta(400);

  try {
    env.TUTORIAIS_EVENTOS?.writeDataPoint({
      indexes: [valido.evento],
      blobs: [valido.evento, valido.tarefa ?? '', valido.termo ?? ''],
      doubles: [valido.passo ?? 0],
    });
  } catch (error) {
    // A medição nunca atrapalha a página; o erro não inclui dados da requisição.
    console.error(JSON.stringify({ event: 'evento_write_failed', message: error instanceof Error ? error.message : String(error) }));
  }
  return resposta(204);
};
