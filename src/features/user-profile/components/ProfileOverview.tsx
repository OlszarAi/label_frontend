import React from 'react';
import { ProfileTabProps } from '../types/profile.types';

export const ProfileOverview: React.FC<ProfileTabProps> = ({ profileData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner"></div>
        <p>Ładowanie danych...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-error">
        <p>Nie udało się załadować danych profilu</p>
      </div>
    );
  }

  const { user, stats } = profileData;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Brak danych';
    return new Date(dateString).toLocaleDateString('pl-PL');
  };

  const calculateDaysSince = (dateString: string) => {
    const diffTime = Math.abs(new Date().getTime() - new Date(dateString).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div>
      <div className="profile-section">
        <h3 className="profile-section-title">Informacje podstawowe</h3>
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
          <div className="profile-info-item">
            <span className="profile-label">Data rejestracji</span>
            <span className="profile-value">{formatDate(user.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">Statystyki konta</h3>
        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <span className="profile-stat-value">{stats.labelsCreated}</span>
            <span className="profile-stat-label">Utworzone etykiety</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-value">{stats.projectsSaved}</span>
            <span className="profile-stat-label">Zapisane projekty</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-value">{calculateDaysSince(user.createdAt)}</span>
            <span className="profile-stat-label">Dni od rejestracji</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-value">{stats.totalSpent.toFixed(2)} PLN</span>
            <span className="profile-stat-label">Łączne wydatki</span>
          </div>
        </div>
      </div>

      {stats.lastLoginDate && (
        <div className="profile-section">
          <h3 className="profile-section-title">Ostatnia aktywność</h3>
          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span className="profile-label">Ostatnie logowanie</span>
              <span className="profile-value">{formatDate(stats.lastLoginDate)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
