'use client';

import { useEffect } from 'react';
import { LandingPage } from '@/features/landing';
import { useAuthContext } from '@/providers/AuthProvider';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    console.log('🏠 Home: Auth state changed', { isAuthenticated, isLoading });
    // Jeśli użytkownik jest zalogowany, przekieruj do dashboardu
    if (isAuthenticated && !isLoading) {
      console.log('🚀 Home: Redirecting to dashboard');
      // Używamy window.location.href zamiast router.push dla hard redirect
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated, isLoading]);

  console.log('🏠 Home: Rendering with state', { isAuthenticated, isLoading });

  // Pokaż loading screen podczas sprawdzania autoryzacji
  if (isLoading) {
    console.log('🔄 Home: Showing loading screen');
    return <LoadingScreen message="Sprawdzanie sesji..." />;
  }

  // Jeśli użytkownik jest zalogowany, nie pokazuj landing page (będzie redirect)
  if (isAuthenticated) {
    console.log('🔄 Home: User authenticated, showing redirect loading');
    return <LoadingScreen message="Przekierowanie do dashboardu..." />;
  }

  console.log('📄 Home: Showing landing page');
  // Dla niezalogowanych użytkowników - pokaż landing page
  return <LandingPage />;
}
