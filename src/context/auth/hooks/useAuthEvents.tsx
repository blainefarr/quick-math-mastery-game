
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthStateType } from '../auth-types';
import { fetchAndSaveAccountProfile } from '../utils/accountProfile';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Optimized timing constants
const AUTH_TIMEOUT_MS = 5000; // 5s timeout for auth operations
const MAX_PROFILE_RETRY_ATTEMPTS = 3;
const PROFILE_RETRY_DELAY_MS = 1000;
const INITIAL_FETCH_DELAY_MS = 300;
const AUTH_REFRESH_DEBOUNCE_MS = 30000; // 30s debounce for refresh operations

// Add debounce control
let isCurrentlyFetching = false;

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

  const navigate = useNavigate();
  
  // Tracking refs for tab visibility and last refresh time
  const isDocumentVisibleRef = useRef(true);
  const lastAuthRefreshTimeRef = useRef<number>(0);

  // Retry profile fetch for new signups - optimized
  useEffect(() => {
    if (isNewSignup && userId && retryAttempts < MAX_PROFILE_RETRY_ATTEMPTS) {
      const timer = setTimeout(async () => {
        console.log(`Profile retry attempt ${retryAttempts + 1}/${MAX_PROFILE_RETRY_ATTEMPTS} for new signup...`);
        
        // Prevent duplicate fetches
        if (isCurrentlyFetching) return;
        isCurrentlyFetching = true;
        
        try {
          // Use the enhanced function to fetch account and profile
          const success = await fetchAndSaveAccountProfile(userId, authState);
          
          if (success) {
            console.log('Successfully retrieved profile after retry!');
            setRetryAttempts(0);
            setIsNewSignup(false);
          } else {
            setRetryAttempts(prev => prev + 1);
            if (retryAttempts + 1 >= MAX_PROFILE_RETRY_ATTEMPTS) {
              console.error('Failed to retrieve profile after maximum retries');
              toast.error('Failed to load profile. Please try refreshing the page.');
              setIsNewSignup(false);
              setRetryAttempts(0);
            }
          }
        } finally {
          isCurrentlyFetching = false;
        }
      }, PROFILE_RETRY_DELAY_MS * (retryAttempts + 1)); // Increase delay with each retry
      
      return () => clearTimeout(timer);
    }
  }, [isNewSignup, userId, retryAttempts]);

  // Track document visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      isDocumentVisibleRef.current = document.visibilityState === 'visible';
      
      // When tab becomes visible, check if we should refresh auth
      // but only if it's been a significant time since last refresh
      if (isDocumentVisibleRef.current) {
        const currentTime = Date.now();
        if (currentTime - lastAuthRefreshTimeRef.current > AUTH_REFRESH_DEBOUNCE_MS) {
          console.log('Tab became visible, debounced auth refresh will occur');
          // We don't refresh immediately, but let the regular auth check handle it
          lastAuthRefreshTimeRef.current = currentTime;
        } else {
          console.log('Tab became visible, but auth refresh debounced');
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Auth initialization and event handling - optimized
  useEffect(() => {
    console.log('Initializing auth event listener');
    let authTimeoutId: NodeJS.Timeout | null = null;
    let initialSessionChecked = false;
    
    // Mark as loading profile when initializing
    setIsLoadingProfile(true);
    
    // Set up auth timeout to prevent infinite loading state
    const startAuthTimeout = () => {
      // Clear any existing timeout
      if (authTimeoutId) clearTimeout(authTimeoutId);
      
      // Set a new timeout
      authTimeoutId = setTimeout(() => {
        if (authState.isLoadingProfile) {
          console.warn('Auth operation timed out - resetting loading state');
          setIsLoadingProfile(false);
        }
      }, AUTH_TIMEOUT_MS);
    };
    
    // Start initial timeout
    startAuthTimeout();
    
    // Handle auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.id || 'no-user');
        
        // Reset timeout whenever auth state changes
        startAuthTimeout();

        // Handle PASSWORD_RECOVERY event
        if (event === 'PASSWORD_RECOVERY') {
          console.log('PASSWORD_RECOVERY event detected in auth context');
          // Navigate to reset password page
          navigate('/reset-password');
          return;
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setIsLoggedIn(false);
          setUserId(null);
          setUsername('');
          setDefaultProfileId(null);
          setHasMultipleProfiles(false);
          localStorage.removeItem('math_game_active_profile');
          setIsLoadingProfile(false);
          
          // Clear timeout as we're done loading
          if (authTimeoutId) clearTimeout(authTimeoutId);
          return;
        }
        
        // Handle all sign-in related events
        if (['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
          if (session?.user) {
            console.log('User authenticated with event:', event, 'user:', session.user.id);
            setIsLoggedIn(true);
            setUserId(session.user.id);
            
            // For TOKEN_REFRESHED, don't fetch profile again if we already have it
            // This helps prevent unnecessary profile fetches when tabs regain focus
            if (event === 'TOKEN_REFRESHED' && authState.defaultProfileId) {
              console.log('Token refreshed but profile already loaded, skipping profile fetch');
              setIsLoadingProfile(false);
              return;
            }
            
            // Prevent duplicate fetches
            if (isCurrentlyFetching) return;
            isCurrentlyFetching = true;
            
            try {
              // For regular sign-ins, fetch account and profile with minimal delay
              setTimeout(async () => {
                console.log('Now fetching account and profile data after auth event');
                await fetchAndSaveAccountProfile(session.user.id, authState);
              }, INITIAL_FETCH_DELAY_MS);
            } finally {
              setTimeout(() => { isCurrentlyFetching = false; }, 1000);
            }
          } else {
            console.log('No user in session after auth event:', event);
            setIsLoadingProfile(false);
            
            // Clear timeout as we're done loading
            if (authTimeoutId) clearTimeout(authTimeoutId);
          }
        }
        // Skip INITIAL_SESSION handling in the auth event listener as we handle it separately
        else if (['SIGNED_UP'].includes(event)) {
          if (session?.user) {
            console.log('New user signup detected! Setting up retry mechanism...');
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

    // Check for existing session on initial load - optimized
    const checkExistingSession = async () => {
      try {
        console.log('Checking for existing session');
        const { data: { session } } = await supabase.auth.getSession();
        
        initialSessionChecked = true;
        lastAuthRefreshTimeRef.current = Date.now();
        
        if (session?.user) {
          console.log('Existing session found, user:', session.user.id);
          setIsLoggedIn(true);
          setUserId(session.user.id);
          
          // Prevent duplicate fetches
          if (isCurrentlyFetching) return;
          isCurrentlyFetching = true;
          
          try {
            // Fetch account and profile with minimal delay
            setTimeout(async () => {
              console.log('Now fetching account and profile data for existing session');
              const success = await fetchAndSaveAccountProfile(session.user.id, authState);
              
              // Clear loading state after fetch completes
              if (!success) {
                setIsLoadingProfile(false);
                if (authTimeoutId) clearTimeout(authTimeoutId);
              }
            }, INITIAL_FETCH_DELAY_MS);
          } finally {
            setTimeout(() => { isCurrentlyFetching = false; }, 1000);
          }
        } else {
          console.log('No existing session found');
          setIsLoggedIn(false);
          setUserId(null);
          setUsername('');
          setDefaultProfileId(null);
          setIsLoadingProfile(false);
          
          // Clear timeout as we're done loading
          if (authTimeoutId) clearTimeout(authTimeoutId);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsLoadingProfile(false);
        
        // Clear timeout as we're done loading
        if (authTimeoutId) clearTimeout(authTimeoutId);
      }
    };
    
    checkExistingSession();

    return () => {
      subscription.unsubscribe();
      if (authTimeoutId) clearTimeout(authTimeoutId);
      console.log('Auth event listener cleaned up');
    };
  }, []);
};
