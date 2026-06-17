import HeroGradient from '@/components/home/HeroGradient';
import QuickAccess from '@/components/home/QuickAccess';
import Services from '@/components/home/Services';
import Publications from '@/components/home/Publications';
import SEO from '@/components/SEO';

export default function HomePage() {
  return (
    <>
      <SEO
        title="Conselho Regional de Farmácia de Alagoas"
        description="CRFAL — Conselho Regional de Farmácia de Alagoas. Fiscalização, registros, serviços e informações para profissionais e estabelecimentos farmacêuticos em Alagoas."
        path="/"
      />
      <HeroGradient />
      <QuickAccess />
      <Services />
      <Publications />
    </>
  );
}
