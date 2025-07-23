'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from './Navigation';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { PricingSection } from './PricingSection';
import { CTASection } from './CTASection';
import { Footer } from './Footer';
import { AuthModal } from '@/components/modals/AuthModal';
import './landing.styles.css';

export function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const openRegisterModal = () => {
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  };

  const openLoginModal = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };
  return (
    <div className="landing-page">
      <Navigation 
        onOpenLogin={openLoginModal}
        onOpenRegister={openRegisterModal}
      />
      
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
        <HeroSection onStartRegister={openRegisterModal} />
        <div id="features">
          <FeaturesSection onStartRegister={openRegisterModal} />
        </div>
        <div id="pricing">
          <PricingSection />
        </div>
        <CTASection onStartRegister={openRegisterModal} />
        <Footer />
      </motion.div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}
