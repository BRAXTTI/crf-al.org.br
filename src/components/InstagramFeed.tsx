import { Instagram } from 'lucide-react';
import { INSTAGRAM_FEED_URL } from '@/config/site';

interface InstagramFeedProps {
  /** Título da seção. */
  title?: string;
  /** Texto de apoio abaixo do título. */
  description?: string;
}

/**
 * Exibe o feed do Instagram (Smash Balloon, hospedado no WordPress) via iframe.
 * O shortcode `[instagram-feed feed=1]` só roda no WordPress, por isso o embed.
 * Para mostrar apenas as fotos (sem cabeçalho/bio), desligue o "Header" nas
 * configurações do feed no WordPress.
 */
export default function InstagramFeed({
  title = 'Acompanhe no Instagram',
  description = 'Novidades, eventos e ações do CRF-AL no dia a dia da profissão farmacêutica.',
}: InstagramFeedProps) {
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

        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-crfal-gray-200">
          <iframe
            src={INSTAGRAM_FEED_URL}
            title="Feed do Instagram do CRF-AL"
            loading="lazy"
            className="block h-[360px] w-full border-0 sm:h-[440px] lg:h-[520px]"
          />
        </div>
      </div>
    </section>
  );
}
