'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function Navigation() {
  return (
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
          <Link href="/login" className="nav-link">Logowanie</Link>
          <Link href="/editor" className="nav-btn-primary">
            Rozpocznij teraz
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
