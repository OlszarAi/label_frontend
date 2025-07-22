import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useProfile } from '../hooks/useProfile';
import { ProfileTab } from '../types/profile.types';
import { PROFILE_TABS, SUBSCRIPTION_TYPE_LABELS } from '../constants/profile.constants';
import { ProfileOverview } from './ProfileOverview';
import { ProfileSubscription } from './ProfileSubscription';
import { ProfileSettings } from './ProfileSettings';
import { ProfileSecurity } from './ProfileSecurity';
import { ProfileBilling } from './ProfileBilling';
import '../styles/ProfilePage.css';

export const UserProfile: React.FC = () => {
  const router = useRouter();
  const {
    profileData,
    subscriptionHistory,
    isLoading,
    error,
    updateProfile,
    changePassword,
    cancelSubscription,
  } = useProfile();

  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-error">
            <h2>Błąd ładowania profilu</h2>
            <p>{error}</p>
            <button onClick={() => router.back()} className="profile-back-btn">
              ← Powrót
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    const props = { profileData, isLoading };

    switch (activeTab) {
      case 'overview':
        return <ProfileOverview {...props} />;
      case 'subscription':
        return (
          <ProfileSubscription
            {...props}
            subscriptionHistory={subscriptionHistory}
            onCancelSubscription={cancelSubscription}
          />
        );
      case 'settings':
        return <ProfileSettings {...props} onUpdateProfile={updateProfile} />;
      case 'security':
        return <ProfileSecurity {...props} onChangePassword={changePassword} />;
      case 'billing':
        return <ProfileBilling {...props} subscriptionHistory={subscriptionHistory} />;
      default:
        return <ProfileOverview {...props} />;
    }
  };

  const getDisplayName = () => {
    if (!profileData?.user) return '';
    const { firstName, lastName, username } = profileData.user;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    return username;
  };

  const getCurrentSubscriptionDisplay = () => {
    const currentType = profileData?.currentSubscription?.type || 'FREE';
    return SUBSCRIPTION_TYPE_LABELS[currentType as keyof typeof SUBSCRIPTION_TYPE_LABELS];
  };

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
          <div className="profile-header-left">
            <button 
              onClick={() => router.back()} 
              className="profile-back-btn"
            >
              ← Powrót
            </button>
            <h1>Profil użytkownika</h1>
          </div>
          <div className="profile-header-actions">
            <button className="profile-edit-btn">
              ✏️ Edytuj profil
            </button>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-sidebar">
            {/* User Card */}
            <div className="profile-user-card">
              <div className="profile-avatar">
                {profileData?.user ? (
                  profileData.user.firstName 
                    ? profileData.user.firstName[0] 
                    : profileData.user.username[0]
                ) : '?'}
              </div>
              <div className="profile-user-info">
                <h2>{getDisplayName()}</h2>
                <p className="profile-user-email">
                  {profileData?.user.email || 'Ładowanie...'}
                </p>
                <span className="profile-user-role">
                  {profileData?.user.role || 'USER'}
                </span>
              </div>
              {profileData?.currentSubscription && (
                <div className="profile-user-subscription">
                  <span className="subscription-badge">
                    {getCurrentSubscriptionDisplay()}
                  </span>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="profile-tabs">
              {PROFILE_TABS.map((tab) => (
                <button
                  key={tab.key}
                  className={`profile-tab ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span className="profile-tab-icon">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="profile-main">
            <div className="profile-tab-content">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
