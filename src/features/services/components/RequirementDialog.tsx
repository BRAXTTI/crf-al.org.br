import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock,
  Download,
  FileText,
  Info,
  Link2,
  ListChecks,
  Play,
  Printer,
  RotateCcw,
  Workflow,
  X,
} from 'lucide-react';
import { ArrowFillButton } from '@/components/block/arrow-fill-button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { CRF_EM_CASA_URL } from '@/config/site';
import {
  DEFAULT_IMPORTANT_OBSERVATION,
  perfilDoRequerimento,
  type RequirementItem,
} from '@/data/requerimentos';
import { getYouTubeEmbedUrl } from '@/lib/youtube';

const focusRing = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2';
const motion = 'transition duration-200 motion-reduce:transition-none';

/* ---------- Checklist de documentos (lembrado neste navegador) ---------- */

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
  return texto.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
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

export default function RequirementDialog({ selectedItem, onClose }: { selectedItem: RequirementItem; onClose: () => void }) {
  const handleOpenChange = (open: boolean) => { if (!open) onClose(); };
  const [activeTab, setActiveTab] = useState<'documentos' | 'instrucoes'>('documentos');
  const [mostraFluxograma, setMostraFluxograma] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [marcados, setMarcados] = useState<number[]>(() => (selectedItem ? lerChecklist(selectedItem.id) : []));
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [impressaoBloqueada, setImpressaoBloqueada] = useState(false);
  const tabsId = useId();

  const videoEmbedUrl = useMemo(() => getYouTubeEmbedUrl(selectedItem?.videoUrl), [selectedItem?.videoUrl]);

  const observacoesSelecionadas = useMemo(() => {
    if (!selectedItem) return [];
    const obs = selectedItem.observacoesImportantes;
    const lista = Array.isArray(obs) ? obs.filter((o) => o.trim().length > 0) : obs?.trim() ? [obs.trim()] : [];
    return lista.length > 0 ? lista : [DEFAULT_IMPORTANT_OBSERVATION];
  }, [selectedItem]);

  useEffect(() => {
    if (!linkCopiado) return;
    const timer = window.setTimeout(() => setLinkCopiado(false), 2500);
    return () => window.clearTimeout(timer);
  }, [linkCopiado]);

  const toggleDocumento = useCallback((index: number) => {
    if (!selectedItem) return;
    setMarcados((atual) => {
      const next = atual.includes(index) ? atual.filter((i) => i !== index) : [...atual, index].sort((a, b) => a - b);
      salvarChecklist(selectedItem.id, next);
      return next;
    });
  }, [selectedItem]);

  const limparChecklist = useCallback(() => {
    if (!selectedItem) return;
    salvarChecklist(selectedItem.id, []);
    setMarcados([]);
  }, [selectedItem]);

  const copiarLink = useCallback(async () => {
    if (!selectedItem) return;
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('item', selectedItem.id);
    url.searchParams.set('perfil', perfilDoRequerimento(selectedItem.id));
    try {
      await navigator.clipboard.writeText(url.toString());
      setLinkCopiado(true);
    } catch {
      window.prompt('Copie o link do requerimento:', url.toString());
    }
  }, [selectedItem]);

  const totalDocs = selectedItem?.documentos.length ?? 0;
  const progresso = totalDocs ? Math.round((marcados.length / totalDocs) * 100) : 0;

  return (
    <>
      {/* Detalhes do requerimento */}
      <Dialog open={selectedItem !== null} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          onInteractOutside={(e) => { if (showVideoModal) e.preventDefault(); }}
          onEscapeKeyDown={(e) => { if (showVideoModal) e.preventDefault(); }}
          className="flex max-h-[calc(100dvh-var(--header-offset)-1.5rem)] w-full flex-col gap-0 overflow-hidden rounded-2xl p-0 top-[calc(var(--header-offset)+0.75rem)] translate-y-0 sm:max-w-2xl lg:top-[50%] lg:max-h-[90vh] lg:translate-y-[-50%]"
        >
          {selectedItem && (
            <>
              <div className="relative isolate shrink-0 overflow-hidden border-t-2 border-crfal-gold bg-linear-to-br/srgb from-crfal-blue to-crfal-blue-dark p-4 sm:p-6">
                {(() => { const Icon = selectedItem.icon; return <Icon className="pointer-events-none absolute -bottom-8 -right-6 -z-10 h-40 w-40 text-white opacity-[0.06]" strokeWidth={1} aria-hidden="true" />; })()}
                <div className="absolute right-2 top-2 flex items-center sm:right-3 sm:top-3 sm:gap-1">
                  <button type="button" onClick={copiarLink} aria-label={linkCopiado ? 'Link copiado' : 'Copiar link deste requerimento'} title="Copiar link" className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full p-2 text-xs font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/60">
                    {linkCopiado ? <Check className="h-5 w-5 text-crfal-gold" aria-hidden="true" /> : <Link2 className="h-5 w-5" aria-hidden="true" />}
                    <span className="hidden sm:inline" aria-hidden="true">{linkCopiado ? 'Copiado' : 'Copiar link'}</span>
                  </button>
                  <span role="status" className="sr-only">{linkCopiado ? 'Link do requerimento copiado.' : ''}</span>
                  <button type="button" onClick={() => handleOpenChange(false)} aria-label="Fechar detalhes" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/60">
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <div className="flex items-start gap-4 pr-20 sm:pr-36">
                  <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/5 ring-1 ring-crfal-gold/40 sm:flex">
                    {(() => { const Icon = selectedItem.icon; return <Icon className="h-6 w-6 text-white sm:h-7 sm:w-7" strokeWidth={1.5} aria-hidden="true" />; })()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-crfal-gold">Requerimento</p>
                    <DialogTitle className="mt-0.5 text-lg font-bold leading-snug tracking-tight text-white sm:text-[22px]">{selectedItem.title}</DialogTitle>
                  </div>
                </div>
                <DialogDescription className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/80 sm:mt-3 sm:line-clamp-none">{selectedItem.description}</DialogDescription>

                <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
                  {selectedItem.prazo && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
                      <Clock className="h-3.5 w-3.5 text-crfal-gold" aria-hidden="true" /> Prazo: {selectedItem.prazo}
                    </span>
                  )}
                  {selectedItem.taxaAplicavel && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
                      <Info className="h-3.5 w-3.5 text-crfal-gold" aria-hidden="true" /> Taxa: {selectedItem.taxaAplicavel}
                    </span>
                  )}
                  {selectedItem.fluxogramaUrl && !mostraFluxograma && (
                    <button type="button" onClick={() => setMostraFluxograma(true)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white hover:text-crfal-blue focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/60 motion-reduce:transition-none sm:min-h-8">
                      <Workflow className="h-3.5 w-3.5" aria-hidden="true" /> Ver fluxograma
                    </button>
                  )}
                  {videoEmbedUrl && (
                    <button type="button" onClick={() => setShowVideoModal(true)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white hover:text-crfal-blue focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/60 motion-reduce:transition-none sm:min-h-8">
                      <Play className="h-3.5 w-3.5" aria-hidden="true" /> Ver tutorial em vídeo
                    </button>
                  )}
                </div>
              </div>

              {mostraFluxograma && selectedItem.fluxogramaUrl ? (
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="flex items-center justify-between border-b border-crfal-gray-200 px-5 py-3">
                    <button type="button" onClick={() => setMostraFluxograma(false)} className={`inline-flex min-h-11 items-center gap-1.5 rounded text-sm font-semibold text-crfal-blue hover:text-crfal-blue-dark ${focusRing}`}>
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar aos detalhes
                    </button>
                  </div>
                  <div className="min-h-0 flex-1 overflow-auto bg-crfal-gray-50 p-4 sm:p-6">
                    <img src={selectedItem.fluxogramaUrl} alt={`Fluxograma do requerimento ${selectedItem.title}`} className="mx-auto h-auto w-full rounded-xl border border-crfal-gray-200 bg-white object-contain shadow-xs" />
                  </div>
                </div>
              ) : (
                <>
                  <div role="tablist" aria-label="Detalhes do requerimento" className="flex shrink-0 border-b border-crfal-gray-200 px-2 sm:px-4">
                    {([
                      { id: 'documentos', label: 'Documentos', icon: ListChecks, count: selectedItem.documentos.length },
                      { id: 'instrucoes', label: 'Como solicitar', icon: FileText, count: selectedItem.instrucoes.length },
                    ] as const).map((tab) => {
                      const TabIcon = tab.icon;
                      const ativo = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          role="tab"
                          id={`${tabsId}-${tab.id}-tab`}
                          aria-selected={ativo}
                          aria-controls={`${tabsId}-${tab.id}-panel`}
                          tabIndex={ativo ? 0 : -1}
                          onClick={() => setActiveTab(tab.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                              e.preventDefault();
                              const next = tab.id === 'documentos' ? 'instrucoes' : 'documentos';
                              setActiveTab(next);
                              document.getElementById(`${tabsId}-${next}-tab`)?.focus();
                            }
                          }}
                          className={`-mb-px flex min-h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap border-b-2 px-2 py-3 text-sm font-semibold transition-colors motion-reduce:transition-none sm:px-3 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-crfal-blue ${
                            ativo ? 'border-crfal-gold text-crfal-blue' : 'border-transparent text-crfal-gray-600 hover:text-crfal-blue'
                          }`}
                        >
                          <TabIcon className="h-4 w-4" aria-hidden="true" />
                          {tab.label}
                          <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${ativo ? 'bg-crfal-blue-lighter text-crfal-blue' : 'bg-crfal-gray-100 text-crfal-gray-600'}`}>{tab.count}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
                    <div className="mb-5 space-y-2">
                      {observacoesSelecionadas.map((observacao, index) => (
                        <div key={index} className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                          <p className="whitespace-pre-line text-[13px] leading-relaxed text-amber-900">{observacao}</p>
                        </div>
                      ))}
                    </div>

                    {activeTab === 'documentos' ? (
                      <div role="tabpanel" id={`${tabsId}-documentos-panel`} aria-labelledby={`${tabsId}-documentos-tab`}>
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-crfal-blue-dark">
                              {marcados.length} de {totalDocs} {totalDocs === 1 ? 'documento reunido' : 'documentos reunidos'}
                            </p>
                            <div className="mt-1.5 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-crfal-gray-100" role="progressbar" aria-valuemin={0} aria-valuemax={totalDocs} aria-valuenow={marcados.length} aria-valuetext={`${marcados.length} de ${totalDocs}`} aria-label="Documentos reunidos">
                              <div className="h-full rounded-full bg-crfal-gold transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${progresso}%` }} />
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {marcados.length > 0 && (
                              <button type="button" onClick={limparChecklist} className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-crfal-gray-600 hover:bg-crfal-gray-100 hover:text-crfal-blue sm:min-h-9 ${focusRing}`}>
                                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Desmarcar todos
                              </button>
                            )}
                            <button type="button" onClick={() => setImpressaoBloqueada(!imprimirLista(selectedItem, observacoesSelecionadas))} className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-crfal-blue hover:bg-crfal-blue-lighter sm:min-h-9 ${focusRing}`}>
                              <Printer className="h-3.5 w-3.5" aria-hidden="true" /> Imprimir lista
                            </button>
                          </div>
                        </div>
                        <ul className="divide-y divide-crfal-gray-100 rounded-xl border border-crfal-gray-200">
                          {selectedItem.documentos.map((doc, index) => {
                            const marcado = marcados.includes(index);
                            return (
                              <li key={index}>
                                <label className={`flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-crfal-gray-50 ${motion}`}>
                                  <input type="checkbox" checked={marcado} onChange={() => toggleDocumento(index)} className="peer sr-only" />
                                  <span aria-hidden="true" className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px] peer-focus-visible:ring-2 peer-focus-visible:ring-crfal-blue peer-focus-visible:ring-offset-2 ${motion} ${marcado ? 'border-crfal-blue bg-crfal-blue text-white' : 'border-crfal-gray-400 bg-white'}`}>
                                    {marcado && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                                  </span>
                                  <span className={`text-sm leading-relaxed ${marcado ? 'text-crfal-gray-500 line-through decoration-crfal-gray-300' : 'text-crfal-gray-700'}`}>{doc}</span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                        {impressaoBloqueada && (
                          <p role="alert" className="mt-3 rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3 text-[13px] leading-relaxed text-amber-900">
                            O navegador bloqueou a janela de impressão. Permita pop-ups para este site e toque em “Imprimir lista” de novo.
                          </p>
                        )}
                        <p className="mt-2 text-xs text-crfal-gray-600">As marcações ficam salvas apenas neste navegador.</p>
                      </div>
                    ) : (
                      <ol role="tabpanel" id={`${tabsId}-instrucoes-panel`} aria-labelledby={`${tabsId}-instrucoes-tab`}>
                        {selectedItem.instrucoes.map((instrucao, index) => (
                          <li key={index} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-crfal-blue text-sm font-bold text-white ring-2 ring-crfal-gold/30">{index + 1}</span>
                              {index < selectedItem.instrucoes.length - 1 && <div className="mt-1 h-full w-px bg-crfal-gray-200" />}
                            </div>
                            <p className="pb-5 pt-1 text-sm leading-relaxed text-crfal-gray-700">{instrucao}</p>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2 border-t border-crfal-gray-200 bg-crfal-gray-50 p-3 sm:flex-wrap sm:gap-3 sm:p-5">
                    <ArrowFillButton href={selectedItem.acesso?.url ?? CRF_EM_CASA_URL} target="_blank" rel="noopener noreferrer">
                      {selectedItem.acesso?.label ?? 'Acessar CRF AL em Casa'}
                      <span className="sr-only"> (abre em nova aba)</span>
                    </ArrowFillButton>
                    {selectedItem.downloadUrl && (
                      <a href={selectedItem.downloadUrl} target="_blank" rel="noopener noreferrer" title="Baixar formulário" className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border-2 border-crfal-blue px-3 py-2.5 sm:px-5 text-sm font-semibold text-crfal-blue transition-colors hover:bg-crfal-blue hover:text-white ${focusRing}`}>
                        <Download className="h-4 w-4" aria-hidden="true" /> <span className="sr-only sm:not-sr-only">Baixar formulário</span>
                        <span className="sr-only"> (abre em nova aba)</span>
                      </a>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent showCloseButton={false} aria-describedby={undefined} className="z-60 overflow-hidden p-0 sm:max-w-2xl">
          <div className="flex items-center justify-between border-b border-crfal-gray-200 p-4">
            <DialogTitle className="font-bold text-crfal-blue">Tutorial: {selectedItem.title}</DialogTitle>
            <button type="button" onClick={() => setShowVideoModal(false)} className="rounded-lg p-2 transition-colors hover:bg-crfal-gray-100" aria-label="Fechar vídeo">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          {videoEmbedUrl && <div className="aspect-video bg-black">
            <iframe src={videoEmbedUrl} title={`Vídeo tutorial: ${selectedItem.title}`} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
          </div>}
        </DialogContent>
      </Dialog>
    </>
  );
}
