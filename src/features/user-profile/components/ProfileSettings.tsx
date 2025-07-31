import React, { useState } from 'react';
import { ProfileTabProps } from '../types/profile.types';

export const ProfileSettings: React.FC<ProfileTabProps & {
  onUpdateProfile: (data: Partial<{
    firstName: string;
    lastName: string;
    email: string;
  }>) => Promise<{ success: boolean; data?: unknown; error?: string }>;
}> = ({ profileData, isLoading, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profileData?.user.firstName || '',
    lastName: profileData?.user.lastName || '',
    email: profileData?.user.email || '',
  });
  const [saving, setSaving] = useState(false);

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner"></div>
        <p>Ładowanie ustawień...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-error">
        <p>Nie udało się załadować ustawień</p>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await onUpdateProfile(formData);
      if (result.success) {
        setIsEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: profileData?.user.firstName || '',
      lastName: profileData?.user.lastName || '',
      email: profileData?.user.email || '',
    });
    setIsEditing(false);
  };

  return (
    <div>
      <div className="profile-section">
        <div className="settings-header">
          <h3 className="profile-section-title">Ustawienia profilu</h3>
          {!isEditing ? (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              Edytuj
            </button>
          ) : (
            <div className="edit-actions">
              <button className="save-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Zapisywanie...' : 'Zapisz'}
              </button>
              <button className="cancel-btn" onClick={handleCancel}>
                Anuluj
              </button>
            </div>
          )}
        </div>

        <div className="settings-form">
          <div className="form-row">
            <div className="form-field">
              <label className="profile-label">Imię</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="form-input"
                  placeholder="Wprowadź imię"
                />
              ) : (
                <span className="profile-value">{profileData.user.firstName || 'Nie podano'}</span>
              )}
            </div>
            <div className="form-field">
              <label className="profile-label">Nazwisko</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="form-input"
                  placeholder="Wprowadź nazwisko"
                />
              ) : (
                <span className="profile-value">{profileData.user.lastName || 'Nie podano'}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="profile-label">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="form-input"
                  placeholder="Wprowadź email"
                />
              ) : (
                <span className="profile-value">{profileData.user.email}</span>
              )}
            </div>
            <div className="form-field">
              <label className="profile-label">Nazwa użytkownika</label>
              <span className="profile-value readonly">{profileData.user.username}</span>
              <small className="field-note">Nazwa użytkownika nie może być zmieniona</small>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">Preferencje</h3>
        <div className="preferences-grid">
          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-label">Powiadomienia email</span>
              <span className="preference-description">Otrzymuj powiadomienia o ważnych aktualizacjach</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          <div className="preference-item">
            <div className="preference-info">
              <span className="preference-label">Powiadomienia marketingowe</span>
              <span className="preference-description">Otrzymuj informacje o nowych funkcjach i promocjach</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">Język i lokalizacja</h3>
        <div className="settings-form">
          <div className="form-row">
            <div className="form-field">
              <label className="profile-label">Język interfejsu</label>
              <select className="form-select">
                <option value="pl">Polski</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            <div className="form-field">
              <label className="profile-label">Strefa czasowa</label>
              <select className="form-select">
                <option value="Europe/Warsaw">Europa/Warszawa (UTC+1)</option>
                <option value="Europe/London">Europa/Londyn (UTC+0)</option>
                <option value="America/New_York">Ameryka/Nowy_Jork (UTC-5)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
