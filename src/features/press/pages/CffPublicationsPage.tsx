import { useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpRight, ChevronsRight, Landmark } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHero, { PageHeroAction } from '@/components/block/page-hero';
import { CffCoverSkeleton, CffPublicationCard } from '@/features/press/cff';
import { CFF_PUBLICATIONS_PATH, CFF_PUBLICATIONS_URL, useCffPublications, type CffCollection } from '@/features/press/cff-data';

/** Como no site do CFF: duas coleções por página. */
const PER_PAGE = 2;
const externalNote = <span className="sr-only"> (abre em uma nova aba)</span>;

/**
 * No celular e no tablet pequeno cada coleção vira um carrossel horizontal (deslizar, com a próxima capa
 * aparecendo na borda) em vez de empilhar uma capa por linha; do md em diante volta à grade centralizada.
 * O padding vertical evita cortar a sombra dos cartões pelo overflow.
 */
const collectionListClass = '-mx-4 flex snap-x snap-mandatory scroll-px-1 overflow-x-auto px-1 pb-4 pt-3 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-2 sm:px-2 md:-mx-4 md:flex-wrap md:justify-center md:overflow-visible md:p-0 lg:-mx-3.5 [&::-webkit-scrollbar]:hidden [&>li]:shrink-0 [&>li]:snap-start';
const collectionItemClass = 'w-[62%] px-3 sm:w-[38%] sm:px-4 md:mb-10 md:w-5/12 lg:mb-12 lg:w-1/4 lg:px-3.5';

function CollectionSection({ collection, shaded }: { collection: CffCollection; shaded: boolean }) {
  return (
    <section aria-labelledby={`${collection.slug}-title`} className={`py-12 md:py-14 ${shaded ? 'bg-crfal-gray-50' : 'bg-white'}`}>
      <div className="container-crfal">
        <header className="mx-auto mb-6 text-center md:mb-10">
          <h2 id={`${collection.slug}-title`} className="text-2xl font-bold leading-snug text-crfal-blue-dark sm:text-[27px]">{collection.title}</h2>
          <span aria-hidden="true" className="mx-auto mt-6 block h-0.5 w-13 rounded-full bg-crfal-gold" />
          {collection.items.length > 1 && (
            <p className="mt-4 flex items-center justify-center gap-1.5 text-[13px] text-crfal-gray-600 md:hidden">
              {collection.items.length} publicações · deslize para ver <ChevronsRight className="h-4 w-4 text-crfal-blue" aria-hidden="true" />
            </p>
          )}
        </header>
        <ul className={collectionListClass}>
          {collection.items.map((item, index) => (
            <li key={item.link} className={collectionItemClass}>
              <CffPublicationCard collection={collection} index={index} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function pageList(page: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  if (page > 3) pages.push('…');
  for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) pages.push(i);
  if (page < total - 2) pages.push('…');
  pages.push(total);
  return pages;
}

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (page: number) => void }) {
  if (total <= 1) return null;
  const circle = 'flex h-9 min-w-9 items-center justify-center rounded-full border px-2 text-[15px] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2';
  const idle = `${circle} border-crfal-gray-300 bg-white text-crfal-gray-600 hover:border-crfal-blue hover:text-crfal-blue disabled:pointer-events-none disabled:opacity-40`;
  return (
    <nav aria-label="Páginas de publicações" className="container-crfal pb-12 pt-2">
      <ul className="flex flex-wrap items-center justify-center gap-1.5">
        <li><button type="button" className={idle} onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Página anterior">«</button></li>
        {pageList(page, total).map((p, i) => (
          <li key={`${p}-${i}`}>
            {p === '…'
              ? <span className={`${circle} border-transparent text-crfal-gray-400`} aria-hidden="true">…</span>
              : <button type="button" onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined} aria-label={`Página ${p}`} className={p === page ? `${circle} border-crfal-blue bg-crfal-blue font-semibold text-white` : idle}>{p}</button>}
          </li>
        ))}
        <li><button type="button" className={idle} onClick={() => onChange(page + 1)} disabled={page === total} aria-label="Próxima página">»</button></li>
      </ul>
    </nav>
  );
}

export default function CffPublicationsPage() {
  const { data: collections = [], isLoading, isError, refetch } = useCffPublications();
  const [params, setParams] = useSearchParams();
  const listRef = useRef<HTMLDivElement>(null);
  const totalPages = Math.max(1, Math.ceil(collections.length / PER_PAGE));
  const page = Math.min(totalPages, Math.max(1, Number.parseInt(params.get('pagina') ?? '1', 10) || 1));
  const visible = collections.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const changePage = (next: number) => {
    setParams(next > 1 ? { pagina: String(next) } : {});
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Publicações do CFF"
        description="Publicações do Conselho Federal de Farmácia (CFF): revista Pharmacia Brasileira, guias de prática clínica, notas técnicas, relatórios e materiais de orientação, com acesso direto ao site do CFF."
        path={CFF_PUBLICATIONS_PATH}
      />

      <PageHero
        breadcrumb={[{ label: 'Início', href: '/' }, { label: 'Imprensa', href: '/imprensa/noticias' }, { label: 'Publicações do CFF' }]}
        title="Publicações do CFF"
        section="imprensa"
        eyebrow="Conselho Federal de Farmácia"
        lead="Revistas, guias, notas técnicas e relatórios do Conselho Federal. Cada capa abre o PDF oficial no site do CFF."
        actions={<PageHeroAction href={CFF_PUBLICATIONS_URL} variant="secondary">Site do CFF</PageHeroAction>}
      />

      <main ref={listRef} className="scroll-mt-24">
        {isError ? (
          <div className="container-crfal py-14">
            <div className="rounded-xl border border-dashed border-crfal-gray-300 bg-white px-6 py-14 text-center">
              <Landmark className="mx-auto mb-3 h-9 w-9 text-crfal-blue" aria-hidden="true" />
              <p role="alert" className="text-lg font-bold text-crfal-blue-dark">Não foi possível carregar as publicações do CFF agora.</p>
              <p className="mt-1 text-sm text-crfal-gray-600">Tente novamente ou acesse diretamente o site do Conselho Federal.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={() => refetch()} className="inline-flex min-h-11 items-center rounded-full border border-crfal-gray-300 px-5 text-sm font-semibold text-crfal-blue hover:border-crfal-blue">Tentar novamente</button>
                <a href={CFF_PUBLICATIONS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-crfal-blue px-5 text-sm font-semibold text-white hover:bg-crfal-blue-dark">
                  Abrir site do CFF <ArrowUpRight className="h-4 w-4" aria-hidden="true" />{externalNote}
                </a>
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="container-crfal py-14">
            <ul className={collectionListClass} aria-busy="true"><CffCoverSkeleton count={8} /></ul>
          </div>
        ) : (
          <>
            {visible.map((collection, i) => <CollectionSection key={collection.slug} collection={collection} shaded={i % 2 === 1} />)}
            <div className="bg-white pt-6">
              <Pagination page={page} total={totalPages} onChange={changePage} />
              <p className="container-crfal pb-12 text-center text-[12.5px] text-crfal-gray-600">
                Publicações do Conselho Federal de Farmácia. Os arquivos ficam no{' '}
                <a href={CFF_PUBLICATIONS_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-crfal-blue hover:underline">site oficial do CFF{externalNote}</a>
                ; o CRF-AL não hospeda cópias.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
