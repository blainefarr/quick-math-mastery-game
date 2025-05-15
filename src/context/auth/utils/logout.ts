
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ACTIVE_PROFILE_KEY } from './profileUtils';
import { AuthStateType } from '../auth-types';
import logger from '@/utils/logger';

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

  // Log the logout attempt for debugging
  logger.info('User initiated logout');
  
  try {
    // Reset loading state to prevent UI issues
    setIsLoadingProfile(false);
    
    // Clear auth state first to prevent UI flicker during logout
    setIsLoggedIn(false);
    setUserId(null);
    setUsername('');
    setDefaultProfileId(null);
    setHasMultipleProfiles(false);
    
    // Sign out from Supabase - this should come AFTER we've reset the UI state
    const { error } = await supabase.auth.signOut({
      scope: 'global' // Ensure we completely sign out from all tabs/windows
    });
    
    if (error) {
      throw error;
    }
    
    // Clear active profile from localStorage
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
    
    // Clear any other potential auth-related data in localStorage
    try {
      // Clear any potential supabase auth data
      localStorage.removeItem('supabase.auth.token');
      // Clear any potential session data
      localStorage.removeItem('sb-session');
      // Clear any other auth-related items
      sessionStorage.removeItem('PROFILE_SWITCHER_SHOWN_KEY');
    } catch (err) {
      // Ignore errors from localStorage operations
      logger.warn('Error clearing localStorage items:', err);
    }
    
    // Use window location only if no navigation utils are available
    // This is more reliable than router navigation in some cases for auth
    window.location.href = '/';
  } catch (error) {
    logger.error('Error during logout:', error);
    
    // Even if error occurs, still reset client-side state
    setIsLoggedIn(false);
    setUserId(null);
    setUsername('');
    setDefaultProfileId(null);
    setHasMultipleProfiles(false);
    setIsLoadingProfile(false);
    
    toast({
      title: "Error during logout",
      description: "Please try again",
      variant: "destructive"
    });
    
    // Still redirect on error to ensure user gets back to home
    window.location.href = '/';
  }
};
