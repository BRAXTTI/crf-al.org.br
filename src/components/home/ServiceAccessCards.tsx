import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { CRF_EM_CASA_URL } from '@/config/site';

const cardClass = 'group relative flex min-h-[104px] items-center overflow-hidden bg-crfal-blue p-5 text-white transition-shadow first:rounded-t-xl last:rounded-b-xl last:bg-crfal-blue-light focus-visible:z-10 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white motion-reduce:transition-none sm:p-7 md:min-h-[196px] md:flex-col md:items-start md:rounded-xl md:shadow-card md:hover:shadow-card-hover md:last:bg-crfal-blue md:focus-visible:ring-crfal-blue md:focus-visible:ring-offset-4 md:focus-visible:ring-offset-background';

function CardContent({ title, description, image, action, shortAction, external = false }: {
  title: string;
  description: string;
  image: string;
  action: string;
  /** Rótulo do botão abaixo de 768px, onde a descrição some. */
  shortAction: string;
  external?: boolean;
}) {
  const Arrow = external ? ArrowUpRight : ArrowRight;
  return (
    <>
      <picture>
        <source media="(min-width: 768px)" srcSet={image} />
        <img alt="" width={1672} height={941} decoding="async" className="pointer-events-none absolute inset-0 h-full w-full object-cover object-right" />
      </picture>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_35%,rgba(0,102,204,0.38),transparent_55%),linear-gradient(110deg,#0b192c_0%,#003366_65%,#004582_100%)] group-last:bg-[radial-gradient(ellipse_at_85%_35%,rgba(0,102,204,0.55),transparent_55%),linear-gradient(110deg,#003366_0%,#004b95_65%,#0066cc_100%)] md:hidden" />
      <svg aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 h-full w-[60%] md:hidden" viewBox="0 0 240 104" preserveAspectRatio="xMaxYMid slice" fill="none">
        <g stroke="#e6f0f8" strokeWidth="1" opacity=".18">
          <path d="M120-20l22 13v26l-22 13-22-13V-7z M164-20l22 13v26l-22 13-22-13V-7z M208-20l22 13v26l-22 13-22-13V-7z M98 19l22 13v26L98 71 76 58V32z M142 19l22 13v26l-22 13-22-13V32z M186 19l22 13v26l-22 13-22-13V32z M230 19l22 13v26l-22 13-22-13V32z M120 58l22 13v26l-22 13-22-13V71z M164 58l22 13v26l-22 13-22-13V71z M208 58l22 13v26l-22 13-22-13V71z" />
        </g>
        <g fill="#e6f0f8" opacity=".09">
          <path d="M164-20l22 13v26l-22 13-22-13V-7z M186 19l22 13v26l-22 13-22-13V32z M120 58l22 13v26l-22 13-22-13V71z" />
        </g>
        <g stroke="#e6f0f8" strokeWidth=".7" opacity=".09">
          <path d="M157-10l34 20v40l-34 20-34-20V10z M225-10l34 20v40l-34 20-34-20V10z M191 50l34 20v40l-34 20-34-20V70z" />
        </g>
      </svg>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden bg-linear-to-r/srgb from-crfal-blue via-crfal-blue/90 to-crfal-blue/30 group-last:from-crfal-blue-light group-last:via-crfal-blue-light/90 md:block md:to-crfal-blue/10 md:group-last:from-crfal-blue md:group-last:via-crfal-blue/90" />
      <div className="relative flex w-full flex-1 items-center justify-between gap-4 md:h-full md:flex-col md:items-start">
        <h2 className="min-w-0 max-w-76 text-lg font-bold leading-tight sm:text-2xl sm:leading-8 md:text-2xl">{title}</h2>
        <p className="mb-5 mt-2 hidden max-w-76 text-sm leading-relaxed text-white/90 md:block">{description}</p>
        <span className="inline-flex min-h-11 shrink-0 items-center gap-3 rounded-full bg-white px-4 py-2 text-xs font-bold text-crfal-blue transition-colors group-hover:bg-crfal-blue-lighter motion-reduce:transition-none sm:text-sm md:mt-auto md:rounded-lg">
          <span className="md:hidden">{shortAction}</span><span className="hidden md:inline">{action}</span><Arrow className="h-4 w-4" aria-hidden="true" />
        </span>
        {external && <span className="sr-only">Abre em uma nova aba.</span>}
      </div>
    </>
  );
}

export default function ServiceAccessCards() {
  return (
    <section aria-label="Acesso aos serviços" className="mb-5 grid rounded-xl md:grid-cols-2 md:gap-5">
      <a href={CRF_EM_CASA_URL} target="_blank" rel="noopener noreferrer" className={cardClass}>
        <CardContent title="CRF AL em Casa" description="Acesse sua área de atendimento online." image="/images/crf-em-casa-card-v3.webp" action="Acessar o sistema" shortAction="Entrar" external />
      </a>
      <Link to="/servicos/requerimentos" className={cardClass}>
        <CardContent title="Serviços e Requerimentos" description="Consulte documentos e orientações para profissionais e estabelecimentos." image="/images/servicos-requerimentos-card-v2.webp" action="Consultar serviços" shortAction="Consultar" />
      </Link>
    </section>
  );
}
