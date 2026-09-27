import SEO from '@/components/SEO';
import PageHero from '@/components/block/page-hero';

export default function InstitutionalPage() {
  return (
    <div className="min-h-screen bg-crfal-gray-50">
      <SEO
        title="Institucional"
        description="Conheça o CRFAL — história, missão, visão, valores, diretoria e estatuto do Conselho Regional de Farmácia do Estado de Alagoas."
        path="/instituicao"
      />
      <PageHero
        breadcrumb={[{ label: 'Início', href: '/' }, { label: 'Instituição' }]}
        eyebrow="Institucional"
        title="Instituição"
        description="Conheça o CRFAL — história, missão, visão, valores, diretoria e estatuto do Conselho Regional de Farmácia do Estado de Alagoas."
      />
    </div>
  );
}
