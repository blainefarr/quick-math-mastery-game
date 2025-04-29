
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { AuthProviderProps } from './auth-types';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { useSessionManagement } from '@/hooks/useSessionManagement';
import { toast } from 'sonner';
import { waitForSession } from '@/hooks/useAuthUtils';

// Define the AuthChangeEvent type to include "SIGNED_UP"
type AuthChangeEvent = 
  | 'INITIAL_SESSION'
  | 'PASSWORD_RECOVERY'
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'MFA_CHALLENGE_VERIFIED'
  | 'SIGNED_UP'; // Add SIGNED_UP to fix TypeScript error

const AuthProvider = ({ children }: AuthProviderProps) => {
  // Use our custom hooks
  const {
    defaultProfileId,
    username,
    isLoadingProfile,
    shouldShowProfileSelector,
    setDefaultProfileId,
    setUsername,
    setIsLoadingProfile,
    setShouldShowProfileSelector,
    fetchDefaultProfile,
    clearProfileData,
  } = useProfileManagement();

  const {
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
  } = useSessionManagement();

  // Main authentication state handler
  useEffect(() => {
    console.log('AuthProvider initializing...');
    // Mark as not ready and loading profile when initializing
    setIsLoadingProfile(true);
    setIsReady(false);
    
    // Handle auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        console.log('Auth state changed:', event);
        
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
          console.log('User authenticated:', session.user.id);
          setIsLoggedIn(true);
          setUserId(session.user.id);
          
          // We need to handle the profile initialization separately 
          // to avoid blocking the auth state listener
          setTimeout(async () => {
            try {
              // Ensure the session is fully established
              const confirmedSession = await waitForSession(5, 800);
              
              if (!confirmedSession) {
                console.error('Failed to get confirmed session');
                handleForceLogout('Unable to establish your session. Please try again.');
                return;
              }
              
              // New users need special handling - give DB triggers time to complete
              if (event === 'SIGNED_UP') {
                console.log('New user signup detected, giving extra time for profile creation');
                // Extra wait for database triggers to complete for new signups
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
              
              // Get or create profile with retry mechanism
              const profile = await fetchDefaultProfile(confirmedSession.user.id, handleForceLogout);
              
              // Only set isReady to true if we have a valid profile
              setIsReady(profile !== null);
              
              if (profile) {
                console.log('Authentication flow completed successfully');
                
                // Show welcome message for new sign-ups
                if (event === 'SIGNED_IN' || event === 'SIGNED_UP') {
                  const isReturningUser = localStorage.getItem('returning_user');
                  if (!isReturningUser) {
                    localStorage.setItem('returning_user', 'true');
                    toast.success('Welcome! Your profile is ready.');
                  }
                }
              } else {
                console.error('Failed to load or create user profile');
                // The fetchDefaultProfile function already handles force logout if needed
              }
            } catch (err) {
              console.error('Error in auth state change handling:', err);
              handleForceLogout('Error establishing your session. Please try again.');
            } finally {
              setIsLoadingProfile(false);
            }
          }, 500);
        } else {
          // No valid session in this auth event
          console.log('No valid session in auth state change event');
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
            // Use the retry mechanism built into fetchDefaultProfile
            const profile = await fetchDefaultProfile(session.user.id, handleForceLogout);
            setIsReady(profile !== null);
            setIsLoadingProfile(false);
          }, 800);
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

  // Backup timeout for stuck loading states
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoadingProfile) {
        console.warn('Profile loading timed out after 10 seconds - resetting loading state');
        setIsLoadingProfile(false);
        setIsReady(true);
        
        // Force logout if stuck in loading state
        if (isLoggedIn && userId) {
          handleForceLogout('Profile loading timed out. Please log in again.');
        }
      }
    }, 10000);
    
    return () => clearTimeout(timeout);
  }, [isLoadingProfile, isLoggedIn, userId]);

  const authContextValue = {
    isLoggedIn,
    username,
    userId,
    defaultProfileId,
    isLoadingProfile,
    isReady,
    authError,
    shouldShowProfileSelector,
    setIsLoggedIn,
    setUsername, 
    setDefaultProfileId,
    setShouldShowProfileSelector,
    handleLogout,
    resetAuthError,
    isAuthenticated: isLoggedIn && !!defaultProfileId
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
