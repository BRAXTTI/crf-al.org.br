import { Instagram } from 'lucide-react';
import { INSTAGRAM_FEED_URL } from '@/config/site';

interface InstagramFeedProps {
  /** Título da seção. */
  title?: string;
  /** Texto de apoio abaixo do título. */
  description?: string;
  /** Altura do iframe (px). */
  height?: number;
}

/**
 * Exibe o feed do Instagram (Smash Balloon, hospedado no WordPress) via iframe.
 * O shortcode `[instagram-feed feed=1]` só roda no WordPress, por isso o embed.
 */
export default function InstagramFeed({
  title = 'Acompanhe no Instagram',
  description = 'Novidades, eventos e ações do CRF-AL no dia a dia da profissão farmacêutica.',
  height = 640,
}: InstagramFeedProps) {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-white" aria-labelledby="instagram-title">
      <div className="container-crfal">
        <div className="mb-8 text-center">
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

        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-crfal-gray-200 shadow-card">
          <iframe
            src={INSTAGRAM_FEED_URL}
            title="Feed do Instagram do CRF-AL"
            loading="lazy"
            className="w-full border-0"
            style={{ height }}
          />
        </div>
      </div>
    </section>
  );
}
