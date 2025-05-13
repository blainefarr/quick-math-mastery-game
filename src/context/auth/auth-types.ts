
import { ReactNode } from 'react';

export interface AuthStateType {
  isLoggedIn: boolean;
  username: string;
  userId: string | null;
  defaultProfileId: string | null;
  isAuthenticated: boolean;
  isLoadingProfile: boolean;
  hasMultipleProfiles: boolean;
  isNewSignup: boolean;
  retryAttempts: number;
  // Subscription related fields
  planType: string;
  subscriptionStatus: string;
  planExpiresAt: string | null;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setUsername: (username: string) => void;
  setUserId: (userId: string | null) => void;
  setDefaultProfileId: (profileId: string | null) => void;
  setIsLoadingProfile: (isLoading: boolean) => void;
  setHasMultipleProfiles: (hasMultiple: boolean) => void;
  setIsNewSignup: (isNew: boolean) => void;
  setRetryAttempts: (attempts: number | ((prev: number) => number)) => void;
  // Subscription setters
  setPlanType: (planType: string) => void;
  setSubscriptionStatus: (status: string) => void;
  setPlanExpiresAt: (expiresAt: string | null) => void;
}

export interface AuthContextType {
  isLoggedIn: boolean;
  username: string;
  userId: string | null;
  defaultProfileId: string | null;
  isAuthenticated: boolean;
  isLoadingProfile: boolean;
  hasMultipleProfiles: boolean;
  isNewSignup: boolean;
  // Subscription related fields
  planType: string;
  subscriptionStatus: string;
  planExpiresAt: string | null;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setUsername: (username: string) => void;
  setDefaultProfileId: (profileId: string | null) => void;
  handleLogout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  // Subscription helpers
  isSubscriptionActive: () => boolean;
  canSaveScores: () => Promise<boolean>;
  checkAndRefreshSubscription: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}

// Plan types
export type PlanType = 'guest' | 'free' | 'individual' | 'family' | 'teacher' | 'school' | 'district';

// Subscription status types
export type SubscriptionStatus = 'free' | 'active' | 'one_time' | 'trial' | 'canceled';

// Payment interval types
export type PaymentInterval = 'monthly' | 'annual' | 'one_time';
