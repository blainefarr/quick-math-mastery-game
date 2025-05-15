
import { supabase } from '@/integrations/supabase/client';
import { AuthStateType } from '../auth-types';
import { ACTIVE_PROFILE_KEY } from './profileUtils';
import { toast } from 'sonner';
import logger from '@/utils/logger';

// Track ongoing fetch operations to prevent duplicates
let isFetchingProfile = false;
const FETCH_TIMEOUT_MS = 5000; // 5 seconds
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000; // 1 second

/**
 * Function to fetch and save account and profile info after auth events
 * This is used during both sign-in and post-signup verification
 * Optimized for speed and includes the best parts from fetchUserProfiles
 */
export const fetchAndSaveAccountProfile = async (
  userId: string, 
  authState: AuthStateType, 
  showToasts = false,
  isRetry = false
): Promise<boolean> => {
  if (!userId) {
    logger.warn('fetchAndSaveAccountProfile called with no userId');
    return false;
  }
  
  // Prevent duplicate concurrent fetches
  if (isFetchingProfile) {
    logger.debug('Already fetching profile, skipping this request');
    return false;
  }
  
  // Use timeout to prevent hanging operations
  const fetchPromise = new Promise<boolean>(async (resolve) => {
    try {
      isFetchingProfile = true;
      
      if (!isRetry) {
        authState.setIsLoadingProfile(true);
      }
      
      logger.debug(`Fetching account and profile data for user: ${userId}`);
      
      // Check current auth session before query
      const { data: sessionData } = await supabase.auth.getSession();
      
      // Verify the session has our target user ID before proceeding
      if (!sessionData.session || sessionData.session.user.id !== userId) {
        // Try to refresh the session
        logger.debug('Session mismatch, attempting refresh');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          logger.warn(`Session refresh failed: ${refreshError.message}`);
          if (showToasts) {
            toast.error('Session refresh failed');
          }
          resolve(false);
          return;
        }
        
        // If still no valid session, return false
        if (!refreshData.session || refreshData.session.user.id !== userId) {
          logger.warn(`Unable to get valid session for user: ${userId}`);
          resolve(false);
          return;
        }
        
        logger.debug('Session refreshed successfully');
      }
      
      // Step 1: Check if account exists first (this is critical)
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('id, name, plan_type, subscription_status, plan_expires_at')
        .eq('id', userId as any)
        .maybeSingle();
        
      if (accountError) {
        logger.error(`Error fetching account: ${accountError.message}`);
        if (showToasts && !isRetry) {
          toast.error('Account not found');
        }
        resolve(false);
        return;
      }
      
      if (!accountData) {
        logger.warn(`No account found for user ID: ${userId}`);
        if (showToasts && !isRetry) {
          toast.error('Account not found');
        }
        resolve(false);
        return;
      }
      
      // Make sure id exists before using it
      if (!('id' in accountData)) {
        logger.warn(`Invalid account data format for user ID: ${userId}`);
        resolve(false);
        return;
      }
      
      const accountId = accountData.id;
      
      // Update auth state with subscription information
      if ('plan_type' in accountData) {
        authState.setPlanType(accountData.plan_type || 'free');
      }
      if ('subscription_status' in accountData) {
        authState.setSubscriptionStatus(accountData.subscription_status || 'free');
      }
      if ('plan_expires_at' in accountData) {
        authState.setPlanExpiresAt(accountData.plan_expires_at);
      }
      
      // Step 2: Get profiles for this account
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, is_active, is_owner, grade')
        .eq('account_id', accountId as any)
        .order('created_at', { ascending: false });
      
      if (profilesError) {
        logger.error(`Error fetching profiles: ${profilesError.message}`);
        if (showToasts && !isRetry) {
          toast.error('Failed to load user profiles');
        }
        resolve(false);
        return;
      }
      
      if (!profiles || !Array.isArray(profiles) || profiles.length === 0) {
        logger.warn(`No profiles found for account: ${accountId}`);
        if (showToasts && !isRetry) {
          toast.error('No profiles found for your account');
        }
        resolve(false);
        return;
      }
      
      logger.debug(`Found ${profiles.length} profile(s) for account: ${accountId}`);
      authState.setHasMultipleProfiles(profiles.length > 1);
      
      // Get stored profile ID or select one
      const storedProfileId = localStorage.getItem(ACTIVE_PROFILE_KEY);
      let selectedProfile = null;
      
      if (storedProfileId) {
        selectedProfile = profiles.find(p => 'id' in p && p.id === storedProfileId);
        logger.debug(`Using stored profile ID: ${storedProfileId}, found: ${!!selectedProfile}`);
      }
      
      if (!selectedProfile) {
        // Auto-select profile
        if (profiles.length === 1) {
          selectedProfile = profiles[0];
          logger.debug('Auto-selecting single available profile');
        } else {
          // Try to get owner profile
          selectedProfile = profiles.find(p => 'is_owner' in p && p.is_owner === true);
          if (!selectedProfile) {
            // Use first profile
            selectedProfile = profiles[0];
            logger.debug('Using first available profile (no owner found)');
          } else {
            logger.debug('Using owner profile');
          }
        }
        
        // Store selected profile
        if (selectedProfile && 'id' in selectedProfile) {
          localStorage.setItem(ACTIVE_PROFILE_KEY, selectedProfile.id);
        }
      }
      
      if (selectedProfile && 'id' in selectedProfile) {
        // Use profile name as requested by the user
        const profileName = selectedProfile.name || '';
        logger.debug(`Setting user profile: ID ${selectedProfile.id}, name: ${profileName}`);
        
        authState.setDefaultProfileId(selectedProfile.id);
        authState.setUsername(profileName);
        authState.setIsLoadingProfile(false);
        
        // If this was a new signup and it's a retry, show success message
        if (authState.isNewSignup && isRetry && showToasts) {
          toast.success('Account created successfully!');
          authState.setIsNewSignup(false);
        }
        
        resolve(true);
        return;
      } else {
        logger.warn('Could not find a valid profile');
        if (showToasts && !isRetry) {
          toast.error('Could not find a valid profile');
        }
        resolve(false);
        return;
      }
    } catch (error: any) {
      logger.error(`Error in fetchAndSaveAccountProfile: ${error?.message || 'Unknown error'}`);
      if (showToasts && !isRetry) {
        toast.error('Error loading user data');
      }
      resolve(false);
    } finally {
      if (!isRetry) {
        authState.setIsLoadingProfile(false);
      }
      // Release the fetch lock after a short delay to prevent race conditions
      setTimeout(() => {
        isFetchingProfile = false;
      }, 300);
    }
  });
  
  // Set up a timeout to prevent hanging operations
  const timeoutPromise = new Promise<boolean>((resolve) => {
    setTimeout(() => {
      logger.warn(`fetchAndSaveAccountProfile timed out after ${FETCH_TIMEOUT_MS}ms`);
      resolve(false);
    }, FETCH_TIMEOUT_MS);
  });
  
  return Promise.race([fetchPromise, timeoutPromise]);
};

/**
 * Refresh user profile data with optimized error handling
 */
export const refreshUserProfile = async (authState: AuthStateType): Promise<boolean> => {
  const { userId } = authState;
  
  if (!userId) {
    logger.warn('refreshUserProfile called with no userId');
    return false;
  }
  
  logger.debug(`Refreshing user profile for: ${userId}`);
  return await fetchAndSaveAccountProfile(userId, authState, true);
};
