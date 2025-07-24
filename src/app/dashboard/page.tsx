'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/features/landing/components/Navigation';
import { DashboardView } from '@/features/landing/components/DashboardView';
import { AuthModal } from '@/components/modals/AuthModal';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import '@/features/landing/components/landing.styles.css';

export default function DashboardPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  console.log('📊 Dashboard: Rendering dashboard page');
  
  // Force client-side rendering check
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    console.log('📊 Dashboard: Component mounted');
  }, []);

  const openRegisterModal = () => {
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  };

  const openLoginModal = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const dashboardContent = (
    <div className="dashboard-page-wrapper">
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
    </div>
  );

  console.log('📊 Dashboard: Rendering protected content');

  if (!mounted) {
    console.log('📊 Dashboard: Not mounted yet, showing loading');
    return <LoadingScreen message="Inicjalizacja dashboardu..." />;
  }

  return (
    <ProtectedRoute>
      {dashboardContent}
    </ProtectedRoute>
  );
}
