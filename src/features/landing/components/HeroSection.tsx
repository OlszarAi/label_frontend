'use client';

import { motion } from 'framer-motion';
import { ArrowRightIcon, PlayIcon } from '@heroicons/react/24/outline';

interface HeroSectionProps {
  onStartRegister?: () => void;
}

export function HeroSection({ onStartRegister }: HeroSectionProps) {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hero-content"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            className="hero-badge"
          >
            Profesjonalny edytor etykiet
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="hero-title"
          >
            Twórz profesjonalne
            <span className="hero-title-gradient"> etykiety </span>
            w kilka sekund
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            className="hero-description"
          >
            Zaawansowany edytor etykiet z setkami szablonów i możliwością 
            eksportu w wysokiej jakości. Idealne dla firm, sklepów i użytku domowego.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
            className="hero-actions"
          >
            <button className="hero-btn-primary" onClick={onStartRegister}>
              <span>Rozpocznij za darmo</span>
              <ArrowRightIcon className="hero-btn-icon" />
            </button>
            
            <button className="hero-btn-secondary">
              <PlayIcon className="hero-btn-icon-small" />
              <span>Zobacz demo</span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
            className="hero-stats"
          >
            <div className="hero-stat">
              <div className="hero-stat-number">50k+</div>
              <div className="hero-stat-label">Aktywnych użytkowników</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">1M+</div>
              <div className="hero-stat-label">Utworzonych etykiet</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">99.9%</div>
              <div className="hero-stat-label">Zadowolenia</div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="hero-visual"
        >
          <div className="hero-visual-container">
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="hero-visual-floating"
            >
              <div className="hero-preview-card">
                <div className="hero-preview-header">
                  <div className="hero-preview-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="hero-preview-title">Label Editor</span>
                </div>
                <div className="hero-preview-content">
                  <div className="hero-preview-canvas">
                    <div className="hero-preview-label">
                      <div className="hero-preview-logo"></div>
                      <div className="hero-preview-text">
                        <div className="hero-preview-line"></div>
                        <div className="hero-preview-line short"></div>
                      </div>
                    </div>
                  </div>
                  <div className="hero-preview-tools">
                    <div className="hero-preview-tool"></div>
                    <div className="hero-preview-tool"></div>
                    <div className="hero-preview-tool active"></div>
                    <div className="hero-preview-tool"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
