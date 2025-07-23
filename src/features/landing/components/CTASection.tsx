'use client';

import { motion } from 'framer-motion';
import { ArrowRightIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

interface CTASectionProps {
  onStartRegister?: () => void;
}

export function CTASection({ onStartRegister }: CTASectionProps) {
  return (
    <section className="cta-section">
      <div className="cta-container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="cta-content"
        >
          <motion.div
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="cta-icon-wrapper"
          >
            <RocketLaunchIcon className="cta-icon" />
          </motion.div>

          <h2 className="cta-title">
            Gotowy na stworzenie
            <span className="cta-title-gradient"> niesamowitych etykiet?</span>
          </h2>

          <p className="cta-description">
            Dołącz do tysięcy zadowolonych użytkowników którzy już tworzą profesjonalne etykiety 
            w kilka minut. Rozpocznij swoją przygodę już dziś!
          </p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="cta-actions"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cta-btn-primary"
              onClick={onStartRegister}
            >
              <span>Rozpocznij darmowy okres próbny</span>
              <ArrowRightIcon className="cta-btn-icon" />
            </motion.button>

            <div className="cta-features">
              <div className="cta-feature">
                <div className="cta-feature-icon">✓</div>
                <span>Bez karty kredytowej</span>
              </div>
              <div className="cta-feature">
                <div className="cta-feature-icon">✓</div>
                <span>Anuluj w każdej chwili</span>
              </div>
              <div className="cta-feature">
                <div className="cta-feature-icon">✓</div>
                <span>Pełny dostęp przez 14 dni</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            viewport={{ once: true }}
            className="cta-testimonial"
          >
            <div className="testimonial-content">
              <p className="testimonial-text">
                &quot;Label Editor całkowicie zmienił sposób w jaki tworzymy etykiety dla naszych produktów. 
                To co wcześniej zajmowało godziny, teraz robimy w kilka minut!&quot;
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">
                  <span>MK</span>
                </div>
                <div className="testimonial-info">
                  <div className="testimonial-name">Michał Kowalski</div>
                  <div className="testimonial-role">CEO, EcoProducts</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="cta-background-elements">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="cta-bg-circle cta-bg-circle-1"
          ></motion.div>
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="cta-bg-circle cta-bg-circle-2"
          ></motion.div>
        </div>
      </div>
    </section>
  );
}
