import { useEffect, useState } from 'react';

export const useOptimizedAnimation = () => {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    // Check for user motion preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Optimized transition settings
  const getTransition = (duration: number = 0.4, delay: number = 0, ease: string = "easeOut") => {
    if (shouldReduceMotion) {
      return { duration: 0.01, delay: 0 };
    }
    return { duration, delay, ease };
  };

  // Fast animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
  };

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  };

  const scaleIn = {
    initial: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 },
    animate: { opacity: 1, scale: 1 },
  };

  const slideInLeft = {
    initial: { opacity: 0, x: shouldReduceMotion ? 0 : 30 },
    animate: { opacity: 1, x: 0 },
  };

  return {
    shouldReduceMotion,
    getTransition,
    fadeInUp,
    fadeIn,
    scaleIn,
    slideInLeft,
  };
};
