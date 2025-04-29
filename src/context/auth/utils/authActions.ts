
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
