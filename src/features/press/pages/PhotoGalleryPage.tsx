import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Images } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHero, { PageHeroStats } from '@/components/block/page-hero';
import { usePhotoAlbums } from '@/services/wordpress/hooks';
import GalleryState from '../components/GalleryState';

export default function PhotoGalleryPage() {
  const [params, setParams] = useSearchParams();
  const requestedPage = Number(params.get('pagina'));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const { data, isPending, isError, isFetching, isPlaceholderData, refetch } = usePhotoAlbums(page);
  const albums = data?.albums ?? [];

  return (
    <div className="min-h-screen bg-crfal-gray-50">
      <SEO title="Galeria de Fotos" description="Registros fotográficos dos eventos, encontros e ações do Conselho Regional de Farmácia de Alagoas." path="/imprensa/galeria-de-fotos" />
      <PageHero title="Galeria de Fotos" breadcrumb={[{ label: 'Início', href: '/' }, { label: 'Imprensa' }, { label: 'Galeria de Fotos' }]} aside={<PageHeroStats items={[{ value: data?.total ?? '—', label: 'Álbuns publicados' }]} />} />
      <section className="container-crfal py-10 md:py-16" aria-label="Álbuns de fotos" aria-busy={isFetching}>
        <p className="mb-8 max-w-2xl leading-relaxed text-crfal-gray-600">Acompanhe os registros dos eventos, encontros e ações do CRF-AL. Selecione um álbum para ver todas as fotos.</p>
        {isPending || isError || albums.length === 0 ? <GalleryState loading={isPending} error={isError} onRetry={() => void refetch()} /> : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <Link key={album.id} to={`/imprensa/galeria-de-fotos/${album.slug}`} className="group overflow-hidden rounded-xl border border-crfal-gray-200 bg-white transition-colors hover:border-crfal-blue/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-4 motion-reduce:transition-none">
                <div className="relative aspect-[4/3] overflow-hidden bg-crfal-gray-100">
                  {album.cover ? <img src={album.cover.thumbnail} alt="" loading="lazy" decoding="async" width={album.cover.width} height={album.cover.height} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none" /> : <Images className="absolute inset-0 m-auto h-12 w-12 text-crfal-gray-400" aria-hidden="true" />}
                  <span className="absolute bottom-3 right-3 rounded-md bg-crfal-blue-dark/90 px-3 py-1.5 text-xs font-semibold text-white">{album.count} {album.count === 1 ? 'foto' : 'fotos'}</span>
                </div>
                <div className="p-5">
                  <h2 className="break-words font-display text-lg font-semibold leading-snug text-crfal-blue">{album.title}</h2>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-crfal-blue">Ver álbum <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
                </div>
              </Link>
            ))}
          </div>
        )}
        {data && (data.totalPages > 1 || page > 1) && !isError && (
          <nav aria-label="Paginação dos álbuns" className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button type="button" className="btn-outline disabled:opacity-50" disabled={page <= 1 || isFetching} onClick={() => setParams({ pagina: String(page - 1) })}>Anterior</button>
            <span className="text-sm text-crfal-gray-600" aria-live="polite">Página {page} de {Math.max(1, data.totalPages)}</span>
            <button type="button" className="btn-outline disabled:opacity-50" disabled={page >= data.totalPages || isFetching || isPlaceholderData} onClick={() => setParams({ pagina: String(page + 1) })}>Próxima</button>
          </nav>
        )}
      </section>
    </div>
  );
}
