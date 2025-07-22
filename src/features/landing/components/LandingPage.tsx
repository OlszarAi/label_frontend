'use client';

import { motion } from 'framer-motion';
import { Navigation } from './Navigation';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { PricingSection } from './PricingSection';
import { CTASection } from './CTASection';
import { Footer } from './Footer';
import './landing.styles.css';

export function LandingPage() {
  return (
    <div className="landing-page">
      <Navigation />
      
      <div className="landing-background">
        <div className="background-grid"></div>
        <div className="background-glow"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="landing-content"
      >
        <HeroSection />
        <div id="features">
          <FeaturesSection />
        </div>
        <div id="pricing">
          <PricingSection />
        </div>
        <CTASection />
        <Footer />
      </motion.div>
    </div>
  );
}
