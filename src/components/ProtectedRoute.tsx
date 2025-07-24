'use client';

import { useAuthContext } from '../providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingScreen } from './ui/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  fallback, 
  redirectTo = '/' 
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  console.log('🔒 ProtectedRoute: State check', { isAuthenticated, isLoading, redirectTo });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('🔒 ProtectedRoute: Not authenticated, redirecting to:', redirectTo);
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Show loading while checking authentication
  if (isLoading) {
    console.log('🔒 ProtectedRoute: Showing loading screen');
    return <LoadingScreen message="Sprawdzanie autoryzacji..." />;
  }

  // If not authenticated, show fallback or redirect
  if (!isAuthenticated) {
    console.log('🔒 ProtectedRoute: Not authenticated, showing fallback or redirect loading');
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Redirect will happen in useEffect
    return <LoadingScreen message="Przekierowanie do strony głównej..." />;
  }

  console.log('🔒 ProtectedRoute: Authenticated, rendering children');
  // If authenticated, render children
  return <>{children}</>;
};
