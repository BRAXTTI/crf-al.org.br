import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import PageHero from '@/components/block/page-hero';

export default function InstitutionalPage() {
  return (
    <div className="min-h-screen">
      <SEO
        title="Institucional"
        description="Conheça o CRFAL — história, missão, visão, valores, diretoria e estatuto do Conselho Regional de Farmácia do Estado de Alagoas."
        path="/instituicao"
      />
      <PageHero
        breadcrumb={[{ label: 'Início', href: '/' }, { label: 'Instituição' }]}
        title="Instituição"
        section="instituicao"
        lead="Conheça o Conselho Regional de Farmácia de Alagoas: história, missão, valores, diretoria e estatuto."
      />
      <nav aria-label="Páginas institucionais" className="container-crfal py-12">
        <ul className="space-y-4">
          <li><Link className="inline-flex min-h-11 items-center underline" to="/instituicao/sobre-conselho">Sobre o Conselho</Link></li>
          <li><Link className="inline-flex min-h-11 items-center underline" to="/instituicao/diretoria">Diretoria</Link></li>
          <li><Link className="inline-flex min-h-11 items-center underline" to="/instituicao/plenarias">Plenárias</Link></li>
        </ul>
      </nav>
    </div>
  );
}
