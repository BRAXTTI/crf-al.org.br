import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Instagram } from 'lucide-react';
import { INSTAGRAM_PROFILE_URL } from '@/config/site';

interface InstagramItem { link: string; image: string }
interface InstagramFeedProps { title?: string; description?: string }
const IMG_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23E6F0F8'/%3E%3C/svg%3E";

async function fetchInstagram(signal: AbortSignal): Promise<InstagramItem[]> {
  const res = await fetch('/api/instagram', { signal });
  if (!res.ok) throw new Error('Falha ao carregar o Instagram');
  const data = (await res.json()) as { items?: InstagramItem[] };
  return Array.isArray(data.items) ? data.items.filter(item => item.link && item.image).slice(0, 4) : [];
}

export default function InstagramFeed({
  title = 'O CRF-AL mais perto de você',
  description = 'Acompanhe os eventos, as ações do Conselho e o dia a dia da profissão farmacêutica.',
}: InstagramFeedProps) {
  const { data, isLoading, isError } = useQuery({ queryKey: ['instagram-feed'], queryFn: ({ signal }) => fetchInstagram(signal), staleTime: 10 * 60 * 1000, retry: 1 });
  const items = data ?? [];
  return (
    <section className="bg-white py-14 sm:py-20" aria-labelledby="instagram-title">
      <div className="container-crfal">
        <div className="grid overflow-hidden rounded-2xl border border-crfal-gray-200 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="flex flex-col items-start bg-crfal-blue p-7 text-white sm:p-10 lg:p-12">
            <span className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80"><Instagram className="h-5 w-5" aria-hidden="true" /> No Instagram</span>
            <h2 id="instagram-title" className="max-w-sm font-display text-3xl font-bold leading-tight sm:text-4xl">{title}</h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/80 sm:text-base">{description}</p>
            <a href={INSTAGRAM_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-11 items-center gap-3 rounded-lg bg-white px-5 py-3 text-sm font-bold text-crfal-blue transition-colors hover:bg-crfal-blue-lighter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-crfal-blue motion-reduce:transition-none">Seguir no Instagram <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
            <span className="mt-auto pt-8 text-xs text-white/70">Perfil oficial do Conselho Regional de Farmácia de Alagoas</span>
          </div>
          <div className="bg-crfal-gray-50 p-4 sm:p-6">
            {isLoading ? (
              <div role="status" className="flex min-h-80 items-center justify-center gap-3 text-crfal-gray-600"><span className="h-6 w-6 animate-spin rounded-full border-2 border-crfal-blue border-t-transparent motion-reduce:animate-none" />Carregando publicações...</div>
            ) : !isError && items.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {items.map((item, index) => (
                  <a key={item.link} href={item.link} target="_blank" rel="noopener noreferrer" aria-label={`Abrir publicação ${index + 1} no Instagram (nova aba)`} className="group relative aspect-square overflow-hidden rounded-lg border border-crfal-gray-200 bg-crfal-blue-lighter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2">
                    <img src={item.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = IMG_FALLBACK; }} />
                    <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-crfal-blue shadow-card transition-colors group-hover:bg-crfal-blue group-hover:text-white group-focus-visible:bg-crfal-blue group-focus-visible:text-white motion-reduce:transition-none"><ArrowUpRight className="h-4 w-4" aria-hidden="true" /></span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex min-h-80 h-full flex-col items-center justify-center p-6 text-center">
                <Instagram className="mb-5 h-10 w-10 text-crfal-blue" aria-hidden="true" />
                <p className="text-lg font-bold text-crfal-blue-dark">As novidades continuam no nosso perfil</p>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-crfal-gray-600">Acesse o Instagram do CRF-AL para ver as últimas publicações.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
