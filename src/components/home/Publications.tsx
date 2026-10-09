import { Link } from 'react-router-dom';
import { ArrowRight, Newspaper } from 'lucide-react';
import { getPostCategory, getPostImage, stripHTML } from '@/services/wordpress/client';
import { usePosts } from '@/services/wordpress/hooks';
import type { WPPost } from '@/services/wordpress/types';

const IMG_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='600' height='400' fill='%23E6F0F8'/%3E%3C/svg%3E";
const focusClass = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-4';

function NewsImage({ post, className }: { post: WPPost; className: string }) {
  return <img src={getPostImage(post) || IMG_FALLBACK} alt="" loading="lazy" decoding="async" className={className} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = IMG_FALLBACK; }} />;
}

function NewsDate({ date }: { date: string }) {
  return <time dateTime={date} className="text-xs font-medium text-crfal-gray-600">{new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</time>;
}

export default function Publications() {
  const { data, isLoading, isError, refetch } = usePosts(1, 5);
  const [featured, ...remaining] = data?.posts ?? [];

  return (
    <section id="noticias" className="bg-crfal-gray-50 py-14 sm:py-20" aria-labelledby="home-news-title">
      <div className="container-crfal">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-crfal-gray-200 pb-6">
          <div>
            <span className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-crfal-blue"><Newspaper className="h-4 w-4" aria-hidden="true" /> Informação para a profissão</span>
            <h2 id="home-news-title" className="font-display text-3xl font-bold text-crfal-blue-dark sm:text-4xl">Últimas notícias</h2>
          </div>
          <Link to="/imprensa/noticias" className={`inline-flex min-h-11 items-center gap-3 rounded-md text-sm font-semibold text-crfal-blue hover:underline ${focusClass}`}>Todas as notícias <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
        {isLoading ? (
          <div role="status" className="flex min-h-80 items-center justify-center gap-3 text-crfal-gray-600"><span className="h-6 w-6 animate-spin rounded-full border-2 border-crfal-blue border-t-transparent motion-reduce:animate-none" />Carregando notícias...</div>
        ) : isError ? (
          <div className="rounded-xl border border-crfal-gray-200 bg-white p-10 text-center"><p role="alert" className="text-crfal-gray-700">Não foi possível carregar as notícias.</p><button onClick={() => refetch()} className="btn-outline mt-4">Tentar novamente</button></div>
        ) : !featured ? (
          <p className="py-16 text-center text-crfal-gray-600">Nenhuma notícia publicada no momento.</p>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            <article>
              <Link to={`/imprensa/noticias/${featured.slug}`} className={`group flex h-full flex-col overflow-hidden rounded-xl border border-crfal-gray-200 bg-white ${focusClass}`}>
                <div className="aspect-[16/9] overflow-hidden bg-crfal-blue-lighter"><NewsImage post={featured} className="h-full w-full object-contain" /></div>
                <div className="flex flex-1 flex-col items-start p-6 sm:p-8">
                  <div className="mb-4 flex flex-wrap items-center gap-3"><span className="rounded-full bg-crfal-blue-lighter px-3 py-1 text-xs font-bold text-crfal-blue">{getPostCategory(featured)}</span><NewsDate date={featured.date} /></div>
                  <h3 className="text-xl font-bold leading-snug text-crfal-blue-dark group-hover:text-crfal-blue sm:text-2xl">{stripHTML(featured.title.rendered)}</h3>
                  <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-crfal-gray-600">{stripHTML(featured.excerpt.rendered)}</p>
                  <span className="mt-6 inline-flex items-center gap-3 text-sm font-bold text-crfal-blue">Ler notícia <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
                </div>
              </Link>
            </article>
            <div className="divide-y divide-crfal-gray-200">
              {remaining.map((post) => (
                <article key={post.id} className="py-5 first:pt-0 last:pb-0">
                  <Link to={`/imprensa/noticias/${post.slug}`} className={`group flex items-start gap-4 rounded-md sm:gap-5 ${focusClass}`}>
                    <div className="aspect-square w-24 shrink-0 overflow-hidden rounded-lg bg-crfal-blue-lighter sm:w-32"><NewsImage post={post} className="h-full w-full object-contain" /></div>
                    <div className="min-w-0 flex-1">
                      <NewsDate date={post.date} />
                      <h3 className="mt-2 text-sm font-bold leading-relaxed text-crfal-blue-dark group-hover:text-crfal-blue sm:text-base">{stripHTML(post.title.rendered)}</h3>
                      <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-crfal-blue">Ler notícia <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
