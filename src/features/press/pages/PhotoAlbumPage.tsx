import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHero, { PageHeroStats } from '@/components/block/page-hero';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePhotoAlbum } from '@/services/wordpress/hooks';
import { GalleryApiError } from '@/services/wordpress/gallery';
import type { PhotoAlbum } from '@/services/wordpress/types';
import GalleryState from '../components/GalleryState';

function AlbumPhotos({ album }: { album: PhotoAlbum }) {
  const [index, setIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const photos = album.photos ?? [];
  const photo = photos[index];
  const move = (direction: number) => setIndex((current) => (current + direction + photos.length) % photos.length);
  if (!photo) return <GalleryState />;

  return (
    <Dialog>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {photos.map((item, itemIndex) => (
          <DialogTrigger asChild key={item.id}>
            <button type="button" onClick={(event) => { triggerRef.current = event.currentTarget; setIndex(itemIndex); }} aria-label={`Ampliar foto ${itemIndex + 1}${item.alt ? `: ${item.alt}` : ''}`} className="group overflow-hidden rounded-xl border border-crfal-gray-200 bg-white text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-4">
              <div className="aspect-[4/3] overflow-hidden bg-crfal-gray-100">
                <img src={item.thumbnail} alt={item.alt || `Foto ${itemIndex + 1} — ${album.title}`} width={item.width} height={item.height} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none" />
              </div>
              {item.caption && <p className="p-3 text-sm text-crfal-gray-600 sm:p-4">{item.caption}</p>}
            </button>
          </DialogTrigger>
        ))}
      </div>
      <DialogContent showCloseButton={false} className="max-w-[calc(100%-1rem)] gap-3 border-0 bg-crfal-blue-dark p-3 text-white sm:max-w-5xl sm:p-5 motion-reduce:animate-none" onCloseAutoFocus={(event) => {
        event.preventDefault();
        triggerRef.current?.focus();
      }} onKeyDown={(event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          move(event.key === 'ArrowRight' ? 1 : -1);
        }
      }}>
        <div className="flex items-center justify-between gap-3">
          <DialogTitle className="min-w-0 break-words text-sm leading-relaxed sm:text-base">{album.title}</DialogTitle>
          <DialogClose className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white" aria-label="Fechar foto"><X className="h-5 w-5" aria-hidden="true" /></DialogClose>
        </div>
        <div className="relative flex h-[55vh] items-center justify-center sm:h-[65vh]">
          <img key={photo.id} src={photo.src} alt={photo.alt || `Foto ${index + 1} — ${album.title}`} width={photo.width} height={photo.height} className="h-full w-full object-contain" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <button type="button" aria-label="Foto anterior" onClick={() => move(-1)} disabled={photos.length < 2} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-white/30 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:opacity-40"><ChevronLeft aria-hidden="true" /></button>
          <DialogDescription className="text-center text-sm text-white/90" aria-live="polite">{photo.caption && <span className="mb-1 block max-h-20 overflow-auto">{photo.caption}</span>}Foto {index + 1} de {photos.length}</DialogDescription>
          <button type="button" aria-label="Próxima foto" onClick={() => move(1)} disabled={photos.length < 2} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-white/30 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:opacity-40"><ChevronRight aria-hidden="true" /></button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PhotoAlbumPage() {
  const { slug = '' } = useParams();
  const { data, isPending, isError, error, refetch } = usePhotoAlbum(slug);
  return (
    <div className="min-h-screen bg-crfal-gray-50">
      <SEO title={data?.title ?? 'Álbum de Fotos'} description={data?.description || 'Confira as fotos dos eventos e ações do CRF-AL.'} path={`/imprensa/galeria-de-fotos/${slug}`} image={data?.cover?.src} noindex={isError} />
      <PageHero title={data?.title ?? 'Álbum de Fotos'} breadcrumb={[{ label: 'Início', href: '/' }, { label: 'Imprensa' }, { label: 'Galeria de Fotos', href: '/imprensa/galeria-de-fotos' }, { label: 'Álbum' }]} aside={<PageHeroStats items={[{ value: data?.count ?? '—', label: 'Fotos no álbum' }]} />} />
      <section className="container-crfal py-10 md:py-16" aria-label="Fotos do álbum">
        <Link to="/imprensa/galeria-de-fotos" className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-crfal-blue hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-crfal-blue"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Voltar para os álbuns</Link>
        {data?.description && <p className="mb-8 max-w-3xl leading-relaxed text-crfal-gray-600">{data.description}</p>}
        {isPending || isError ? <GalleryState loading={isPending} error={isError} notFound={error instanceof GalleryApiError && error.status === 404} onRetry={() => void refetch()} /> : data ? <AlbumPhotos key={data.id} album={data} /> : <GalleryState />}
      </section>
    </div>
  );
}
