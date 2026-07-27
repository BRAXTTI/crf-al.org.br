import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Tag, ArrowLeft } from 'lucide-react';
import DOMPurify from 'dompurify';
import { WP_BASE_URL } from '@/services/wordpress/client';

interface WPPostDetail {
  id: number;
  date: string;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>;
    'wp:term'?: Array<Array<{ id: number; name: string }>>;
  };
}

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

export default function PublicationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<WPPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        setError(false);
        const response = await fetch(
          `${WP_BASE_URL}/posts?slug=${slug}&_embed`
        );
        const data: WPPostDetail[] = await response.json();

        if (data.length === 0) {
          setError(true);
          return;
        }

        setPost(data[0]);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-crfal-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-crfal-gray-500">Carregando publicação...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-800 mb-4">Publicação não encontrada</h2>
          <p className="text-crfal-gray-500 mb-6">A publicação que você procura não existe ou foi removida.</p>
          <Link to="/#publicacoes" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar para publicações
          </Link>
        </div>
      </div>
    );
  }

  const category = post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Geral';
  const image = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  return (
    <article className="py-12 md:py-20">
      <div className="container-crfal max-w-4xl">
        <Link
          to="/#publicacoes"
          className="inline-flex items-center gap-2 text-crfal-blue font-medium mb-8 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para publicações
        </Link>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 ${getTagColor(category)} text-white text-xs font-semibold rounded-full`}
          >
            <Tag className="w-3 h-3" />
            {category}
          </span>
          <span className="flex items-center gap-2 text-crfal-gray-500 text-sm">
            <Calendar className="w-4 h-4" />
            {formatDate(post.date)}
          </span>
        </div>

        <h1
          className="text-3xl md:text-4xl font-bold text-neutral-800 mb-8 leading-tight"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.title.rendered) }}
        />

        {image && (
          <div className="rounded-xl overflow-hidden mb-10">
            <img
              src={image}
              alt={post.title.rendered.replace(/<[^>]*>/g, '')}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        <div
          className="wp-content prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content.rendered) }}
        />

        <div className="mt-12 pt-8 border-t border-crfal-gray-200">
          <Link to="/#publicacoes" className="btn-outline inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar para publicações
          </Link>
        </div>
      </div>
    </article>
  );
}
