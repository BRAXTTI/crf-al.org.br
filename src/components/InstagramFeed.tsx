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
    <section className="border-t border-crfal-gray-200 bg-white py-10 sm:py-14" aria-labelledby="instagram-title">
      <div className="container-crfal">
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)] lg:gap-6">
          <div className="relative isolate grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 overflow-hidden rounded-xl bg-crfal-blue p-4 text-white sm:p-6 lg:flex lg:flex-col lg:items-start lg:p-5">
            <img src="/images/instagram-card-background-v1.jpg" alt="" aria-hidden="true" loading="lazy" decoding="async" className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover object-right-bottom" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-crfal-blue/95 via-crfal-blue/80 to-crfal-blue/30" />
            <div>
            <span className="mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/80 sm:text-xs"><Instagram className="h-5 w-5" aria-hidden="true" /> No Instagram</span>
            <h2 id="instagram-title" className="max-w-sm font-display text-lg font-bold leading-tight sm:text-2xl lg:text-xl">{title}</h2>
            <p className="mt-3 hidden max-w-sm text-xs leading-relaxed text-white/80 sm:block lg:hidden xl:block">{description}</p>
            </div>
            <a href={INSTAGRAM_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs sm:px-4 sm:text-sm lg:mt-4 font-bold text-crfal-blue transition-colors hover:bg-crfal-blue-lighter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-crfal-blue motion-reduce:transition-none"><span className="sm:hidden">Seguir</span><span className="hidden sm:inline">Seguir no Instagram</span><ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
          </div>
          <div className="min-w-0">
            {isLoading ? (
              <div role="status" className="flex min-h-48 items-center justify-center gap-3 text-crfal-gray-600"><span className="h-6 w-6 animate-spin rounded-full border-2 border-crfal-blue border-t-transparent motion-reduce:animate-none" />Carregando publicações...</div>
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
              <div className="flex min-h-48 h-full flex-col items-center justify-center p-6 text-center">
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
