import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '@/components/SEO';
import PageHero, { PageHeroAction } from '@/components/block/page-hero';
import { SETOR_CONTATOS } from '@/config/contact';
import { CRF_EM_CASA_URL } from '@/config/site';
import {
  TODOS_OS_REQUERIMENTOS,
  corporateMenu,
  individualMenu,
  type MenuCategory,
  type RequirementItem,
} from '@/data/requerimentos';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  ChevronRight,
  Clock,
  PillBottle,
  Search,
  X,
} from 'lucide-react';
import RequirementDialog from '../components/RequirementDialog';

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const TODOS_OS_ITENS = TODOS_OS_REQUERIMENTOS;

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
    setItemParam(item.id);
  }, [setItemParam]);

  const handleOpenChange = useCallback((aberto: boolean) => {
    if (!aberto) {
      setSelectedItem(null);
          setItemParam(null);
    }
  }, [setItemParam]);

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

  const seletorPerfil = (className: string) => (
    <div role="group" aria-label="Selecionar perfil" className={`grid shrink-0 grid-cols-2 gap-1 rounded-2xl border border-crfal-gray-200 bg-crfal-gray-100 p-1 ${className}`}>
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
  );

  return (
    <div className="min-h-screen">
      <SEO
        title="Requerimentos"
        description="Documentos e passos de cada requerimento do CRF-AL para farmacêuticos e empresas: inscrição, certidões, registro de estabelecimentos, responsabilidade técnica e mais."
        path="/servicos/requerimentos"
      />

      <PageHero
        breadcrumb={[{ label: 'Início', href: '/' }, { label: 'Serviços' }, { label: 'Requerimentos' }]}
        section="servicos"
        lead="Confira os documentos e os passos de cada requerimento antes de enviá-lo pelo CRF AL em Casa."
        title="Central de Requerimentos"
        meta={[{ value: totalPerfil, label: `requerimentos para ${activeProfile.audience}` }, { value: currentMenu.length, label: 'categorias' }]}
        actions={<PageHeroAction href={CRF_EM_CASA_URL}>Acessar CRF AL em Casa</PageHeroAction>}
      />

      <div className="container-crfal py-8 md:py-12">
        {/* No celular, o perfil fica fora da barra fixa: só busca e categorias acompanham a rolagem. */}
        {seletorPerfil('mb-3 lg:hidden')}

        {/* Barra fixa: busca e categorias (e o perfil a partir de 1024px) */}
        <div className="sticky top-(--header-offset) z-30 glass-light rounded-2xl border border-white/70 p-2 shadow-[0_12px_32px_-16px_rgba(11,25,44,0.35)] ring-1 ring-crfal-gray-200/70 sm:p-3 lg:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {seletorPerfil('hidden lg:grid')}

            <div className="relative lg:ml-auto lg:max-w-sm lg:flex-1">
              <label htmlFor="busca-requerimento" className="sr-only">Buscar requerimento</label>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-crfal-gray-400" aria-hidden="true" />
              <input
                id="busca-requerimento"
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar requerimento, ex.: certidão"
                className="min-h-11 w-full appearance-none rounded-full border lg:min-h-12 [&::-webkit-search-cancel-button]:appearance-none border-crfal-gray-200 bg-white py-2.5 pl-11 pr-11 text-sm text-crfal-blue-dark transition-colors placeholder:text-crfal-gray-400 focus:border-crfal-blue-light focus:outline-hidden focus:ring-2 focus:ring-crfal-blue-light/40"
              />
              {busca && (
                <button type="button" onClick={() => setBusca('')} aria-label="Limpar busca" className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-crfal-gray-400 transition-colors hover:bg-crfal-gray-100 hover:text-crfal-gray-600 ${focusRing}`}>
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <div role="group" aria-label="Filtrar por categoria" className="mt-2 flex gap-2 sm:mt-3 overflow-x-auto scrollbar-none [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)] [&::-webkit-scrollbar]:hidden lg:flex-wrap lg:overflow-visible lg:[mask-image:none]">
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
                Dúvidas sobre o sistema: <a href={`mailto:${SETOR_CONTATOS.tecnologia.email}`} className="rounded font-semibold text-white underline underline-offset-4 hover:text-crfal-gold focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/60">{SETOR_CONTATOS.tecnologia.email}</a>
              </p>
            </div>
            <a href={CRF_EM_CASA_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-bold transition-colors hover:border-white hover:bg-white hover:text-crfal-blue focus-visible:outline-white">
              Acessar CRF AL em Casa <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">(abre em uma nova aba)</span>
            </a>
          </aside>
        </div>
      </div>

      {selectedItem && <RequirementDialog key={selectedItem.id} selectedItem={selectedItem} onClose={() => handleOpenChange(false)} />}
    </div>
  );
}
