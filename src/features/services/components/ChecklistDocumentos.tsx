import { useCallback, useMemo, useState } from 'react';
import { Check, Printer, RotateCcw } from 'lucide-react';
import { observacoesDoRequerimento, type RequirementItem } from '@/data/requerimentos';
import { useHydrated } from '@/lib/hydration';

const focusRing =
  'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2';
const motion = 'transition duration-200 motion-reduce:transition-none';

function checklistKey(id: string) {
  return `crfal:requerimentos:checklist:${id}`;
}

function lerChecklist(id: string): number[] {
  try {
    const raw = window.localStorage.getItem(checklistKey(id));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

function salvarChecklist(id: string, marcados: number[]) {
  try {
    if (marcados.length === 0) window.localStorage.removeItem(checklistKey(id));
    else window.localStorage.setItem(checklistKey(id), JSON.stringify(marcados));
  } catch {
    /* armazenamento indisponível: a lista funciona apenas nesta visita */
  }
}

function escapeHtml(texto: string) {
  return texto.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
}

/** Abre a lista para impressão; retorna `false` quando o navegador bloqueia a nova janela. */
function imprimirLista(item: RequirementItem, observacoes: string[]): boolean {
  const janela = window.open('', '_blank', 'width=820,height=900');
  if (!janela) return false;
  const docs = item.documentos.map((d) => `<li>${escapeHtml(d)}</li>`).join('');
  const passos = item.instrucoes.map((d) => `<li>${escapeHtml(d)}</li>`).join('');
  const obs = observacoes.map((d) => `<p>${escapeHtml(d)}</p>`).join('');
  janela.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${escapeHtml(item.title)} · CRF-AL</title>
<style>body{font:14px/1.6 system-ui,sans-serif;color:#0B192C;max-width:720px;margin:40px auto;padding:0 24px}h1{font-size:22px;color:#003366;margin:4px 0 4px}small{color:#8A6A12;text-transform:uppercase;letter-spacing:.14em;font-size:11px;font-weight:600}h2{font-size:15px;color:#003366;border-bottom:2px solid #C59B27;padding-bottom:4px;margin-top:28px}ul{list-style:none;padding:0}ul li{padding:6px 0 6px 28px;position:relative;border-bottom:1px solid #E2E8F0}ul li:before{content:'';position:absolute;left:0;top:9px;width:14px;height:14px;border:1.5px solid #003366;border-radius:3px}ol li{margin:6px 0}.obs{background:#FFFBEB;border:1px solid #FDE68A;padding:8px 14px;border-radius:8px}footer{margin-top:32px;color:#64748B;font-size:12px}</style></head><body>
<small>CRF-AL · Requerimentos</small><h1>${escapeHtml(item.title)}</h1><p>${escapeHtml(item.description)}</p>
${item.prazo ? `<p><strong>Prazo:</strong> ${escapeHtml(item.prazo)}</p>` : ''}
<h2>Documentos necessários</h2><ul>${docs}</ul><h2>Como solicitar</h2><ol>${passos}</ol>
<h2>Observações</h2><div class="obs">${obs}</div>
<footer>Conselho Regional de Farmácia do Estado de Alagoas · crf-al.org.br</footer></body></html>`);
  janela.document.close();
  janela.focus();
  janela.print();
  return true;
}

/** Checklist de documentos (lembrado neste navegador) + "Imprimir lista". Monte com `key={item.id}`. */
export default function ChecklistDocumentos({
  item,
  observacoes,
}: {
  item: RequirementItem;
  observacoes?: string[];
}) {
  // A página é pré-renderizada sem nada marcado; o salvo neste navegador entra depois da hidratação.
  const hydrated = useHydrated();
  const salvos = useMemo(() => (hydrated ? lerChecklist(item.id) : []), [hydrated, item.id]);
  const [editados, setMarcados] = useState<number[] | null>(null);
  const marcados = editados ?? salvos;
  const [impressaoBloqueada, setImpressaoBloqueada] = useState(false);

  const observacoesResolvidas = useMemo(
    () => observacoes ?? observacoesDoRequerimento(item),
    [item, observacoes],
  );

  const toggleDocumento = useCallback(
    (index: number) => {
      setMarcados((editado) => {
        const atual = editado ?? salvos;
        const next = atual.includes(index)
          ? atual.filter((i) => i !== index)
          : [...atual, index].sort((a, b) => a - b);
        salvarChecklist(item.id, next);
        return next;
      });
    },
    [item.id, salvos],
  );

  const limparChecklist = useCallback(() => {
    salvarChecklist(item.id, []);
    setMarcados([]);
  }, [item.id]);

  const totalDocs = item.documentos.length;
  const progresso = totalDocs ? Math.round((marcados.length / totalDocs) * 100) : 0;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-crfal-blue-dark">
            {marcados.length} de {totalDocs}{' '}
            {totalDocs === 1 ? 'documento reunido' : 'documentos reunidos'}
          </p>
          <div
            className="mt-1.5 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-crfal-gray-100"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={totalDocs}
            aria-valuenow={marcados.length}
            aria-valuetext={`${marcados.length} de ${totalDocs}`}
            aria-label="Documentos reunidos"
          >
            <div
              className="h-full rounded-full bg-crfal-gold transition-[width] duration-300 motion-reduce:transition-none"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          {marcados.length > 0 && (
            <button
              type="button"
              onClick={limparChecklist}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-crfal-gray-600 hover:bg-crfal-gray-100 hover:text-crfal-blue sm:min-h-9 ${focusRing}`}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Desmarcar todos
            </button>
          )}
          <button
            type="button"
            onClick={() => setImpressaoBloqueada(!imprimirLista(item, observacoesResolvidas))}
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-crfal-blue hover:bg-crfal-blue-lighter sm:min-h-9 ${focusRing}`}
          >
            <Printer className="h-3.5 w-3.5" aria-hidden="true" /> Imprimir lista
          </button>
        </div>
      </div>
      <ul className="divide-y divide-crfal-gray-100 rounded-xl border border-crfal-gray-200">
        {item.documentos.map((doc, index) => {
          const marcado = marcados.includes(index);
          return (
            <li key={index}>
              <label
                className={`flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-crfal-gray-50 ${motion}`}
              >
                <input
                  type="checkbox"
                  checked={marcado}
                  onChange={() => toggleDocumento(index)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px] peer-focus-visible:ring-2 peer-focus-visible:ring-crfal-blue peer-focus-visible:ring-offset-2 ${motion} ${
                    marcado
                      ? 'border-crfal-blue bg-crfal-blue text-white'
                      : 'border-crfal-gray-400 bg-white'
                  }`}
                >
                  {marcado && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
                <span
                  className={`text-sm leading-relaxed ${
                    marcado
                      ? 'text-crfal-gray-500 line-through decoration-crfal-gray-300'
                      : 'text-crfal-gray-700'
                  }`}
                >
                  {doc}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {impressaoBloqueada && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3 text-[13px] leading-relaxed text-amber-900"
        >
          O navegador bloqueou a janela de impressão. Permita pop-ups para este site e toque em
          “Imprimir lista” de novo.
        </p>
      )}
      <p className="mt-2 text-xs text-crfal-gray-600">
        As marcações ficam salvas apenas neste navegador.
      </p>
    </div>
  );
}
