import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Calendar,
  ChevronRight,
  ExternalLink,
  FileText,
  MessageSquare,
  Search,
  UserCircle,
} from 'lucide-react';

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

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  tag: string;
}

interface ServiceShortcut {
  id: number;
  title: string;
  description: string;
  href: string;
  target?: '_blank';
  icon: React.ElementType;
}

const WP_API_BASE = 'https://wordpress.crf-al.org.br/wp-json/wp/v2/posts?_embed';
const PER_PAGE = 9;

const serviceShortcuts: ServiceShortcut[] = [
  {
    id: 1,
    title: 'CRF AL em Casa',
    description: 'Portal com serviços online do Conselho.',
    href: 'https://crfal-emcasa.cisantec.com.br/crf-em-casa/login.jsf',
    target: '_blank',
    icon: Building2,
  },
  {
    id: 2,
    title: 'Requerimentos',
    description: 'Acesse requerimentos para pessoa física e jurídica.',
    href: '/servicos/requerimentos',
    icon: FileText,
  },
  {
    id: 3,
    title: 'Tutoriais',
    description: 'Guias passo a passo para os serviços do CRFAL.',
    href: '/servicos/tutoriais',
    icon: UserCircle,
  },
  {
    id: 4,
    title: 'Ouvidoria',
    description: 'Canal oficial para manifestações e solicitações.',
    href: '/servicos/ouvidoria',
    icon: MessageSquare,
  },
];

function formatarData(dataISO: string) {
  return new Date(dataISO).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function sanitizeHTML(html: string) {
  return html.replace(/<[^>]+>/g, '').trim();
}

export default function Noticias() {
  const [posts, setPosts] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState('Todas');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNews = async (pageToLoad: number) => {
    const isFirstPage = pageToLoad === 1;
    setError(null);
    if (isFirstPage) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await fetch(`${WP_API_BASE}&per_page=${PER_PAGE}&page=${pageToLoad}`);
      if (!response.ok) {
        throw new Error('Não foi possível carregar as notícias no momento.');
      }

      const total = Number(response.headers.get('X-WP-TotalPages')) || 1;
      const data: WPPost[] = await response.json();

      const mapped: NewsItem[] = data.map((post) => {
        const tag = post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Geral';
        return {
          id: post.id,
          title: post.title.rendered,
          excerpt: sanitizeHTML(post.excerpt.rendered),
          image:
            post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
            '/images/banner1.jpg',
          date: formatarData(post.date),
          tag,
        };
      });

      setTotalPages(total);
      setPosts((prev) => (isFirstPage ? mapped : [...prev, ...mapped]));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Falha ao carregar notícias.'
      );
    } finally {
      if (isFirstPage) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    fetchNews(1);
  }, []);

  const tags = useMemo(() => {
    const found = Array.from(new Set(posts.map((item) => item.tag)));
    return ['Todas', ...found];
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((item) => {
      const matchesTag = activeTag === 'Todas' || item.tag === activeTag;
      const matchesQuery =
        q.length === 0 ||
        sanitizeHTML(item.title).toLowerCase().includes(q) ||
        item.excerpt.toLowerCase().includes(q);
      return matchesTag && matchesQuery;
    });
  }, [posts, activeTag, query]);

  const destaque = filtered[0];
  const restantes = filtered.slice(1);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-slate-950">
      <div className="relative bg-gradient-to-br from-crfal-blue via-crfal-blue-dark to-[#002a4a] pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-crfal-blue-light rounded-full blur-3xl" />
        </div>
        <div className="container-crfal relative z-10">
          <div className="flex flex-wrap items-center gap-2 text-white/60 text-xs sm:text-sm mb-4">
            <Link to="/" className="hover:text-white transition-colors">Início</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Imprensa</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Notícias</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Central de Notícias
          </h1>
          <p className="text-white/80 text-base sm:text-lg max-w-3xl">
            Acompanhe as publicações institucionais do CRFAL com atualização contínua,
            leitura otimizada e acesso rápido aos principais serviços.
          </p>
        </div>
      </div>

      <div className="container-crfal py-10 md:py-16">
        <div className="grid lg:grid-cols-12 gap-8">
          <main className="lg:col-span-8 order-1">
            <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-neutral-200 dark:border-slate-700/70 p-4 sm:p-5 mb-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por título ou conteúdo da notícia"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-slate-700/70 bg-white dark:bg-slate-900/80 focus:outline-none focus:ring-2 focus:ring-crfal-blue/20 focus:border-crfal-blue text-sm"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    className={`px-3.5 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                      activeTag === tag
                        ? 'bg-crfal-blue text-white'
                        : 'bg-neutral-100 dark:bg-slate-800 text-neutral-700 dark:text-slate-300 hover:bg-neutral-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-neutral-200 dark:border-slate-700/70 p-8 text-center text-neutral-500">
                Carregando notícias...
              </div>
            )}

            {error && (
              <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-red-200 dark:border-red-800/60 p-6 mb-6">
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <button
                  onClick={() => fetchNews(1)}
                  className="btn-outline text-sm"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-neutral-200 dark:border-slate-700/70 p-8 text-center text-neutral-500">
                Nenhuma notícia encontrada para os filtros atuais.
              </div>
            )}

            {!loading && !error && destaque && (
              <article className="bg-white dark:bg-slate-900/90 rounded-2xl border border-neutral-200 dark:border-slate-700/70 overflow-hidden mb-6">
                <Link to={`/imprensa/noticias/${destaque.id}`} className="block">
                  <div className="relative h-56 sm:h-72">
                    <img
                      src={destaque.image}
                      alt={sanitizeHTML(destaque.title)}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-crfal-blue text-white text-xs font-semibold">
                      {destaque.tag}
                    </span>
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-3">
                      <Calendar className="w-4 h-4" />
                      {destaque.date}
                    </div>
                    <h2
                      className="text-xl sm:text-2xl font-bold text-neutral-800 mb-3 leading-tight"
                      dangerouslySetInnerHTML={{ __html: destaque.title }}
                    />
                    <p className="text-sm sm:text-base text-neutral-600 leading-relaxed line-clamp-3">
                      {destaque.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-2 mt-4 text-crfal-blue font-medium text-sm">
                      Ler notícia completa
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </article>
            )}

            {!loading && !error && restantes.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                {restantes.map((item) => (
                  <article
                    key={item.id}
                    className="bg-white dark:bg-slate-900/90 rounded-2xl border border-neutral-200 dark:border-slate-700/70 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <Link to={`/imprensa/noticias/${item.id}`} className="block">
                      <div className="h-40">
                        <img
                          src={item.image}
                          alt={sanitizeHTML(item.title)}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-medium text-crfal-blue">{item.tag}</span>
                          <span className="text-xs text-neutral-500">{item.date}</span>
                        </div>
                        <h3
                          className="font-bold text-neutral-800 text-sm sm:text-base line-clamp-2 mb-2 leading-snug"
                          dangerouslySetInnerHTML={{ __html: item.title }}
                        />
                        <p className="text-sm text-neutral-600 line-clamp-3">
                          {item.excerpt}
                        </p>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}

            {!loading && page < totalPages && (
              <div className="mt-8 text-center">
                <button
                  onClick={async () => {
                    const next = page + 1;
                    setPage(next);
                    await fetchNews(next);
                  }}
                  disabled={loadingMore}
                  className="btn-outline text-sm sm:text-base disabled:opacity-60"
                >
                  {loadingMore ? 'Carregando...' : 'Carregar mais notícias'}
                </button>
              </div>
            )}
          </main>

          <aside className="lg:col-span-4 order-2">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-neutral-200 dark:border-slate-700/70 p-5">
                <span className="inline-flex px-3 py-1 rounded-full bg-crfal-blue-lighter text-crfal-blue text-xs font-semibold mb-3">
                  Serviços em Destaque
                </span>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">
                  Acesso Rápido
                </h3>
                <p className="text-sm text-neutral-600">
                  Navegue direto para os serviços mais usados pelos profissionais.
                </p>
              </div>

              {serviceShortcuts.map((item) => {
                const Icon = item.icon;
                const isExternal = item.target === '_blank';

                if (isExternal) {
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white dark:bg-slate-900/90 rounded-2xl border border-neutral-200 dark:border-slate-700/70 p-4 hover:border-crfal-blue/40 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-crfal-blue-lighter text-crfal-blue flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-neutral-800 text-sm mb-1">
                            {item.title}
                          </h4>
                          <p className="text-xs text-neutral-600 leading-relaxed">
                            {item.description}
                          </p>
                          <span className="inline-flex items-center gap-1 text-crfal-blue text-xs font-medium mt-2">
                            Acessar
                            <ExternalLink className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    className="block bg-white dark:bg-slate-900/90 rounded-2xl border border-neutral-200 dark:border-slate-700/70 p-4 hover:border-crfal-blue/40 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-crfal-blue-lighter text-crfal-blue flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-neutral-800 text-sm mb-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-neutral-600 leading-relaxed">
                          {item.description}
                        </p>
                        <span className="inline-flex items-center gap-1 text-crfal-blue text-xs font-medium mt-2">
                          Acessar
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
