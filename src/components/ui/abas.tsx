import { useCallback, useEffect, useEffectEvent, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const focusRing =
  'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-crfal-blue';
const panelFocusRing =
  'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2';
const motion = 'transition-colors duration-200 motion-reduce:transition-none';

export interface ItemAba<Id extends string = string> {
  /** Identificador da aba; também define o `#hash` na URL (exceto na aba padrão). */
  id: Id;
  /** Rótulo completo da aba. */
  rotulo: ReactNode;
  /** Ícone opcional exibido ao lado do rótulo. */
  icone?: ReactNode;
  /** Contador ou selo curto opcional. */
  contador?: ReactNode;
  /** Conteúdo do painel da aba. */
  conteudo: ReactNode;
}

export interface AbasProps<Id extends string = string> {
  abas: readonly ItemAba<Id>[];
  ariaLabel: string;
  /** Aba inicial quando não há `#` válido na URL (padrão: primeira aba). */
  abaPadrao?: Id;
  /** Aba controlada externamente (opcional). */
  ativa?: Id;
  /** Chamado sempre que a aba ativa muda. */
  onChange?: (id: Id) => void;
  /** Sincroniza a aba ativa com `#hash` na URL usando `replace` (padrão: `true`). */
  sincronizarHash?: boolean;
  /** Mantém a barra de abas fixa logo abaixo do cabeçalho ao rolar (padrão: `true`). */
  fixaNoTopo?: boolean;
  className?: string;
  painelClassName?: string;
}

function extrairIdDaHash<Id extends string>(
  hash: string,
  abas: readonly ItemAba<Id>[],
): Id | undefined {
  if (!hash || hash.length < 2) return undefined;
  let limpo = hash.slice(1);
  try {
    limpo = decodeURIComponent(limpo);
  } catch {
    /* hash malformada: ignora */
  }
  return abas.find((aba) => aba.id === limpo)?.id;
}

/**
 * Componente de abas acessível (WAI-ARIA Tabs) com ativação automática por teclado
 * (←/→ circulares, Home/End) e sincronização opcional com `#hash` via `replace`.
 */
export default function Abas<Id extends string = string>({
  abas,
  ariaLabel,
  abaPadrao,
  ativa: ativaControlada,
  onChange,
  sincronizarHash = true,
  fixaNoTopo = true,
  className = '',
  painelClassName = '',
}: AbasProps<Id>) {
  const baseId = useId();
  const location = useLocation();
  const navigate = useNavigate();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const padrao = abaPadrao ?? abas[0]?.id;

  const resolverInicial = (): Id => {
    if (ativaControlada !== undefined) return ativaControlada;
    if (sincronizarHash) {
      const hashAtual = location.hash || (typeof window !== 'undefined' ? window.location.hash : '');
      const daHash = extrairIdDaHash(hashAtual, abas);
      if (daHash) return daHash;
    }
    return padrao;
  };

  const [ativaInterna, setAtivaInterna] = useState<Id>(resolverInicial);
  const abaAtiva = ativaControlada ?? ativaInterna;

  // Lê abas/aba ativa atuais sem depender delas: as abas são recriadas a cada render da página,
  // e o efeito abaixo só deve rodar quando o `#` muda de fato.
  const aoMudarHash = useEffectEvent((hash: string) => {
    const daHash = extrairIdDaHash(hash, abas) ?? padrao;
    if (daHash === abaAtiva) return;
    setAtivaInterna(daHash);
    onChange?.(daHash);
  });

  // Sincroniza quando o `#` muda por navegação (link, voltar/avançar, troca feita aqui).
  useEffect(() => {
    if (!sincronizarHash || ativaControlada !== undefined) return;
    aoMudarHash(location.hash);
  }, [location.hash, sincronizarHash, ativaControlada]);

  const selecionarAba = useCallback(
    (novoId: Id, focarBotao = false) => {
      const indice = abas.findIndex((aba) => aba.id === novoId);
      if (indice < 0) return;

      if (ativaControlada === undefined) {
        setAtivaInterna(novoId);
      }
      if (novoId !== abaAtiva) {
        onChange?.(novoId);
      }

      if (sincronizarHash) {
        const novoHash = novoId === padrao ? '' : `#${novoId}`;
        const destinoUrl = `${window.location.pathname}${window.location.search}${novoHash}`;
        if (window.location.hash !== novoHash) {
          window.history.replaceState(window.history.state, '', destinoUrl);
        }
        if (location.hash !== novoHash) {
          navigate(
            { pathname: location.pathname, search: location.search, hash: novoHash },
            { replace: true, preventScrollReset: true },
          );
        }
      }

      if (focarBotao) {
        tabRefs.current[indice]?.focus();
      }
    },
    [abas, ativaControlada, abaAtiva, onChange, sincronizarHash, padrao, location.pathname, location.search, location.hash, navigate],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, indiceAtual: number) => {
    const total = abas.length;
    if (total === 0) return;

    let proximoIndice: number | null = null;
    if (event.key === 'ArrowRight') {
      proximoIndice = (indiceAtual + 1) % total;
    } else if (event.key === 'ArrowLeft') {
      proximoIndice = (indiceAtual - 1 + total) % total;
    } else if (event.key === 'Home') {
      proximoIndice = 0;
    } else if (event.key === 'End') {
      proximoIndice = total - 1;
    }

    if (proximoIndice !== null) {
      event.preventDefault();
      selecionarAba(abas[proximoIndice].id, true);
    }
  };

  return (
    <div className={className}>
      <div
        className={`${
          fixaNoTopo ? 'sticky top-(--header-offset) z-20 ' : ''
        }glass-light rounded-t-2xl border border-b-0 border-crfal-gray-200/90 bg-white/95 px-1 sm:px-3`}
      >
        <div
          role="tablist"
          aria-label={ariaLabel}
          className="flex overflow-x-auto border-b border-crfal-gray-200 scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          {abas.map((aba, indice) => {
            const selecionada = aba.id === abaAtiva;
            return (
              <button
                key={aba.id}
                ref={(el) => {
                  tabRefs.current[indice] = el;
                }}
                type="button"
                role="tab"
                id={`${baseId}-${aba.id}-tab`}
                aria-selected={selecionada}
                aria-controls={`${baseId}-${aba.id}-panel`}
                tabIndex={selecionada ? 0 : -1}
                onClick={() => selecionarAba(aba.id, false)}
                onKeyDown={(e) => handleKeyDown(e, indice)}
                className={`-mb-px flex min-h-12 flex-1 items-center justify-center gap-1.5 whitespace-nowrap border-b-2 px-2 py-3 text-[13px] font-semibold sm:gap-2 sm:px-4 sm:text-sm ${motion} ${focusRing} ${
                  selecionada
                    ? 'border-crfal-gold text-crfal-blue'
                    : 'border-transparent text-crfal-gray-600 hover:border-crfal-gray-300 hover:text-crfal-blue'
                }`}
              >
                {aba.icone && <span className="hidden sm:inline-flex">{aba.icone}</span>}
                <span>{aba.rotulo}</span>
                {aba.contador !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                      selecionada
                        ? 'bg-crfal-blue-lighter text-crfal-blue'
                        : 'bg-crfal-gray-100 text-crfal-gray-600'
                    }`}
                  >
                    {aba.contador}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {abas.map((aba) => {
        const selecionada = aba.id === abaAtiva;
        return (
          <div
            key={aba.id}
            role="tabpanel"
            id={`${baseId}-${aba.id}-panel`}
            aria-labelledby={`${baseId}-${aba.id}-tab`}
            tabIndex={0}
            hidden={!selecionada}
            className={`rounded-b-2xl border border-t-0 border-crfal-gray-200/90 bg-white p-5 shadow-xs sm:p-7 ${panelFocusRing} ${painelClassName}`}
          >
            {aba.conteudo}
          </div>
        );
      })}
    </div>
  );
}
