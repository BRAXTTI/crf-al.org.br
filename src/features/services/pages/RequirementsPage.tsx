import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '@/components/SEO';
import { ArrowFillButton } from '@/components/block/arrow-fill-button';
import PageHero, { PageHeroAction } from '@/components/block/page-hero';
import { getYouTubeEmbedUrl } from '@/lib/youtube';
import {
  DEFAULT_IMPORTANT_OBSERVATION,
  TODOS_OS_REQUERIMENTOS,
  corporateMenu,
  individualMenu,
  perfilDoRequerimento,
  type MenuCategory,
  type RequirementItem,
} from '@/data/requerimentos';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Building2,
  ChevronRight,
  FileText,
  Download,
  ArrowLeft,
  AlertCircle,
  Info,
  Workflow,
  X,
  Search,
  Clock,
  ListChecks,
  Play,
  PillBottle,
  Link2,
  Check,
  Printer,
  RotateCcw,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const TODOS_OS_ITENS = TODOS_OS_REQUERIMENTOS;
const CRF_EM_CASA_URL = 'https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf';

type ProfileType = 'individual' | 'corporate';

const PROFILES = [
  { id: 'individual', param: 'pessoa-fisica', label: 'Farmacêuticos', audience: 'farmacêuticos', sublabel: 'Pessoa física', icon: PillBottle, menu: individualMenu },
  { id: 'corporate', param: 'pessoa-juridica', label: 'Empresas', audience: 'empresas', sublabel: 'Pessoa jurídica', icon: Building2, menu: corporateMenu },
] as const;

const goldLabel = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]';
const focusRing = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2';
const motion = 'transition duration-200 motion-reduce:transition-none';

function buscarItens(menu: readonly MenuCategory[], termo: string) {
  return menu.flatMap((cat) => cat.items).filter(
    (item) => termo === '' || normalizar(`${item.title} ${item.description}`).includes(termo)
  );
}

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

/* ---------- Página ---------- */

export default function RequirementsPage() {
  const [searchParams] = useSearchParams();
  return <RequirementsContent key={`${searchParams.get('perfil') ?? 'pessoa-fisica'}|${searchParams.get('categoria') ?? 'todas'}`} />;
}

function RequirementsContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeType: ProfileType = searchParams.get('perfil') === 'pessoa-juridica' ? 'corporate' : 'individual';
  const activeProfile = PROFILES.find((p) => p.id === activeType)!;
  const otherProfile = PROFILES.find((p) => p.id !== activeType)!;
  const currentMenu = activeProfile.menu;

  const [busca, setBusca] = useState(() => searchParams.get('q') ?? '');
  const [categoria, setCategoria] = useState<string>(() => {
    const requested = searchParams.get('categoria');
    return currentMenu.some((category) => category.id === requested) ? requested! : 'todas';
  });
  const [selectedItem, setSelectedItem] = useState<RequirementItem | null>(
    () => TODOS_OS_ITENS.find((item) => item.id === searchParams.get('item')) ?? null
  );
  const [activeTab, setActiveTab] = useState<'documentos' | 'instrucoes'>('documentos');
  const [mostraFluxograma, setMostraFluxograma] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [marcados, setMarcados] = useState<number[]>(() => (selectedItem ? lerChecklist(selectedItem.id) : []));
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [impressaoBloqueada, setImpressaoBloqueada] = useState(false);
  const tabsId = useId();

  const videoEmbedUrl = useMemo(() => getYouTubeEmbedUrl(selectedItem?.videoUrl), [selectedItem?.videoUrl]);

  const termo = normalizar(busca.trim());

  const itensFiltrados = useMemo(() => {
    return currentMenu
      .filter((cat) => categoria === 'todas' || cat.id === categoria)
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => termo === '' || normalizar(`${item.title} ${item.description}`).includes(termo)),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [currentMenu, categoria, termo]);

  const totalResultados = itensFiltrados.reduce((soma, cat) => soma + cat.items.length, 0);
  const resultadosOutroPerfil = useMemo(
    () => (termo ? buscarItens(otherProfile.menu, termo).length : 0),
    [otherProfile.menu, termo]
  );
  const totalPerfil = currentMenu.reduce((soma, cat) => soma + cat.items.length, 0);

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

  const setItemParam = useCallback((id: string | null) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (id) next.set('item', id);
      else next.delete('item');
      return next;
    }, { replace: true, preventScrollReset: true });
  }, [setSearchParams]);

  const handleTypeChange = useCallback((type: ProfileType, manterBusca = false) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set('perfil', type === 'corporate' ? 'pessoa-juridica' : 'pessoa-fisica');
      next.delete('categoria');
      next.delete('item');
      if (manterBusca && busca.trim()) next.set('q', busca.trim());
      else next.delete('q');
      return next;
    }, { preventScrollReset: true });
  }, [setSearchParams, busca]);

  const handleSelectItem = useCallback((item: RequirementItem) => {
    setSelectedItem(item);
    setActiveTab('documentos');
    setMostraFluxograma(false);
    setShowVideoModal(false);
    setMarcados(lerChecklist(item.id));
    setLinkCopiado(false);
    setImpressaoBloqueada(false);
    setItemParam(item.id);
  }, [setItemParam]);

  const handleOpenChange = useCallback((aberto: boolean) => {
    if (!aberto) {
      setSelectedItem(null);
      setMostraFluxograma(false);
      setShowVideoModal(false);
      setItemParam(null);
    }
  }, [setItemParam]);

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

  const limparFiltros = () => {
    setBusca('');
    setCategoria('todas');
  };

  const chipClass = (ativo: boolean) =>
    `inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-semibold ${motion} ${focusRing} ${
      ativo
        ? 'border-crfal-blue bg-crfal-blue text-white shadow-xs'
        : 'border-crfal-gray-200 bg-white text-crfal-gray-700 hover:border-crfal-blue/40 hover:text-crfal-blue'
    }`;
  const chipCount = (ativo: boolean) =>
    `rounded-full px-1.5 text-[11px] font-bold ${ativo ? 'bg-white/20 text-white' : 'bg-crfal-gray-100 text-crfal-gray-600'}`;

  const totalDocs = selectedItem?.documentos.length ?? 0;
  const progresso = totalDocs ? Math.round((marcados.length / totalDocs) * 100) : 0;

  return (
    <div className="min-h-screen">
      <SEO
        title="Requerimentos"
        description="Documentos e passos de cada requerimento do CRF-AL para farmacêuticos e empresas: inscrição, certidões, registro de estabelecimentos, responsabilidade técnica e mais."
        path="/servicos/requerimentos"
      />

      <PageHero
        variant="compact"
        breadcrumb={[{ label: 'Início', href: '/' }, { label: 'Serviços' }, { label: 'Requerimentos' }]}
        section="servicos"
        lead="Confira os documentos e os passos de cada requerimento antes de enviá-lo pelo CRF AL em Casa."
        title="Central de Requerimentos"
        meta={[{ value: totalPerfil, label: `requerimentos para ${activeProfile.audience}` }, { value: currentMenu.length, label: 'categorias' }]}
        actions={<PageHeroAction href={CRF_EM_CASA_URL}>Acessar CRF AL em Casa</PageHeroAction>}
      />

      <main className="container-crfal py-8 md:py-12">
        {/* Barra de perfil, busca e categorias */}
        <div className="sticky top-(--header-offset) z-30 glass-light rounded-2xl border border-white/70 p-3 shadow-[0_12px_32px_-16px_rgba(11,25,44,0.35)] ring-1 ring-crfal-gray-200/70 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div role="group" aria-label="Selecionar perfil" className="grid shrink-0 grid-cols-2 gap-1 rounded-2xl border border-crfal-gray-200 bg-crfal-gray-100 p-1">
              {PROFILES.map((profile) => {
                const ProfileIcon = profile.icon;
                const ativo = activeType === profile.id;
                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => handleTypeChange(profile.id)}
                    aria-pressed={ativo}
                    className={`flex min-h-[52px] items-center gap-2.5 rounded-xl px-3 py-1.5 text-left sm:px-4 ${motion} ${focusRing} ${
                      ativo ? 'bg-crfal-blue text-white shadow-md' : 'text-crfal-gray-700 hover:bg-white hover:text-crfal-blue'
                    }`}
                  >
                    <ProfileIcon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                    <span className="flex flex-col leading-tight">
                      <span className="text-sm font-bold">{profile.label}</span>
                      <span className={`text-[11px] ${ativo ? 'text-white/75' : 'text-crfal-gray-600'}`}>{profile.sublabel}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative lg:ml-auto lg:max-w-sm lg:flex-1">
              <label htmlFor="busca-requerimento" className="sr-only">Buscar requerimento</label>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-crfal-gray-400" aria-hidden="true" />
              <input
                id="busca-requerimento"
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar requerimento, ex.: certidão"
                className="min-h-[48px] w-full appearance-none rounded-full border [&::-webkit-search-cancel-button]:appearance-none border-crfal-gray-200 bg-white py-2.5 pl-11 pr-11 text-sm text-crfal-blue-dark transition-colors placeholder:text-crfal-gray-400 focus:border-crfal-blue-light focus:outline-hidden focus:ring-2 focus:ring-crfal-blue-light/40"
              />
              {busca && (
                <button type="button" onClick={() => setBusca('')} aria-label="Limpar busca" className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-crfal-gray-400 transition-colors hover:bg-crfal-gray-100 hover:text-crfal-gray-600 ${focusRing}`}>
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <div role="group" aria-label="Filtrar por categoria" className="mt-3 flex gap-2 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
            <button type="button" onClick={() => setCategoria('todas')} aria-pressed={categoria === 'todas'} className={chipClass(categoria === 'todas')}>
              Todas <span className={chipCount(categoria === 'todas')}>{totalPerfil}</span>
            </button>
            {currentMenu.map((cat) => {
              const ativo = categoria === cat.id;
              return (
                <button key={cat.id} type="button" onClick={() => setCategoria(cat.id)} aria-pressed={ativo} className={chipClass(ativo)}>
                  {cat.title} <span className={chipCount(ativo)}>{cat.items.length}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Resultados */}
        <div className="mt-8 md:mt-10" aria-live="polite">
          {termo && (
            <p className="mb-6 text-sm text-crfal-gray-600">
              <strong className="text-crfal-blue-dark">{totalResultados}</strong> {totalResultados === 1 ? 'resultado' : 'resultados'} em {activeProfile.label}
              {resultadosOutroPerfil > 0 && (
                <>
                  {' · '}
                  <button type="button" onClick={() => handleTypeChange(otherProfile.id, true)} className={`inline-flex items-center gap-1 rounded font-semibold text-crfal-blue underline-offset-4 hover:underline ${focusRing}`}>
                    ver {resultadosOutroPerfil} em {otherProfile.label}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </>
              )}
            </p>
          )}

          {totalResultados === 0 ? (
            <div className="rounded-2xl border border-dashed border-crfal-gray-300 bg-white px-6 py-14 text-center">
              <Search className="mx-auto mb-3 h-10 w-10 text-crfal-gray-300" aria-hidden="true" />
              <h2 className="text-lg font-bold text-crfal-blue-dark">
                {busca.trim() ? <>Nenhum requerimento para “{busca.trim()}” em {activeProfile.label}</> : <>Nenhum requerimento em {activeProfile.label} nesta categoria</>}
              </h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-crfal-gray-600">
                {categoria !== 'todas'
                  ? 'A busca considera só a categoria selecionada. Tente em todas as categorias ou use outra palavra, como “certidão” ou “inscrição”.'
                  : 'Tente outra palavra, como “certidão” ou “inscrição”. Se não encontrar o que precisa, fale com o atendimento.'}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {resultadosOutroPerfil > 0 && (
                  <button type="button" onClick={() => handleTypeChange(otherProfile.id, true)} className={`inline-flex min-h-[44px] items-center gap-2 rounded-full bg-crfal-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-crfal-blue-dark ${focusRing}`}>
                    Ver {resultadosOutroPerfil} em {otherProfile.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
                {categoria !== 'todas' ? (
                  <button type="button" onClick={() => setCategoria('todas')} className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border border-crfal-gray-300 px-5 py-2.5 text-sm font-semibold text-crfal-blue hover:border-crfal-blue ${focusRing}`}>
                    Buscar em todas as categorias
                  </button>
                ) : (
                  <button type="button" onClick={limparFiltros} className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border border-crfal-gray-300 px-5 py-2.5 text-sm font-semibold text-crfal-blue hover:border-crfal-blue ${focusRing}`}>
                    Limpar busca
                  </button>
                )}
                <Link to="/contato" className={`inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-crfal-blue underline-offset-4 hover:underline ${focusRing}`}>
                  Falar com o atendimento <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-10 md:space-y-12">
              {itensFiltrados.map((cat) => (
                <section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                      <p className={goldLabel}>{cat.items.length} {cat.items.length === 1 ? 'requerimento' : 'requerimentos'}</p>
                      <h2 id={`cat-${cat.id}`} className="mt-1 text-[22px] font-bold leading-tight tracking-tight text-crfal-blue sm:text-[26px]">{cat.title}</h2>
                      <span aria-hidden="true" className="mt-2.5 block h-0.5 w-10 rounded-full bg-crfal-gold" />
                    </div>
                  </div>

                  <ul className="grid gap-px overflow-hidden rounded-xl border border-crfal-gray-200 bg-crfal-gray-200 shadow-xs lg:grid-cols-2">
                    {cat.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.id} className="bg-white lg:[&:last-child:nth-child(odd)]:col-span-2">
                          <button
                            type="button"
                            onClick={() => handleSelectItem(item)}
                            className={`group flex h-full w-full items-center gap-4 p-4 text-left hover:bg-crfal-blue-lighter/50 sm:p-5 ${motion} focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-crfal-blue`}
                          >
                            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-crfal-blue-lighter text-crfal-blue ring-1 ring-crfal-blue/10 group-hover:bg-crfal-blue group-hover:text-white group-hover:ring-crfal-gold/50 ${motion}`}>
                              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[15px] font-bold leading-snug text-crfal-blue-dark group-hover:text-crfal-blue sm:text-base">{item.title}</span>
                              <span className="mt-1 line-clamp-2 block text-[13px] leading-relaxed text-crfal-gray-600 sm:line-clamp-1">{item.description}</span>
                              {item.prazo && (
                                <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-crfal-gray-600">
                                  <Clock className="h-3.5 w-3.5 text-[#8A6A12]" aria-hidden="true" />
                                  {item.prazo}
                                </span>
                              )}
                            </span>
                            <ChevronRight className={`h-5 w-5 shrink-0 text-crfal-gray-400 group-hover:translate-x-1 group-hover:text-[#8A6A12] ${motion}`} aria-hidden="true" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}

          <aside className="mt-12 flex flex-col items-start gap-4 rounded-xl bg-linear-to-br/srgb from-crfal-blue to-crfal-blue-dark p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-crfal-gold">Atendimento online</p>
              <p className="mt-1 text-lg font-bold">Os requerimentos são enviados pelo CRF AL em Casa.</p>
              <p className="mt-1 text-sm text-white/75">
                Dúvidas sobre o sistema: <a href="mailto:tecnologia@crf-al.org.br" className="rounded font-semibold text-white underline underline-offset-4 hover:text-crfal-gold focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/60">tecnologia@crf-al.org.br</a>
              </p>
            </div>
            <a href={CRF_EM_CASA_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-bold transition-colors hover:border-white hover:bg-white hover:text-crfal-blue focus-visible:outline-white">
              Acessar CRF AL em Casa <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">(abre em uma nova aba)</span>
            </a>
          </aside>
        </div>
      </main>

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
              <div className="relative isolate shrink-0 overflow-hidden border-t-2 border-crfal-gold bg-linear-to-br/srgb from-crfal-blue to-crfal-blue-dark p-5 sm:p-6">
                {(() => { const Icon = selectedItem.icon; return <Icon className="pointer-events-none absolute -bottom-8 -right-6 -z-10 h-40 w-40 text-white opacity-[0.06]" strokeWidth={1} aria-hidden="true" />; })()}
                <div className="absolute right-3 top-3 flex items-center gap-1">
                  <button type="button" onClick={copiarLink} aria-label={linkCopiado ? 'Link copiado' : 'Copiar link deste requerimento'} title="Copiar link" className="inline-flex items-center gap-1.5 rounded-full p-2 text-xs font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/60">
                    {linkCopiado ? <Check className="h-5 w-5 text-crfal-gold" aria-hidden="true" /> : <Link2 className="h-5 w-5" aria-hidden="true" />}
                    <span className="hidden sm:inline" aria-hidden="true">{linkCopiado ? 'Copiado' : 'Copiar link'}</span>
                  </button>
                  <span role="status" className="sr-only">{linkCopiado ? 'Link do requerimento copiado.' : ''}</span>
                  <button type="button" onClick={() => handleOpenChange(false)} aria-label="Fechar detalhes" className="rounded-full p-2 text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/60">
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <div className="flex items-start gap-4 pr-24 sm:pr-36">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/5 ring-1 ring-crfal-gold/40 sm:h-14 sm:w-14">
                    {(() => { const Icon = selectedItem.icon; return <Icon className="h-6 w-6 text-white sm:h-7 sm:w-7" strokeWidth={1.5} aria-hidden="true" />; })()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-crfal-gold">Requerimento</p>
                    <DialogTitle className="mt-0.5 text-lg font-bold leading-snug tracking-tight text-white sm:text-[22px]">{selectedItem.title}</DialogTitle>
                  </div>
                </div>
                <DialogDescription className="mt-3 text-sm leading-relaxed text-white/80">{selectedItem.description}</DialogDescription>

                <div className="mt-4 flex flex-wrap gap-2">
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
                    <button type="button" onClick={() => setMostraFluxograma(true)} className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white hover:text-crfal-blue focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/60">
                      <Workflow className="h-3.5 w-3.5" aria-hidden="true" /> Ver fluxograma
                    </button>
                  )}
                  {videoEmbedUrl && (
                    <button type="button" onClick={() => setShowVideoModal(true)} className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white hover:text-crfal-blue focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/60">
                      <Play className="h-3.5 w-3.5" aria-hidden="true" /> Ver tutorial em vídeo
                    </button>
                  )}
                </div>
              </div>

              {mostraFluxograma && selectedItem.fluxogramaUrl ? (
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="flex items-center justify-between border-b border-crfal-gray-200 px-5 py-3">
                    <button type="button" onClick={() => setMostraFluxograma(false)} className={`inline-flex min-h-[36px] items-center gap-1.5 rounded text-sm font-semibold text-crfal-blue hover:text-crfal-blue-dark ${focusRing}`}>
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
                          className={`-mb-px flex flex-1 items-center justify-center gap-2 border-b-2 px-3 py-3.5 text-sm font-semibold transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-crfal-blue ${
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
                              {marcados.length} de {totalDocs} documentos reunidos
                            </p>
                            <div className="mt-1.5 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-crfal-gray-100" role="progressbar" aria-valuemin={0} aria-valuemax={totalDocs} aria-valuenow={marcados.length} aria-label="Documentos reunidos">
                              <div className="h-full rounded-full bg-crfal-gold transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${progresso}%` }} />
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {marcados.length > 0 && (
                              <button type="button" onClick={limparChecklist} className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-crfal-gray-600 hover:bg-crfal-gray-100 hover:text-crfal-blue ${focusRing}`}>
                                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Desmarcar todos
                              </button>
                            )}
                            <button type="button" onClick={() => setImpressaoBloqueada(!imprimirLista(selectedItem, observacoesSelecionadas))} className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-crfal-blue hover:bg-crfal-blue-lighter ${focusRing}`}>
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

                  <div className="flex shrink-0 flex-wrap gap-3 border-t border-crfal-gray-200 bg-crfal-gray-50 p-4 sm:p-5">
                    <ArrowFillButton href={CRF_EM_CASA_URL} target="_blank" rel="noopener noreferrer">
                      Acessar CRF AL em Casa
                      <span className="sr-only"> (abre em nova aba)</span>
                    </ArrowFillButton>
                    {selectedItem.downloadUrl && (
                      <a href={selectedItem.downloadUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-crfal-blue px-5 py-2.5 text-sm font-semibold text-crfal-blue transition-colors hover:bg-crfal-blue hover:text-white ${focusRing}`}>
                        <Download className="h-4 w-4" aria-hidden="true" /> Baixar formulário
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

      {showVideoModal && selectedItem && videoEmbedUrl &&
        createPortal(
          <div className="pointer-events-auto fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowVideoModal(false)}>
            <div role="dialog" aria-modal="true" aria-label={`Tutorial: ${selectedItem.title}`} className="w-full max-w-2xl animate-scale-in overflow-hidden rounded-xl bg-white" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-crfal-gray-200 p-4">
                <h3 className="font-bold text-crfal-blue">Tutorial: {selectedItem.title}</h3>
                <button type="button" onClick={() => setShowVideoModal(false)} className="rounded-lg p-2 transition-colors hover:bg-crfal-gray-100" aria-label="Fechar vídeo">
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="aspect-video bg-black">
                <iframe src={videoEmbedUrl} title={`Vídeo tutorial: ${selectedItem.title}`} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
