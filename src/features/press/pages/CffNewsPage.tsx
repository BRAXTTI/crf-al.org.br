import { ArrowUpRight, Landmark, Loader2 } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHero, { PageHeroAction } from '@/components/block/page-hero';
import { CffNewsCard, CffNewsSkeleton } from '@/features/press/cff';
import { CFF_NEWS_URL, useCffNews } from '@/features/press/cff-data';

const PAGE_SIZE = 12;

export default function CffNewsPage() {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useCffNews(PAGE_SIZE);
  const items = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="min-h-screen">
      <SEO
        title="Notícias do CFF"
        description="Notícias do Conselho Federal de Farmácia (CFF) sobre a profissão farmacêutica, normas e ações do Sistema CFF/CRFs, reunidas pelo CRF-AL."
        path="/imprensa/noticias-cff"
      />

      <PageHero
        breadcrumb={[{ label: 'Início', href: '/' }, { label: 'Imprensa', href: '/imprensa/noticias' }, { label: 'Notícias do CFF' }]}
        title="Notícias do CFF"
        section="imprensa"
        eyebrow="Conselho Federal de Farmácia"
        lead="O que o Conselho Federal publica sobre a profissão, as normas e as ações do Sistema CFF/CRFs. As matérias abrem no site oficial do CFF."
        actions={<PageHeroAction href={CFF_NEWS_URL} variant="secondary">Site do CFF</PageHeroAction>}
      />

      <main className="container-crfal py-10 md:py-14">
        {isError && items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-crfal-gray-300 bg-white px-6 py-14 text-center">
            <Landmark className="mx-auto mb-3 h-9 w-9 text-crfal-blue" aria-hidden="true" />
            <p role="alert" className="text-lg font-bold text-crfal-blue-dark">Não foi possível carregar as notícias do CFF agora.</p>
            <p className="mt-1 text-sm text-crfal-gray-600">Tente novamente ou acesse diretamente o site do Conselho Federal.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => refetch()} className="inline-flex min-h-11 items-center rounded-full border border-crfal-gray-300 px-5 text-sm font-semibold text-crfal-blue hover:border-crfal-blue">Tentar novamente</button>
              <a href={CFF_NEWS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-crfal-blue px-5 text-sm font-semibold text-white hover:bg-crfal-blue-dark">
                Abrir site do CFF <ArrowUpRight className="h-4 w-4" aria-hidden="true" /><span className="sr-only">(abre em uma nova aba)</span>
              </a>
            </div>
          </div>
        ) : (
          <>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy={isLoading || isFetchingNextPage || undefined}>
              {items.map((item) => <li key={item.link}><CffNewsCard item={item} summaryLines={3} /></li>)}
              {(isLoading || isFetchingNextPage) && <CffNewsSkeleton count={isLoading ? 6 : 3} className="" />}
            </ul>

            <div className="mt-10 flex flex-col items-center gap-4">
              {hasNextPage && !isLoading && (
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-crfal-blue px-6 text-sm font-bold text-white shadow-[0_6px_16px_-6px_rgba(0,51,102,0.55)] transition-colors hover:bg-crfal-blue-dark disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2"
                >
                  {isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                  {isFetchingNextPage ? 'Carregando…' : 'Carregar mais notícias'}
                </button>
              )}
              <p className="text-center text-[12.5px] text-crfal-gray-600">
                Conteúdo do Conselho Federal de Farmácia, publicado com autorização. Os links abrem o{' '}
                <a href={CFF_NEWS_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-crfal-blue hover:underline">site oficial do CFF<span className="sr-only"> (abre em uma nova aba)</span></a>.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
