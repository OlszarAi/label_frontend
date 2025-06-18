import { SubscriptionType, SubscriptionStatus, ProfileTab } from '../types/profile.types';

export const SUBSCRIPTION_TYPE_LABELS: Record<SubscriptionType, string> = {
  [SubscriptionType.FREE]: 'Free',
  [SubscriptionType.STARTER]: 'Starter',
  [SubscriptionType.PROFESSIONAL]: 'Professional', 
  [SubscriptionType.ENTERPRISE]: 'Enterprise',
};

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.INACTIVE]: 'Nieaktywna',
  [SubscriptionStatus.ACTIVE]: 'Aktywna',
  [SubscriptionStatus.EXPIRED]: 'Wygasła',
  [SubscriptionStatus.CANCELLED]: 'Anulowana',
  [SubscriptionStatus.TRIAL]: 'Okres próbny',
};

export const SUBSCRIPTION_STATUS_COLORS: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.INACTIVE]: 'gray',
  [SubscriptionStatus.ACTIVE]: 'green',
  [SubscriptionStatus.EXPIRED]: 'red',
  [SubscriptionStatus.CANCELLED]: 'orange',
  [SubscriptionStatus.TRIAL]: 'blue',
};

export const PROFILE_TABS: { key: ProfileTab; label: string; icon: string }[] = [
  { key: 'overview', label: 'Przegląd', icon: '👤' },
  { key: 'subscription', label: 'Subskrypcja', icon: '💎' },
  { key: 'settings', label: 'Ustawienia', icon: '⚙️' },
  { key: 'security', label: 'Bezpieczeństwo', icon: '🔒' },
  { key: 'billing', label: 'Płatności', icon: '💳' },
];

export const SUBSCRIPTION_FEATURES = {
  [SubscriptionType.FREE]: [
    'Podstawowe funkcje etykietowania',
    'Do 5 projektów',
    'Wsparcie społeczności',
  ],
  [SubscriptionType.STARTER]: [
    'Wszystkie funkcje Free',
    'Do 25 projektów',
    'Eksport do PDF',
    'Podstawowe szablony',
    'Email support',
  ],
  [SubscriptionType.PROFESSIONAL]: [
    'Wszystkie funkcje Starter',
    'Nieograniczone projekty',
    'Zaawansowane szablony',
    'Integracja z API',
    'Analityka i raporty',
    'Priorytetowe wsparcie',
  ],
  [SubscriptionType.ENTERPRISE]: [
    'Wszystkie funkcje Professional',
    'Dedykowane wsparcie',
    'Custom branding',
    'SSO integration',
    'Advanced security',
    'SLA guarantee',
  ],
};

export const BILLING_CYCLE_LABELS = {
  MONTHLY: 'Miesięcznie',
  YEARLY: 'Rocznie',
};

export const SUBSCRIPTION_PRICES = {
  [SubscriptionType.FREE]: { monthly: 0, yearly: 0 },
  [SubscriptionType.STARTER]: { monthly: 29, yearly: 290 },
  [SubscriptionType.PROFESSIONAL]: { monthly: 79, yearly: 790 },
  [SubscriptionType.ENTERPRISE]: { monthly: 199, yearly: 1990 },
};
