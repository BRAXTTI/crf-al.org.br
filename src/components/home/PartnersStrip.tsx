import { Link } from 'react-router-dom';
import { ArrowRight, Handshake } from 'lucide-react';
import { Reveal } from '@/components/ui/reveal';
import { parceiros as defaultParceiros, type Parceiro } from '@/data/parceiros';

/** Segundos por parceiro numa volta da faixa: o ritmo fica igual com mais ou menos logos. */
const SECONDS_PER_ITEM = 4;

function PartnerTile({ parceiro }: { parceiro: Parceiro }) {
  const content = parceiro.logo ? (
    <img src={parceiro.logo} alt={parceiro.nome} loading="lazy" decoding="async" className="max-h-12 w-auto max-w-[140px] object-contain" />
  ) : (
    <span className="flex flex-col items-center text-center">
      <span className="text-[19px] font-extrabold leading-none tracking-tight" style={{ color: parceiro.color }}>{parceiro.nome}</span>
      {parceiro.categoria && <span className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-crfal-gray-500">{parceiro.categoria}</span>}
    </span>
  );
  const tileClass = 'flex h-20 w-40 shrink-0 sm:h-24 sm:w-48 items-center justify-center rounded-xl border border-crfal-gray-200 bg-white px-5 grayscale-[35%] transition-[filter,box-shadow] duration-300 hover:grayscale-0 hover:shadow-card motion-reduce:transition-none';

  return parceiro.href ? (
    <a
      href={parceiro.href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={`${parceiro.nome} (abre em nova aba)`}
      className={`${tileClass} focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-2`}
    >
      {content}
    </a>
  ) : (
    <div className={tileClass}>{content}</div>
  );
}

interface PartnersStripProps {
  /** Lista de parceiros. Padrão: `src/data/parceiros.ts`. */
  items?: Parceiro[];
}

/**
 * Faixa de logos de parceiros na home.
 *
 * Desliza sem parar e pausa com o ponteiro ou o foco. Com movimento reduzido, vira uma grade parada.
 * A lista é renderizada duas vezes para a volta fechar sem salto; a cópia fica fora da árvore de acessibilidade.
 */
export default function PartnersStrip({ items = defaultParceiros }: PartnersStripProps) {
  if (items.length === 0) return null;
  const isPreview = items.some((parceiro) => parceiro.exemplo);

  return (
    <section className="py-2 sm:py-3" aria-labelledby="partners-title">
      <div className="container-crfal">
        <Reveal className="section-panel">
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6A12]">
                <Handshake className="h-3.5 w-3.5" aria-hidden="true" /> Parcerias
              </p>
              <h2 id="partners-title" className="mt-2 text-[26px] font-bold leading-tight tracking-tight text-crfal-blue sm:text-[32px]">Parceiros do CRF-AL</h2>
              <span aria-hidden="true" className="mt-3 block h-0.5 w-10 rounded-full bg-crfal-gold" />
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-crfal-gray-600">Instituições que oferecem cursos, eventos e benefícios aos farmacêuticos inscritos no Conselho.</p>
            </div>
            <Link to="/contato" className="group inline-flex min-h-11 items-center gap-2 self-start rounded-md text-sm font-semibold text-crfal-blue hover:text-crfal-blue-light focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-crfal-blue focus-visible:ring-offset-4 sm:self-auto">
              Seja um parceiro <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
            </Link>
          </div>

          <div className="group/marquee relative -mx-4 overflow-hidden sm:-mx-6 md:-mx-8 lg:-mx-12 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] motion-reduce:[mask-image:none]">
            <div
              className="flex w-max animate-marquee gap-3 px-3 sm:gap-4 sm:px-4 group-hover/marquee:[animation-play-state:paused] group-focus-within/marquee:[animation-play-state:paused] motion-reduce:w-auto motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center"
              style={{ '--marquee-duration': `${items.length * SECONDS_PER_ITEM}s` } as React.CSSProperties}
            >
              <ul className="flex gap-3 sm:gap-4 motion-reduce:flex-wrap motion-reduce:justify-center">
                {items.map((parceiro) => (
                  <li key={parceiro.nome}><PartnerTile parceiro={parceiro} /></li>
                ))}
              </ul>
              <ul className="flex gap-3 sm:gap-4 motion-reduce:hidden" aria-hidden="true" inert>
                {items.map((parceiro) => (
                  <li key={parceiro.nome}><PartnerTile parceiro={parceiro} /></li>
                ))}
              </ul>
            </div>
          </div>

          {isPreview && (
            <p className="mt-6 border-t border-crfal-gray-100 pt-4 text-[12.5px] text-crfal-gray-600">
              Prévia com logos ilustrativas: os nomes acima são exemplos e não representam parcerias firmadas.
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
