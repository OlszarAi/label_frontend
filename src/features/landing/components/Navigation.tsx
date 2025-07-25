'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuthContext } from '@/providers/AuthProvider';
import { UserMenu } from '@/components/navigation/UserMenu';
import './landing.styles.css';

interface NavigationProps {
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
}

export function Navigation({ onOpenLogin, onOpenRegister }: NavigationProps) {
  const { isAuthenticated, isLoading } = useAuthContext();

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
            {/* Funkcje i Cennik tylko dla niezalogowanych */}
            {!isAuthenticated && (
              <>
                <a href="#features" className="nav-link">Funkcje</a>
                <a href="#pricing" className="nav-link">Cennik</a>
              </>
            )}
            
            {/* Dla zalogowanych - szybkie linki do głównych sekcji */}
            {isAuthenticated && (
              <>
                <Link href="/projects" className="nav-link">Projekty</Link>
                <Link href="/editor" className="nav-link">Edytor</Link>
              </>
            )}
            
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <UserMenu />
                ) : (
                  <>
                    <button onClick={onOpenLogin} className="nav-link">
                      Logowanie
                    </button>
                    <button onClick={onOpenRegister} className="nav-btn-primary">
                      Rozpocznij teraz
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </motion.nav>
    </>
  );
}
