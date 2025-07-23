import React, { useState, useRef } from 'react';
import { ProfileTabProps } from '../types/profile.types';

export const ProfileSecurity: React.FC<ProfileTabProps & {
  onChangePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<{ success: boolean; error?: string }>;
}> = ({ profileData, isLoading, onChangePassword }) => {
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  const currentPasswordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner"></div>
        <p>Ładowanie ustawień bezpieczeństwa...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-error">
        <p>Nie udało się załadować ustawień bezpieczeństwa</p>
      </div>
    );
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const currentPassword = currentPasswordRef.current?.value || '';
    const newPassword = newPasswordRef.current?.value || '';
    const confirmPassword = confirmPasswordRef.current?.value || '';

    if (newPassword !== confirmPassword) {
      setPasswordError('Nowe hasła nie są identyczne');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Nowe hasło musi mieć co najmniej 8 znaków');
      return;
    }

    setChangingPassword(true);
    try {
      const result = await onChangePassword({
        currentPassword,
        newPassword,
      });

      if (result.success) {
        setPasswordSuccess('Hasło zostało zmienione pomyślnie');
        // Clear form
        if (currentPasswordRef.current) currentPasswordRef.current.value = '';
        if (newPasswordRef.current) newPasswordRef.current.value = '';
        if (confirmPasswordRef.current) confirmPasswordRef.current.value = '';
      } else {
        setPasswordError(result.error || 'Błąd podczas zmiany hasła');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Brak danych';
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="profile-section">
        <h3 className="profile-section-title">Zmiana hasła</h3>
        <form onSubmit={handlePasswordChange} className="security-form">
          <div className="form-field">
            <label className="profile-label">Aktualne hasło</label>
            <input
              type="password"
              ref={currentPasswordRef}
              className="form-input"
              required
            />
          </div>

          <div className="form-field">
            <label className="profile-label">Nowe hasło</label>
            <input
              type="password"
              ref={newPasswordRef}
              className="form-input"
              required
              minLength={8}
            />
            <small className="field-note">Hasło musi mieć co najmniej 8 znaków</small>
          </div>

          <div className="form-field">
            <label className="profile-label">Potwierdź nowe hasło</label>
            <input
              type="password"
              ref={confirmPasswordRef}
              className="form-input"
              required
            />
          </div>

          {passwordError && (
            <div className="error-message">{passwordError}</div>
          )}

          {passwordSuccess && (
            <div className="success-message">{passwordSuccess}</div>
          )}

          <button
            type="submit"
            className="security-btn"
            disabled={changingPassword}
          >
            {changingPassword ? 'Zmienianie hasła...' : 'Zmień hasło'}
          </button>
        </form>
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">Aktywność konta</h3>
        <div className="security-info">
          <div className="security-item">
            <div className="security-icon">🕐</div>
            <div className="security-details">
              <span className="security-label">Data rejestracji</span>
              <span className="security-value">{formatDate(profileData.user.createdAt)}</span>
            </div>
          </div>

          <div className="security-item">
            <div className="security-icon">🔄</div>
            <div className="security-details">
              <span className="security-label">Ostatnia aktualizacja profilu</span>
              <span className="security-value">{formatDate(profileData.user.updatedAt)}</span>
            </div>
          </div>

          {profileData.stats.lastLoginDate && (
            <div className="security-item">
              <div className="security-icon">🔑</div>
              <div className="security-details">
                <span className="security-label">Ostatnie logowanie</span>
                <span className="security-value">{formatDate(profileData.stats.lastLoginDate)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">Bezpieczeństwo konta</h3>
        <div className="security-recommendations">
          <div className="security-recommendation">
            <div className="recommendation-icon">✅</div>
            <div className="recommendation-content">
              <h4>Silne hasło</h4>
              <p>Twoje hasło spełnia wymagania bezpieczeństwa</p>
            </div>
          </div>

          <div className="security-recommendation">
            <div className="recommendation-icon">⚠️</div>
            <div className="recommendation-content">
              <h4>Uwierzytelnianie dwuskładnikowe</h4>
              <p>Zalecamy włączenie 2FA dla dodatkowego bezpieczeństwa</p>
              <button className="recommendation-btn">Włącz 2FA</button>
            </div>
          </div>

          <div className="security-recommendation">
            <div className="recommendation-icon">📧</div>
            <div className="recommendation-content">
              <h4>Powiadomienia bezpieczeństwa</h4>
              <p>Otrzymuj powiadomienia o podejrzanych aktywnościach</p>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-section danger-zone">
        <h3 className="profile-section-title">Strefa niebezpieczna</h3>
        <div className="danger-actions">
          <div className="danger-item">
            <div className="danger-info">
              <h4>Usuń konto</h4>
              <p>Permanentnie usuń swoje konto i wszystkie powiązane dane</p>
            </div>
            <button className="danger-btn">
              Usuń konto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
