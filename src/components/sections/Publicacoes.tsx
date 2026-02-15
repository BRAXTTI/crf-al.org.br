import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Tag, Newspaper } from 'lucide-react';

interface WPPost {
  id: number;
  date: string;
  link: string;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
    }>;
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
    }>>;
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
}

const WP_API_URL = "https://wordpress.crf-al.org.br/wp-json/wp/v2/posts?_embed&per_page=6";

const formatarData = (dataISO: string) => {
  return new Date(dataISO).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const getTagColor = (tagName: string) => {
  const map: Record<string, string> = {
    'Notícias': 'bg-blue-500',
    'Institucional': 'bg-purple-500',
    'Cursos': 'bg-green-500',
    'Eventos': 'bg-orange-500',
  };
  return map[tagName] || 'bg-crfal-blue';
};

const tags = [
  { label: 'Todas', value: 'all', color: 'bg-crfal-blue' },
  { label: 'Institucional', value: 'Institucional', color: 'bg-purple-500' },
  { label: 'Notícias', value: 'Notícias', color: 'bg-blue-500' },
  { label: 'Cursos', value: 'Cursos', color: 'bg-green-500' },
  { label: 'Eventos', value: 'Eventos', color: 'bg-orange-500' },
];

export default function Publicacoes() {
  const [activeTag, setActiveTag] = useState('all');
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await fetch(WP_API_URL);
        const data: WPPost[] = await response.json();

        const mappedNews: Publication[] = data.map((post) => {
          const categoryName = post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Geral';

          return {
            id: post.id,
            title: post.title.rendered,
            excerpt: post.excerpt.rendered.replace(/<[^>]*>?/gm, '').slice(0, 100) + '...',
            image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/images/placeholder.jpg',
            date: formatarData(post.date),
            tag: categoryName,
            tagColor: getTagColor(categoryName),
          };
        });

        setPublications(mappedNews);
        setFilteredPublications(mappedNews);
      } catch (error) {
        console.error("Erro ao buscar notícias:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (activeTag === 'all') {
      setFilteredPublications(publications);
    } else {
      setFilteredPublications(
        publications.filter((pub) => pub.tag === activeTag)
      );
    }
  }, [activeTag, publications]);

  return (
    <section ref={sectionRef} id="publicacoes" className="py-16 sm:py-20 md:py-28 bg-white">
      <div className="container-crfal">
        <div
          className={`flex flex-col md:flex-row md:items-end md:justify-between gap-4 sm:gap-6 mb-8 sm:mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div>
            <span className="inline-block px-4 py-1.5 bg-crfal-blue-lighter text-crfal-blue text-sm font-semibold rounded-full mb-4">
              Publicações
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-800">
              Nossas Publicações
            </h2>
          </div>

          {/* Filter tags - horizontal scroll on mobile */}
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {tags.map((tag) => (
                <button
                  key={tag.value}
                  onClick={() => setActiveTag(tag.value)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 active:scale-95 ${
                    activeTag === tag.value
                      ? `${tag.color} text-white shadow-sm`
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16 sm:py-20 text-neutral-500">
            <div className="animate-spin w-8 h-8 border-4 border-crfal-blue border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm sm:text-base">Carregando notícias...</p>
          </div>
        ) : filteredPublications.length === 0 ? (
          /* Empty state */
          <div className="text-center py-16 sm:py-20">
            <Newspaper className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500 text-sm sm:text-base">
              Nenhuma publicação encontrada para esta categoria.
            </p>
            <button
              onClick={() => setActiveTag('all')}
              className="mt-4 text-crfal-blue text-sm font-medium hover:underline"
            >
              Ver todas as publicações
            </button>
          </div>
        ) : (
          <>
            {/* Mobile: featured card + compact list */}
            <div className="sm:hidden space-y-4">
              {filteredPublications.map((pub, index) => (
                <article
                  key={pub.id}
                  className={`group bg-white rounded-2xl overflow-hidden border border-neutral-200 active:scale-[0.99] transition-all duration-300 ${
                    isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{
                    transitionDelay: isVisible ? `${200 + index * 80}ms` : '0ms',
                  }}
                >
                  {/* First card is featured with image */}
                  {index === 0 ? (
                    <Link to={`/imprensa/noticias/${pub.id}`} className="block">
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={pub.image}
                          alt={pub.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Sem+Imagem';
                          }}
                        />
                        <div className="absolute top-3 left-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 ${pub.tagColor} text-white text-xs font-semibold rounded-full`}
                          >
                            <Tag className="w-3 h-3" />
                            {pub.tag}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 text-neutral-400 text-xs mb-2">
                          <Calendar className="w-3.5 h-3.5" />
                          {pub.date}
                        </div>
                        <h3
                          className="font-bold text-neutral-800 text-base mb-1.5 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: pub.title }}
                        />
                        <p className="text-sm text-neutral-500 line-clamp-2">
                          {pub.excerpt}
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <Link to={`/imprensa/noticias/${pub.id}`} className="flex items-center gap-3 p-3">
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100">
                        <img
                          src={pub.image}
                          alt={pub.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80?text=Img';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${pub.tagColor} flex-shrink-0`} />
                          <span className="text-xs text-neutral-400">{pub.date}</span>
                        </div>
                        <h3
                          className="font-bold text-neutral-800 text-sm line-clamp-2 leading-snug"
                          dangerouslySetInnerHTML={{ __html: pub.title }}
                        />
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                    </Link>
                  )}
                </article>
              ))}
            </div>

            {/* Desktop grid */}
            <div className="hidden sm:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPublications.map((pub, index) => (
                <article
                  key={pub.id}
                  className={`group bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200 hover:border-crfal-blue/30 hover:shadow-lg transition-all duration-300 ${
                    isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{
                    transitionDelay: isVisible ? `${200 + index * 80}ms` : '0ms',
                  }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={pub.image}
                      alt={pub.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Sem+Imagem';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="absolute top-4 left-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 ${pub.tagColor} text-white text-xs font-semibold rounded-full`}
                      >
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

                    <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                      {pub.excerpt}
                    </p>

                    <Link
                      to={`/imprensa/noticias/${pub.id}`}
                      className="inline-flex items-center gap-2 text-crfal-blue font-medium text-sm group/link"
                    >
                      <span className="group-hover/link:underline">
                        Ler mais
                      </span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {/* View All Button */}
        <div
          className={`mt-8 sm:mt-10 text-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '800ms' }}
        >
          <a href="/imprensa/noticias" className="btn-outline inline-flex items-center gap-2 text-sm sm:text-base">
            Ver todas as publicações
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
