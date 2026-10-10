import { useState, useRef, useMemo } from 'react';
import SEO from '@/components/SEO';
import PageHero, { PageHeroStats } from '@/components/block/page-hero';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Tag, ChevronRight, Filter, Newspaper, ChevronLeft } from 'lucide-react';
import {
  getPostCategory,
  getPostImage,
  stripHTML,
} from '@/services/wordpress/client';
import { usePosts } from '@/services/wordpress/hooks';
import type { WPPost } from '@/services/wordpress/types';

const IMG_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect width='400' height='200' fill='%23e5e7eb'%3E%3C/svg%3E";

interface Publication {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  tag: string;
  tagColor: string;
  href: string;
}

const PER_PAGE = 12;

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getTagColor(tagName: string) {
  const map: Record<string, string> = {
    'Notícias': 'bg-blue-500',
    'Institucional': 'bg-purple-500',
    'Cursos': 'bg-green-500',
    'Eventos': 'bg-orange-500',
  };
  return map[tagName] || 'bg-crfal-blue';
}

const filterTags = [
  { label: 'Todas', value: 'all', color: 'bg-crfal-blue' },
  { label: 'Notícias', value: 'Notícias', color: 'bg-blue-500' },
  { label: 'Institucional', value: 'Institucional', color: 'bg-purple-500' },
  { label: 'Cursos', value: 'Cursos', color: 'bg-green-500' },
  { label: 'Eventos', value: 'Eventos', color: 'bg-orange-500' },
];

function mapWPPost(post: WPPost): Publication {
  const categoryName = getPostCategory(post);
  return {
    id: `${post.newsSource}:${post.id}`,
    title: stripHTML(post.title.rendered),
    excerpt: stripHTML(post.excerpt.rendered),
    image: getPostImage(post) || IMG_FALLBACK,
    date: formatDate(post.date),
    tag: categoryName,
    tagColor: getTagColor(categoryName),
    href: `/imprensa/noticias/${post.slug}`,
  };
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-10 flex-wrap">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border border-crfal-gray-200 bg-white text-crfal-gray-600 hover:border-crfal-blue/40 hover:text-crfal-blue transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
        Anterior
      </button>

      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 py-2 text-crfal-gray-400 text-sm select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Página ${p}`}
            onClick={() => onPageChange(p as number)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
              p === page
                ? 'bg-crfal-blue text-white shadow-card'
                : 'border border-crfal-gray-200 bg-white text-crfal-gray-600 hover:border-crfal-blue/40 hover:text-crfal-blue'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border border-crfal-gray-200 bg-white text-crfal-gray-600 hover:border-crfal-blue/40 hover:text-crfal-blue transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Próxima
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function NewsPage() {
  const [activeTag, setActiveTag] = useState('all');
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, refetch } = usePosts(page, PER_PAGE);
  const gridRef = useRef<HTMLDivElement>(null);

  const publications = useMemo(() => data?.posts.map(mapWPPost) ?? [], [data]);
  const totalPages = data?.totalPages ?? 1;
  const totalPosts = data?.total ?? 0;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setActiveTag('all');
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const filteredPublications =
    activeTag === 'all'
      ? publications
      : publications.filter((pub) => pub.tag === activeTag);

  return (
    <div className="min-h-screen bg-crfal-gray-50">
      <SEO
        title="Notícias"
        description="Fique por dentro das últimas notícias e comunicados do CRFAL — Conselho Regional de Farmácia do Estado de Alagoas."
        path="/imprensa/noticias"
      />
      <PageHero
        breadcrumb={[
          { label: 'Início', href: '/' },
          { label: 'Imprensa' },
          { label: 'Notícias' },
        ]}
        title="Notícias"
        aside={<PageHeroStats items={[{ value: totalPosts || publications.length, label: 'Notícias publicadas' }]} />}
      />

      <div className="container-crfal py-10 md:py-16" ref={gridRef}>
        <div className="flex flex-wrap gap-2 mb-10">
          <div className="flex items-center gap-2 mr-2 text-crfal-gray-500">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtrar:</span>
          </div>
          {filterTags.map((tag) => (
            <button
              key={tag.value}
              onClick={() => setActiveTag(tag.value)}
              aria-pressed={activeTag === tag.value}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTag === tag.value
                  ? `${tag.color} text-white shadow-card`
                  : 'bg-white border border-crfal-gray-200 text-crfal-gray-600 hover:border-crfal-blue/30 hover:text-crfal-blue'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-crfal-gray-500">
            <div className="animate-spin w-10 h-10 border-4 border-crfal-blue border-t-transparent rounded-full mx-auto mb-4"></div>
            Carregando notícias...
          </div>
        ) : isError ? (
          <div className="max-w-xl mx-auto bg-white rounded-xl border border-red-200 p-8 text-center">
            <p className="text-red-600 mb-4">Não foi possível carregar as notícias agora.</p>
            <p className="text-crfal-gray-500 text-sm mb-6">
              Verifique sua conexão ou tente novamente em instantes.
            </p>
            <button onClick={() => refetch()} className="btn-outline text-sm">
              Tentar novamente
            </button>
          </div>
        ) : filteredPublications.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-neutral-700 mb-2">Nenhuma notícia encontrada</h3>
            <p className="text-crfal-gray-500 text-sm">Não há notícias na categoria selecionada.</p>
          </div>
        ) : (
          <div className={isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <div className="grid gap-5 xl:grid-cols-2" aria-busy={isFetching}>
              {filteredPublications.map((pub) => (
                <article key={pub.id} className="h-full">
                  <Link
                    to={pub.href}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-crfal-gray-200 bg-white transition-colors hover:border-crfal-blue/40 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-4 motion-reduce:transition-none sm:flex-row"
                  >
                    <div className="relative aspect-video shrink-0 overflow-hidden bg-crfal-gray-100 sm:aspect-auto sm:w-48 lg:w-56">
                      <img
                        src={pub.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain sm:absolute sm:inset-0"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = IMG_FALLBACK; }}
                      />
                    </div>
                    <div className="flex flex-1 flex-col items-start p-5 sm:p-6">
                      <span className={`mb-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white ${pub.tagColor}`}>
                        <Tag className="h-3 w-3" aria-hidden="true" />
                        {pub.tag}
                      </span>
                      <h2 className="mb-3 text-lg font-bold leading-snug text-crfal-blue-dark group-hover:text-crfal-blue">
                        {pub.title}
                      </h2>
                      <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-crfal-gray-600">{pub.excerpt}</p>
                      <div className="mt-auto flex w-full flex-wrap items-center justify-between gap-3 border-t border-crfal-gray-100 pt-4">
                        <span className="inline-flex items-center gap-2 text-xs text-crfal-gray-500">
                          <Calendar className="h-4 w-4" aria-hidden="true" />
                          {pub.date}
                        </span>
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-crfal-blue">
                          Ler notícia <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>
    </div>
  );
}
