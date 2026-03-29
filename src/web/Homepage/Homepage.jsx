import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import Footer from './Footer';

export default function Homepage() {
  return (
    <div style={{ background: '#0d0f1a', minHeight: '100vh', fontFamily: "'Outfit', sans-serif" }}>
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
}