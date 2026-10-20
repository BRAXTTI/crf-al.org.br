export class HttpError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(`Não foi possível carregar os dados (${status}).`);
    this.status = status;
    this.name = 'HttpError';
  }
}

/**
 * Combina o cancelamento do chamador com um prazo próprio. Evita
 * `AbortSignal.any`, ausente no Safari anterior ao 17.4.
 */
function withTimeout(signal: AbortSignal | undefined, timeoutMs: number) {
  const controller = new AbortController();
  const onAbort = () => controller.abort(signal?.reason);
  const timer = setTimeout(
    () => controller.abort(new DOMException('A requisição excedeu o tempo limite.', 'TimeoutError')),
    timeoutMs,
  );
  if (signal?.aborted) onAbort();
  else signal?.addEventListener('abort', onAbort, { once: true });
  return {
    signal: controller.signal,
    dispose: () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    },
  };
}

/** O prazo cobre também a leitura do JSON, preservando o cancelamento do chamador. */
export async function requestJson<T>(
  url: string,
  { signal, timeoutMs = 15_000, errorForStatus = (status: number) => new HttpError(status) }: {
    signal?: AbortSignal;
    timeoutMs?: number;
    errorForStatus?: (status: number) => Error;
  } = {},
): Promise<T> {
  const request = withTimeout(signal, timeoutMs);
  try {
    const response = await fetch(url, { signal: request.signal });
    if (!response.ok) throw errorForStatus(response.status);
    return await response.json() as T;
  } finally {
    request.dispose();
  }
}
