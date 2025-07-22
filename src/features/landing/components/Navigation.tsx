'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuthContext } from '@/providers/AuthProvider';
import { AuthModal } from '@/components/modals/AuthModal';
import { UserMenu } from '@/components/navigation/UserMenu';

export function Navigation() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const { isAuthenticated, isLoading } = useAuthContext();

  const openLoginModal = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="nav-container"
      >
        <div className="nav-content">
          <Link href="/landing" className="nav-logo">
            <span className="nav-logo-text">LabelMaker</span>
          </Link>
          
          <div className="nav-links">
            <a href="#features" className="nav-link">Funkcje</a>
            <a href="#pricing" className="nav-link">Cennik</a>
            
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <UserMenu />
                ) : (
                  <>
                    <button onClick={openLoginModal} className="nav-link">
                      Logowanie
                    </button>
                    <button onClick={openRegisterModal} className="nav-btn-primary">
                      Rozpocznij teraz
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </motion.nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
}
