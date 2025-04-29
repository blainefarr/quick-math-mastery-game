
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
    console.log('Logout initiated');
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Supabase signOut error:', error);
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
    
    console.log('Logout completed successfully');
    window.location.href = '/'; // Redirect to home page after logout
  } catch (error) {
    console.error('Error during logout process:', error);
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
    console.warn('Cannot refresh profile: No user ID available');
    return;
  }
  console.log('Manually refreshing user profile for:', userId);
  await fetchUserProfiles(userId, authState);
};

/**
 * Complete signup process that ensures account and profile creation
 * before allowing the user to proceed
 */
export const completeSignUp = async (email: string, password: string, displayName: string) => {
  console.log('Starting complete signup process...');
  
  // Step 1: Auth Sign Up
  console.log('Step 1: Performing Supabase Auth SignUp for:', email);
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
    console.error('Authentication signup failed:', authError);
    throw new Error('Authentication signup failed: ' + authError?.message);
  }
  
  const userId = authData.user.id;
  console.log('Auth signup successful, userId:', userId);
  
  // IMPORTANT: Wait for Supabase to fully commit the account/profile creation
  console.log('Waiting for Supabase to fully commit account/profile (2.5s delay)...');
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  // Step 2: Explicitly verify account creation
  const maxAccountRetries = 10; // Increased from 5
  const retryDelay = 1000; // 1 second between retries
  let accountId = null;
  
  console.log('Step 2: Verifying account creation in database...');
  // Try multiple times to get the account - it should be created by DB trigger
  for (let i = 0; i < maxAccountRetries; i++) {
    // Wait a consistent 1 second between retries
    if (i > 0) {
      console.log(`Waiting ${retryDelay}ms before retry attempt ${i + 1}/${maxAccountRetries}...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
    
    console.log(`Checking for account creation, attempt ${i + 1}/${maxAccountRetries}`);
    
    // Check current auth session before query
    const { data: sessionData } = await supabase.auth.getSession();
    console.log(`Auth session before account fetch (attempt ${i + 1}):`, {
      hasSession: !!sessionData.session,
      sessionUserId: sessionData.session?.user?.id,
      accessToken: sessionData.session?.access_token ? '✓ Present' : '❌ Missing',
      targetUserId: userId,
      matchesTarget: sessionData.session?.user?.id === userId,
      fullSession: sessionData.session
    });
    
    // Verify the session has our target user ID before proceeding
    if (!sessionData.session || sessionData.session.user.id !== userId) {
      console.warn(`Session mismatch or missing - refreshing session before account check attempt ${i + 1}`);
      
      // Try to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error('Error refreshing session:', refreshError);
      } else {
        console.log('Session refreshed, new session:', {
          hasSession: !!refreshData.session,
          sessionUserId: refreshData.session?.user?.id,
          matchesTarget: refreshData.session?.user?.id === userId
        });
      }
    }
    
    // Check if the account was created
    console.log(`Querying accounts table for userId=${userId}`);
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', userId)  // In your schema, account.id = user.id
      .maybeSingle();
    
    if (accountError) {
      console.warn(`Account check error (attempt ${i + 1}):`, accountError);
    } else if (accountData) {
      accountId = accountData.id;
      console.log('Account found:', accountId);
      break;
    } else {
      console.log(`Account not found on attempt ${i + 1}, will ${i < maxAccountRetries - 1 ? 'retry' : 'stop trying'}`);
    }
  }
  
  if (!accountId) {
    console.error('Failed to confirm account creation after multiple retries');
    throw new Error('Account creation failed. Please try again or contact support.');
  }
  
  // Step 3: Check if profile exists
  console.log('Step 3: Verifying profile creation in database...');
  let retryCount = 0;
  const maxProfileRetries = 10; // Increased from 5
  let profileCreated = false;
  let profileId = null;
  
  while (retryCount < maxProfileRetries && !profileCreated) {
    try {
      // First attempt doesn't need additional delay since we just found the account
      if (retryCount > 0) {
        console.log(`Waiting ${retryDelay}ms before profile check attempt ${retryCount + 1}/${maxProfileRetries}...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
      
      console.log(`Checking for profile, attempt ${retryCount + 1}/${maxProfileRetries}`);
      
      // Check current auth session before query
      const { data: sessionData } = await supabase.auth.getSession();
      console.log(`Auth session before profile fetch (attempt ${retryCount + 1}):`, {
        hasSession: !!sessionData.session,
        sessionUserId: sessionData.session?.user?.id,
        accessToken: sessionData.session?.access_token ? '✓ Present' : '❌ Missing',
        matchesTarget: sessionData.session?.user?.id === userId,
        fullSession: sessionData.session
      });
      
      // Check if profile exists
      console.log(`Querying profiles table for account_id=${userId}`);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('account_id', userId)
        .maybeSingle();
      
      if (profileError) {
        console.warn(`Profile check error (attempt ${retryCount + 1}):`, profileError);
      } else if (profileData) {
        console.log('Profile found:', profileData.id, profileData.name);
        profileCreated = true;
        profileId = profileData.id;
        
        // Store the profile ID in localStorage
        console.log(`Saving profile ID ${profileId} to localStorage (key: ${ACTIVE_PROFILE_KEY})`);
        localStorage.setItem(ACTIVE_PROFILE_KEY, profileData.id);
        break;
      } else {
        console.log(`Profile not found on attempt ${retryCount + 1}, will ${retryCount < maxProfileRetries - 1 ? 'retry' : 'stop trying'}`);
      }
      
      retryCount++;
    } catch (error) {
      console.error(`Error in profile creation check attempt ${retryCount + 1}:`, error);
      retryCount++;
    }
  }
  
  if (!profileCreated) {
    console.error('Failed to confirm profile creation after maximum retries');
    throw new Error('Profile creation failed after multiple attempts. Please try again or contact support.');
  }
  
  console.log('Complete signup process successful with:', {
    userId,
    accountId, 
    profileId
  });
  
  return { userId, accountId, profileId };
};

/**
 * Function to fetch and save account and profile info after auth events
 * This is used during both sign-in and post-signup verification
 */
export const fetchAndSaveAccountProfile = async (userId: string, authState: AuthStateType): Promise<boolean> => {
  console.log('fetchAndSaveAccountProfile: Starting for userId:', userId);
  
  if (!userId) {
    console.error('fetchAndSaveAccountProfile: No userId provided');
    return false;
  }
  
  try {
    // Check current auth session before query
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('Auth session before account fetch:', {
      hasSession: !!sessionData.session,
      sessionUserId: sessionData.session?.user?.id,
      accessToken: sessionData.session?.access_token ? '✓ Present' : '❌ Missing',
      targetUserId: userId,
      matchesTarget: sessionData.session?.user?.id === userId,
      fullSession: sessionData.session
    });
    
    // Verify the session has our target user ID before proceeding
    if (!sessionData.session || sessionData.session.user.id !== userId) {
      console.warn('Session mismatch or missing - refreshing session before fetch');
      
      // Try to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error('Error refreshing session:', refreshError);
      } else {
        console.log('Session refreshed, new session:', {
          hasSession: !!refreshData.session,
          sessionUserId: refreshData.session?.user?.id,
          matchesTarget: refreshData.session?.user?.id === userId
        });
      }
    }
    
    // Step 1: Check if account exists first (this is critical)
    console.log('fetchAndSaveAccountProfile Step 1: Checking account existence');
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (accountError) {
      console.error('fetchAndSaveAccountProfile: Error fetching account:', accountError);
      return false;
    }
    
    if (!accountData) {
      console.error('fetchAndSaveAccountProfile: No account found for user:', userId);
      return false;
    }
    
    const accountId = accountData.id;
    console.log('fetchAndSaveAccountProfile: Account found:', accountId);
    
    // Step 2: Get profiles for this account
    console.log('fetchAndSaveAccountProfile Step 2: Fetching profiles for account');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, is_active, is_owner, grade')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });
    
    if (profilesError) {
      console.error('fetchAndSaveAccountProfile: Error fetching profiles:', profilesError);
      return false;
    }
    
    if (!profiles || profiles.length === 0) {
      console.error('fetchAndSaveAccountProfile: No profiles found for account:', accountId);
      return false;
    }
    
    console.log('fetchAndSaveAccountProfile: Found', profiles.length, 'profiles:', profiles);
    authState.setHasMultipleProfiles(profiles.length > 1);
    
    // Get stored profile ID or select one
    const storedProfileId = localStorage.getItem(ACTIVE_PROFILE_KEY);
    let selectedProfile = null;
    
    if (storedProfileId) {
      console.log('fetchAndSaveAccountProfile: Checking for stored profile:', storedProfileId);
      selectedProfile = profiles.find(p => p.id === storedProfileId);
    }
    
    if (!selectedProfile) {
      // Auto-select profile
      if (profiles.length === 1) {
        selectedProfile = profiles[0];
        console.log('fetchAndSaveAccountProfile: Auto-selecting only profile:', selectedProfile.id);
      } else {
        // Try to get owner profile
        selectedProfile = profiles.find(p => p.is_owner === true);
        if (selectedProfile) {
          console.log('fetchAndSaveAccountProfile: Selected owner profile:', selectedProfile.id);
        } else {
          selectedProfile = profiles[0];
          console.log('fetchAndSaveAccountProfile: Falling back to first profile:', selectedProfile.id);
        }
      }
      
      // Store selected profile
      if (selectedProfile) {
        console.log('fetchAndSaveAccountProfile: Saving profile ID to localStorage:', selectedProfile.id);
        localStorage.setItem(ACTIVE_PROFILE_KEY, selectedProfile.id);
      }
    }
    
    if (selectedProfile) {
      console.log('fetchAndSaveAccountProfile: Setting profile in auth state:', selectedProfile.id);
      authState.setDefaultProfileId(selectedProfile.id);
      authState.setUsername(selectedProfile.name);
      return true;
    } else {
      console.error('fetchAndSaveAccountProfile: Failed to select a profile');
      return false;
    }
  } catch (error) {
    console.error('fetchAndSaveAccountProfile: Unexpected error:', error);
    return false;
  }
};
