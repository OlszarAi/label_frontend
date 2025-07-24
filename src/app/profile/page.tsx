'use client';

import { UserProfile } from '@/features/user-profile';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function ProfilePage() {
  return (
    <ProtectedRoute redirectTo="/landing">
      <UserProfile />
    </ProtectedRoute>
  );
}
