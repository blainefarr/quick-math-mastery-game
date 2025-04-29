
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSessionManagement = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Reset auth error state
  const resetAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Comprehensive logout function that ensures all session data is cleared
  const handleLogout = useCallback(async () => {
    try {
      console.log('Logout initiated');
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signOut error:', error);
        toast.error('Error during logout. Please try again.');
        throw error;
      }
      
      // Reset all authentication states
      setIsLoggedIn(false);
      setUserId(null);
      setAuthError(null);
      
      // Clear active profile from localStorage
      localStorage.removeItem('math_game_active_profile');
      
      // Clear all local storage and session storage related to auth
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      
      const authItems = ['supabase.auth.token', 'supabase-auth-token'];
      authItems.forEach(item => {
        localStorage.removeItem(item);
        sessionStorage.removeItem(item);
      });

      console.log('Logout completed successfully');
      toast.success('You have been logged out successfully');
    } catch (error) {
      console.error('Error during logout process:', error);
      toast.error('Error during logout. Some data may not have been cleared.');
      // Even if error occurs, still reset client-side state
      setIsLoggedIn(false);
      setUserId(null);
    }
  }, []);

  const handleForceLogout = useCallback((errorMessage: string = 'Authentication error. Please log in again.') => {
    console.error('Forced logout due to:', errorMessage);
    setAuthError(errorMessage);
    toast.error(errorMessage);
    handleLogout();
  }, [handleLogout]);

  return {
    isLoggedIn,
    userId,
    isReady,
    authError,
    setIsLoggedIn,
    setUserId,
    setIsReady,
    setAuthError,
    resetAuthError,
    handleLogout,
    handleForceLogout
  };
};
