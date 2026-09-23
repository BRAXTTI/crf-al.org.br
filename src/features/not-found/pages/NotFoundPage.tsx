import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Home } from 'lucide-react';
import SEO from '@/components/SEO';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-crfal-gray-50 px-4 pt-32 pb-16 lg:pt-44">
      <SEO
        title="Página não encontrada"
        description="A página que você procura não existe ou foi movida. Volte à página inicial do CRFAL."
        path="/404"
        noindex
      />

      <div className="w-full max-w-xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-crfal-blue-lighter">
          <Compass className="h-8 w-8 text-crfal-blue" />
        </div>

        <p className="font-display mb-2 text-5xl font-bold text-crfal-blue">404</p>
        <h1 className="mb-3 text-2xl font-bold text-neutral-800">Página não encontrada</h1>
        <p className="mb-8 text-crfal-gray-500">
          O endereço que você acessou não existe, foi removido ou está temporariamente
          indisponível.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <Home className="h-4 w-4" />
            Página inicial
          </Link>
          <Link to="/imprensa/noticias" className="btn-outline inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Ver notícias
          </Link>
        </div>
      </div>
    </div>
  );
}
