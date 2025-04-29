
import { supabase } from '@/integrations/supabase/client';
import { AuthStateType } from '../auth-types';
import { ACTIVE_PROFILE_KEY } from './profileUtils';

/**
 * Function to fetch and save account and profile info after auth events
 * This is used during both sign-in and post-signup verification
 * Optimized for speed
 */
export const fetchAndSaveAccountProfile = async (userId: string, authState: AuthStateType): Promise<boolean> => {
  if (!userId) {
    return false;
  }
  
  try {
    console.log('Fetching account and profile data for user:', userId);
    
    // Check current auth session before query
    const { data: sessionData } = await supabase.auth.getSession();
    
    // Verify the session has our target user ID before proceeding
    if (!sessionData.session || sessionData.session.user.id !== userId) {
      // Try to refresh the session - optimized to avoid multiple refreshes
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.warn('Session refresh failed:', refreshError.message);
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
      return false;
    }
    
    if (!accountData) {
      console.warn('No account found for user ID:', userId);
      return false;
    }
    
    const accountId = accountData.id;
    const accountName = accountData.name;
    
    // Step 2: Get profiles for this account
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, is_active, is_owner, grade')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return false;
    }
    
    if (!profiles || profiles.length === 0) {
      console.warn('No profiles found for account:', accountId);
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
      // Use profile name as requested by the user
      authState.setDefaultProfileId(selectedProfile.id);
      authState.setUsername(selectedProfile.name);
      authState.setIsLoadingProfile(false);
      return true;
    } else {
      console.warn('Could not find a valid profile');
      return false;
    }
  } catch (error) {
    console.error('Error in fetchAndSaveAccountProfile:', error);
    return false;
  } finally {
    // Ensure loading state gets reset
    authState.setIsLoadingProfile(false);
  }
};

/**
 * Refresh user profile data
 */
export const refreshUserProfile = async (authState: AuthStateType): Promise<void> => {
  const { userId } = authState;
  
  if (!userId) {
    return;
  }
  await fetchAndSaveAccountProfile(userId, authState);
};
