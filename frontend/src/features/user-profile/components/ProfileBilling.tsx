import React from 'react';
import { ProfileTabProps, Subscription } from '../types/profile.types';

export const ProfileBilling: React.FC<ProfileTabProps & { 
  subscriptionHistory: Subscription[];
}> = ({ profileData, isLoading, subscriptionHistory }) => {
  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner"></div>
        <p>Ładowanie danych płatności...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-error">
        <p>Nie udało się załadować danych płatności</p>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Brak danych';
    return new Date(dateString).toLocaleDateString('pl-PL');
  };

  const formatCurrency = (amount: number, currency: string = 'PLN') => {
    return `${amount.toFixed(2)} ${currency}`;
  };

  // Mock data for payment methods and invoices
  const paymentMethods = [
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    }
  ];

  const invoices = subscriptionHistory
    .filter(sub => sub.price && sub.price > 0)
    .map((sub, index) => ({
      id: sub.id,
      number: `INV-${new Date(sub.createdAt).getFullYear()}-${String(index + 1).padStart(3, '0')}`,
      date: sub.createdAt,
      amount: sub.price,
      currency: sub.currency,
      status: 'paid',
      description: `Subskrypcja ${sub.type}`,
    }));

  const totalSpent = subscriptionHistory.reduce((sum, sub) => sum + (sub.price || 0), 0);

  return (
    <div>
      <div className="profile-section">
        <h3 className="profile-section-title">Podsumowanie płatności</h3>
        <div className="billing-summary">
          <div className="billing-stat">
            <span className="billing-stat-label">Łączne wydatki</span>
            <span className="billing-stat-value">{formatCurrency(totalSpent)}</span>
          </div>
          <div className="billing-stat">
            <span className="billing-stat-label">Liczba płatności</span>
            <span className="billing-stat-value">{invoices.length}</span>
          </div>
          <div className="billing-stat">
            <span className="billing-stat-label">Aktualny plan</span>
            <span className="billing-stat-value">
              {profileData.currentSubscription?.type || 'FREE'}
            </span>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">Metody płatności</h3>
        {paymentMethods.length > 0 ? (
          <div className="payment-methods">
            {paymentMethods.map((method) => (
              <div key={method.id} className="payment-method">
                <div className="payment-method-info">
                  <div className="payment-method-icon">
                    {method.type === 'card' ? '💳' : '🏦'}
                  </div>
                  <div className="payment-method-details">
                    <span className="payment-method-brand">
                      {method.brand} •••• {method.last4}
                    </span>
                    <span className="payment-method-expiry">
                      Wygasa {method.expiryMonth}/{method.expiryYear}
                    </span>
                  </div>
                  {method.isDefault && (
                    <span className="payment-method-default">Domyślna</span>
                  )}
                </div>
                <div className="payment-method-actions">
                  <button className="payment-method-edit">Edytuj</button>
                  <button className="payment-method-remove">Usuń</button>
                </div>
              </div>
            ))}
            <button className="add-payment-method">
              + Dodaj metodę płatności
            </button>
          </div>
        ) : (
          <div className="no-payment-methods">
            <p>Brak zapisanych metod płatności</p>
            <button className="add-payment-method">
              Dodaj metodę płatności
            </button>
          </div>
        )}
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">Historia faktur</h3>
        {invoices.length > 0 ? (
          <div className="invoices-table">
            <div className="table-header">
              <span>Numer faktury</span>
              <span>Data</span>
              <span>Opis</span>
              <span>Kwota</span>
              <span>Status</span>
              <span>Akcje</span>
            </div>
            {invoices.map((invoice) => (
              <div key={invoice.id} className="table-row">
                <span className="invoice-number">{invoice.number}</span>
                <span className="invoice-date">{formatDate(invoice.date)}</span>
                <span className="invoice-description">{invoice.description}</span>
                <span className="invoice-amount">
                  {formatCurrency(invoice.amount || 0, invoice.currency)}
                </span>
                <span className={`invoice-status status-${invoice.status}`}>
                  {invoice.status === 'paid' ? 'Opłacona' : 'Nieopłacona'}
                </span>
                <div className="invoice-actions">
                  <button className="invoice-download">📄 Pobierz</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-invoices">
            <p>Brak historii płatności</p>
          </div>
        )}
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">Adres rozliczeniowy</h3>
        <div className="billing-address">
          <div className="address-form">
            <div className="form-row">
              <div className="form-field">
                <label className="profile-label">Imię i nazwisko</label>
                <input type="text" className="form-input" placeholder="Wprowadź imię i nazwisko" />
              </div>
              <div className="form-field">
                <label className="profile-label">Firma (opcjonalne)</label>
                <input type="text" className="form-input" placeholder="Nazwa firmy" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="profile-label">Adres</label>
                <input type="text" className="form-input" placeholder="Ulica i numer" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="profile-label">Miasto</label>
                <input type="text" className="form-input" placeholder="Miasto" />
              </div>
              <div className="form-field">
                <label className="profile-label">Kod pocztowy</label>
                <input type="text" className="form-input" placeholder="00-000" />
              </div>
              <div className="form-field">
                <label className="profile-label">Kraj</label>
                <select className="form-select">
                  <option value="PL">Polska</option>
                  <option value="DE">Niemcy</option>
                  <option value="GB">Wielka Brytania</option>
                  <option value="FR">Francja</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="profile-label">NIP (dla firm)</label>
                <input type="text" className="form-input" placeholder="0000000000" />
              </div>
            </div>
            <button className="save-address-btn">
              Zapisz adres rozliczeniowy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
