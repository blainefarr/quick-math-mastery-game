
import React, { useState } from 'react';
import AuthContext from './AuthContext';
import { AuthContextType, AuthProviderProps } from './auth-types';
import { useAuthState } from './hooks/useAuthState';
import { useAuthEvents } from './hooks/useAuthEvents';
import { handleLogout } from './utils/logout';
import { refreshUserProfile } from './utils/accountProfile';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AuthProvider = ({ children }: AuthProviderProps) => {
  const authState = useAuthState();
  const [profileCount, setProfileCount] = useState(0);
  const [maxProfiles, setMaxProfiles] = useState<number | null>(null);
  
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
    
    // Also refresh profile limits
    if (authState.userId) {
      fetchProfileLimits(authState.userId, authState.planType);
    }
    
    // Return void as expected by the type definition
    return;
  };

  // Fetch profile limits based on plan
  const fetchProfileLimits = async (userId: string, planType: string) => {
    try {
      // Get max profiles from plan
      const { data: planData } = await supabase
        .from('plans')
        .select('max_profiles')
        .eq('plan_type', planType)
        .maybeSingle();
      
      // Get current profile count
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', userId);
      
      setMaxProfiles(planData?.max_profiles || null);
      setProfileCount(count || 0);
      
    } catch (error) {
      console.error('Error fetching profile limits:', error);
    }
  };

  // Check if the user can create more profiles
  const canCreateProfile = async () => {
    if (!authState.userId) return false;
    
    try {
      // Get the current plan details
      const { data: planData } = await supabase
        .from('plans')
        .select('max_profiles')
        .eq('plan_type', authState.planType)
        .single();
      
      if (!planData) return false;
      
      // If there's no limit (null means unlimited)
      if (planData.max_profiles === null) return true;
      
      // Get current profile count
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', authState.userId);
        
      return count < planData.max_profiles;
    } catch (error) {
      console.error('Error checking if user can create profile:', error);
      return false;
    }
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
      const { data: planData } = await supabase
        .from('plans')
        .select('can_save_score, max_saved_scores')
        .eq('plan_type', authState.planType)
        .single();
      
      if (!planData) return false;
      
      // If the plan allows saving scores
      if (planData.can_save_score) {
        // If there's no limit (null means unlimited)
        if (planData.max_saved_scores === null) return true;
        
        // If there is a limit, check against current save count
        const { data: accountData } = await supabase
          .from('accounts')
          .select('score_save_count')
          .eq('id', authState.userId)
          .single();
        
        if (!accountData) return false;
        
        return accountData.score_save_count < planData.max_saved_scores;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking if user can save scores:', error);
      return false;
    }
  };
  
  // Enhanced check and refresh subscription details with better error handling
  // Fixed to return void instead of boolean
  const checkAndRefreshSubscription = async (): Promise<void> => {
    if (!authState.userId) return;
    
    try {
      console.log("Checking subscription status for user:", authState.userId);
      
      // First try to fetch from direct database to avoid any webhook latency
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('plan_type, subscription_status, plan_expires_at')
        .eq('id', authState.userId)
        .single();
      
      if (accountError) {
        console.error('Error fetching account data:', accountError);
        throw new Error(accountError.message);
      }
      
      if (account) {
        console.log("Account data from DB:", account);
        authState.setPlanType(account.plan_type || 'free');
        authState.setSubscriptionStatus(account.subscription_status || 'free');
        authState.setPlanExpiresAt(account.plan_expires_at);
        
        // Also update profile limits
        fetchProfileLimits(authState.userId, account.plan_type || 'free');
        
        // If we already have a non-free plan, we can stop here
        if (account.plan_type !== 'free' && account.subscription_status !== 'free') {
          return;
        }
      }
      
      // If we don't have a subscription yet or it's free, check directly with the API
      try {
        console.log("Checking subscription with edge function");
        const { data: checkData, error: checkError } = await supabase.functions.invoke('check-subscription', {
          body: {}
        });
        
        if (checkError) {
          console.error('Error from check-subscription function:', checkError);
          throw new Error(checkError.message);
        }
        
        if (checkData) {
          console.log("Subscription data from API:", checkData);
          if (checkData.plan_type) authState.setPlanType(checkData.plan_type);
          if (checkData.subscription_status) authState.setSubscriptionStatus(checkData.subscription_status);
          if (checkData.plan_expires_at) authState.setPlanExpiresAt(checkData.plan_expires_at);
          
          // Update profile limits with the new plan type
          if (authState.userId && checkData.plan_type) {
            fetchProfileLimits(authState.userId, checkData.plan_type);
          }
        }
      } catch (apiError) {
        console.error('Error calling check-subscription function:', apiError);
        // Continue with the data we have from the database
      }
      
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      toast.error('Failed to verify subscription status');
    }
    // No return statement or explicitly returning undefined to match Promise<void>
  };

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
    checkAndRefreshSubscription,
    // Profile limit methods
    canCreateProfile,
    profileCount,
    maxProfiles
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
