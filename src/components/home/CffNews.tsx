import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Landmark } from 'lucide-react';
import { CffNewsCard, CffNewsSkeleton } from '@/features/press/cff';
import { CFF_NEWS_URL, useCffNews } from '@/features/press/cff-data';

const POSTS = 4;
const trackClass = '-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden';
const slotClass = 'w-[78%] shrink-0 snap-start sm:w-[46%] md:w-auto';

export default function CffNews() {
  const { data, isLoading, isError } = useCffNews(POSTS);
  const items = data?.pages[0]?.items.slice(0, POSTS) ?? [];

  if (!isLoading && (isError || items.length === 0)) return null;

  return (
    <section className="py-2 sm:py-3" aria-labelledby="cff-news-title">
      <div className="container-crfal">
        <div className="section-panel">
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]">
                <Landmark className="h-3.5 w-3.5" aria-hidden="true" /> Conselho Federal de Farmácia
              </p>
              <h2 id="cff-news-title" className="mt-2 text-[26px] font-bold leading-tight tracking-tight text-crfal-blue sm:text-[32px]">Notícias do CFF</h2>
              <span aria-hidden="true" className="mt-3 block h-0.5 w-10 rounded-full bg-crfal-gold" />
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-crfal-gray-600">O que o Conselho Federal publica sobre a profissão, as normas e as ações do Sistema CFF/CRFs.</p>
            </div>
            <Link to="/imprensa/noticias-cff" className="group inline-flex min-h-11 items-center gap-2 self-start rounded-md text-sm font-semibold text-crfal-blue hover:text-crfal-blue-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-4 sm:self-auto">
              Ver todas <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
            </Link>
          </div>

          <ul className={trackClass} aria-busy={isLoading || undefined}>
            {isLoading
              ? <CffNewsSkeleton count={POSTS} className={slotClass} />
              : items.map((item) => <li key={item.link} className={slotClass}><CffNewsCard item={item} /></li>)}
          </ul>

          <p className="mt-6 border-t border-crfal-gray-100 pt-4 text-[12.5px] text-crfal-gray-600">
            Conteúdo do Conselho Federal de Farmácia, publicado com autorização. Os links abrem o{' '}
            <a href={CFF_NEWS_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-crfal-blue hover:underline">
              site oficial do CFF<ArrowUpRight className="ml-0.5 inline h-3 w-3 align-[-1px]" aria-hidden="true" /><span className="sr-only"> (abre em uma nova aba)</span>
            </a>.
          </p>
        </div>
      </div>
    </section>
  );
}
