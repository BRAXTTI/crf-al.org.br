import { ArrowUpRight } from 'lucide-react';
import { CFF_IMG_FALLBACK as IMG_FALLBACK, formatCffDate, type CffNewsItem } from '@/features/press/cff-data';

const motion = 'transition duration-300 motion-reduce:transition-none';

function handleImageError(event: React.SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = IMG_FALLBACK;
}

export function CffNewsCard({ item, summaryLines = 2 }: { item: CffNewsItem; summaryLines?: 2 | 3 }) {
  const date = formatCffDate(item.date);
  const image = item.image || IMG_FALLBACK;
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${item.title}${date ? `, ${date}` : ''} (Conselho Federal de Farmácia, abre em uma nova aba)`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-crfal-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-crfal-blue/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2 motion-reduce:transition-none"
    >
      <div className="relative isolate aspect-[16/10] overflow-hidden bg-crfal-blue-dark">
        <img src={image} alt="" aria-hidden="true" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={handleImageError} className="absolute inset-0 -z-10 h-full w-full scale-150 object-cover opacity-60 blur-2xl" />
        <img src={image} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={handleImageError} className={`h-full w-full object-contain group-hover:scale-[1.03] ${motion}`} />
        <span className="glass-chip absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">CFF</span>
        <span aria-hidden="true" className={`absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-crfal-blue shadow-md group-hover:bg-crfal-blue group-hover:text-white ${motion}`}>
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
      <div className="flex flex-1 flex-col border-t-2 border-crfal-gold/0 p-4 group-hover:border-crfal-gold/70 sm:p-5">
        {date && <time dateTime={item.date} className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A6A12]">{date}</time>}
        <h3 className="mt-1.5 line-clamp-3 text-[15px] font-bold leading-snug text-crfal-blue-dark group-hover:text-crfal-blue">{item.title}</h3>
        {item.summary && <p className={`mt-2 text-[13.5px] leading-relaxed text-crfal-gray-600 ${summaryLines === 3 ? 'line-clamp-3' : 'line-clamp-2'}`}>{item.summary}</p>}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[13px] font-semibold text-crfal-blue">
          Ler no site do CFF <ArrowUpRight className={`h-3.5 w-3.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${motion}`} aria-hidden="true" />
        </span>
      </div>
    </a>
  );
}

export function CffNewsSkeleton({ count, className }: { count: number; className: string }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className={className}>
          <div className="h-full animate-pulse overflow-hidden rounded-xl border border-crfal-gray-200 bg-white motion-reduce:animate-none">
            <div className="aspect-[16/10] bg-crfal-gray-200" />
            <div className="space-y-2.5 p-5"><div className="h-2.5 w-24 rounded bg-crfal-gray-200" /><div className="h-3.5 w-full rounded bg-crfal-gray-200" /><div className="h-3.5 w-4/5 rounded bg-crfal-gray-200" /><div className="h-3 w-full rounded bg-crfal-gray-100" /></div>
          </div>
        </li>
      ))}
    </>
  );
}
