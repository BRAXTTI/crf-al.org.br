import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPostImage, sanitizeWP, stripHTML } from '@/services/wordpress/client';
import { usePosts } from '@/services/wordpress/hooks';
import type { WPPost } from '@/services/wordpress/types';

const IMG_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='600' height='400' fill='%23E6F0F8'/%3E%3C/svg%3E";

interface Publication {
  id: number;
  title: string;
  image: string;
}

function mapWPPost(post: WPPost): Publication {
  return {
    id: post.id,
    title: stripHTML(sanitizeWP(post.title.rendered)),
    image: getPostImage(post) || IMG_FALLBACK,
  };
}

export default function Publications() {
  const { data, isLoading, isError, refetch } = usePosts(1, 6);
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [perView, setPerView] = useState(() =>
    typeof window === 'undefined' ? 3 : window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1
  );

  useEffect(() => {
    const onResize = () => {
      setPerView(window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const publications = useMemo(() => data?.posts.map(mapWPPost) ?? [], [data]);
  const totalPages = Math.max(1, Math.ceil(publications.length / perView));

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages - 1));
  }, [totalPages]);

  const goTo = useCallback(
    (p: number) => {
      const clamped = Math.max(0, Math.min(totalPages - 1, p));
      setPage(clamped);
      const track = trackRef.current;
      if (track) {
        track.scrollTo({ left: clamped * track.clientWidth, behavior: 'smooth' });
      }
    },
    [totalPages]
  );

  const prev = useCallback(() => goTo(page - 1), [goTo, page]);
  const next = useCallback(() => goTo(page + 1), [goTo, page]);

  return (
    <section id="noticias" className="py-16 sm:py-20 md:py-24 bg-crfal-gray-50">
      <div className="container-crfal">
        <h2 className="mb-10 text-center font-display text-2xl sm:text-3xl md:text-4xl font-bold text-red-600 sm:mb-14">
          Notícias
        </h2>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
          </div>
        ) : isError ? (
          <div className="py-16 text-center">
            <p className="text-crfal-gray-600">Não foi possível carregar as notícias. Tente novamente.</p>
            <button
              onClick={() => refetch()}
              className="mt-4 rounded-md border-2 border-red-600 px-5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
            >
              Tentar novamente
            </button>
          </div>
        ) : publications.length === 0 ? (
          <p className="py-16 text-center text-crfal-gray-600">Nenhuma notícia publicada no momento.</p>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={prev}
              aria-label="Notícias anteriores"
              disabled={page === 0}
              className="absolute left-2 top-[128px] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-crfal-gray-dark/80 text-white shadow-lg transition hover:bg-crfal-gray-dark disabled:pointer-events-none disabled:opacity-0 sm:flex lg:left-4"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Próximas notícias"
              disabled={page >= totalPages - 1}
              className="absolute right-2 top-[128px] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-crfal-gray-dark/80 text-white shadow-lg transition hover:bg-crfal-gray-dark disabled:pointer-events-none disabled:opacity-0 sm:flex lg:right-4"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div
              ref={trackRef}
              className="overflow-x-auto scrollbar-none scroll-smooth sm:overflow-hidden"
            >
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${page * 100}%)` }}
              >
                {Array.from({ length: totalPages }).map((_, groupIndex) => {
                  const group = publications.slice(groupIndex * perView, (groupIndex + 1) * perView);
                  return (
                    <div key={groupIndex} className="flex w-full shrink-0 gap-6">
                      {group.map((pub) => (
                        <article key={pub.id} className="w-full shrink-0 sm:w-1/2 lg:w-auto lg:flex-1">
                          <Link to={`/imprensa/noticias/${pub.id}`} className="group block text-center">
                            <div className="overflow-hidden rounded-xl">
                              <img
                                src={pub.image}
                                alt={pub.title}
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = IMG_FALLBACK;
                                }}
                                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            </div>
                            <h3 className="mx-auto mt-4 max-w-md text-base font-bold leading-snug text-crfal-blue sm:text-lg">
                              {pub.title}
                            </h3>
                            <span className="mt-3 inline-block rounded-md bg-primary px-6 py-2 text-sm font-semibold text-white transition hover:bg-primary/90">
                              Leia mais
                            </span>
                          </Link>
                        </article>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 text-center sm:mt-14">
          <Link
            to="/imprensa/noticias"
            className="inline-block rounded-md border-2 border-red-600 px-8 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white sm:text-base"
          >
            Leia todas as notícias
          </Link>
        </div>
      </div>
    </section>
  );
}
