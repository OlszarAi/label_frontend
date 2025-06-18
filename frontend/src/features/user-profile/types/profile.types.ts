export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  type: SubscriptionType;
  status: SubscriptionStatus;
  startDate?: string;
  endDate?: string;
  trialEndDate?: string;
  billingCycle?: BillingCycle;
  price?: number;
  currency: string;
  paymentMethod?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileData {
  user: User;
  currentSubscription?: Subscription;
  subscriptionHistory: Subscription[];
  stats: ProfileStats;
}

export interface ProfileStats {
  labelsCreated: number;
  projectsSaved: number;
  daysFromRegistration: number;
  totalSpent: number;
  lastLoginDate?: string;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum SubscriptionType {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export enum SubscriptionStatus {
  INACTIVE = 'INACTIVE',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  TRIAL = 'TRIAL',
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export interface ProfileTabProps {
  profileData: ProfileData | null;
  isLoading: boolean;
}

export type ProfileTab = 'overview' | 'subscription' | 'settings' | 'security' | 'billing';
