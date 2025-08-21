'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: string;
  subscriptionType: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  subscriptionStatus: 'INACTIVE' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Check if token is stored in localStorage and validate it
  const checkAuthOnMount = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (!storedToken || !storedUser) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Validate token with backend
      const response = await fetch('/api/auth/session', {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      });

      console.log('🔐 useAuth: Auth validation response:', response.status, response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('🔐 useAuth: Auth validation successful:', data);
        setAuthState({
          user: JSON.parse(storedUser),
          token: storedToken,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        console.log('🔐 useAuth: Auth validation failed, clearing storage');
        // Token is invalid, clear storage
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid data on error
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: email,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok && data.data?.token) {
        const { user, token } = data.data;
        
        // Store in localStorage
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        
        // Update state
        setAuthState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });

        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Connection error' };
    }
  }, []);

  // Register function
  const register = useCallback(async (userData: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => {
    try {
      // Log registration attempt without sensitive data
      console.log('🔧 Register attempt for user:', userData.email);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Connection error' };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      if (authState.token) {
        // Call backend logout
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authState.token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local data
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, [authState.token]);

  // Get user profile
  const getUserProfile = useCallback(async () => {
    if (!authState.token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${authState.token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || 'Failed to get profile' };
      }
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, error: 'Connection error' };
    }
  }, [authState.token]);

  // Check if current session is valid
  const checkSession = useCallback(async () => {
    if (!authState.token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch('/api/auth/session', {
        headers: {
          'Authorization': `Bearer ${authState.token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        // Session expired, logout
        logout();
        return { success: false, error: data.message || 'Session expired' };
      }
    } catch (error) {
      console.error('Session check error:', error);
      return { success: false, error: 'Connection error' };
    }
  }, [authState.token, logout]);

  // Check auth on component mount
  useEffect(() => {
    checkAuthOnMount();
  }, [checkAuthOnMount]);

  return {
    // State
    user: authState.user,
    token: authState.token,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    
    // Actions
    login,
    register,
    logout,
    getUserProfile,
    checkSession,
    checkAuthOnMount,
  };
};
