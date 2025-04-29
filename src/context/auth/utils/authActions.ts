
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserProfiles, ACTIVE_PROFILE_KEY } from './profileUtils';
import { AuthStateType } from '../auth-types';

export const handleLogout = async (authState: AuthStateType) => {
  const { 
    setIsLoggedIn, 
    setUserId, 
    setUsername, 
    setDefaultProfileId, 
    setHasMultipleProfiles 
  } = authState;

  try {
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    
    // Reset all authentication states
    setIsLoggedIn(false);
    setUserId(null);
    setUsername('');
    setDefaultProfileId(null);
    setHasMultipleProfiles(false);
    
    // Clear active profile from localStorage
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
    
    window.location.href = '/'; // Redirect to home page after logout
  } catch (error) {
    // Even if error occurs, still reset client-side state
    setIsLoggedIn(false);
    setUserId(null);
    setUsername('');
    setDefaultProfileId(null);
    setHasMultipleProfiles(false);
  }
};

export const refreshUserProfile = async (authState: AuthStateType): Promise<void> => {
  const { userId } = authState;
  
  if (!userId) {
    return;
  }
  await fetchUserProfiles(userId, authState);
};

/**
 * Complete signup process that ensures account and profile creation
 * before allowing the user to proceed
 */
export const completeSignUp = async (email: string, password: string, displayName: string) => {
  // Step 1: Auth Sign Up
  const { data: authData, error: authError } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        name: displayName
      }
    }
  });
  
  if (authError || !authData.user) {
    throw new Error('Authentication signup failed: ' + authError?.message);
  }
  
  const userId = authData.user.id;
  
  // IMPORTANT: Wait for Supabase to fully commit the account/profile creation
  // Reduced from 2500ms to 1500ms
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Step 2: Explicitly verify account creation
  const maxAccountRetries = 5; // Reduced from 10 to 5
  const retryDelay = 800; // Reduced from 1000ms to 800ms
  let accountId = null;
  
  // Try multiple times to get the account - it should be created by DB trigger
  for (let i = 0; i < maxAccountRetries; i++) {
    // Wait a consistent delay between retries
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
    
    // Check current auth session before query
    const { data: sessionData } = await supabase.auth.getSession();
    
    // Verify the session has our target user ID before proceeding
    if (!sessionData.session || sessionData.session.user.id !== userId) {
      // Try to refresh the session
      await supabase.auth.refreshSession();
    }
    
    // Check if the account was created
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', userId)  // In your schema, account.id = user.id
      .maybeSingle();
    
    if (!accountError && accountData) {
      accountId = accountData.id;
      break;
    }
  }
  
  if (!accountId) {
    throw new Error('Account creation failed. Please try again or contact support.');
  }
  
  // Step 3: Check if profile exists
  let retryCount = 0;
  const maxProfileRetries = 5; // Reduced from 10 to 5
  let profileCreated = false;
  let profileId = null;
  
  while (retryCount < maxProfileRetries && !profileCreated) {
    try {
      // First attempt doesn't need additional delay since we just found the account
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
      
      // Check if profile exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('account_id', userId)
        .maybeSingle();
      
      if (!profileError && profileData) {
        profileCreated = true;
        profileId = profileData.id;
        
        // Store the profile ID in localStorage
        localStorage.setItem(ACTIVE_PROFILE_KEY, profileData.id);
        
        // IMPORTANT: Update the profile name if it doesn't match the display name
        // This ensures the profile name matches what the user entered during signup
        if (profileData.name !== displayName) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ name: displayName })
            .eq('id', profileData.id);
            
          if (updateError) {
            console.error('Failed to update profile name:', updateError);
          }
        }
        
        break;
      }
      
      retryCount++;
    } catch (error) {
      retryCount++;
    }
  }
  
  if (!profileCreated) {
    throw new Error('Profile creation failed after multiple attempts. Please try again or contact support.');
  }
  
  return { userId, accountId, profileId };
};

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
