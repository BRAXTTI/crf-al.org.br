import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Tag, ChevronRight, Filter, Newspaper } from 'lucide-react';
import { WP_POSTS_URL } from '@/services/wordpress/client';

interface WPPost {
  id: number;
  date: string;
  link: string;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>;
    'wp:term'?: Array<Array<{ id: number; name: string }>>;
  };
}

interface Publication {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  tag: string;
  tagColor: string;
  href: string;
}

const WP_API_BASE = `${WP_POSTS_URL}&per_page=12`;

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
  const categoryName = post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Geral';
  return {
    id: post.id,
    title: post.title.rendered,
    excerpt: post.excerpt.rendered.replace(/<[^>]*>?/gm, '').slice(0, 100) + '...',
    image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/images/placeholder.jpg',
    date: formatDate(post.date),
    tag: categoryName,
    tagColor: getTagColor(categoryName),
    href: `/publicacao/${post.slug}`,
  };
}

function RevealCard({ children, index }: { children: React.ReactNode; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: isVisible ? `${(index % 3) * 120}ms` : '0ms' }}
    >
      {children}
    </div>
  );
}

export default function NewsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [activeTag, setActiveTag] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(async (pageNum: number) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await fetch(`${WP_API_BASE}&page=${pageNum}`);
      const wpTotalPages = response.headers.get('X-WP-TotalPages');
      if (wpTotalPages) setTotalPages(Number(wpTotalPages));

      const data: WPPost[] = await response.json();
      const mapped = data.map(mapWPPost);

      setPublications((prev) => (pageNum === 1 ? mapped : [...prev, ...mapped]));
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingMore && page < totalPages) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPosts(nextPage);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [page, totalPages, loadingMore, fetchPosts]);

  const filteredPublications =
    activeTag === 'all'
      ? publications
      : publications.filter((pub) => pub.tag === activeTag);

  const hasReachedEnd = page >= totalPages && !loadingMore;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="relative bg-gradient-to-br from-crfal-blue via-crfal-blue-dark to-[#002a4a] pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-crfal-blue-light rounded-full blur-3xl" />
        </div>
        <div className="container-crfal relative z-10">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
            <Link to="/" className="hover:text-white transition-colors">Início</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Imprensa</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Notícias</span>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Notícias</h1>
              <p className="text-white/80 text-lg">
                Acompanhe as últimas notícias, comunicados e novidades do
                Conselho Regional de Farmácia de Alagoas.
              </p>
            </div>
            <div className="hidden md:flex justify-end">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                <Newspaper className="w-8 h-8 text-white mb-2" />
                <span className="text-2xl font-bold text-white block">{publications.length}</span>
                <span className="text-sm text-white/70">Notícias carregadas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-crfal py-10 md:py-16">
        <div className="flex flex-wrap gap-2 mb-10">
          <div className="flex items-center gap-2 mr-2 text-neutral-500">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtrar:</span>
          </div>
          {filterTags.map((tag) => (
            <button
              key={tag.value}
              onClick={() => setActiveTag(tag.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTag === tag.value
                  ? `${tag.color} text-white shadow-md`
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:border-crfal-blue/30 hover:text-crfal-blue'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-neutral-500">
            <div className="animate-spin w-10 h-10 border-4 border-crfal-blue border-t-transparent rounded-full mx-auto mb-4"></div>
            Carregando notícias...
          </div>
        ) : filteredPublications.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-neutral-700 mb-2">Nenhuma notícia encontrada</h3>
            <p className="text-neutral-500 text-sm">Não há notícias na categoria selecionada.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPublications.map((pub, index) => (
                <RevealCard key={pub.id} index={index}>
                  <article className="group bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:border-crfal-blue/30 hover:shadow-lg transition-all duration-300 h-full">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={pub.image}
                        alt={pub.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://via.placeholder.com/400x200?text=Sem+Imagem';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-4 left-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 ${pub.tagColor} text-white text-xs font-semibold rounded-full`}>
                          <Tag className="w-3 h-3" />
                          {pub.tag}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-2 text-neutral-500 text-sm mb-3">
                        <Calendar className="w-4 h-4" />
                        {pub.date}
                      </div>

                      <h3
                        className="font-bold text-neutral-800 mb-2 line-clamp-2 group-hover:text-crfal-blue transition-colors duration-300"
                        dangerouslySetInnerHTML={{ __html: pub.title }}
                      />

                      <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{pub.excerpt}</p>

                      <Link
                        to={pub.href}
                        className="inline-flex items-center gap-2 text-crfal-blue font-medium text-sm group/link"
                      >
                        <span className="group-hover/link:underline">Ler mais</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  </article>
                </RevealCard>
              ))}
            </div>

            {loadingMore && (
              <div className="text-center py-8 text-neutral-500">
                <div className="animate-spin w-6 h-6 border-3 border-crfal-blue border-t-transparent rounded-full mx-auto mb-2"></div>
                <span className="text-sm">Carregando mais notícias...</span>
              </div>
            )}

            {hasReachedEnd && publications.length > 0 && (
              <p className="text-center text-neutral-400 text-sm py-8">
                Você chegou ao fim das notícias.
              </p>
            )}

            <div ref={sentinelRef} className="h-1" />
          </>
        )}
      </div>
    </div>
  );
}
