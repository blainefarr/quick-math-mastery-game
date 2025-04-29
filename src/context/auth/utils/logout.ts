
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ACTIVE_PROFILE_KEY } from './profileUtils';
import { AuthStateType } from '../auth-types';

/**
 * Handle user logout and clean up user state
 */
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
