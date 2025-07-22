import { ProfileData, Subscription } from '../types/profile.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const profileService = {
  /**
   * Pobiera pełne dane profilu użytkownika
   */
  async getProfileData(token: string): Promise<{ success: boolean; data?: ProfileData; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile/full`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error fetching profile data:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  /**
   * Pobiera historię subskrypcji użytkownika
   * NOTE: Obecnie nieużywane - dane są pobierane z /profile/full
   */
  async getSubscriptionHistory(token: string): Promise<{ success: boolean; data?: Subscription[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/subscription/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  /**
   * Pobiera aktualną subskrypcję użytkownika
   * NOTE: Obecnie nieużywane - dane są pobierane z /profile/full
   */
  async getCurrentSubscription(token: string): Promise<{ success: boolean; data?: Subscription; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/subscription/active`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching current subscription:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  /**
   * Aktualizuje dane profilu użytkownika
   */
  async updateProfile(token: string, profileData: Partial<{
    firstName: string;
    lastName: string;
    email: string;
  }>): Promise<{ success: boolean; data?: unknown; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  /**
   * Zmienia hasło użytkownika
   */
  async changePassword(token: string, passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error changing password:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  /**
   * Anuluje subskrypcję
   */
  async cancelSubscription(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subscriptions/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },
};
