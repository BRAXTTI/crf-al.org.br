import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';

const ATRIBUTO_ALVO = 'data-alvo';
const ESPERA_MS = 3000;

function alvoDaHash(hash: string) {
  if (hash.length < 2) return null;
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
}

/**
 * Rola até o alvo e o marca, como o `:target` nativo. A suavidade vem do CSS; `instantaneo`
 * imita a abertura de uma URL com âncora.
 */
function irPara(alvo: HTMLElement, instantaneo = false) {
  document.querySelectorAll(`[${ATRIBUTO_ALVO}]`).forEach((el) => el.removeAttribute(ATRIBUTO_ALVO));
  alvo.setAttribute(ATRIBUTO_ALVO, '');
  alvo.scrollIntoView({ block: 'start', behavior: instantaneo ? 'instant' : undefined });
  // Leva o foco junto quando o alvo aceita foco (ex.: <main tabIndex={-1}> do “Ir para o conteúdo”).
  if (alvo.matches('a[href], button, input, select, textarea, [tabindex]')) alvo.focus({ preventScroll: true });
}

/**
 * Âncoras (#secao) em todo o site.
 *
 * O `ScrollRestoration` do roteador salva a posição pela chave da entrada do histórico, e a
 * navegação nativa por âncora cria entradas sem estado, com a mesma chave “default” da página
 * aberta direto. Resultado: em vez de ir à seção, ele voltava à posição salva. Aqui, cliques em
 * links `#…` da própria página viram navegações do roteador (com chave própria, então “Voltar”
 * funciona) e a rolagem é feita por este componente depois de cada navegação com âncora,
 * inclusive ao abrir a URL direto, esperando o conteúdo carregado depois (até 3 s).
 */
export default function HashScroll() {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const chaveInicial = useRef(location.key);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
      if (!(link instanceof HTMLAnchorElement) || (link.target && link.target !== '_self')) return;
      const hash = link.getAttribute('href') ?? '';
      const alvo = alvoDaHash(hash);
      if (!alvo) return;
      event.preventDefault();
      // Mesma âncora da URL: só rola. Senão, navega primeiro (o roteador salva a posição atual
      // para o “Voltar”) e o efeito abaixo rola depois.
      if (window.location.hash === hash) irPara(alvo);
      else navigate({ pathname: window.location.pathname, search: window.location.search, hash }, { preventScrollReset: true });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navigate]);

  useEffect(() => {
    const { hash } = location;
    // “Voltar”/“Avançar”: o ScrollRestoration já devolve a posição em que a pessoa estava.
    // A exceção é a página aberta direto com âncora (também um POP).
    if (!hash || (navigationType === 'POP' && location.key !== chaveInicial.current)) return;
    const abertura = navigationType === 'POP';
    let timer: number | undefined;
    let desistir = false;
    const inicio = Date.now();
    const tentar = () => {
      if (desistir) return;
      const alvo = alvoDaHash(hash);
      if (alvo) {
        irPara(alvo, abertura);
        if (!abertura) return;
        // Na abertura, o ScrollRestoration e o conteúdo que chega depois podem tirar a página do
        // lugar: confere de novo até o prazo, a menos que a pessoa já tenha rolado.
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
  }, [location, navigationType]);

  return null;
}
