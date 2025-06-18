'use client';

import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  BoltIcon, 
  CloudArrowUpIcon, 
  DevicePhoneMobileIcon,
  PaintBrushIcon,
  CogIcon 
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: SparklesIcon,
    title: 'AI-Powered Design',
    description: 'Sztuczna inteligencja pomoże Ci stworzyć idealne etykiety w kilka kliknięć',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: BoltIcon,
    title: 'Błyskawiczna wydajność',
    description: 'Nowoczesny silnik renderowania zapewnia płynną pracę nawet z dużymi projektami',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: PaintBrushIcon,
    title: 'Setki szablonów',
    description: 'Gotowe wzory dla każdej branży - od produktów spożywczych po kosmetyki',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: CloudArrowUpIcon,
    title: 'Chmura i synchronizacja',
    description: 'Wszystkie projekty automatycznie zapisywane w chmurze z dostępem z każdego urządzenia',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: DevicePhoneMobileIcon,
    title: 'Responsive Design',
    description: 'Pracuj wygodnie na komputerze, tablecie lub smartfonie - wszędzie tak samo dobrze',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    icon: CogIcon,
    title: 'Zaawansowane narzędzia',
    description: 'Profesjonalne funkcje jak warstwy, maski, filtry i eksport w najwyższej jakości',
    color: 'from-teal-500 to-cyan-500'
  }
];

export function FeaturesSection() {
  return (
    <section className="features-section">
      <div className="features-container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="features-header"
        >
          <h2 className="features-title">
            Wszystko czego potrzebujesz
            <span className="features-title-gradient"> w jednym miejscu</span>
          </h2>
          <p className="features-description">
            Nasza platforma łączy w sobie moc profesjonalnych narzędzi z prostotą obsługi
          </p>
        </motion.div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="feature-card"
            >
              <div className={`feature-icon-wrapper bg-gradient-to-r ${feature.color}`}>
                <feature.icon className="feature-icon" />
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="features-showcase"
        >
          <div className="showcase-content">
            <h3 className="showcase-title">Zobacz Label Editor w akcji</h3>
            <p className="showcase-description">
              Intuicyjny interfejs, zaawansowane funkcje i nieograniczone możliwości twórcze
            </p>
            <button className="showcase-btn">
              <span>Rozpocznij darmowy okres próbny</span>
            </button>
          </div>
          <div className="showcase-visual">
            <motion.div
              animate={{
                scale: [1, 1.02, 1],
                rotate: [0, 1, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="showcase-mockup"
            >
              <div className="mockup-screen">
                <div className="mockup-toolbar">
                  <div className="mockup-tool-group">
                    <div className="mockup-tool active"></div>
                    <div className="mockup-tool"></div>
                    <div className="mockup-tool"></div>
                  </div>
                </div>
                <div className="mockup-canvas">
                  <div className="mockup-label">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="mockup-element"
                    ></motion.div>
                    <div className="mockup-text-lines">
                      <div className="mockup-text-line"></div>
                      <div className="mockup-text-line short"></div>
                    </div>
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
