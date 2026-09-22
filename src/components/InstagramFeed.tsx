import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Instagram, Layers, Play } from 'lucide-react';
import { INSTAGRAM_FEED_URL, SOCIAL_LINKS } from '@/config/site';
import { useInstagramFeed } from '@/services/wordpress/hooks';
import type { CRFInstagramPost } from '@/services/wordpress/types';

interface InstagramFeedProps {
  /** Título da seção. */
  title?: string;
  /** Texto de apoio abaixo do título. */
  description?: string;
}

const INSTAGRAM_PROFILE_URL =
  SOCIAL_LINKS.find((social) => social.label === 'Instagram')?.href ??
  'https://www.instagram.com/crfal';

/**
 * Carrossel das publicações do Instagram.
 *
 * Os posts vêm da rota `crfal/v1/instagram` (que lê o cache do Smash Balloon no
 * WordPress). Se a rota ainda não existir ou falhar, a seção cai no iframe do
 * feed hospedado no WordPress — assim o site nunca fica sem a seção.
 */
export default function InstagramFeed({
  title = 'Acompanhe no Instagram',
  description = 'Novidades, eventos e ações do CRF-AL no dia a dia da profissão farmacêutica.',
}: InstagramFeedProps) {
  const { data: posts, isPending } = useInstagramFeed();

  const items = posts ?? [];
  const hasPosts = items.length > 0;
  const showIframeFallback = !hasPosts && !isPending;

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

        {hasPosts && <PostsCarousel posts={items} />}

        {isPending && !hasPosts && (
          <div className="mx-auto flex max-w-5xl gap-4 overflow-hidden" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="hidden aspect-square w-[78%] shrink-0 animate-pulse rounded-2xl bg-crfal-gray-100 sm:block sm:w-[300px]"
              />
            ))}
          </div>
        )}

        {showIframeFallback && (
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-crfal-gray-200">
            <iframe
              src={INSTAGRAM_FEED_URL}
              title="Feed do Instagram do CRF-AL"
              loading="lazy"
              className="block h-[360px] w-full border-0 sm:h-[440px] lg:h-[520px]"
            />
          </div>
        )}

        <div className="mt-8 text-center">
          <a
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-crfal-blue transition-colors hover:text-crfal-blue-light"
          >
            Ver mais no Instagram
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

const TYPE_LABELS = {
  video: 'Vídeo',
  carousel: 'Carrossel',
} as const;

function PostsCarousel({ posts }: { posts: CRFInstagramPost[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [reduceMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const updateEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    setAtStart(track.scrollLeft <= 2);
    setAtEnd(track.scrollLeft >= maxScroll - 2);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updateEdges();
    track.addEventListener('scroll', updateEdges, { passive: true });
    window.addEventListener('resize', updateEdges);
    return () => {
      track.removeEventListener('scroll', updateEdges);
      window.removeEventListener('resize', updateEdges);
    };
  }, [updateEdges]);

  const scrollByCard = useCallback(
    (direction: 1 | -1) => {
      const track = trackRef.current;
      if (!track) return;
      const card = track.firstElementChild as HTMLElement | null;
      const gap = 16;
      const amount = card ? card.offsetWidth + gap : track.clientWidth * 0.8;
      track.scrollBy({ left: amount * direction, behavior: reduceMotion ? 'auto' : 'smooth' });
    },
    [reduceMotion]
  );

  const arrowClass =
    'flex h-11 w-11 items-center justify-center rounded-full border border-crfal-gray-200 bg-white text-crfal-blue shadow-card transition-all hover:bg-crfal-blue hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-crfal-blue';

  return (
    <div className="relative">
      <div className="mb-4 flex justify-end gap-2 sm:mb-5">
        <button type="button" onClick={() => scrollByCard(-1)} disabled={atStart} className={arrowClass} aria-label="Publicações anteriores">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button type="button" onClick={() => scrollByCard(1)} disabled={atEnd} className={arrowClass} aria-label="Próximas publicações">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div
        ref={trackRef}
        tabIndex={0}
        role="region"
        aria-label="Publicações do Instagram"
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue-light"
      >
        {posts.map((post, index) => {
          const typeLabel = post.type !== 'image' ? TYPE_LABELS[post.type] : null;
          return (
            <a
              key={post.id || index}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-[78%] shrink-0 snap-start overflow-hidden rounded-2xl border border-crfal-gray-200 bg-crfal-gray-50 sm:w-[300px]"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={post.image}
                  alt={post.caption ? post.caption.slice(0, 120) : 'Publicação do CRF-AL no Instagram'}
                  loading={index < 3 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {typeLabel && (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                  {post.type === 'video' ? <Play className="h-3 w-3" /> : <Layers className="h-3 w-3" />}
                  {typeLabel}
                </span>
              )}

              {post.caption && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 text-xs leading-snug text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="line-clamp-2">{post.caption}</span>
                </span>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
