import { ProfileData, Subscription, SubscriptionType, SubscriptionStatus, BillingCycle, UserRole } from '../types/profile.types';

// Mock data for development/testing
export const createMockProfileData = (): ProfileData => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  const mockSubscription: Subscription = {
    id: 'sub_mock_123',
    userId: 'user_mock_123',
    type: SubscriptionType.STARTER,
    status: SubscriptionStatus.ACTIVE,
    startDate: thirtyDaysAgo.toISOString(),
    endDate: oneYearFromNow.toISOString(),
    trialEndDate: undefined,
    billingCycle: BillingCycle.MONTHLY,
    price: 29,
    currency: 'PLN',
    paymentMethod: 'Visa •••• 4242',
    isActive: true,
    createdAt: thirtyDaysAgo.toISOString(),
    updatedAt: now.toISOString(),
  };

  const mockHistorySubscription: Subscription = {
    id: 'sub_mock_old_123',
    userId: 'user_mock_123',
    type: SubscriptionType.FREE,
    status: SubscriptionStatus.CANCELLED,
    startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: thirtyDaysAgo.toISOString(),
    trialEndDate: undefined,
    billingCycle: undefined,
    price: 0,
    currency: 'PLN',
    paymentMethod: undefined,
    isActive: false,
    createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: thirtyDaysAgo.toISOString(),
  };

  return {
    user: {
      id: 'user_mock_123',
      email: 'admin1@admin.com',
      username: 'admin1',
      firstName: 'admin',
      lastName: 'admin',
      role: UserRole.ADMIN,
      createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    currentSubscription: mockSubscription,
    subscriptionHistory: [mockSubscription, mockHistorySubscription],
    stats: {
      labelsCreated: 15,
      projectsSaved: 8,
      daysFromRegistration: 60,
      totalSpent: 87.00,
      lastLoginDate: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
  };
};

export const createMockSubscriptionHistory = (): Subscription[] => {
  const mockData = createMockProfileData();
  return mockData.subscriptionHistory;
};
