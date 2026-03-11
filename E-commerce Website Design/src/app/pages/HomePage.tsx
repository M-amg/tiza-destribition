import { Hero } from '../components/Hero';
import { Categories } from '../components/Categories';
import { FeaturedProducts } from '../components/FeaturedProducts';
import { PromoBanner } from '../components/PromoBanner';
import { PromoSection } from '../components/PromoSection';

export function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <PromoBanner />
      <FeaturedProducts />
      <PromoSection />
    </>
  );
}
