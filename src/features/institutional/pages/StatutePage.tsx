import SEO from '@/components/SEO';
import PageHero from '@/components/block/page-hero';

export default function StatutePage() {
  return (
    <div className="min-h-screen">
      <SEO
        title="Estatuto"
        description="Acesse o estatuto do Conselho Regional de Farmácia do Estado de Alagoas (CRFAL) — normas, regimentos e regulamentos internos."
        path="/instituicao/estatuto"
      />
      <PageHero
        breadcrumb={[
          { label: 'Início', href: '/' },
          { label: 'Instituição', href: '/instituicao' },
          { label: 'Estatuto' },
        ]}
        title="Estatuto"
        section="instituicao"
        lead="O documento que define a organização, as competências e o funcionamento do CRF-AL."
      />
    </div>
  );
}
