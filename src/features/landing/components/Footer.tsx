'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="footer-container"
    >
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-title">LabelMaker</h3>
          <p className="footer-description">
            Profesjonalne narzędzie do tworzenia etykiet dla nowoczesnych firm
          </p>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-section-title">Produkt</h4>
          <ul className="footer-links">
            <li><a href="#features">Funkcje</a></li>
            <li><a href="#pricing">Cennik</a></li>
            <li><Link href="/editor">Edytor</Link></li>
            <li><Link href="/templates">Szablony</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-section-title">Firma</h4>
          <ul className="footer-links">
            <li><Link href="/about">O nas</Link></li>
            <li><Link href="/contact">Kontakt</Link></li>
            <li><Link href="/careers">Kariera</Link></li>
            <li><Link href="/blog">Blog</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-section-title">Wsparcie</h4>
          <ul className="footer-links">
            <li><Link href="/help">Pomoc</Link></li>
            <li><Link href="/docs">Dokumentacja</Link></li>
            <li><Link href="/api">API</Link></li>
            <li><Link href="/status">Status</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p className="footer-copyright">
          © 2025 LabelMaker. Wszystkie prawa zastrzeżone.
        </p>
        <div className="footer-legal">
          <Link href="/privacy">Prywatność</Link>
          <Link href="/terms">Regulamin</Link>
          <Link href="/cookies">Cookies</Link>
        </div>
      </div>
    </motion.footer>
  );
}
