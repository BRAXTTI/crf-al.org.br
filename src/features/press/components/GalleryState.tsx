import { Images } from 'lucide-react';

export default function GalleryState({ loading = false, error = false, notFound = false, onRetry }: {
  loading?: boolean;
  error?: boolean;
  notFound?: boolean;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-crfal-gray-200 bg-white p-8 text-center" role={error ? 'alert' : 'status'}>
      <Images className="mb-4 h-10 w-10 text-crfal-gray-400" aria-hidden="true" />
      <p className="font-semibold text-crfal-blue">
        {loading ? 'Carregando fotos…' : notFound ? 'Álbum não encontrado.' : error ? 'Não foi possível carregar a galeria.' : 'Nenhuma foto publicada por enquanto.'}
      </p>
      {!loading && <p className="mt-2 text-sm text-crfal-gray-600">{notFound ? 'Volte para os álbuns e escolha outra galeria.' : error ? 'Verifique sua conexão e tente novamente.' : 'Volte em breve para acompanhar os registros do CRF-AL.'}</p>}
      {error && !notFound && <button type="button" onClick={onRetry} className="btn-outline mt-6 focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-4">Tentar novamente</button>}
    </div>
  );
}
