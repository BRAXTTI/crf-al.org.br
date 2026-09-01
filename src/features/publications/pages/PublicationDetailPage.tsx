import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePostBySlug } from '@/services/wordpress/hooks';

/**
 * Rota legada `/publicacao/:slug` — existe apenas para redirecionar
 * links antigos (bookmarks/SEO) para a página de notícia padronizada
 * `/imprensa/noticias/:id`, que é a única tela de detalhe em uso.
 */
export default function PublicationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = usePostBySlug(slug ?? '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-crfal-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-crfal-gray-500">Carregando notícia...</p>
        </div>
      </div>
    );
  }

  if (post) {
    return <Navigate to={`/imprensa/noticias/${post.id}`} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">Notícia não encontrada</h2>
        <p className="text-crfal-gray-500 mb-6">
          A notícia que você procura não existe ou foi removida.
        </p>
        <Link to="/imprensa/noticias" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar para notícias
        </Link>
      </div>
    </div>
  );
}
