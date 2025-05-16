
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
import { safeData, hasData, hasProperty } from '@/utils/supabase-type-helpers';

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
      const planResponse = await supabase
        .from('plans')
        .select('can_save_score, max_saved_scores')
        .eq('plan_type', authState.planType as any)
        .single();
      
      // Handle errors properly using our type helper
      if (!hasData(planResponse) || !planResponse.data) {
        logger.error({
          message: 'Error checking plan permissions', 
          error: planResponse.error
        });
        return false;
      }
      
      const planData = planResponse.data;
      
      // If the plan allows saving scores
      if (planData && planData.can_save_score) {
        // If there's no limit (null means unlimited)
        if (planData.max_saved_scores === null) return true;
        
        // If there is a limit, check against current save count
        const accountResponse = await supabase
          .from('accounts')
          .select('score_save_count')
          .eq('id', authState.userId as any)
          .single();
        
        // Handle errors properly
        if (!hasData(accountResponse) || !accountResponse.data) {
          logger.error({
            message: 'Error checking account score count', 
            error: accountResponse.error
          });
          return false;
        }
        
        const accountData = accountResponse.data;
        
        // Make sure both properties exist before comparing
        if (accountData.score_save_count !== undefined && planData.max_saved_scores !== undefined) {
          return accountData.score_save_count < planData.max_saved_scores;
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
      const accountResponse = await supabase
        .from('accounts')
        .select('plan_type, subscription_status, plan_expires_at')
        .eq('id', authState.userId as any)
        .single();
      
      if (hasData(accountResponse)) {
        const account = accountResponse.data;
        logger.debug("Account data from DB:", account);
        
        // Use nullish coalescing to avoid setting undefined values
        if (hasProperty(account, 'plan_type')) {
          authState.setPlanType(account.plan_type || 'free');
        }
        
        if (hasProperty(account, 'subscription_status')) {
          authState.setSubscriptionStatus(account.subscription_status || 'free');
        }
        
        if (hasProperty(account, 'plan_expires_at')) {
          authState.setPlanExpiresAt(account.plan_expires_at);
        }
        
        // If we already have a non-free plan, we can stop here
        if (account.plan_type !== 'free' && account.subscription_status !== 'free') {
          return;
        }
      } else if (accountResponse.error) {
        logger.error('Error fetching account data:', accountResponse.error);
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
          if (hasProperty(checkData, 'plan_type')) authState.setPlanType(checkData.plan_type);
          if (hasProperty(checkData, 'subscription_status')) authState.setSubscriptionStatus(checkData.subscription_status);
          if (hasProperty(checkData, 'plan_expires_at')) authState.setPlanExpiresAt(checkData.plan_expires_at);
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
