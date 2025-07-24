'use client';

import React, { useState } from 'react';
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import './EarlyAccessBanner.css';

export function EarlyAccessBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="early-access-banner">
      <div className="banner-content">
        <div className="banner-icon">
          <InformationCircleIcon className="icon" />
        </div>
        
        <div className="banner-text">
          <div className="banner-title">
            🚀 Pre-Alpha Early Access
          </div>
          <div className="banner-description">
            Aplikacja jest w fazie wczesnego dostępu. Spodziewaj się ograniczonej funkcjonalności i możliwych błędów.
          </div>
        </div>

        <div className="banner-actions">
          <button 
            className="details-btn"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Ukryj' : 'Więcej'}
          </button>
          
          <button 
            className="close-btn"
            onClick={() => setIsVisible(false)}
            aria-label="Zamknij banner"
          >
            <XMarkIcon className="close-icon" />
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="banner-details">
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-icon">⚠️</span>
              <div>
                <strong>Ograniczona funkcjonalność</strong>
                <p>Nie wszystkie funkcje są jeszcze dostępne</p>
              </div>
            </div>
            
            <div className="detail-item">
              <span className="detail-icon">🐛</span>
              <div>
                <strong>Możliwe błędy</strong>
                <p>Aplikacja może zawierać błędy i niestabilności</p>
              </div>
            </div>
            
            <div className="detail-item">
              <span className="detail-icon">🔄</span>
              <div>
                <strong>Regularne aktualizacje</strong>
                <p>Stale dodajemy nowe funkcje i poprawki</p>
              </div>
            </div>
            
            <div className="detail-item">
              <span className="detail-icon">💬</span>
              <div>
                <strong>Twoja opinia się liczy</strong>
                <p>Pomóż nam ulepszać aplikację swoimi uwagami</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
