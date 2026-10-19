import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Copy, Instagram, Play } from 'lucide-react';
import { INSTAGRAM_PROFILE_URL } from '@/config/site';
import { CFF_COVER_ASPECT } from '@/features/press/cff';

type MediaType = 'image' | 'video' | 'carousel';
interface InstagramItem { link: string; image: string; caption?: string; date?: number; type?: MediaType }
interface InstagramFeedProps { title?: string; description?: string }

const IMG_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23E6F0F8'/%3E%3C/svg%3E";
const POSTS = 4;
const HANDLE = `@${INSTAGRAM_PROFILE_URL.replace(/\/+$/, '').split('/').pop() || 'crfal'}`;
const motion = 'transition duration-300 motion-reduce:transition-none';

async function fetchInstagram(signal: AbortSignal): Promise<InstagramItem[]> {
  const res = await fetch('/api/instagram', { signal });
  if (!res.ok) throw new Error('Falha ao carregar o Instagram');
  const data = (await res.json()) as { items?: InstagramItem[] };
  return Array.isArray(data.items) ? data.items.filter(item => item.link && item.image).slice(0, POSTS) : [];
}

function formatDate(ms?: number) {
  if (!ms) return undefined;
  return new Date(ms).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', timeZone: 'America/Maceio' });
}

/** Rótulo acessível: sem emoji e cortado no fim de uma palavra. */
function accessibleLabel(text: string, max = 160) {
  const clean = text.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 0) || max).replace(/[\s,.;:–-]+$/, '')}…`;
}

function handleImageError(event: React.SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = IMG_FALLBACK;
}

const TYPE_BADGE: Record<Exclude<MediaType, 'image'>, { label: string; icon: typeof Play }> = {
  video: { label: 'Vídeo', icon: Play },
  carousel: { label: 'Carrossel', icon: Copy },
};

function PostCard({ item }: { item: InstagramItem }) {
  const date = formatDate(item.date);
  const badge = item.type && item.type !== 'image' ? TYPE_BADGE[item.type] : undefined;
  const BadgeIcon = badge?.icon;
  const label = [date ? `Publicação de ${date}` : 'Publicação no Instagram', item.caption].filter(Boolean).join(': ');
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${accessibleLabel(label)} (abre o Instagram em uma nova aba)`}
      className="group flex h-full flex-col overflow-hidden rounded-xl bg-white ring-1 ring-crfal-gray-200 shadow-xs transition-shadow duration-300 hover:shadow-xl hover:shadow-crfal-blue/10 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2 motion-reduce:transition-none"
    >
      <div className={`relative isolate ${CFF_COVER_ASPECT} overflow-hidden bg-crfal-blue-dark`}>
        <img src={item.image} alt="" aria-hidden="true" loading="lazy" decoding="async" onError={handleImageError} className="absolute inset-0 -z-10 h-full w-full scale-150 object-cover opacity-60 blur-2xl" />
        <img src={item.image} alt="" loading="lazy" decoding="async" onError={handleImageError} className={`h-full w-full object-contain group-hover:scale-[1.03] ${motion}`} />
        {badge && BadgeIcon && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 glass-chip rounded-full px-2.5 py-1 text-[11px] font-semibold text-white">
            <BadgeIcon className="h-3 w-3" aria-hidden="true" />{badge.label}
          </span>
        )}
        <span aria-hidden="true" className={`absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-crfal-blue shadow-md group-hover:bg-crfal-blue group-hover:text-white ${motion}`}>
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
      {(date || item.caption) && (
        <div className="flex flex-1 flex-col border-t-2 border-crfal-gold/0 p-4 group-hover:border-crfal-gold/70">
          {date && <time dateTime={new Date(item.date!).toISOString()} className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A6A12]">{date}</time>}
          {item.caption && <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-snug text-crfal-gray-700 group-hover:text-crfal-blue-dark">{item.caption}</p>}
        </div>
      )}
    </a>
  );
}

function FollowCard() {
  return (
    <a
      href={INSTAGRAM_PROFILE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative isolate flex h-full min-h-[260px] flex-col justify-between overflow-hidden rounded-xl border-t-2 border-crfal-gold bg-crfal-blue p-5 text-white shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2"
    >
      <img src="/images/instagram-card-background-v1.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" className={`pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover object-bottom-right group-hover:scale-105 ${motion}`} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-t/srgb from-crfal-blue-dark via-crfal-blue/85 to-crfal-blue/50" />
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 ring-1 ring-crfal-gold/50">
        <Instagram className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-crfal-gold">{HANDLE}</p>
        <p className="mt-1.5 text-lg font-bold leading-snug">Siga o CRF-AL no Instagram</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-white/75">Eventos, alertas e o dia a dia da profissão.</p>
        <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-bold text-crfal-blue">
          Seguir <ArrowUpRight className={`h-4 w-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${motion}`} aria-hidden="true" />
        </span>
      </div>
      <span className="sr-only">(abre em uma nova aba)</span>
    </a>
  );
}

/** Trilho: carrossel com deslize no celular, grade de 4 colunas a partir de 768px — mesma largura e espaçamento das capas de Publicações do CFF. */
const trackClass = '-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 scrollbar-none sm:-mx-6 sm:gap-8 sm:scroll-px-6 sm:px-6 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 md:pb-0 lg:gap-10 [&::-webkit-scrollbar]:hidden';
const slotClass = 'w-[calc(50%-0.5rem)] shrink-0 snap-start sm:w-[calc(50%-1rem)] md:w-auto';

export default function InstagramFeed({
  title = 'O CRF-AL mais perto de você',
  description = 'Acompanhe os eventos, as ações do Conselho e o dia a dia da profissão farmacêutica.',
}: InstagramFeedProps) {
  const { data, isLoading, isError } = useQuery({ queryKey: ['instagram-feed', POSTS], queryFn: ({ signal }) => fetchInstagram(signal), staleTime: 10 * 60 * 1000, retry: 1 });
  const items = data ?? [];

  return (
    <section className="py-2 sm:py-3" aria-labelledby="instagram-title">
      <div className="container-crfal">
        <div className="section-panel">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]">
              <Instagram className="h-3.5 w-3.5" aria-hidden="true" /> No Instagram · {HANDLE}
            </p>
            <h2 id="instagram-title" className="mt-2 text-[26px] font-bold leading-tight tracking-tight text-crfal-blue sm:text-[32px]">{title}</h2>
            <span aria-hidden="true" className="mt-3 block h-0.5 w-10 rounded-full bg-crfal-gold" />
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-crfal-gray-600">{description}</p>
          </div>
          <a href={INSTAGRAM_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="group inline-flex min-h-11 items-center gap-2 self-start rounded-md text-sm font-semibold text-crfal-blue hover:text-crfal-blue-light focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-4 sm:self-auto">
            Seguir {HANDLE}
            <ArrowUpRight className={`h-4 w-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${motion}`} aria-hidden="true" />
            <span className="sr-only">(abre em uma nova aba)</span>
          </a>
        </div>

        {isLoading ? (
          <div role="status" aria-label="Carregando publicações" className={`${trackClass} animate-pulse motion-reduce:animate-none`}>
            {Array.from({ length: POSTS }, (_, i) => (
              <div key={i} className={`${slotClass} overflow-hidden rounded-xl border border-crfal-gray-200 bg-white`}>
                <div className={`${CFF_COVER_ASPECT} bg-crfal-gray-200`} />
                <div className="space-y-2 p-4"><div className="h-2.5 w-20 rounded bg-crfal-gray-200" /><div className="h-3 w-full rounded bg-crfal-gray-100" /><div className="h-3 w-2/3 rounded bg-crfal-gray-100" /></div>
              </div>
            ))}
            <span className="sr-only">Carregando publicações...</span>
          </div>
        ) : !isError && items.length > 0 ? (
          <ul className={trackClass}>
            {items.map((item, index) => (
              <li key={item.link} className={`${slotClass} ${index === 3 ? 'md:hidden' : ''}`}>
                <PostCard item={item} />
              </li>
            ))}
            <li className={slotClass}><FollowCard /></li>
          </ul>
        ) : (
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_280px]">
            <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-crfal-gray-300 p-6 text-center">
              <Instagram className="mb-4 h-9 w-9 text-crfal-blue" aria-hidden="true" />
              <p className="text-lg font-bold text-crfal-blue-dark">As novidades continuam no nosso perfil</p>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-crfal-gray-600">Acesse o Instagram do CRF-AL para ver as últimas publicações.</p>
            </div>
            <FollowCard />
          </div>
        )}
        </div>
      </div>
    </section>
  );
}
