'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from './Navigation';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { PricingSection } from './PricingSection';
import { CTASection } from './CTASection';
import { Footer } from './Footer';
import { DashboardView } from './DashboardView';
import { AuthModal } from '@/components/modals/AuthModal';
import { EarlyAccessBanner } from '@/components/EarlyAccessBanner';
import { useAuthContext } from '@/providers/AuthProvider';
import './landing.styles.css';

export function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const { isAuthenticated, isLoading } = useAuthContext();

  const openRegisterModal = () => {
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  };

  const openLoginModal = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  // Jeśli użytkownik jest zalogowany, pokaż dashboard
  if (isAuthenticated && !isLoading) {
    return (
      <>
        <Navigation 
          onOpenLogin={openLoginModal}
          onOpenRegister={openRegisterModal}
        />
        <DashboardView />
        
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
        />
      </>
    );
  }

  // Dla niezalogowanych użytkowników - pokazuj marketing landing page
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

      {/* Fixed Early Access Banner Overlay - tylko na landing page */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <EarlyAccessBanner />
        </div>
      </div>
    </div>
  );
}
