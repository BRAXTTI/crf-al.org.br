import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import SEO from '@/components/SEO';
import { LOGO_IMAGE, SITE_NAME, SITE_URL } from '@/config/site';
import {
  getPostAuthor,
  getPostCategory,
  getPostImage,
  sanitizeWP,
  stripHTML,
} from '@/services/wordpress/client';
import { usePost, usePostBySlug, useRelatedPosts } from '@/services/wordpress/hooks';
import ShareButtons from '../components/ShareButtons';
import { ArrowLeft, ChevronRight } from 'lucide-react';

interface RelatedItem {
  id: string;
  slug: string;
  title: string;
  date: string;
}

const IMG_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect width='400' height='200' fill='%23e5e7eb'%3E%3C/svg%3E";

function formatarData(dataISO: string) {
  return new Date(dataISO).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/** "YYYY-MM-DDTHH:mm:ss" (hora local do WP) → "DD/MM/YYYY - HH:mm". */
function formatarDataHoraPublicacao(dataISO: string) {
  const dia = dataISO.slice(0, 10).split('-').reverse().join('/');
  const hora = dataISO.slice(11, 16);
  return hora ? `${dia} - ${hora}` : dia;
}

export default function NewsDetailPage() {
  const { slug } = useParams();
  // Links antigos por ID (/imprensa/noticias/16193) são redirecionados para a
  // URL canônica por slug. Novos links já chegam com o slug da matéria.
  const isLegacyId = Boolean(slug && /^\d+$/.test(slug));
  const isInvalidSlug = !slug;

  const {
    data: slugPost,
    isLoading: isSlugLoading,
    isError: isSlugError,
    error: slugError,
    refetch: refetchSlug,
  } = usePostBySlug(isLegacyId ? '' : slug ?? '');
  const {
    data: idPost,
    isLoading: isIdLoading,
    isError: isIdError,
    error: idError,
    refetch: refetchId,
  } = usePost(isLegacyId ? Number(slug) : NaN);

  const post = isLegacyId ? idPost : slugPost;
  const isLoading = isLegacyId ? isIdLoading : isSlugLoading;
  const isError = isLegacyId ? isIdError : isSlugError;
  const error = isLegacyId ? idError : slugError;
  const refetch = isLegacyId ? refetchId : refetchSlug;

  const { data: relatedPosts } = useRelatedPosts(post?.slug ?? '', 3);

  const related: RelatedItem[] =
    relatedPosts?.map((item) => ({
      id: `${item.newsSource}:${item.id}`,
      slug: item.slug,
      title: stripHTML(item.title.rendered),
      date: formatarData(item.date),
    })) ?? [];

  const postImage = post ? getPostImage(post) : undefined;
  const featuredImage = postImage || IMG_FALLBACK;
  const categoria = (post && getPostCategory(post)) || 'Notícia';
  const autor = post ? getPostAuthor(post) : undefined;
  const canonicalUrl = `${SITE_URL}/imprensa/noticias/${post?.slug ?? slug ?? ''}`;
  const standfirst = useMemo(() => {
    if (!post) return '';
    const excerpt = stripHTML(post.excerpt?.rendered ?? '');
    // O WordPress pode gerar o resumo a partir da abertura da matéria,
    // inclusive truncando-o com reticências. Nesse caso, exibir só no corpo.
    const normalize = (text: string) => text.normalize('NFKC').toLocaleLowerCase('pt-BR').replace(/[^\p{L}\p{N}]/gu, '');
    const normalizedExcerpt = normalize(excerpt);
    const normalizedContent = normalize(stripHTML(post.content?.rendered ?? ''));
    return normalizedExcerpt && !normalizedContent.startsWith(normalizedExcerpt) ? excerpt : '';
  }, [post]);

  const jsonLd = useMemo(() => {
    if (!post) return undefined;
    const headline = stripHTML(post.title.rendered);
    const description = stripHTML(post.excerpt?.rendered ?? '').slice(0, 160);
    const canonical = `${SITE_URL}/imprensa/noticias/${post.slug}`;
    return {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline,
      description: description || undefined,
      image: featuredImage !== IMG_FALLBACK ? [featuredImage] : undefined,
      datePublished: post.date,
      dateModified: post.modified ?? post.date,
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      articleSection: categoria,
      inLanguage: 'pt-BR',
      author: { '@type': 'Organization', name: SITE_NAME },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: { '@type': 'ImageObject', url: LOGO_IMAGE },
      },
    };
  }, [post, featuredImage, categoria]);

  const errorMessage = isInvalidSlug
    ? 'Notícia inválida.'
    : isError
      ? error instanceof Error
        ? error.message
        : 'Falha ao carregar notícia.'
      : null;

  if (isLegacyId && post) {
    return <Navigate to={`/imprensa/noticias/${post.slug}`} replace />;
  }

  return (
    <div className="min-h-screen bg-crfal-gray-50 ">
      <SEO
        title={post ? stripHTML(post.title.rendered) : 'Notícia'}
        description={
          post
            ? stripHTML(post.excerpt.rendered).slice(0, 160)
            : 'Leia as últimas notícias do CRFAL — Conselho Regional de Farmácia do Estado de Alagoas.'
        }
        path={`/imprensa/noticias/${post?.slug ?? slug ?? ''}`}
        image={featuredImage !== IMG_FALLBACK ? featuredImage : undefined}
        type="article"
        publishedAt={post?.date}
        modifiedAt={post?.modified}
        jsonLd={jsonLd}
      />
      {/* Cabeçalho compacto (breadcrumb + voltar) — sem hero, conteúdo perto da navbar */}
      <div className="pt-[calc(var(--page-header-offset)+0.75rem)]">
        <div className="container-crfal flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs text-crfal-gray-500 sm:text-sm"
          >
            <Link to="/" className="transition-colors hover:text-crfal-blue">Início</Link>
            <ChevronRight className="h-4 w-4" />
            <span>Imprensa</span>
            <ChevronRight className="h-4 w-4" />
            <Link to="/imprensa/noticias" className="transition-colors hover:text-crfal-blue">Notícias</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-crfal-blue-dark">Matéria</span>
          </nav>

          <Link
            to="/imprensa/noticias"
            className="inline-flex items-center gap-2 text-sm font-medium text-crfal-blue transition-colors hover:text-crfal-blue-dark"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para notícias
          </Link>
        </div>
      </div>

      {(isLoading || errorMessage) && (
        <div className="container-crfal py-8 md:py-12">
          {isLoading && (
            <div className="bg-white  rounded-xl border border-crfal-gray-200  p-10 text-center text-crfal-gray-500">
              <div className="animate-spin w-8 h-8 border-4 border-crfal-blue border-t-transparent rounded-full mx-auto mb-4" />
              Carregando matéria...
            </div>
          )}

          {errorMessage && (
            <div className="bg-white  rounded-xl border border-red-200  p-8">
              <p className="text-red-600 mb-4">{errorMessage}</p>
              <div className="flex flex-wrap gap-3">
                {isError && (
                  <button onClick={() => refetch()} className="btn-outline text-sm">
                    Tentar novamente
                  </button>
                )}
                <Link to="/imprensa/noticias" className="btn-outline text-sm">Voltar para notícias</Link>
              </div>
            </div>
          )}
        </div>
      )}

      {!isLoading && !errorMessage && post && (
        <>
          {/* Cabeçalho editorial: categoria, título, linha de destaque e metadados */}
          <header className="border-b border-crfal-gray-200 bg-white">
            <div className="container-crfal py-6 md:py-8">
              <div className="mx-auto max-w-4xl text-center">
                <span className="inline-flex items-center rounded-full bg-crfal-gold px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-crfal-blue-dark">
                  {categoria}
                </span>
                <h1
                  className="mt-3 font-display text-2xl font-bold leading-[1.15] text-crfal-blue-dark sm:text-3xl md:text-4xl"
                  dangerouslySetInnerHTML={{ __html: sanitizeWP(post.title.rendered) }}
                />
                {standfirst && (
                  <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-crfal-gray-600 sm:text-base">
                    {standfirst}
                  </p>
                )}
              </div>
            </div>

            <div className="h-1 w-full bg-crfal-gold" />

            <div className="container-crfal py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {autor && (
                    <p className="text-xs font-bold uppercase tracking-wide text-crfal-blue-dark sm:text-sm">
                      {autor}
                    </p>
                  )}
                  <p className="text-xs text-crfal-gray-500 sm:text-sm">
                    Publicado em {formatarDataHoraPublicacao(post.date)}
                  </p>
                </div>
                <ShareButtons url={canonicalUrl} title={stripHTML(post.title.rendered)} />
              </div>
            </div>
          </header>

          <div className="container-crfal py-6 md:py-8">
            <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
              {/* Article */}
              <main className="lg:col-span-8">
                <article className="bg-white  rounded-xl border border-crfal-gray-200  overflow-hidden">

                  <div className="p-4 sm:p-6">
                    <div
                    className="text-neutral-700  leading-relaxed text-sm sm:text-base
                      [&_p]:mb-4
                      [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-neutral-800 [&_h2]: [&_h2]:mt-8 [&_h2]:mb-3
                      [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-neutral-800 [&_h3]: [&_h3]:mt-6 [&_h3]:mb-2
                      [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4
                      [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4
                      [&_li]:mb-2
                      [&_a]:text-crfal-blue [&_a]:underline
                      [&_img]:rounded-xl [&_img]:my-4 [&_img]:w-full"
                    dangerouslySetInnerHTML={{ __html: sanitizeWP(post.content?.rendered ?? '') }}
                  />
                </div>
              </article>
            </main>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <div className="space-y-4 lg:sticky lg:top-[calc(var(--header-offset)+1rem)]">
                {/* Related posts */}
                <div className="bg-white  rounded-xl border border-crfal-gray-200  p-4">
                  <h3 className="text-base font-bold text-neutral-800  mb-3">Outras Notícias</h3>
                  {related.length === 0 ? (
                    <p className="text-sm text-crfal-gray-500 ">Não há outras matérias para exibir agora.</p>
                  ) : (
                    <div className="space-y-2">
                      {related.map((item) => (
                        <Link
                          key={item.id}
                          to={`/imprensa/noticias/${item.slug}`}
                          className="block p-3 rounded-xl border border-crfal-gray-200  hover:border-crfal-blue/40 transition-colors"
                        >
                          <p className="text-xs text-crfal-gray-500  mb-1">{item.date}</p>
                          <p className="text-sm font-semibold text-neutral-800  line-clamp-2">{item.title}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </aside>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
