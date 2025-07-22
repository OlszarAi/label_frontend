import { useState, useEffect, useCallback } from 'react';
import { ProfileData, Subscription } from '../types/profile.types';
import { profileService } from '../services/profileService';
import { createMockProfileData, createMockSubscriptionHistory } from '../services/mockData';
import { useAuthContext } from '@/providers/AuthProvider';

// Enable mock mode for development
const USE_MOCK_DATA = false; // Changed to false to always use real backend data

export const useProfile = () => {
  const { user, token } = useAuthContext();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = useCallback(async () => {
    if (!user || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      if (USE_MOCK_DATA) {
        // Use mock data for development
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        const mockData = createMockProfileData();
        const mockHistory = createMockSubscriptionHistory();
        setProfileData(mockData);
        setSubscriptionHistory(mockHistory);
        return;
      }

      // Pobierz pełne dane profilu (zawiera już historię subskrypcji)
      const profileResult = await profileService.getProfileData(token);
      if (!profileResult.success) {
        throw new Error(profileResult.error || 'Failed to fetch profile data');
      }

      if (profileResult.data) {
        setProfileData(profileResult.data);
        // Historia subskrypcji jest już zawarta w danych profilu
        if (profileResult.data.subscriptionHistory) {
          setSubscriptionHistory(profileResult.data.subscriptionHistory);
        }
      }
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [user, token]);

  const updateProfile = async (data: Partial<{
    firstName: string;
    lastName: string;
    email: string;
  }>) => {
    if (!token) {
      throw new Error('No authentication token');
    }

    const result = await profileService.updateProfile(token, data);
    if (result.success) {
      // Odśwież dane profilu po aktualizacji
      await fetchProfileData();
    }
    return result;
  };

  const changePassword = async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    if (!token) {
      throw new Error('No authentication token');
    }

    return await profileService.changePassword(token, passwordData);
  };

  const cancelSubscription = async () => {
    if (!token) {
      throw new Error('No authentication token');
    }

    const result = await profileService.cancelSubscription(token);
    if (result.success) {
      // Odśwież dane profilu po anulowaniu subskrypcji
      await fetchProfileData();
    }
    return result;
  };

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  return {
    profileData,
    subscriptionHistory,
    isLoading,
    error,
    refetch: fetchProfileData,
    updateProfile,
    changePassword,
    cancelSubscription,
  };
};
