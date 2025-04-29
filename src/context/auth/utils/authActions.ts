
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
  
  // Step 2: Check/Create Account (handled by database triggers in Supabase)
  // The database will automatically create an account linked to the user
  // through the handle_new_account_profile function
  
  // Step 3: Check if account and profile were created successfully
  let retryCount = 0;
  const maxRetries = 4;
  let profileCreated = false;
  
  while (retryCount < maxRetries && !profileCreated) {
    try {
      // Allow some time for the database triggers to complete
      if (retryCount > 0) {
        console.log(`Retry attempt ${retryCount}/${maxRetries} for profile creation...`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Check if profile exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('account_id', userId)
        .maybeSingle();
      
      if (profileError) {
        console.warn('Error checking profile:', profileError);
      } else if (profileData) {
        console.log('Profile found:', profileData.id);
        profileCreated = true;
        
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
  
  console.log('Complete signup process successful');
  return { userId };
};
