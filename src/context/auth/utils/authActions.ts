
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
  
  // Step 2: Explicitly verify account creation
  const maxAccountRetries = 5;
  let accountId = null;
  
  // Try multiple times to get the account - it should be created by DB trigger
  for (let i = 0; i < maxAccountRetries; i++) {
    // Wait a bit before checking (increasing delay with each retry)
    await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
    
    console.log(`Checking for account creation, attempt ${i + 1}/${maxAccountRetries}`);
    
    // Check if the account was created
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
    }
  }
  
  if (!accountId) {
    console.error('Failed to confirm account creation after multiple retries');
    throw new Error('Account creation failed. Please try again or contact support.');
  }
  
  // Step 3: Check if profile exists
  let retryCount = 0;
  const maxRetries = 5;
  let profileCreated = false;
  let profileId = null;
  
  while (retryCount < maxRetries && !profileCreated) {
    try {
      // Allow some time for the database triggers to complete
      if (retryCount > 0) {
        console.log(`Retry attempt ${retryCount}/${maxRetries} for profile creation...`);
        await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1)));
      }
      
      // Check if profile exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('account_id', userId)
        .maybeSingle();
      
      if (profileError) {
        console.warn('Error checking profile:', profileError);
      } else if (profileData) {
        console.log('Profile found:', profileData.id, profileData.name);
        profileCreated = true;
        profileId = profileData.id;
        
        // Store the profile ID in localStorage
        localStorage.setItem(ACTIVE_PROFILE_KEY, profileData.id);
        break;
      }
      
      retryCount++;
    } catch (error) {
      console.error('Error in profile creation check:', error);
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
