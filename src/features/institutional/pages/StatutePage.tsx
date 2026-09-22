import SEO from '@/components/SEO';

export default function StatutePage() {
  return (
    <div className="pt-28 lg:pt-44 pb-16">
      <SEO
        title="Estatuto"
        description="Acesse o estatuto do Conselho Regional de Farmácia do Estado de Alagoas (CRFAL) — normas, regimentos e regulamentos internos."
        path="/instituicao/estatuto"
      />
      <div className="container-crfal">
        <h1 className="text-2xl font-semibold text-crfal-gray-dark">Estatuto</h1>
      </div>
    </div>
  );
}
