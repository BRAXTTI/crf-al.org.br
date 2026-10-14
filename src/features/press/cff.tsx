import { Eye } from 'lucide-react';
import { CFF_COVER_FALLBACK, isPdfLink, publicationLabel, type CffCollection } from '@/features/press/cff-data';

function handleImageError(event: React.SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = CFF_COVER_FALLBACK;
}

/** Colunas como no site do CFF: 1 capa no celular, 2 no tablet, 4 no desktop, centralizadas. */
export const cffColClass = 'w-2/3 px-3 sm:w-1/2 sm:px-4 md:w-5/12 lg:w-1/4 lg:px-3.5';

/**
 * Capa no mesmo formato do site do CFF: cartão branco arredondado, imagem inteira,
 * ao passar o mouse o cartão sobe, a capa gira levemente e o “olho” entra pelo canto.
 * Leva direto ao PDF no site do CFF (o arquivo não é hospedado aqui).
 */
export function CffPublicationCard({ collection, index }: { collection: CffCollection; index: number }) {
  const item = collection.items[index];
  const pdf = isPdfLink(item.link);
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      title="Ver publicação"
      aria-label={`${publicationLabel(collection, index)} (${pdf ? 'PDF no site do Conselho Federal de Farmácia' : 'página externa'}, abre em uma nova aba)`}
      className="group relative block overflow-hidden rounded-xl bg-white shadow-[0_3px_20px_rgba(0,51,102,0.1)] transition duration-300 ease-in-out hover:-translate-y-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-4 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-crfal-blue-dark via-crfal-blue to-crfal-blue-light">
        <img
          src={item.cover || CFF_COVER_FALLBACK}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={handleImageError}
          className="block h-auto w-full transition-transform delay-200 duration-[350ms] group-hover:rotate-[5deg] group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-0 right-0 flex h-11 w-11 translate-x-full items-end justify-end rounded-tl-full bg-white pb-2.5 pr-2.5 text-crfal-blue opacity-0 transition duration-100 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
        >
          <Eye className="h-[1.1rem] w-[1.1rem]" />
        </span>
      </div>
    </a>
  );
}

export function CffCoverSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className={`${cffColClass} mb-10`}>
          <div className="aspect-[5/7] animate-pulse rounded-xl bg-crfal-gray-200 motion-reduce:animate-none" />
        </li>
      ))}
    </>
  );
}
