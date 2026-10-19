import HeroSlider from '@/components/home/HeroSlider';
import ServiceProfiles from '@/components/home/ServiceProfiles';
import InstagramFeed from '@/components/InstagramFeed';
import Publications from '@/components/home/Publications';
import CffPublications from '@/components/home/CffPublications';
import SEO from '@/components/SEO';
import ServiceAccessCards from '@/components/home/ServiceAccessCards';
import AgoraNoConselho from '@/components/home/AgoraNoConselho';

export default function HomePage() {
  return (
    <>
      <SEO
        title="Conselho Regional de Farmácia do Estado de Alagoas"
        description="CRFAL — Conselho Regional de Farmácia do Estado de Alagoas. Fiscalização, registros, serviços e informações para profissionais e estabelecimentos farmacêuticos em Alagoas."
        path="/"
      />
      <div className="pt-(--home-header-offset)">
        <div className="container-crfal pb-6 pt-5 sm:pb-8 sm:pt-8">
          <ServiceAccessCards />
          <HeroSlider />
        </div>
      </div>
      <AgoraNoConselho />
      <ServiceProfiles />
      <Publications />
      <CffPublications />
      <InstagramFeed />
    </>
  );
}
