import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { CRF_EM_CASA_URL } from '@/config/site';

const cardClass = 'group relative flex min-h-[104px] items-center overflow-hidden bg-crfal-blue p-5 text-white transition-shadow first:rounded-t-xl last:rounded-b-xl last:bg-crfal-blue-light focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white motion-reduce:transition-none sm:p-7 md:min-h-[196px] md:flex-col md:items-start md:rounded-xl md:shadow-card md:hover:shadow-card-hover md:last:bg-crfal-blue md:focus-visible:ring-crfal-blue md:focus-visible:ring-offset-4 md:focus-visible:ring-offset-background';

function CardContent({ title, description, image, action, external = false }: {
  title: string;
  description: string;
  image: string;
  action: string;
  external?: boolean;
}) {
  const Arrow = external ? ArrowUpRight : ArrowRight;
  return (
    <>
      <img src={image} alt="" width={1536} height={512} decoding="async" className="pointer-events-none absolute inset-0 h-full w-full object-cover object-right" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-crfal-blue via-crfal-blue/90 to-crfal-blue/30 group-last:from-crfal-blue-light group-last:via-crfal-blue-light/90 md:to-crfal-blue/10 md:group-last:from-crfal-blue md:group-last:via-crfal-blue/90" />
      <div className="relative flex w-full flex-1 items-center justify-between gap-4 md:h-full md:flex-col md:items-start">
        <h2 className="min-w-0 max-w-[19rem] text-lg font-bold leading-tight sm:text-2xl md:text-2xl">{title}</h2>
        <p className="mb-5 mt-2 hidden max-w-[19rem] text-sm leading-relaxed text-white/90 md:block">{description}</p>
        <span className="inline-flex min-h-11 shrink-0 items-center gap-3 rounded-full bg-white px-4 py-2 text-xs font-bold text-crfal-blue transition-colors group-hover:bg-crfal-blue-lighter motion-reduce:transition-none sm:text-sm md:mt-auto md:rounded-lg">
          <span className="md:hidden">Acessar</span><span className="hidden md:inline">{action}</span><Arrow className="hidden h-4 w-4 md:block" aria-hidden="true" />
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
        <CardContent title="CRF em Casa" description="Acesse sua área de atendimento online." image="/images/crf-em-casa-card-v2.webp" action="Acessar o sistema" external />
      </a>
      <Link to="/servicos/requerimentos" className={cardClass}>
        <CardContent title="Serviços e Requerimentos" description="Consulte documentos e orientações para profissionais e estabelecimentos." image="/images/servicos-requerimentos-card-v1.webp" action="Consultar serviços" />
      </Link>
    </section>
  );
}
