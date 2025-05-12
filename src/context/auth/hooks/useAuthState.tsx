
import { useState, useCallback } from 'react';
import { AuthStateType } from '../auth-types';

export const useAuthState = (): AuthStateType => {
  // Core auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [defaultProfileId, setDefaultProfileId] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [hasMultipleProfiles, setHasMultipleProfiles] = useState(false);
  const [isNewSignup, setIsNewSignup] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);
  
  // Subscription-related state
  const [planType, setPlanType] = useState<string>('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('free');
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);
  
  // Computed state for convenience
  const isAuthenticated = isLoggedIn;
  
  return {
    isLoggedIn,
    username,
    userId,
    defaultProfileId,
    isAuthenticated,
    isLoadingProfile,
    hasMultipleProfiles,
    isNewSignup,
    retryAttempts,
    planType,
    subscriptionStatus,
    planExpiresAt,
    setIsLoggedIn,
    setUsername,
    setUserId,
    setDefaultProfileId,
    setIsLoadingProfile,
    setHasMultipleProfiles,
    setIsNewSignup,
    setRetryAttempts,
    setPlanType,
    setSubscriptionStatus,
    setPlanExpiresAt
  };
};
