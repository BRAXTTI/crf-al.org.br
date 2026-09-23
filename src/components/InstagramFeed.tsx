import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Instagram } from 'lucide-react';
import { INSTAGRAM_PROFILE_URL } from '@/config/site';

interface InstagramItem {
  link: string;
  image: string;
}

interface InstagramFeedProps {
  /** Título da seção. */
  title?: string;
  /** Texto de apoio abaixo do título. */
  description?: string;
}

async function fetchInstagram(): Promise<InstagramItem[]> {
  const res = await fetch('/api/instagram');
  if (!res.ok) throw new Error('Falha ao carregar o Instagram');
  const data = (await res.json()) as { items?: InstagramItem[] };
  return Array.isArray(data.items) ? data.items : [];
}

/**
 * Carrossel nativo do Instagram (rolagem horizontal), alimentado pela Pages
 * Function `/api/instagram` (que lê o feed do Smash Balloon no WordPress).
 * Se a API falhar, mostra um botão para o perfil — nunca uma grade quebrada.
 */
export default function InstagramFeed({
  title = 'Acompanhe no Instagram',
  description = 'Novidades, eventos e ações do CRF-AL no dia a dia da profissão farmacêutica.',
}: InstagramFeedProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['instagram-feed'],
    queryFn: fetchInstagram,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const items = data ?? [];
  const showCarousel = !isError && items.length > 0;

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
  }, [updateArrows, items.length]);

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
    <section className="bg-white py-10 sm:py-14 md:py-20" aria-labelledby="instagram-title">
      <div className="container-crfal">
        <div className="mb-6 text-center sm:mb-8">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-crfal-blue-lighter px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-crfal-blue">
            <Instagram className="h-3.5 w-3.5" />
            Redes sociais
          </span>
          <h2
            id="instagram-title"
            className="font-display text-2xl font-bold text-neutral-800 sm:text-3xl md:text-4xl"
          >
            {title}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-crfal-gray-600 sm:text-base">
            {description}
          </p>
        </div>

        {isLoading ? (
          <div className="mx-auto flex max-w-5xl gap-4 overflow-hidden" aria-hidden>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square w-[72%] shrink-0 animate-pulse rounded-xl bg-crfal-gray-100 sm:w-[42%] lg:w-[23%]"
              />
            ))}
          </div>
        ) : showCarousel ? (
          <div className="relative mx-auto max-w-5xl">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={!canPrev}
              aria-label="Publicações anteriores"
              className={`${arrowClass} left-0 lg:-left-4`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div
              ref={trackRef}
              className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
              role="region"
              aria-label="Publicações do Instagram do CRF-AL"
            >
              {items.map((item) => (
                <a
                  key={item.link}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square w-[72%] shrink-0 snap-start overflow-hidden rounded-xl border border-crfal-gray-200 sm:w-[42%] lg:w-[23%]"
                >
                  <img
                    src={item.image}
                    alt="Publicação do Instagram do CRF-AL"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-crfal-blue/0 opacity-0 transition-all duration-300 [@media(hover:hover)]:group-hover:bg-crfal-blue/40 [@media(hover:hover)]:group-hover:opacity-100">
                    <Instagram className="h-6 w-6 text-white" />
                  </span>
                </a>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={!canNext}
              aria-label="Próximas publicações"
              className={`${arrowClass} right-0 lg:-right-4`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <a
              href={INSTAGRAM_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-crfal-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-crfal-blue-dark"
            >
              <Instagram className="h-4 w-4" />
              Ver no Instagram
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
