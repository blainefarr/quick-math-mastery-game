
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { AuthProviderProps } from './auth-types';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { useSessionManagement } from '@/hooks/useSessionManagement';
import { toast } from 'sonner';
import { waitForSession } from '@/hooks/useAuthUtils';

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
        
        if (event === 'SIGNED_IN' || event === 'SIGNED_UP' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            console.log(`Auth event ${event} detected, user ID:`, session.user.id);
            setIsLoggedIn(true);
            setUserId(session.user.id);
            
            // We need to handle the profile initialization separately 
            // to avoid blocking the auth state listener
            setTimeout(async () => {
              try {
                // Wait for the session to be fully established before attempting profile operations
                const confirmedSession = await waitForSession(5, 600);
                
                if (!confirmedSession) {
                  console.error('Failed to get confirmed session after sign in/up');
                  handleForceLogout('Unable to establish your session. Please try again.');
                  return;
                }
                
                // For new sign-ups, ensure a profile exists
                if (event === 'SIGNED_UP') {
                  console.log('New sign-up detected, ensuring profile exists');
                  const profile = await ensureProfileExists(confirmedSession.user.id);
                  if (profile) {
                    console.log('Profile was created/found for new user:', profile);
                    setDefaultProfileId(profile.id);
                    setUsername(profile.name || '');
                    localStorage.setItem('math_game_active_profile', profile.id);
                    setIsReady(true);
                    setIsLoadingProfile(false);
                    toast.success('Welcome! Your profile has been created.');
                    return;
                  } else {
                    console.error('Failed to create profile for new user');
                    handleForceLogout('Unable to create your profile. Please try again.');
                    return;
                  }
                }
                
                // Standard flow for existing users
                const profile = await fetchDefaultProfile(confirmedSession.user.id, handleForceLogout);
                setIsReady(profile !== null);
              } catch (err) {
                console.error('Error in auth state change handling:', err);
                handleForceLogout('Error establishing your session. Please try again.');
              }
            }, 500); // Short delay to ensure auth state is settled
          }
        }
      }
    );

    // Check for existing session on initial load
    const checkExistingSession = async () => {
      try {
        console.log('Checking for existing session on initial load');
        
        // Use our waitForSession utility instead of a simple getSession call
        const session = await waitForSession(3, 500);
        
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
          }, 1200);
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
    // After 10 seconds, if we're still loading profile, set to false
    const timeout = setTimeout(() => {
      if (isLoadingProfile) {
        console.warn('Profile loading timed out after 10 seconds - resetting loading state');
        setIsLoadingProfile(false);
        setIsReady(true); // Also mark as ready to prevent UI from being stuck
        
        // If we're supposed to be logged in but profile loading timed out, show error
        if (isLoggedIn && userId) {
          toast.error('Unable to load your profile. You may need to log in again.');
          // Force logout when profile cannot be loaded after timeout
          handleForceLogout('Profile loading timed out. Please log in again.');
        }
      }
    }, 10000);  // Increased timeout to give more time for profile creation
    
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
