import React, { useState } from 'react';
import { ProfileTabProps, Subscription } from '../types/profile.types';
import { 
  SUBSCRIPTION_TYPE_LABELS, 
  SUBSCRIPTION_STATUS_LABELS, 
  SUBSCRIPTION_STATUS_COLORS,
  SUBSCRIPTION_FEATURES,
  SUBSCRIPTION_PRICES,
  BILLING_CYCLE_LABELS
} from '../constants/profile.constants';

export const ProfileSubscription: React.FC<ProfileTabProps & { 
  subscriptionHistory: Subscription[];
  onCancelSubscription: () => Promise<unknown>;
}> = ({ profileData, isLoading, subscriptionHistory, onCancelSubscription }) => {
  const [cancelling, setCancelling] = useState(false);

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner"></div>
        <p>Ładowanie danych subskrypcji...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-error">
        <p>Nie udało się załadować danych subskrypcji</p>
      </div>
    );
  }

  const { currentSubscription } = profileData;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Brak danych';
    return new Date(dateString).toLocaleDateString('pl-PL');
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Czy na pewno chcesz anulować subskrypcję?')) {
      setCancelling(true);
      try {
        await onCancelSubscription();
      } catch (error) {
        console.error('Error cancelling subscription:', error);
      } finally {
        setCancelling(false);
      }
    }
  };

  const getSubscriptionStatusColor = (status: string) => {
    return SUBSCRIPTION_STATUS_COLORS[status as keyof typeof SUBSCRIPTION_STATUS_COLORS] || 'gray';
  };

  const getCurrentPlan = () => {
    return currentSubscription?.type || 'FREE';
  };

  const features = SUBSCRIPTION_FEATURES[getCurrentPlan() as keyof typeof SUBSCRIPTION_FEATURES] || [];

  return (
    <div>
      {/* Aktywna subskrypcja */}
      <div className="profile-section">
        <h3 className="profile-section-title">Aktywna subskrypcja</h3>
        <div className="subscription-current-card">
          <div className="subscription-header">
            <div className="subscription-type">
              <span className="subscription-badge">
                {SUBSCRIPTION_TYPE_LABELS[getCurrentPlan() as keyof typeof SUBSCRIPTION_TYPE_LABELS]}
              </span>
              {currentSubscription && (
                <span className={`subscription-status status-${getSubscriptionStatusColor(currentSubscription.status)}`}>
                  {SUBSCRIPTION_STATUS_LABELS[currentSubscription.status as keyof typeof SUBSCRIPTION_STATUS_LABELS]}
                </span>
              )}
            </div>
            <div className="subscription-price">
              {currentSubscription && currentSubscription.price ? (
                <span className="price-amount">
                  {currentSubscription.price} {currentSubscription.currency}
                  <span className="price-period">
                    /{currentSubscription.billingCycle ? BILLING_CYCLE_LABELS[currentSubscription.billingCycle as keyof typeof BILLING_CYCLE_LABELS] : 'miesiąc'}
                  </span>
                </span>
              ) : (
                <span className="price-amount">Bezpłatny</span>
              )}
            </div>
          </div>

          {currentSubscription && (
            <div className="subscription-dates">
              <div className="subscription-date">
                <span className="profile-label">Data rozpoczęcia</span>
                <span className="profile-value">{formatDate(currentSubscription.startDate)}</span>
              </div>
              <div className="subscription-date">
                <span className="profile-label">Data wygaśnięcia</span>
                <span className="profile-value">{formatDate(currentSubscription.endDate)}</span>
              </div>
              {currentSubscription.trialEndDate && (
                <div className="subscription-date">
                  <span className="profile-label">Koniec okresu próbnego</span>
                  <span className="profile-value">{formatDate(currentSubscription.trialEndDate)}</span>
                </div>
              )}
            </div>
          )}

          <div className="subscription-features">
            <h4>Funkcje w Twoim planie:</h4>
            <ul>
              {features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>

          <div className="subscription-actions">
            {getCurrentPlan() === 'FREE' ? (
              <button className="upgrade-btn">
                Uaktualnij plan
              </button>
            ) : (
              <div className="subscription-management">
                <button className="manage-btn">
                  Zarządzaj subskrypcją
                </button>
                {currentSubscription?.status === 'ACTIVE' && (
                  <button 
                    className="cancel-btn"
                    onClick={handleCancelSubscription}
                    disabled={cancelling}
                  >
                    {cancelling ? 'Anulowanie...' : 'Anuluj subskrypcję'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historia subskrypcji */}
      <div className="profile-section">
        <h3 className="profile-section-title">Historia subskrypcji</h3>
        {subscriptionHistory.length > 0 ? (
          <div className="subscription-history">
            {subscriptionHistory.map((subscription) => (
              <div key={subscription.id} className="subscription-history-item">
                <div className="subscription-history-header">
                  <div className="subscription-history-type">
                    <span className="subscription-badge">
                      {SUBSCRIPTION_TYPE_LABELS[subscription.type as keyof typeof SUBSCRIPTION_TYPE_LABELS]}
                    </span>
                    <span className={`subscription-status status-${getSubscriptionStatusColor(subscription.status)}`}>
                      {SUBSCRIPTION_STATUS_LABELS[subscription.status as keyof typeof SUBSCRIPTION_STATUS_LABELS]}
                    </span>
                  </div>
                  <div className="subscription-history-period">
                    {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
                  </div>
                </div>
                <div className="subscription-history-details">
                  {subscription.price && (
                    <span className="subscription-history-price">
                      {subscription.price} {subscription.currency}
                      {subscription.billingCycle && ` / ${BILLING_CYCLE_LABELS[subscription.billingCycle as keyof typeof BILLING_CYCLE_LABELS]}`}
                    </span>
                  )}
                  {subscription.paymentMethod && (
                    <span className="subscription-history-payment">
                      Metoda płatności: {subscription.paymentMethod}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="subscription-history-empty">
            <p>Brak historii subskrypcji</p>
          </div>
        )}
      </div>

      {/* Dostępne plany */}
      <div className="profile-section">
        <h3 className="profile-section-title">Dostępne plany</h3>
        <div className="subscription-plans">
          {Object.entries(SUBSCRIPTION_PRICES).map(([type, prices]) => (
            <div key={type} className={`subscription-plan ${getCurrentPlan() === type ? 'current' : ''}`}>
              <div className="plan-header">
                <h4>{SUBSCRIPTION_TYPE_LABELS[type as keyof typeof SUBSCRIPTION_TYPE_LABELS]}</h4>
                <div className="plan-price">
                  {prices.monthly > 0 ? (
                    <>
                      <span className="price-amount">{prices.monthly} PLN</span>
                      <span className="price-period">/miesiąc</span>
                    </>
                  ) : (
                    <span className="price-amount">Bezpłatny</span>
                  )}
                </div>
              </div>
              <div className="plan-features">
                <ul>
                  {SUBSCRIPTION_FEATURES[type as keyof typeof SUBSCRIPTION_FEATURES].map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              {getCurrentPlan() !== type && (
                <button className="plan-select-btn">
                  {type === 'FREE' ? 'Przejdź na plan bezpłatny' : 'Wybierz plan'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
