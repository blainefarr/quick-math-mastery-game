
import { supabase } from '@/integrations/supabase/client';
import { AuthStateType } from '../auth-types';
import { ACTIVE_PROFILE_KEY } from './profileUtils';
import { toast } from 'sonner';

// Track ongoing fetch operations to prevent duplicates
let isFetchingProfile = false;
const FETCH_TIMEOUT_MS = 5000; // 5 seconds
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000; // 1 second
const AUTH_REFRESH_DEBOUNCE_MS = 30000; // 30s debounce for refresh operations

// Map to track when profiles were last fetched for each user ID
const lastProfileFetchTimeMap = new Map<string, number>();

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
    return false;
  }
  
  // Check if we recently fetched this profile and have a defaultProfileId already
  // This helps prevent duplicate fetches during tab switches
  const now = Date.now();
  const lastFetchTime = lastProfileFetchTimeMap.get(userId) || 0;
  if (
    !isRetry && 
    authState.defaultProfileId && 
    now - lastFetchTime < AUTH_REFRESH_DEBOUNCE_MS
  ) {
    console.log(`Profile for ${userId} was fetched recently, skipping duplicate fetch`);
    authState.setIsLoadingProfile(false);
    return true;
  }
  
  // Prevent duplicate concurrent fetches
  if (isFetchingProfile) {
    console.log('Already fetching profile, skipping this request');
    return false;
  }
  
  // Set up a timeout to release the lock if the operation takes too long
  const fetchTimeoutId = setTimeout(() => {
    console.warn('Profile fetch operation timed out, releasing lock');
    isFetchingProfile = false;
    authState.setIsLoadingProfile(false);
  }, FETCH_TIMEOUT_MS);
  
  try {
    isFetchingProfile = true;
    
    if (!isRetry) {
      authState.setIsLoadingProfile(true);
    }
    
    console.log('Fetching account and profile data for user:', userId);
    
    // Check current auth session before query
    const { data: sessionData } = await supabase.auth.getSession();
    
    // Verify the session has our target user ID before proceeding
    if (!sessionData.session || sessionData.session.user.id !== userId) {
      // Try to refresh the session - optimized to avoid multiple refreshes
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.warn('Session refresh failed:', refreshError.message);
        if (showToasts) {
          toast.error('Session refresh failed');
        }
        return false;
      }
      
      // If still no valid session, return false
      if (!refreshData.session || refreshData.session.user.id !== userId) {
        console.warn('Unable to get valid session for user:', userId);
        return false;
      }
    }
    
    // Step 1: Check if account exists first (this is critical)
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id, name')
      .eq('id', userId)
      .maybeSingle();
      
    if (accountError) {
      console.error('Error fetching account:', accountError);
      if (showToasts && !isRetry) {
        toast.error('Account not found');
      }
      return false;
    }
    
    if (!accountData) {
      console.warn('No account found for user ID:', userId);
      if (showToasts && !isRetry) {
        toast.error('Account not found');
      }
      return false;
    }
    
    const accountId = accountData.id;
    
    // Step 2: Get profiles for this account
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, is_active, is_owner, grade')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      if (showToasts && !isRetry) {
        toast.error('Failed to load user profiles');
      }
      return false;
    }
    
    if (!profiles || profiles.length === 0) {
      console.warn('No profiles found for account:', accountId);
      if (showToasts && !isRetry) {
        toast.error('No profiles found for your account');
      }
      return false;
    }
    
    authState.setHasMultipleProfiles(profiles.length > 1);
    
    // Get stored profile ID or select one
    const storedProfileId = localStorage.getItem(ACTIVE_PROFILE_KEY);
    let selectedProfile = null;
    
    if (storedProfileId) {
      selectedProfile = profiles.find(p => p.id === storedProfileId);
    }
    
    if (!selectedProfile) {
      // Auto-select profile
      if (profiles.length === 1) {
        selectedProfile = profiles[0];
      } else {
        // Try to get owner profile
        selectedProfile = profiles.find(p => p.is_owner === true);
        if (!selectedProfile) {
          // Use first profile
          selectedProfile = profiles[0];
        }
      }
      
      // Store selected profile
      if (selectedProfile) {
        localStorage.setItem(ACTIVE_PROFILE_KEY, selectedProfile.id);
      }
    }
    
    if (selectedProfile) {
      // Store the timestamp of this successful fetch
      lastProfileFetchTimeMap.set(userId, Date.now());
      
      // Use profile name as requested by the user
      authState.setDefaultProfileId(selectedProfile.id);
      authState.setUsername(selectedProfile.name);
      authState.setIsLoadingProfile(false);
      
      // If this was a new signup and it's a retry, show success message
      if (authState.isNewSignup && isRetry && showToasts) {
        toast.success('Account created successfully!');
        authState.setIsNewSignup(false);
      }
      
      return true;
    } else {
      console.warn('Could not find a valid profile');
      if (showToasts && !isRetry) {
        toast.error('Could not find a valid profile');
      }
      return false;
    }
  } catch (error) {
    console.error('Error in fetchAndSaveAccountProfile:', error);
    if (showToasts && !isRetry) {
      toast.error('Error loading user data');
    }
    return false;
  } finally {
    // Clear the timeout since we're done
    clearTimeout(fetchTimeoutId);
    
    if (!isRetry) {
      authState.setIsLoadingProfile(false);
    }
    // Release the fetch lock after a short delay to prevent race conditions
    setTimeout(() => {
      isFetchingProfile = false;
    }, 300);
  }
};

/**
 * Refresh user profile data with optimized error handling
 */
export const refreshUserProfile = async (authState: AuthStateType): Promise<boolean> => {
  const { userId } = authState;
  
  if (!userId) {
    return false;
  }
  return await fetchAndSaveAccountProfile(userId, authState, true);
};
