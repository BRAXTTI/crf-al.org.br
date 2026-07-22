import HeroSlider from '@/components/home/HeroSlider';
import ImpactStrip from '@/components/home/ImpactStrip';
import InstitutionalCards from '@/components/home/InstitutionalCards';
import Pillars from '@/components/home/Pillars';
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
      <HeroSlider />
      <ImpactStrip />
      <InstitutionalCards />
      <Pillars />
      <Services />
      <Publications />
    </>
  );
}
