
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { AuthProviderProps } from './auth-types';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { useSessionManagement } from '@/hooks/useSessionManagement';

const AuthProvider = ({ children }: AuthProviderProps) => {
  // Use our custom hooks
  const {
    defaultProfileId,
    username,
    isLoadingProfile,
    setDefaultProfileId,
    setUsername,
    setIsLoadingProfile,
    fetchDefaultProfile
  } = useProfileManagement();

  const {
    isLoggedIn,
    userId,
    isReady,
    setIsLoggedIn,
    setUserId,
    setIsReady,
    handleLogout
  } = useSessionManagement();

  useEffect(() => {
    // Mark as loading profile when initializing
    setIsLoadingProfile(true);
    setIsReady(false);
    
    // Handle auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed in AuthProvider:', event);
        
        if (event === 'SIGNED_OUT') {
          setIsLoggedIn(false);
          setUserId(null);
          setUsername('');
          setDefaultProfileId(null);
          
          // Clear active profile from localStorage on signout
          localStorage.removeItem('math_game_active_profile');
          
          setIsLoadingProfile(false);
          setIsReady(true); // Mark as ready on sign out
          return;
        }
        
        if (session?.user) {
          setIsLoggedIn(true);
          setUserId(session.user.id);
          
          // We need to ensure the session is fully initialized before fetching the profile
          setTimeout(async () => {
            try {
              const { data: { session: refreshedSession } } = await supabase.auth.getSession();
              if (refreshedSession?.user) {
                // Now fetch the profile with the confirmed session
                await fetchDefaultProfile(refreshedSession.user.id);
                setIsReady(true);
              } else {
                setIsLoadingProfile(false);
                setIsReady(true);
              }
            } catch (err) {
              console.error('Error refreshing session:', err);
              setIsLoadingProfile(false);
              setIsReady(true);
            }
          }, 300);
        } else {
          // If no session, mark profile as not loading and auth as ready
          setIsLoadingProfile(false);
          setIsReady(true);
        }
      }
    );

    // Check for existing session on initial load
    const checkExistingSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('Existing session found, user:', session.user.email);
          setIsLoggedIn(true);
          setUserId(session.user.id);
          
          // Add a slight delay to ensure auth is fully ready on Supabase
          setTimeout(async () => {
            await fetchDefaultProfile(session.user.id);
            setIsReady(true);
          }, 300);
        } else {
          console.log('No existing session found');
          // Ensure we're truly logged out and not loading profile
          setIsLoggedIn(false);
          setUserId(null);
          setUsername('');
          setDefaultProfileId(null);
          setIsLoadingProfile(false);
          setIsReady(true); // Mark as ready for non-authenticated state
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsLoadingProfile(false);
        setIsReady(true); // Mark as ready even if there was an error
      }
    };
    
    checkExistingSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Extra safeguard - if profile loading state gets stuck somehow
  useEffect(() => {
    // After 5 seconds, if we're still loading profile, set to false
    const timeout = setTimeout(() => {
      if (isLoadingProfile) {
        console.warn('Profile loading timed out - resetting loading state');
        setIsLoadingProfile(false);
        setIsReady(true); // Also mark as ready to prevent UI from being stuck
      }
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [isLoadingProfile]);

  const authContextValue = {
    isLoggedIn,
    username,
    userId,
    defaultProfileId,
    isLoadingProfile,
    isReady,
    setIsLoggedIn,
    setUsername,
    setDefaultProfileId,
    handleLogout,
    isAuthenticated: isLoggedIn
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
