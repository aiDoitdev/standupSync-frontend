import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/sections/HeroSection.jsx';
import HowItWorksSection from '@/components/sections/HowItWorksSection.jsx';
import FeaturesSection from '@/components/sections/FeaturesSection.jsx';
import SocialProofSection from '@/components/sections/SocialProofSection.jsx';
import PricingSection from '@/components/sections/PricingSection.jsx';
import WaitlistSection from '@/components/sections/WaitlistSection.jsx';
import FooterSection from '@/components/sections/FooterSection.jsx';

export const metadata = {
  title: 'StandupSync — AI Daily Standups for Remote Teams | AI Task Radar & Blocker Intelligence',
  description:
    'Replace daily standup meetings with AI. StandupSync\'s AI Task Radar tracks every task, Blocker Intelligence auto-detects issues, and delivers smart summaries in 30 seconds. Free to start.',
  alternates: {
    canonical: 'https://standupsync.ai',
  },
};

export default function LandingPage() {
  return (
    <main style={{ background: '#0d0628', color: 'white' }}>
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <SocialProofSection />
      <PricingSection />
      <WaitlistSection />
      <FooterSection />
    </main>
  );
}

