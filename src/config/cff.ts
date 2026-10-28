/** Prazo do navegador para /api/cff-publicacoes; compartilhado com a Pages Function. */
export const CFF_CLIENT_TIMEOUT_MS = 15_000;

/**
 * Coleta no servidor com o navegador esperando: termina antes de ele desistir, com folga
 * para a resposta chegar. A atualização em segundo plano (sem ninguém esperando) usa 20 s.
 */
export const CFF_REQUEST_BUDGET_MS = CFF_CLIENT_TIMEOUT_MS - 3_000;
