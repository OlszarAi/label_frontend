'use client';

import { useEffect } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/features/user-profile';

export default function ProfilePage() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/landing');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="profile-spinner"></div>
          <p>Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <UserProfile />;
}
