import { Helmet } from 'react-helmet-async';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/config/site';

const BASE_URL = SITE_URL;
const DEFAULT_IMAGE = DEFAULT_OG_IMAGE;

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
  publishedAt?: string;
  modifiedAt?: string;
  /** Dados estruturados (schema.org) injetados como JSON-LD. */
  jsonLd?: Record<string, unknown>;
}

export default function SEO({
  title,
  description,
  path = '',
  image = DEFAULT_IMAGE,
  noindex = false,
  type = 'website',
  publishedAt,
  modifiedAt,
  jsonLd,
}: SEOProps) {
  const canonical = `${BASE_URL}${path}`;
  const fullTitle = `${title} | CRFAL`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:type" content={type} />
      {publishedAt && <meta property="article:published_time" content={publishedAt} />}
      {modifiedAt && <meta property="article:modified_time" content={modifiedAt} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd).replace(/</g, '\\u003c')}
        </script>
      )}
    </Helmet>
  );
}
