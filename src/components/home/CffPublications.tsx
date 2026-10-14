import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Landmark } from 'lucide-react';
import { CFF_COVER_ASPECT, CffPublicationCard } from '@/features/press/cff';
import { CFF_PUBLICATIONS_PATH, CFF_PUBLICATIONS_URL, useCffPublications } from '@/features/press/cff-data';

const SHOWN = 4;
/** Na home, 2 capas por linha no celular para a seção não ficar longa demais. */
const colClass = 'w-1/2 px-2 sm:px-4 md:w-1/4 lg:px-5';

/** A primeira capa de cada uma das 4 primeiras coleções, no mesmo cartão da página (abre o PDF no CFF). */
export default function CffPublications() {
  const { data, isLoading, isError } = useCffPublications();
  const collections = data?.slice(0, SHOWN) ?? [];

  if (!isLoading && (isError || collections.length === 0)) return null;

  return (
    <section className="py-2 sm:py-3" aria-labelledby="cff-publications-title">
      <div className="container-crfal">
        <div className="section-panel">
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]">
                <Landmark className="h-3.5 w-3.5" aria-hidden="true" /> Conselho Federal de Farmácia
              </p>
              <h2 id="cff-publications-title" className="mt-2 text-[26px] font-bold leading-tight tracking-tight text-crfal-blue sm:text-[32px]">Publicações do CFF</h2>
              <span aria-hidden="true" className="mt-3 block h-0.5 w-10 rounded-full bg-crfal-gold" />
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-crfal-gray-600">Revistas, guias de prática clínica, notas técnicas e relatórios do Conselho Federal.</p>
            </div>
            <Link to={CFF_PUBLICATIONS_PATH} className="group inline-flex min-h-11 items-center gap-2 self-start rounded-md text-sm font-semibold text-crfal-blue hover:text-crfal-blue-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-4 sm:self-auto">
              Ver todas <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
            </Link>
          </div>

          <ul className="-mx-2 -mb-6 flex flex-wrap justify-center sm:-mx-4 sm:-mb-10 lg:-mx-5" aria-busy={isLoading || undefined}>
            {isLoading
              ? Array.from({ length: SHOWN }, (_, i) => <li key={i} className={`${colClass} mb-6 sm:mb-10`}><div className={`${CFF_COVER_ASPECT} animate-pulse rounded-xl bg-crfal-gray-200 motion-reduce:animate-none`} /></li>)
              : collections.map((collection) => (
                  <li key={collection.slug} className={`${colClass} mb-6 sm:mb-10`}>
                    <CffPublicationCard collection={collection} index={0} />
                  </li>
                ))}
          </ul>

          <p className="mt-6 border-t border-crfal-gray-100 pt-4 text-[12.5px] text-crfal-gray-600">
            Os PDFs abrem no{' '}
            <a href={CFF_PUBLICATIONS_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-crfal-blue hover:underline">
              site oficial do CFF<ArrowUpRight className="ml-0.5 inline h-3 w-3 align-[-1px]" aria-hidden="true" /><span className="sr-only"> (abre em uma nova aba)</span>
            </a>.
          </p>
        </div>
      </div>
    </section>
  );
}
