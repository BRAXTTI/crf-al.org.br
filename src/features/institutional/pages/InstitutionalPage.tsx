import SEO from '@/components/SEO';

export default function InstitutionalPage() {
  return (
    <div className="pt-28 lg:pt-44 pb-16">
      <SEO
        title="Institucional"
        description="Conheça o CRFAL — história, missão, visão, valores, diretoria e estatuto do Conselho Regional de Farmácia do Estado de Alagoas."
        path="/instituicao"
      />
      <div className="container-crfal">
        <h1 className="text-2xl font-semibold text-crfal-gray-dark">Instituição</h1>
      </div>
    </div>
  );
}
