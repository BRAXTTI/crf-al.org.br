import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const publications = useMemo(() => data?.posts.map(mapWPPost) ?? [], [data]);

  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [updateArrows, publications.length]);

  const scrollByCard = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.querySelector('a');
    const gap = 16;
    const step = first ? first.getBoundingClientRect().width + gap : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  const arrowClass =
    'absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-crfal-gray-200 bg-white/95 text-crfal-blue shadow-card transition-all hover:bg-white hover:scale-105 disabled:pointer-events-none disabled:opacity-0 sm:flex';

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
          <div className="relative mx-auto max-w-5xl">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={!canPrev}
              aria-label="Notícias anteriores"
              className={`${arrowClass} left-0 lg:-left-4`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div
              ref={trackRef}
              className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
              role="region"
              aria-label="Notícias do CRF-AL"
            >
              {publications.map((pub) => (
                <Link
                  key={pub.id}
                  to={`/imprensa/noticias/${pub.id}`}
                  className="group block w-[72%] shrink-0 snap-start text-center sm:w-[42%] lg:w-[23%]"
                >
                  <div className="relative aspect-video overflow-hidden rounded-xl border border-crfal-gray-200 bg-crfal-gray-100">
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
                      className="relative z-10 h-full w-full object-contain transition-transform duration-500 ease-out [@media(hover:hover)]:group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mx-auto mt-4 max-w-md text-base font-bold leading-snug text-crfal-blue sm:text-lg">
                    {pub.title}
                  </h3>
                  <span className="mt-3 inline-block rounded-md bg-primary px-6 py-2 text-sm font-semibold text-white transition hover:bg-primary/90">
                    Leia mais
                  </span>
                </Link>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={!canNext}
              aria-label="Próximas notícias"
              className={`${arrowClass} right-0 lg:-right-4`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
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
