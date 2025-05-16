
import React, { useEffect } from 'react';
import AuthContext from './AuthContext';
import { AuthContextType, AuthProviderProps } from './auth-types';
import { useAuthState } from './hooks/useAuthState';
import { useAuthEvents } from './hooks/useAuthEvents';
import { handleLogout } from './utils/logout';
import { refreshUserProfile } from './utils/accountProfile';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import logger from '@/utils/logger';

const AuthProvider = ({ children }: AuthProviderProps) => {
  const authState = useAuthState();
  
  // Initialize auth events and session handling
  useAuthEvents(authState);
  
  // Create methods that will be exposed in the context
  const logoutHandler = async () => {
    return handleLogout(authState);
  };
  
  // Modified refreshProfileHandler to match the AuthContextType
  const refreshProfileHandler = async () => {
    // Call refreshUserProfile and ignore the return value
    await refreshUserProfile(authState);
    // Return void as expected by the type definition
    return;
  };

  // Check if subscription is active
  const isSubscriptionActive = () => {
    const { subscriptionStatus, planExpiresAt } = authState;
    if (subscriptionStatus === 'free') return false;
    
    // If one_time purchase or active subscription
    if (['one_time', 'active'].includes(subscriptionStatus)) {
      // Check if plan has not expired
      if (planExpiresAt) {
        const expiryDate = new Date(planExpiresAt);
        const now = new Date();
        return expiryDate > now;
      }
      return true; // No expiry date means it's active
    }
    
    return false;
  };
  
  // Check if the user can save scores
  const canSaveScores = async () => {
    // If not logged in, cannot save scores
    if (!authState.isLoggedIn) return false;
    
    try {
      // Get the current plan details
      const { data, error } = await supabase
        .from('plans')
        .select('can_save_score, max_saved_scores')
        .eq('plan_type', authState.planType as any)
        .single();
      
      // Handle errors properly
      if (error || !data) {
        logger.error({
          message: 'Error checking plan permissions', 
          error
        });
        return false;
      }
      
      // If the plan allows saving scores
      if (data && data.can_save_score) {
        // If there's no limit (null means unlimited)
        if (data.max_saved_scores === null) return true;
        
        // If there is a limit, check against current save count
        const { data: accountData, error: accountError } = await supabase
          .from('accounts')
          .select('score_save_count')
          .eq('id', authState.userId as any)
          .single();
        
        // Handle errors properly
        if (accountError || !accountData) {
          logger.error({
            message: 'Error checking account score count', 
            error: accountError
          });
          return false;
        }
        
        // Make sure both properties exist before comparing
        if (accountData.score_save_count !== undefined && data.max_saved_scores !== undefined) {
          return accountData.score_save_count < data.max_saved_scores;
        }
      }
      
      return false;
    } catch (error) {
      logger.error('Error checking if user can save scores:', error);
      return false;
    }
  };
  
  // Enhanced check and refresh subscription details with better error handling
  // Fixed to return void instead of boolean
  const checkAndRefreshSubscription = async (): Promise<void> => {
    if (!authState.userId) return;
    
    try {
      logger.debug("Checking subscription status for user: " + authState.userId);
      
      // First try to fetch from direct database to avoid any webhook latency
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('plan_type, subscription_status, plan_expires_at')
        .eq('id', authState.userId as any)
        .single();
      
      if (accountError) {
        logger.error('Error fetching account data:', accountError);
        throw new Error(accountError.message);
      }
      
      if (account) {
        logger.debug("Account data from DB:", account);
        
        // Use nullish coalescing to avoid setting undefined values
        if (account.plan_type !== undefined) {
          authState.setPlanType(account.plan_type || 'free');
        }
        
        if (account.subscription_status !== undefined) {
          authState.setSubscriptionStatus(account.subscription_status || 'free');
        }
        
        if (account.plan_expires_at !== undefined) {
          authState.setPlanExpiresAt(account.plan_expires_at);
        }
        
        // If we already have a non-free plan, we can stop here
        if (account.plan_type !== 'free' && account.subscription_status !== 'free') {
          return;
        }
      }
      
      // If we don't have a subscription yet or it's free, check directly with the API
      try {
        logger.debug("Checking subscription with edge function");
        const { data: checkData, error: checkError } = await supabase.functions.invoke('check-subscription', {
          body: {}
        });
        
        if (checkError) {
          logger.error('Error from check-subscription function:', checkError);
          throw new Error(checkError.message);
        }
        
        if (checkData && typeof checkData === 'object') {
          logger.debug("Subscription data from API:", checkData);
          
          // Use optional chaining to safely access properties
          if ('plan_type' in checkData) authState.setPlanType(checkData.plan_type);
          if ('subscription_status' in checkData) authState.setSubscriptionStatus(checkData.subscription_status);
          if ('plan_expires_at' in checkData) authState.setPlanExpiresAt(checkData.plan_expires_at);
        }
      } catch (apiError) {
        logger.error('Error calling check-subscription function:', apiError);
        // Continue with the data we have from the database
      }
      
    } catch (error) {
      logger.error('Error refreshing subscription:', error);
      toast.error('Failed to verify subscription status');
    }
    // No return statement or explicitly returning undefined to match Promise<void>
  };

  // Check and refresh subscription on mount and when userId changes
  useEffect(() => {
    if (authState.userId) {
      checkAndRefreshSubscription();
    }
  }, [authState.userId]);

  const value: AuthContextType = {
    isLoggedIn: authState.isLoggedIn,
    username: authState.username,
    userId: authState.userId,
    defaultProfileId: authState.defaultProfileId,
    isLoadingProfile: authState.isLoadingProfile,
    hasMultipleProfiles: authState.hasMultipleProfiles,
    isNewSignup: authState.isNewSignup,
    setIsLoggedIn: authState.setIsLoggedIn,
    setUsername: authState.setUsername,
    setDefaultProfileId: authState.setDefaultProfileId,
    handleLogout: logoutHandler,
    refreshUserProfile: refreshProfileHandler,
    isAuthenticated: authState.isLoggedIn,
    // Subscription related fields
    planType: authState.planType,
    subscriptionStatus: authState.subscriptionStatus,
    planExpiresAt: authState.planExpiresAt,
    // Subscription methods
    isSubscriptionActive,
    canSaveScores,
    checkAndRefreshSubscription
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
