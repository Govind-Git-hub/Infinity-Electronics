import HeroSection from '../components/home/HeroSection';
import CategorySection from '../components/home/CategorySection';
import FeaturedProducts from '../components/home/FeaturedProducts';
import PromoBanner from '../components/home/PromoBanner';
import WhyChooseUs from '../components/home/WhyChooseUs';

const Home = () => {
  return (
    <main>
      <HeroSection />
      <CategorySection />
      <FeaturedProducts />
      <PromoBanner />
      <WhyChooseUs />
    </main>
  );
};

export default Home;