
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { AuthProviderProps } from './auth-types';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { useSessionManagement } from '@/hooks/useSessionManagement';
import { toast } from 'sonner';

const AuthProvider = ({ children }: AuthProviderProps) => {
  // Use our custom hooks
  const {
    defaultProfileId,
    username,
    isLoadingProfile,
    setDefaultProfileId,
    setUsername,
    setIsLoadingProfile,
    fetchDefaultProfile,
    clearProfileData,
    ensureProfileExists
  } = useProfileManagement();

  const {
    isLoggedIn,
    userId,
    isReady,
    setIsLoggedIn,
    setUserId,
    setIsReady,
    handleLogout,
    handleForceLogout
  } = useSessionManagement();

  // Main authentication state handler
  useEffect(() => {
    console.log('AuthProvider initializing...');
    // Mark as not ready and loading profile when initializing
    setIsLoadingProfile(true);
    setIsReady(false);
    
    // Handle auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed in AuthProvider:', event);
        
        if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing all auth data');
          setIsLoggedIn(false);
          setUserId(null);
          clearProfileData();
          setIsLoadingProfile(false);
          setIsReady(true); // Mark as ready on sign out
          return;
        }
        
        if (session?.user) {
          console.log('Valid session detected, user ID:', session.user.id);
          setIsLoggedIn(true);
          setUserId(session.user.id);
          
          // We need to ensure the session is fully initialized before fetching the profile
          setTimeout(async () => {
            try {
              console.log('Verifying session before profile fetch');
              const { data: { session: refreshedSession } } = await supabase.auth.getSession();
              
              if (refreshedSession?.user) {
                console.log('Session verified, proceeding with profile fetch');
                // Check for sign up or sign in events to ensure profile creation
                if (event === 'SIGNED_IN' && !defaultProfileId) {
                  // For OAuth logins or returning users, we may need to ensure a profile exists
                  console.log('Sign-in detected, ensuring profile exists');
                  const profile = await ensureProfileExists(refreshedSession.user.id);
                  if (profile) {
                    console.log('Profile was created/found for user:', profile);
                    // Update state with the found/created profile
                    setDefaultProfileId(profile.id);
                    setUsername(profile.name || '');
                    localStorage.setItem('math_game_active_profile', profile.id);
                    setIsReady(true);
                    setIsLoadingProfile(false);
                    toast.success('Welcome! Your profile is ready.');
                    return;
                  }
                }
                
                // Standard flow for existing users
                const profile = await fetchDefaultProfile(refreshedSession.user.id, handleForceLogout);
                if (!profile) {
                  console.error('Failed to fetch profile after multiple attempts');
                  handleForceLogout('Unable to load your profile. Please log in again.');
                } else {
                  setIsReady(true);
                }
              } else {
                console.error('Session verification failed after timeout');
                handleForceLogout('Session verification failed. Please log in again.');
              }
            } catch (err) {
              console.error('Error refreshing session:', err);
              handleForceLogout('Error initializing your session. Please try again.');
            }
          }, 1000);  // Increased delay to ensure account is created
        } else {
          console.log('No valid session in auth state change event');
          // If no session, mark profile as not loading and auth as ready
          setIsLoggedIn(false);
          setUserId(null);
          clearProfileData();
          setIsLoadingProfile(false);
          setIsReady(true);
        }
      }
    );

    // Check for existing session on initial load
    const checkExistingSession = async () => {
      try {
        console.log('Checking for existing session on initial load');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('Existing session found, user:', session.user.email);
          setIsLoggedIn(true);
          setUserId(session.user.id);
          
          // Add a slight delay to ensure auth is fully ready on Supabase
          setTimeout(async () => {
            console.log('Fetching profile for existing session');
            const profile = await fetchDefaultProfile(session.user.id, handleForceLogout);
            if (!profile) {
              console.error('Failed to fetch profile for existing session');
              // Do not set isReady = true here, as we're logging out the user
            } else {
              setIsReady(true);
            }
          }, 1000);
        } else {
          console.log('No existing session found');
          // Ensure we're truly logged out and not loading profile
          setIsLoggedIn(false);
          setUserId(null);
          clearProfileData();
          setIsLoadingProfile(false);
          setIsReady(true); // Mark as ready for non-authenticated state
        }
      } catch (error) {
        console.error('Error checking session:', error);
        toast.error('Error checking your login status. Please refresh the page.');
        clearProfileData();
        setIsLoadingProfile(false);
        setIsReady(true); // Mark as ready even if there was an error
      }
    };
    
    checkExistingSession();

    return () => {
      console.log('Auth provider cleanup: unsubscribing from auth events');
      subscription.unsubscribe();
    };
  }, []);

  // Extra safeguard - if profile loading state gets stuck somehow
  useEffect(() => {
    // After 8 seconds, if we're still loading profile, set to false
    const timeout = setTimeout(() => {
      if (isLoadingProfile) {
        console.warn('Profile loading timed out after 8 seconds - resetting loading state');
        setIsLoadingProfile(false);
        setIsReady(true); // Also mark as ready to prevent UI from being stuck
        
        // If we're supposed to be logged in but profile loading timed out, show error
        if (isLoggedIn && userId) {
          toast.error('Unable to load your profile. You may need to log in again.');
          // Force logout when profile cannot be loaded after timeout
          handleForceLogout('Profile loading timed out. Please log in again.');
        }
      }
    }, 8000);  // Increased timeout to give more time for profile creation
    
    return () => clearTimeout(timeout);
  }, [isLoadingProfile, isLoggedIn, userId]);

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
    isAuthenticated: isLoggedIn && !!defaultProfileId // Only truly authenticated with both login and profile
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
