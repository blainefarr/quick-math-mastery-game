
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthStateType } from '../auth-types';
import { fetchUserProfiles } from '../utils/profileUtils';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

const AUTH_TIMEOUT_MS = 5000; // 5 seconds timeout for auth operations

export const useAuthEvents = (authState: AuthStateType) => {
  const { 
    userId,
    isNewSignup,
    retryAttempts,
    setIsLoggedIn,
    setUserId,
    setUsername,
    setDefaultProfileId,
    setHasMultipleProfiles,
    setIsLoadingProfile,
    setIsNewSignup,
    setRetryAttempts
  } = authState;

  // Retry profile fetch for new signups
  useEffect(() => {
    const MAX_RETRIES = 4;
    const RETRY_DELAY = 500;
    
    if (isNewSignup && userId && retryAttempts < MAX_RETRIES) {
      const timer = setTimeout(async () => {
        console.log(`Profile retry attempt ${retryAttempts + 1}/${MAX_RETRIES} for new signup...`);
        const success = await fetchUserProfiles(userId, authState, true);
        
        if (success) {
          console.log('Successfully retrieved profile after retry!');
          setRetryAttempts(0);
          setIsNewSignup(false);
        } else {
          setRetryAttempts(prev => prev + 1);
          if (retryAttempts + 1 >= MAX_RETRIES) {
            console.error('Failed to retrieve profile after maximum retries');
            toast.error('Failed to load profile. Please try refreshing the page.');
            setIsNewSignup(false);
            setRetryAttempts(0);
          }
        }
      }, RETRY_DELAY);
      
      return () => clearTimeout(timer);
    }
  }, [isNewSignup, userId, retryAttempts]);

  // Auth initialization and event handling
  useEffect(() => {
    // Mark as loading profile when initializing
    setIsLoadingProfile(true);
    
    // Set up auth timeout to prevent infinite loading state
    const authTimeout = setTimeout(() => {
      if (authState.isLoadingProfile) {
        console.warn('Auth operation timed out - resetting loading state');
        setIsLoadingProfile(false);
      }
    }, AUTH_TIMEOUT_MS);
    
    // Handle auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.id || 'no-user');
        
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setIsLoggedIn(false);
          setUserId(null);
          setUsername('');
          setDefaultProfileId(null);
          setHasMultipleProfiles(false);
          localStorage.removeItem('math_game_active_profile');
          setIsLoadingProfile(false);
          return;
        }
        
        // Handle all sign-in related events
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || 
            event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
          if (session?.user) {
            console.log('User authenticated:', session.user.id);
            setIsLoggedIn(true);
            setUserId(session.user.id);
            
            // For regular sign-ins, fetch user profiles with a slight delay to allow triggers to complete
            setTimeout(() => {
              fetchUserProfiles(session.user.id, authState);
            }, 300);
          } else {
            console.log('No user in session after auth event:', event);
            setIsLoadingProfile(false);
          }
        }
        // Fix: Using type-safe array inclusion check for SIGNED_UP event
        else if (['SIGNED_UP'].includes(event as string)) {
          if (session?.user) {
            console.log('New user signup detected! Setting up retry mechanism...');
            setIsLoggedIn(true);
            setUserId(session.user.id);
            setIsNewSignup(true);
            setRetryAttempts(0);
            // For new signups, we'll let the retry effect handle profile fetching
          }
        }
      }
    );

    // Check for existing session on initial load
    const checkExistingSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('Existing session found, user:', session.user.id);
          setIsLoggedIn(true);
          setUserId(session.user.id);
          
          // Fetch user profiles with a slight delay
          setTimeout(() => {
            fetchUserProfiles(session.user.id, authState);
          }, 300);
        } else {
          console.log('No existing session found');
          setIsLoggedIn(false);
          setUserId(null);
          setUsername('');
          setDefaultProfileId(null);
          setIsLoadingProfile(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsLoadingProfile(false);
      }
    };
    
    checkExistingSession();

    return () => {
      subscription.unsubscribe();
      clearTimeout(authTimeout);
    };
  }, []);
};
