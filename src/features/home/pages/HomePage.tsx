import HeroGradient from '@/components/home/HeroGradient';
import QuickAccess from '@/components/home/QuickAccess';
import Services from '@/components/home/Services';
import Publications from '@/components/home/Publications';

export default function HomePage() {
  return (
    <>
      <HeroGradient />
      <QuickAccess />
      <Services />
      <Publications />
    </>
  );
}
