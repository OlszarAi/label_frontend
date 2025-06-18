'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthContext } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import './profile.css';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, getUserProfile } = useAuthContext();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/landing');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated && user) {
        setLoadingProfile(true);
        const result = await getUserProfile();
        if (result.success) {
          setProfileData(result.data);
        }
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, user, getUserProfile]);

  const getSubscriptionStatus = () => {
    if (!user) return { color: 'gray', text: 'Nieznany' };
    
    switch (user.subscriptionStatus) {
      case 'ACTIVE':
        return { color: 'green', text: 'Aktywna' };
      case 'EXPIRED':
        return { color: 'red', text: 'Wygasła' };
      case 'CANCELLED':
        return { color: 'orange', text: 'Anulowana' };
      default:
        return { color: 'gray', text: 'Nieaktywna' };
    }
  };

  const getSubscriptionDisplay = () => {
    if (!user) return 'Free';
    
    switch (user.subscriptionType) {
      case 'STARTER':
        return 'Starter';
      case 'PROFESSIONAL':
        return 'Professional';
      case 'ENTERPRISE':
        return 'Enterprise';
      default:
        return 'Free';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Brak danych';
    return new Date(dateString).toLocaleDateString('pl-PL');
  };

  if (isLoading || loadingProfile) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="profile-spinner"></div>
          <p>Ładowanie profilu...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div className="profile-page">
      <div className="profile-background">
        <div className="background-grid"></div>
        <div className="background-glow"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="profile-container"
      >
        <div className="profile-header">
          <button 
            onClick={() => router.back()} 
            className="profile-back-btn"
          >
            ← Powrót
          </button>
          <h1>Profil użytkownika</h1>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                {user.firstName ? user.firstName[0] : user.username[0]}
              </div>
              <div className="profile-name">
                <h2>
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user.username
                  }
                </h2>
                <p className="profile-email">{user.email}</p>
              </div>
            </div>

            <div className="profile-details">
              <div className="profile-section">
                <h3>Informacje podstawowe</h3>
                <div className="profile-info-grid">
                  <div className="profile-info-item">
                    <span className="profile-label">Nazwa użytkownika</span>
                    <span className="profile-value">{user.username}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-label">Email</span>
                    <span className="profile-value">{user.email}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-label">Imię</span>
                    <span className="profile-value">{user.firstName || 'Nie podano'}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-label">Nazwisko</span>
                    <span className="profile-value">{user.lastName || 'Nie podano'}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-label">Rola</span>
                    <span className="profile-value">{user.role}</span>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <h3>Subskrypcja</h3>
                <div className="profile-subscription">
                  <div className="subscription-type">
                    <span className="subscription-badge">
                      {getSubscriptionDisplay()}
                    </span>
                    <span 
                      className={`subscription-status status-${subscriptionStatus.color}`}
                    >
                      {subscriptionStatus.text}
                    </span>
                  </div>
                  
                  <div className="subscription-dates">
                    <div className="subscription-date">
                      <span className="profile-label">Data rozpoczęcia</span>
                      <span className="profile-value">
                        {formatDate(user.subscriptionStartDate)}
                      </span>
                    </div>
                    <div className="subscription-date">
                      <span className="profile-label">Data wygaśnięcia</span>
                      <span className="profile-value">
                        {formatDate(user.subscriptionEndDate)}
                      </span>
                    </div>
                  </div>

                  {user.subscriptionType === 'FREE' && (
                    <div className="subscription-upgrade">
                      <p>Rozszerz swoje możliwości z planem premium!</p>
                      <button className="upgrade-btn">
                        Sprawdź plany
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="profile-section">
                <h3>Statystyki</h3>
                <div className="profile-stats">
                  <div className="stat-item">
                    <span className="stat-value">0</span>
                    <span className="stat-label">Utworzone etykiety</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">0</span>
                    <span className="stat-label">Zapisane projekty</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">0</span>
                    <span className="stat-label">Dni od rejestracji</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
