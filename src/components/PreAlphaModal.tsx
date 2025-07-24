'use client';

import React, { useState } from 'react';
import { XMarkIcon, InformationCircleIcon, ExclamationTriangleIcon, SparklesIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import './PreAlphaModal.css';

interface BugItem {
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

interface FeatureItem {
  title: string;
  description: string;
  category: 'minor' | 'major';
}

export function PreAlphaModal() {
  const [isVisible, setIsVisible] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'bugs' | 'features'>('overview');

  const bugs: BugItem[] = [
    {
      title: "QR Code w edytorze",
      description: "Problemy z generowaniem i wyświetlaniem kodów QR w edytorze etykiet",
      severity: "high"
    },
    {
      title: "Strona projektów",
      description: "Błędy na stronie szczegółów projektu (/projects/[id])",
      severity: "high"
    },
    {
      title: "Eksport kolorów",
      description: "Niepoprawne renderowanie kolorów podczas eksportu etykiet",
      severity: "medium"
    }
  ];

  const minorFeatures: FeatureItem[] = [
    {
      title: "Import zdjęć w edytorze",
      description: "Możliwość dodawania własnych obrazów do etykiet",
      category: "minor"
    },
    {
      title: "Edycja nazwy etykiety",
      description: "Zmiana nazw etykiet bezpośrednio w edytorze i projektach",
      category: "minor"
    },
    {
      title: "Pokazywanie hasła",
      description: "Opcja ujawnienia hasła podczas logowania i rejestracji",
      category: "minor"
    },
    {
      title: "Redesign strony projektu",
      description: "Całkowite przeprojektowanie interfejsu projects/[id]",
      category: "minor"
    },
    {
      title: "Poprawa scrollowania",
      description: "Optymalizacja przewijania w edytorze etykiet",
      category: "minor"
    },
    {
      title: "Aktualizacja galerii",
      description: "Drobne ulepszenia w galerii projektów",
      category: "minor"
    },
    {
      title: "Wsparcie języków",
      description: "Poprawa polskiego i dodanie innych języków",
      category: "minor"
    }
  ];

  const majorFeatures: FeatureItem[] = [
    {
      title: "Zaawansowany eksport",
      description: "Eksport wybranych etykiet, fitowanie na stronie, nowe formaty (nie tylko PDF)",
      category: "major"
    },
    {
      title: "Szablony etykiet",
      description: "Gotowe szablony i możliwość tworzenia własnych",
      category: "major"
    },
    {
      title: "Masowe tworzenie",
      description: "Tworzenie dużej ilości etykiet jednocześnie",
      category: "major"
    }
  ];

  if (!isVisible) return null;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚠️';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'minor': return '✨';
      case 'major': return '🚀';
      default: return '📋';
    }
  };

  return (
    <div className="pre-alpha-modal-overlay">
      <div className="pre-alpha-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">
              <RocketLaunchIcon className="icon" />
            </div>
            <div className="header-text">
              <h2 className="modal-title">🚀 Pre-Alpha Early Access</h2>
              <p className="modal-subtitle">
                Aplikacja jest w fazie wczesnego dostępu. Zobacz co nas czeka!
              </p>
            </div>
          </div>
          
          <div className="header-actions">
            {!showDetails && (
              <button 
                className="details-btn"
                onClick={() => setShowDetails(true)}
              >
                Więcej informacji
              </button>
            )}
            
            <button 
              className="close-btn"
              onClick={() => setIsVisible(false)}
              aria-label="Zamknij modal"
            >
              <XMarkIcon className="close-icon" />
            </button>
          </div>
        </div>



        {/* Detailed view */}
        {showDetails && (
          <div className="modal-content">
            {/* Tabs */}
            <div className="tabs-container">
              <button 
                className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <InformationCircleIcon className="tab-icon" />
                Przegląd
              </button>
              <button 
                className={`tab ${activeTab === 'bugs' ? 'active' : ''}`}
                onClick={() => setActiveTab('bugs')}
              >
                <ExclamationTriangleIcon className="tab-icon" />
                Błędy ({bugs.length})
              </button>
              <button 
                className={`tab ${activeTab === 'features' ? 'active' : ''}`}
                onClick={() => setActiveTab('features')}
              >
                <SparklesIcon className="tab-icon" />
                Funkcje ({minorFeatures.length + majorFeatures.length})
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'overview' && (
                <div className="overview-content">
                  <div className="overview-grid">
                    <div className="overview-card bugs-card">
                      <h3>🐛 Znane problemy</h3>
                      <p>Pracujemy nad naprawą {bugs.length} błędów, które mogą wpływać na Twoje doświadczenie.</p>
                      <button 
                        className="card-btn"
                        onClick={() => setActiveTab('bugs')}
                      >
                        Zobacz szczegóły
                      </button>
                    </div>
                    
                    <div className="overview-card features-card">
                      <h3>✨ Nadchodzące funkcje</h3>
                      <p>Planujemy {minorFeatures.length + majorFeatures.length} nowych funkcji i ulepszeń.</p>
                      <button 
                        className="card-btn"
                        onClick={() => setActiveTab('features')}
                      >
                        Zobacz roadmapę
                      </button>
                    </div>
                  </div>
                  
                  <div className="overview-note">
                    <div className="note-icon">💬</div>
                    <div>
                      <strong>Twoja opinia się liczy!</strong>
                      <p>Pomóż nam priorytetyzować funkcje i zgłaszać błędy.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bugs' && (
                <div className="bugs-content">
                  <div className="section-header">
                    <h3>🐛 Znane błędy</h3>
                    <p>Błędy, nad którymi obecnie pracujemy:</p>
                  </div>
                  
                  <div className="items-list">
                    {bugs.map((bug, index) => (
                      <div key={index} className={`item-card bug-item severity-${bug.severity}`}>
                        <div className="item-header">
                          <span className="item-icon">{getSeverityIcon(bug.severity)}</span>
                          <h4 className="item-title">{bug.title}</h4>
                          <span className={`severity-badge ${bug.severity}`}>
                            {bug.severity === 'high' ? 'Wysoki' : bug.severity === 'medium' ? 'Średni' : 'Niski'}
                          </span>
                        </div>
                        <p className="item-description">{bug.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'features' && (
                <div className="features-content">
                  {/* Minor Features */}
                  <div className="feature-section">
                    <div className="section-header">
                      <h3>✨ Małe ulepszenia</h3>
                      <p>Szybkie ulepszenia, które wkrótce dodamy:</p>
                    </div>
                    
                    <div className="items-list">
                      {minorFeatures.map((feature, index) => (
                        <div key={index} className="item-card feature-item minor">
                          <div className="item-header">
                            <span className="item-icon">{getCategoryIcon(feature.category)}</span>
                            <h4 className="item-title">{feature.title}</h4>
                            <span className="category-badge minor">Małe</span>
                          </div>
                          <p className="item-description">{feature.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Major Features */}
                  <div className="feature-section">
                    <div className="section-header">
                      <h3>🚀 Duże funkcje</h3>
                      <p>Zaawansowane funkcje w długoterminowej roadmapie:</p>
                    </div>
                    
                    <div className="items-list">
                      {majorFeatures.map((feature, index) => (
                        <div key={index} className="item-card feature-item major">
                          <div className="item-header">
                            <span className="item-icon">{getCategoryIcon(feature.category)}</span>
                            <h4 className="item-title">{feature.title}</h4>
                            <span className="category-badge major">Duże</span>
                          </div>
                          <p className="item-description">{feature.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button 
                className="collapse-btn"
                onClick={() => setShowDetails(false)}
              >
                Zwiń szczegóły
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
