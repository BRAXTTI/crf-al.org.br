const ATRIBUTO_ALVO = 'data-alvo';
const ESPERA_MS = 3000;

/**
 * Rola até o alvo e o marca, como o `:target` nativo. A suavidade vem do CSS; `instantaneo`
 * imita a abertura de uma URL com âncora.
 */
export function irPara(alvo: HTMLElement, instantaneo = false) {
  document.querySelectorAll(`[${ATRIBUTO_ALVO}]`).forEach((el) => el.removeAttribute(ATRIBUTO_ALVO));
  alvo.setAttribute(ATRIBUTO_ALVO, '');
  alvo.scrollIntoView({ block: 'start', behavior: instantaneo ? 'instant' : undefined });
  // Leva o foco junto quando o alvo aceita foco (ex.: <main tabIndex={-1}> do “Ir para o conteúdo”).
  if (alvo.matches('a[href], button, input, select, textarea, [tabindex]')) alvo.focus({ preventScroll: true });
}

/**
 * Rola até o alvo assim que ele existir (espera até 3 s). Na `abertura`, confere de novo até o
 * prazo, porque o ScrollRestoration e o conteúdo que chega depois podem tirar a página do lugar,
 * e para se a pessoa rolar ou tocar na tela. Devolve a limpeza para o efeito.
 */
export function rolarAteAlvo(obterAlvo: () => HTMLElement | null, abertura: boolean) {
  let timer: number | undefined;
  let desistir = false;
  const inicio = Date.now();
  const tentar = () => {
    if (desistir) return;
    const alvo = obterAlvo();
    if (alvo) {
      irPara(alvo, abertura);
      if (!abertura) return;
      if (Math.abs(alvo.getBoundingClientRect().top - parseFloat(getComputedStyle(alvo).scrollMarginTop || '0')) < 2 && Date.now() - inicio > 600) return;
    }
    if (Date.now() - inicio < ESPERA_MS) timer = window.setTimeout(tentar, 100);
  };
  const parar = () => { desistir = true; };
  const eventos = ['wheel', 'touchstart', 'keydown', 'mousedown'] as const;
  eventos.forEach((nome) => window.addEventListener(nome, parar, { passive: true, once: true }));
  // Depois do ScrollRestoration, que roda no layout effect e pode ter restaurado outra posição.
  timer = window.setTimeout(tentar, 0);
  return () => {
    window.clearTimeout(timer);
    eventos.forEach((nome) => window.removeEventListener(nome, parar));
  };
}
