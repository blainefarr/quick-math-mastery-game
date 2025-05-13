
import { toast } from '@/hooks/use-toast';
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
    setHasMultipleProfiles,
    setIsLoadingProfile
  } = authState;

  try {
    // Reset loading state to prevent UI issues
    setIsLoadingProfile(false);
    
    // Sign out from Supabase with more explicit options
    const { error } = await supabase.auth.signOut({
      scope: 'global' // Ensure we completely sign out from all tabs/windows
    });
    
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
    
    // Also clear any other potential auth-related data in localStorage
    try {
      // Clear any potential supabase auth data
      localStorage.removeItem('supabase.auth.token');
      // Clear any potential session data
      localStorage.removeItem('sb-session');
      // Clear any other auth-related items
      sessionStorage.removeItem('PROFILE_SWITCHER_SHOWN_KEY');
    } catch (err) {
      // Ignore errors from localStorage operations
      console.warn('Error clearing localStorage items:', err);
    }
    
    window.location.href = '/'; // Redirect to home page after logout
  } catch (error) {
    console.error('Error during logout:', error);
    
    // Even if error occurs, still reset client-side state
    setIsLoggedIn(false);
    setUserId(null);
    setUsername('');
    setDefaultProfileId(null);
    setHasMultipleProfiles(false);
    setIsLoadingProfile(false);
    
    // Still try to redirect
    window.location.href = '/';
  }
};
