import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Tag, Newspaper } from 'lucide-react';
import DOMPurify from 'dompurify';

const IMG_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='340'%3E%3Crect width='600' height='340' fill='%23e2e8f0'/%3E%3C/svg%3E";

interface WPPost {
  id: number;
  date: string;
  link: string;
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
}

const WP_API_URL = 'https://wordpress.crf-al.org.br/wp-json/wp/v2/posts?_embed&per_page=6';
const HTML_TAG_RE = /<[^>]*>?/gm;

const formatarData = (dataISO: string) =>
  new Date(dataISO).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

const getTagColor = (tagName: string) => {
  const map: Record<string, string> = {
    'Notícias': 'bg-blue-600',
    'Institucional': 'bg-indigo-600',
    'Cursos': 'bg-emerald-600',
    'Eventos': 'bg-amber-600',
  };
  return map[tagName] || 'bg-crfal-blue';
};

const tags = [
  { label: 'Todas', value: 'all' },
  { label: 'Institucional', value: 'Institucional' },
  { label: 'Notícias', value: 'Notícias' },
  { label: 'Cursos', value: 'Cursos' },
  { label: 'Eventos', value: 'Eventos' },
];

export default function Publications() {
  const [activeTag, setActiveTag] = useState('all');
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const filteredPublications = useMemo(
    () => (activeTag === 'all' ? publications : publications.filter((pub) => pub.tag === activeTag)),
    [activeTag, publications]
  );

  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await fetch(WP_API_URL);
        const data: WPPost[] = await response.json();
        const mappedNews: Publication[] = data.map((post) => {
          const categoryName = post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Geral';
          return {
            id: post.id,
            title: DOMPurify.sanitize(post.title.rendered),
            excerpt: post.excerpt.rendered.replace(HTML_TAG_RE, '').slice(0, 130) + '...',
            image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || IMG_FALLBACK,
            date: formatarData(post.date),
            tag: categoryName,
            tagColor: getTagColor(categoryName),
          };
        });
        setPublications(mappedNews);
      } catch (error) {
        console.error('Erro ao buscar notícias:', error);
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
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="publicacoes" className="py-16 sm:py-20 md:py-28 bg-white dark:bg-slate-950">
      <div className="container-crfal">
        <div
          className={`flex flex-col md:flex-row md:items-end md:justify-between gap-4 sm:gap-6 mb-10 sm:mb-14 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div>
            <span className="inline-block px-4 py-1.5 bg-crfal-blue-lighter text-crfal-blue text-sm font-semibold rounded-full mb-4 dark:bg-crfal-blue/10 dark:text-crfal-blue-light">
              Comunicação
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-800 dark:text-white">
              Nossas Notícias
            </h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {tags.map((tag) => (
              <button
                key={tag.value}
                onClick={() => setActiveTag(tag.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 active:scale-95 ${
                  activeTag === tag.value
                    ? 'bg-crfal-blue text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-slate-800 dark:text-neutral-300 dark:hover:bg-slate-700'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 sm:py-20 text-neutral-500">
            <div className="animate-spin w-8 h-8 border-4 border-crfal-blue border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm sm:text-base">Carregando notícias...</p>
          </div>
        ) : filteredPublications.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <Newspaper className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500 text-sm sm:text-base">Nenhuma publicação encontrada para esta categoria.</p>
            <button onClick={() => setActiveTag('all')} className="mt-4 text-crfal-blue text-sm font-medium hover:underline">
              Ver todas as publicações
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPublications.map((pub, index) => (
                <article
                  key={pub.id}
                  className={`group bg-white dark:bg-slate-900/90 rounded-2xl overflow-hidden border border-neutral-200 dark:border-slate-700/70 hover:border-crfal-blue/30 hover:shadow-card-hover transition-all duration-300 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: isVisible ? `${200 + index * 80}ms` : '0ms' }}
                >
                  <Link to={`/imprensa/noticias/${pub.id}`} className="block">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={pub.image}
                        alt={pub.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).src = IMG_FALLBACK; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-4 left-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${pub.tagColor} text-white text-xs font-semibold rounded-full`}>
                          <Tag className="w-3 h-3" />
                          {pub.tag}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-sm mb-3">
                      <Calendar className="w-4 h-4" />
                      {pub.date}
                    </div>
                    <Link to={`/imprensa/noticias/${pub.id}`}>
                      <h3
                        className="font-bold text-neutral-800 dark:text-white mb-3 line-clamp-2 group-hover:text-crfal-blue transition-colors duration-300"
                        dangerouslySetInnerHTML={{ __html: pub.title }}
                      />
                    </Link>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                      {pub.excerpt}
                    </p>
                    <Link
                      to={`/imprensa/noticias/${pub.id}`}
                      className="inline-flex items-center gap-2 text-crfal-blue font-semibold text-sm group/link dark:text-crfal-blue-light"
                    >
                      <span className="group-hover/link:underline">Ler mais</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <div
              className={`mt-10 sm:mt-12 text-center transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '700ms' }}
            >
              <a
                href="/imprensa/noticias"
                className="btn-outline inline-flex items-center gap-2 text-sm sm:text-base"
              >
                Ver todas as publicações
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
