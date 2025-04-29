
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthStateType } from '../auth-types';
import { fetchUserProfiles } from '../utils/profileUtils';
import { fetchAndSaveAccountProfile } from '../utils/authActions';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

const AUTH_TIMEOUT_MS = 10000; // Increased from 5000 to 10000 - 10 seconds timeout for auth operations
const MAX_PROFILE_RETRY_ATTEMPTS = 5;
const PROFILE_RETRY_DELAY_MS = 1500; // Increased delay between retries to 1.5s
const INITIAL_FETCH_DELAY_MS = 1000; // Initial delay before fetching

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
    if (isNewSignup && userId && retryAttempts < MAX_PROFILE_RETRY_ATTEMPTS) {
      console.log(`useAuthEvents: Profile retry effect triggered, attempt ${retryAttempts + 1}/${MAX_PROFILE_RETRY_ATTEMPTS} for new signup...`);
      
      const timer = setTimeout(async () => {
        console.log(`Profile retry attempt ${retryAttempts + 1}/${MAX_PROFILE_RETRY_ATTEMPTS} for new signup...`);
        
        // Check auth session before retry
        const { data: sessionData } = await supabase.auth.getSession();
        console.log(`Auth session before profile retry attempt ${retryAttempts + 1}:`, {
          hasSession: !!sessionData.session,
          sessionUserId: sessionData.session?.user?.id,
          accessToken: sessionData.session?.access_token ? '✓ Present' : '❌ Missing'
        });
        
        // Use the enhanced function to fetch account and profile
        const success = await fetchAndSaveAccountProfile(userId, authState);
        
        if (success) {
          console.log('useAuthEvents: Successfully retrieved profile after retry!');
          setRetryAttempts(0);
          setIsNewSignup(false);
        } else {
          console.log(`useAuthEvents: Profile retry attempt ${retryAttempts + 1} failed, will ${retryAttempts + 1 >= MAX_PROFILE_RETRY_ATTEMPTS ? 'stop' : 'retry again'}`);
          setRetryAttempts(prev => prev + 1);
          if (retryAttempts + 1 >= MAX_PROFILE_RETRY_ATTEMPTS) {
            console.error('useAuthEvents: Failed to retrieve profile after maximum retries');
            toast.error('Failed to load profile. Please try refreshing the page.');
            setIsNewSignup(false);
            setRetryAttempts(0);
          }
        }
      }, PROFILE_RETRY_DELAY_MS * (retryAttempts + 1)); // Increase delay with each retry
      
      return () => clearTimeout(timer);
    }
  }, [isNewSignup, userId, retryAttempts]);

  // Auth initialization and event handling
  useEffect(() => {
    console.log('useAuthEvents: Initializing auth event listener');
    // Mark as loading profile when initializing
    setIsLoadingProfile(true);
    
    // Set up auth timeout to prevent infinite loading state
    const authTimeout = setTimeout(() => {
      if (authState.isLoadingProfile) {
        console.warn('useAuthEvents: Auth operation timed out - resetting loading state');
        setIsLoadingProfile(false);
      }
    }, AUTH_TIMEOUT_MS);
    
    // Handle auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('useAuthEvents: Auth state changed:', event, session?.user?.id || 'no-user');
        
        if (event === 'SIGNED_OUT') {
          console.log('useAuthEvents: User signed out');
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
        if (['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED', 'INITIAL_SESSION'].includes(event)) {
          if (session?.user) {
            console.log('useAuthEvents: User authenticated with event:', event, 'user:', session.user.id);
            setIsLoggedIn(true);
            setUserId(session.user.id);
            
            // For regular sign-ins, fetch account and profile with appropriate delay
            setTimeout(async () => {
              console.log(`useAuthEvents: Waiting ${INITIAL_FETCH_DELAY_MS}ms before fetching account/profile data`);
              
              // Check auth session before fetching
              const { data: sessionData } = await supabase.auth.getSession();
              console.log('Auth session before account/profile fetch:', {
                hasSession: !!sessionData.session,
                sessionUserId: sessionData.session?.user?.id,
                accessToken: sessionData.session?.access_token ? '✓ Present' : '❌ Missing'
              });
              
              // Add initial delay before fetching account and profile
              await new Promise(resolve => setTimeout(resolve, INITIAL_FETCH_DELAY_MS));
              
              console.log('useAuthEvents: Now fetching account and profile data after auth event');
              await fetchAndSaveAccountProfile(session.user.id, authState);
            }, 100); // Start the delay process quickly
          } else {
            console.log('useAuthEvents: No user in session after auth event:', event);
            setIsLoadingProfile(false);
          }
        }
        // Handle signup events
        else if (['SIGNED_UP'].includes(event)) {
          if (session?.user) {
            console.log('useAuthEvents: New user signup detected! Setting up retry mechanism...');
            setIsLoggedIn(true);
            setUserId(session.user.id);
            setIsNewSignup(true);
            setRetryAttempts(0);
            // For new signups, we'll let the retry effect handle profile fetching
            toast.success('Account created! Setting up your profile...');
          }
        }
      }
    );

    // Check for existing session on initial load
    const checkExistingSession = async () => {
      try {
        console.log('useAuthEvents: Checking for existing session');
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log('useAuthEvents: Initial session check result:', {
          hasSession: !!session,
          sessionUserId: session?.user?.id || 'none',
          accessToken: session?.access_token ? '✓ Present' : '❌ Missing'
        });
        
        if (session?.user) {
          console.log('useAuthEvents: Existing session found, user:', session.user.id);
          setIsLoggedIn(true);
          setUserId(session.user.id);
          
          // Fetch account and profile with appropriate delay
          setTimeout(async () => {
            console.log(`useAuthEvents: Waiting ${INITIAL_FETCH_DELAY_MS}ms before fetching account/profile data for existing session`);
            
            // Add initial delay before fetching
            await new Promise(resolve => setTimeout(resolve, INITIAL_FETCH_DELAY_MS));
            
            console.log('useAuthEvents: Now fetching account and profile data for existing session');
            await fetchAndSaveAccountProfile(session.user.id, authState);
          }, 100); // Start the delay process quickly
        } else {
          console.log('useAuthEvents: No existing session found');
          setIsLoggedIn(false);
          setUserId(null);
          setUsername('');
          setDefaultProfileId(null);
          setIsLoadingProfile(false);
        }
      } catch (error) {
        console.error('useAuthEvents: Error checking session:', error);
        setIsLoadingProfile(false);
      }
    };
    
    checkExistingSession();

    return () => {
      subscription.unsubscribe();
      clearTimeout(authTimeout);
      console.log('useAuthEvents: Auth event listener cleaned up');
    };
  }, []);
};
