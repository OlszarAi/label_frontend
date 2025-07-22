'use client';

import { motion } from 'framer-motion';
import { ArrowRightIcon, PlayIcon } from '@heroicons/react/24/outline';

export function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hero-content"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="hero-badge"
          >
            ✨ Nowa generacja etykiet
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="hero-title"
          >
            Twórz profesjonalne
            <span className="hero-title-gradient"> etykiety </span>
            w kilka sekund
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="hero-description"
          >
            Zaawansowany edytor etykiet z AI, setkami szablonów i możliwością 
            eksportu w wysokiej jakości. Idealne dla firm, sklepów i użytku domowego.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="hero-actions"
          >
            <button className="hero-btn-primary">
              <span>Rozpocznij za darmo</span>
              <ArrowRightIcon className="hero-btn-icon" />
            </button>
            
            <button className="hero-btn-secondary">
              <PlayIcon className="hero-btn-icon-small" />
              <span>Zobacz demo</span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
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
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="hero-visual"
        >
          <div className="hero-visual-container">
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
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
