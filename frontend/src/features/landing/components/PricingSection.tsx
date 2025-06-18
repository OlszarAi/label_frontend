'use client';

import { motion } from 'framer-motion';
import { CheckIcon, StarIcon } from '@heroicons/react/24/solid';

const plans = [
  {
    name: 'Starter',
    price: 'Darmowy',
    period: 'na zawsze',
    description: 'Idealne do rozpoczęcia przygody z tworzeniem etykiet',
    features: [
      'Do 10 etykiet miesięcznie',
      'Podstawowe szablony',
      'Eksport w standardowej jakości',
      'Wsparcie społeczności',
      'Podstawowe narzędzia edycji'
    ],
    buttonText: 'Rozpocznij za darmo',
    popular: false,
    color: 'from-gray-600 to-gray-800'
  },
  {
    name: 'Professional',
    price: '29',
    period: '/miesiąc',
    description: 'Dla profesjonalistów i małych firm',
    features: [
      'Nielimitowane etykiety',
      'Wszystkie szablony premium',
      'Eksport w najwyższej jakości',
      'AI Design Assistant',
      'Priorytetowe wsparcie',
      'Zaawansowane narzędzia',
      'Integracje z e-commerce',
      'Współpraca zespołowa'
    ],
    buttonText: 'Wybierz Professional',
    popular: true,
    color: 'from-blue-600 to-blue-800'
  },
  {
    name: 'Enterprise',
    price: '99',
    period: '/miesiąc',
    description: 'Dla dużych firm i agencji',
    features: [
      'Wszystko z Professional',
      'Dedykowany account manager',
      'API dostęp',
      'White-label rozwiązania',
      'Zaawansowana analityka',
      'SSO i zarządzanie użytkownikami',
      'SLA 99.9%',
      'Szkolenia dla zespołu'
    ],
    buttonText: 'Skontaktuj się z nami',
    popular: false,
    color: 'from-purple-600 to-purple-800'
  }
];

export function PricingSection() {
  return (
    <section className="pricing-section">
      <div className="pricing-container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="pricing-header"
        >
          <h2 className="pricing-title">
            Wybierz plan
            <span className="pricing-title-gradient"> idealny dla Ciebie</span>
          </h2>
          <p className="pricing-description">
            Transparentne ceny bez ukrytych kosztów. Możesz zmienić plan w każdej chwili.
          </p>
        </motion.div>

        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className={`pricing-card ${plan.popular ? 'pricing-card-popular' : ''}`}
            >
              {plan.popular && (
                <div className="pricing-badge">
                  <StarIcon className="pricing-badge-icon" />
                  <span>Najpopularniejszy</span>
                </div>
              )}

              <div className="pricing-card-header">
                <h3 className="pricing-plan-name">{plan.name}</h3>
                <p className="pricing-plan-description">{plan.description}</p>
              </div>

              <div className="pricing-card-price">
                <div className="pricing-price-wrapper">
                  {plan.price !== 'Darmowy' && (
                    <span className="pricing-currency">zł</span>
                  )}
                  <span className="pricing-amount">{plan.price}</span>
                  <span className="pricing-period">{plan.period}</span>
                </div>
              </div>

              <div className="pricing-card-features">
                <ul className="pricing-features-list">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="pricing-feature">
                      <CheckIcon className="pricing-feature-icon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`pricing-btn ${plan.popular ? 'pricing-btn-popular' : 'pricing-btn-default'}`}
              >
                {plan.buttonText}
              </motion.button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="pricing-guarantee"
        >
          <div className="guarantee-content">
            <h3 className="guarantee-title">30-dniowa gwarancja zwrotu pieniędzy</h3>
            <p className="guarantee-description">
              Jeśli nie będziesz zadowolony z naszego produktu, zwrócimy Ci pieniądze bez pytań
            </p>
          </div>
          <div className="guarantee-badges">
            <div className="guarantee-badge">
              <CheckIcon className="guarantee-badge-icon" />
              <span>Bez ryzyka</span>
            </div>
            <div className="guarantee-badge">
              <CheckIcon className="guarantee-badge-icon" />
              <span>Anuluj w każdej chwili</span>
            </div>
            <div className="guarantee-badge">
              <CheckIcon className="guarantee-badge-icon" />
              <span>Pełny zwrot</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
