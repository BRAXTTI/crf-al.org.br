import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getPostCategory, getPostImage, stripHTML } from '@/services/wordpress/client';
import { usePosts } from '@/services/wordpress/hooks';
import type { WPPost } from '@/services/wordpress/types';

const IMG_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='600' height='400' fill='%23E6F0F8'/%3E%3C/svg%3E";
const GENERIC_CATEGORIES = new Set(['blog', 'geral', 'notícias', 'sem categoria']);
const focusClass = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-4';
const motionClass = 'transition duration-300 motion-reduce:transition-none';

function handleImageError(event: React.SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = IMG_FALLBACK;
}

/** Imagem inteira (as artes têm texto e proporções variadas) sobre um fundo desfocado da própria imagem. */
function NewsImage({ post, className = '' }: { post: WPPost; className?: string }) {
  const src = getPostImage(post) || IMG_FALLBACK;
  return (
    <div className={`relative isolate overflow-hidden bg-crfal-blue-dark ${className}`}>
      <img src={src} alt="" aria-hidden="true" loading="lazy" decoding="async" onError={handleImageError} className="absolute inset-0 -z-10 h-full w-full scale-150 object-cover opacity-60 blur-2xl" />
      <img src={src} alt="" loading="lazy" decoding="async" onError={handleImageError} className={`h-full w-full object-contain drop-shadow-lg group-hover:scale-[1.03] ${motionClass}`} />
    </div>
  );
}

function NewsDate({ date }: { date: string }) {
  return (
    <time dateTime={date} className="text-[11px] font-semibold uppercase tracking-[0.12em] text-crfal-gray-600">
      {new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
    </time>
  );
}

function NewsSkeleton() {
  return (
    <div role="status" aria-label="Carregando notícias" className="grid animate-pulse gap-8 motion-reduce:animate-none lg:grid-cols-2 lg:gap-10">
      <div className="overflow-hidden rounded-xl border border-crfal-gray-200 bg-white">
        <div className="aspect-16/10 bg-crfal-gray-200" />
        <div className="space-y-3 p-8"><div className="h-3 w-32 rounded bg-crfal-gray-200" /><div className="h-6 w-4/5 rounded bg-crfal-gray-200" /><div className="h-4 w-full rounded bg-crfal-gray-100" /><div className="h-4 w-2/3 rounded bg-crfal-gray-100" /></div>
      </div>
      <div className="space-y-4">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex gap-5 rounded-xl bg-white p-3"><div className="aspect-4/3 w-28 shrink-0 rounded-lg bg-crfal-gray-200 sm:w-36" /><div className="flex-1 space-y-3 py-2"><div className="h-3 w-24 rounded bg-crfal-gray-200" /><div className="h-4 w-full rounded bg-crfal-gray-200" /><div className="h-4 w-3/4 rounded bg-crfal-gray-200" /></div></div>
        ))}
      </div>
      <span className="sr-only">Carregando notícias...</span>
    </div>
  );
}

export default function Publications() {
  const { data, isLoading, isError, refetch } = usePosts(1, 5);
  const [featured, ...remaining] = data?.posts ?? [];
  const featuredCategory = featured ? getPostCategory(featured) : '';
  const showCategory = featuredCategory && !GENERIC_CATEGORIES.has(featuredCategory.toLocaleLowerCase('pt-BR'));

  return (
    <section id="noticias" className="py-2 sm:py-3" aria-labelledby="home-news-title">
      <div className="container-crfal">
        <div className="section-panel">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]">Informação para a profissão</p>
            <h2 id="home-news-title" className="mt-2 text-[26px] font-bold leading-tight tracking-tight text-crfal-blue sm:text-[32px]">Últimas notícias</h2>
            <span aria-hidden="true" className="mt-3 block h-0.5 w-10 rounded-full bg-crfal-gold" />
          </div>
          <Link to="/imprensa/noticias" className={`group inline-flex min-h-11 items-center gap-2 self-start rounded-md text-sm font-semibold text-crfal-blue hover:text-crfal-blue-light sm:self-auto ${focusClass}`}>
            Todas as notícias
            <ArrowRight className={`h-4 w-4 group-hover:translate-x-1 ${motionClass}`} aria-hidden="true" />
          </Link>
        </div>

        {isLoading ? (
          <NewsSkeleton />
        ) : isError ? (
          <div className="rounded-xl border border-crfal-gray-200 bg-white p-10 text-center"><p role="alert" className="text-crfal-gray-700">Não foi possível carregar as notícias.</p><button onClick={() => refetch()} className="btn-outline mt-4">Tentar novamente</button></div>
        ) : !featured ? (
          <p className="py-16 text-center text-crfal-gray-600">Nenhuma notícia publicada no momento.</p>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            <article>
              <Link to={`/imprensa/noticias/${featured.slug}`} className={`group flex h-full flex-col overflow-hidden rounded-xl border border-crfal-gray-200 bg-white shadow-xs hover:-translate-y-0.5 hover:shadow-xl hover:shadow-crfal-blue/10 motion-reduce:hover:translate-y-0 ${motionClass} ${focusClass}`}>
                <div className="relative">
                  <NewsImage post={featured} className="aspect-16/10" />
                  <span className="absolute left-4 top-4 glass-chip rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-crfal-gold ring-1 ring-crfal-gold/40">Em destaque</span>
                </div>
                <div className="flex flex-1 flex-col items-start border-t-2 border-crfal-gold p-6 sm:p-8">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <NewsDate date={featured.date} />
                    {showCategory && <span className="rounded-full bg-crfal-blue-lighter px-3 py-1 text-xs font-semibold text-crfal-blue">{featuredCategory}</span>}
                  </div>
                  <h3 className="text-[22px] font-bold leading-snug tracking-tight text-crfal-blue-dark group-hover:text-crfal-blue sm:text-[26px]">{stripHTML(featured.title.rendered)}</h3>
                  <p className="mt-4 line-clamp-3 text-[15px] leading-relaxed text-crfal-gray-600">{stripHTML(featured.excerpt.rendered)}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold text-crfal-blue">
                    Ler notícia completa
                    <ArrowRight className={`h-4 w-4 group-hover:translate-x-1 group-hover:text-[#8A6A12] ${motionClass}`} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </article>

            <ul className="flex flex-col divide-y divide-crfal-gray-200">
              {remaining.map((post) => (
                <li key={`${post.newsSource}:${post.id}`} className="flex flex-1 py-2 first:pt-0 last:pb-0">
                  <article className="w-full">
                    <Link to={`/imprensa/noticias/${post.slug}`} className={`group -mx-3 flex h-full items-center gap-4 rounded-xl border border-transparent p-3 hover:border-crfal-gray-200 hover:bg-white hover:shadow-md hover:shadow-crfal-blue/5 sm:gap-5 ${motionClass} ${focusClass}`}>
                      <NewsImage post={post} className="aspect-4/3 w-28 shrink-0 rounded-lg sm:w-36" />
                      <div className="min-w-0 flex-1">
                        <NewsDate date={post.date} />
                        <h3 className="mt-1.5 line-clamp-3 text-[15px] font-bold leading-snug text-crfal-blue-dark group-hover:text-crfal-blue sm:text-base">{stripHTML(post.title.rendered)}</h3>
                      </div>
                      <ArrowRight className={`hidden h-5 w-5 shrink-0 text-crfal-gray-400 opacity-0 group-hover:text-[#8A6A12] group-hover:opacity-100 group-focus-visible:opacity-100 sm:block ${motionClass}`} aria-hidden="true" />
                    </Link>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        )}
        </div>
      </div>
    </section>
  );
}
