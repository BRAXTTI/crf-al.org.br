import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  ChevronRight,
  ExternalLink,
  FileText,
  MessageSquare,
  UserCircle,
} from 'lucide-react';

interface WPPost {
  id: number;
  date: string;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  content: {
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

interface RelatedItem {
  id: number;
  title: string;
  date: string;
}

interface ServiceShortcut {
  id: number;
  title: string;
  description: string;
  href: string;
  target?: '_blank';
  icon: React.ElementType;
}

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

export default function NoticiaDetalhe() {
  const { id } = useParams();
  const [post, setPost] = useState<WPPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [related, setRelated] = useState<RelatedItem[]>([]);

  useEffect(() => {
    if (!id) return;

    const postId = Number(id);
    if (Number.isNaN(postId)) {
      setError('Notícia inválida.');
      setLoading(false);
      return;
    }

    async function fetchPost() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://wordpress.crf-al.org.br/wp-json/wp/v2/posts/${postId}?_embed`
        );

        if (!response.ok) {
          throw new Error('Não foi possível carregar esta notícia.');
        }

        const data: WPPost = await response.json();
        setPost(data);

        const relatedResponse = await fetch(
          'https://wordpress.crf-al.org.br/wp-json/wp/v2/posts?_embed&per_page=4'
        );

        if (relatedResponse.ok) {
          const relatedData: WPPost[] = await relatedResponse.json();
          setRelated(
            relatedData
              .filter((item) => item.id !== data.id)
              .slice(0, 3)
              .map((item) => ({
                id: item.id,
                title: sanitizeHTML(item.title.rendered),
                date: formatarData(item.date),
              }))
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Falha ao carregar notícia.'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const featuredImage =
    post?._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/images/banner1.jpg';
  const categoria = post?._embedded?.['wp:term']?.[0]?.[0]?.name || 'Notícia';

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="relative bg-gradient-to-br from-crfal-blue via-crfal-blue-dark to-[#002a4a] pt-28 pb-14 md:pt-32 md:pb-16 overflow-hidden">
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
            <Link to="/imprensa/noticias" className="hover:text-white transition-colors">Notícias</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Matéria</span>
          </div>
          <Link
            to="/imprensa/noticias"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para notícias
          </Link>
        </div>
      </div>

      <div className="container-crfal py-8 md:py-12">
        {loading && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-10 text-center text-neutral-500">
            Carregando matéria...
          </div>
        )}

        {error && (
          <div className="bg-white rounded-2xl border border-red-200 p-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Link to="/imprensa/noticias" className="btn-outline text-sm">
              Voltar para notícias
            </Link>
          </div>
        )}

        {!loading && !error && post && (
          <div className="grid lg:grid-cols-12 gap-8">
            <main className="lg:col-span-8">
              <article className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                <div className="relative h-56 sm:h-72 md:h-80">
                  <img
                    src={featuredImage}
                    alt={sanitizeHTML(post.title.rendered)}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 bg-crfal-blue text-white text-xs font-semibold rounded-full">
                    {categoria}
                  </span>
                </div>

                <div className="p-5 sm:p-7">
                  <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
                    <Calendar className="w-4 h-4" />
                    {formatarData(post.date)}
                  </div>

                  <h1
                    className="text-2xl sm:text-3xl font-bold text-neutral-800 leading-tight mb-4"
                    dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                  />

                  <p className="text-neutral-600 leading-relaxed mb-6 text-sm sm:text-base">
                    {sanitizeHTML(post.excerpt.rendered)}
                  </p>

                  <div
                    className="text-neutral-700 leading-relaxed text-sm sm:text-base
                      [&_p]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-neutral-800 [&_h2]:mt-8 [&_h2]:mb-3
                      [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-neutral-800 [&_h3]:mt-6 [&_h3]:mb-2
                      [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4
                      [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4
                      [&_li]:mb-2
                      [&_a]:text-crfal-blue [&_a]:underline
                      [&_img]:rounded-xl [&_img]:my-4 [&_img]:w-full"
                    dangerouslySetInnerHTML={{ __html: post.content.rendered }}
                  />
                </div>
              </article>
            </main>

            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-24 space-y-4">
                <div className="bg-white rounded-2xl border border-neutral-200 p-5">
                  <h3 className="text-lg font-bold text-neutral-800 mb-3">
                    Outras Notícias
                  </h3>
                  {related.length === 0 ? (
                    <p className="text-sm text-neutral-500">
                      Não há outras matérias para exibir agora.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {related.map((item) => (
                        <Link
                          key={item.id}
                          to={`/imprensa/noticias/${item.id}`}
                          className="block p-3 rounded-xl border border-neutral-200 hover:border-crfal-blue/40 transition-colors"
                        >
                          <p className="text-xs text-neutral-500 mb-1">{item.date}</p>
                          <p className="text-sm font-semibold text-neutral-800 line-clamp-2">
                            {item.title}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-neutral-200 p-5">
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
                        className="block bg-white rounded-2xl border border-neutral-200 p-4 hover:border-crfal-blue/40 hover:shadow-sm transition-all"
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
                      className="block bg-white rounded-2xl border border-neutral-200 p-4 hover:border-crfal-blue/40 hover:shadow-sm transition-all"
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
        )}
      </div>
    </div>
  );
}
