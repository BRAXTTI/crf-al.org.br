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
  const [activeIndex, setActiveIndex] = useState(0);
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
  const currentPage = Math.min(page, totalPages - 1);

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

  const prev = useCallback(() => goTo(currentPage - 1), [goTo, currentPage]);
  const next = useCallback(() => goTo(currentPage + 1), [goTo, currentPage]);

  const getStep = useCallback(() => {
    const children = trackRef.current?.firstElementChild?.children;
    if (!children || children.length < 2) return 0;
    return (children[1] as HTMLElement).offsetLeft - (children[0] as HTMLElement).offsetLeft;
  }, []);

  const goToIndex = useCallback(
    (index: number) => {
      const track = trackRef.current;
      const step = getStep();
      if (!track || step <= 0) return;
      track.scrollTo({ left: index * step, behavior: 'smooth' });
    },
    [getStep]
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const step = getStep();
      if (step <= 0) {
        setActiveIndex(0);
        return;
      }
      const index = Math.round(track.scrollLeft / step);
      setActiveIndex(Math.max(0, Math.min(publications.length - 1, index)));
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => track.removeEventListener('scroll', onScroll);
  }, [getStep, publications.length]);

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
              disabled={currentPage === 0}
              className="absolute left-2 top-[128px] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-crfal-gray-dark/80 text-white shadow-lg transition hover:bg-crfal-gray-dark disabled:pointer-events-none disabled:opacity-0 sm:flex lg:left-4"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Próximas notícias"
              disabled={currentPage >= totalPages - 1}
              className="absolute right-2 top-[128px] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-crfal-gray-dark/80 text-white shadow-lg transition hover:bg-crfal-gray-dark disabled:pointer-events-none disabled:opacity-0 sm:flex lg:right-4"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div
              ref={trackRef}
              className="overflow-x-auto scrollbar-none scroll-smooth snap-x snap-mandatory overscroll-x-contain sm:overflow-hidden sm:snap-none"
            >
              <div
                className="flex gap-6 transition-transform duration-500 ease-out sm:gap-0"
                style={{ transform: `translateX(-${currentPage * 100}%)` }}
              >
                {Array.from({ length: totalPages }).map((_, groupIndex) => {
                  const group = publications.slice(groupIndex * perView, (groupIndex + 1) * perView);
                  return (
                    <div key={groupIndex} className="flex w-full shrink-0 snap-center snap-always gap-6">
                      {group.map((pub) => (
                        <article key={pub.id} className="w-full shrink-0 sm:w-1/2 lg:w-auto lg:flex-1">
                          <Link to={`/imprensa/noticias/${pub.id}`} className="group block text-center">
                            <div className="relative aspect-video overflow-hidden rounded-xl bg-crfal-gray-100">
                              <img
                                src={pub.image}
                                alt=""
                                aria-hidden="true"
                                className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl opacity-70"
                              />
                              <img
                                src={pub.image}
                                alt={pub.title}
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = IMG_FALLBACK;
                                }}
                                className="relative z-10 h-full w-full object-contain"
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

            <div className="mt-6 flex justify-center gap-2 sm:hidden">
              {publications.map((pub, index) => (
                <button
                  key={pub.id}
                  type="button"
                  onClick={() => goToIndex(index)}
                  aria-label={`Ir para a notícia ${index + 1}`}
                  aria-current={index === activeIndex}
                  className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
                    index === activeIndex ? 'bg-crfal-blue' : 'bg-crfal-gray-300 hover:bg-crfal-gray-400'
                  }`}
                />
              ))}
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
