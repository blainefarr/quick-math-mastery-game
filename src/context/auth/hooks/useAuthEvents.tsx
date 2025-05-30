
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthStateType } from '../auth-types';
import { fetchAndSaveAccountProfile } from '../utils/accountProfile';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import logger from '@/utils/logger';

// Optimized timing constants
const AUTH_TIMEOUT_MS = 5000; // 5s timeout for auth operations
const MAX_PROFILE_RETRY_ATTEMPTS = 3;
const PROFILE_RETRY_DELAY_MS = 1000;
const INITIAL_FETCH_DELAY_MS = 300;

// Add debounce and deduplication control
let isCurrentlyFetching = false;
let lastFetchedUserId: string | null = null;
let fetchTimeout: NodeJS.Timeout | null = null;

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

  // Helper function to debounce profile fetching
  const debounceFetchProfile = (user_id: string) => {
    if (fetchTimeout) {
      clearTimeout(fetchTimeout);
    }
    
    // Don't fetch if already fetching same user
    if (isCurrentlyFetching && lastFetchedUserId === user_id) {
      logger.auth.debug('Skipping duplicate profile fetch for user', user_id);
      return;
    }
    
    fetchTimeout = setTimeout(async () => {
      if (isCurrentlyFetching) {
        logger.auth.debug('Another fetch already in progress, skipping');
        return;
      }
      
      logger.auth.debug('Fetching profile for user', user_id);
      isCurrentlyFetching = true;
      lastFetchedUserId = user_id;
      
      try {
        await fetchAndSaveAccountProfile(user_id, authState);
      } catch (error) {
        logger.error('Error fetching profile:', error);
      } finally {
        isCurrentlyFetching = false;
        fetchTimeout = null;
      }
    }, INITIAL_FETCH_DELAY_MS);
  };

  // Retry profile fetch for new signups - optimized
  useEffect(() => {
    if (isNewSignup && userId && retryAttempts < MAX_PROFILE_RETRY_ATTEMPTS) {
      const timer = setTimeout(async () => {
        logger.auth.info(`Profile retry attempt ${retryAttempts + 1}/${MAX_PROFILE_RETRY_ATTEMPTS} for new signup...`);
        
        // Prevent duplicate fetches
        if (isCurrentlyFetching) return;
        isCurrentlyFetching = true;
        
        try {
          // Use the enhanced function to fetch account and profile
          const success = await fetchAndSaveAccountProfile(userId, authState);
          
          if (success) {
            logger.auth.info('Successfully retrieved profile after retry!');
            setRetryAttempts(0);
            setIsNewSignup(false);
          } else {
            setRetryAttempts(prev => prev + 1);
            if (retryAttempts + 1 >= MAX_PROFILE_RETRY_ATTEMPTS) {
              logger.error('Failed to retrieve profile after maximum retries');
              toast.error('Failed to load profile. Please try refreshing the page.');
              setIsNewSignup(false);
              setRetryAttempts(0);
            }
          }
        } catch (error) {
          logger.error('Error during profile retry:', error);
        } finally {
          isCurrentlyFetching = false;
        }
      }, PROFILE_RETRY_DELAY_MS * (retryAttempts + 1)); // Increase delay with each retry
      
      return () => clearTimeout(timer);
    }
  }, [isNewSignup, userId, retryAttempts]);

  // Auth initialization and event handling - optimized
  useEffect(() => {
    logger.auth.debug('Initializing auth event listener');
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
          logger.warn('Auth operation timed out - resetting loading state');
          setIsLoadingProfile(false);
        }
      }, AUTH_TIMEOUT_MS);
    };
    
    // Start initial timeout
    startAuthTimeout();
    
    // Handle auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        logger.auth.debug('Auth state changed:', event, session?.user?.id || 'no-user');
        
        // Reset timeout whenever auth state changes
        startAuthTimeout();

        // Handle PASSWORD_RECOVERY event
        if (event === 'PASSWORD_RECOVERY') {
          logger.auth.info('PASSWORD_RECOVERY event detected in auth context');
          // Navigate to reset password page
          navigate('/reset-password');
          return;
        }
        
        if (event === 'SIGNED_OUT') {
          logger.auth.info('User signed out');
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
            logger.auth.debug('User authenticated with event:', event, 'user:', session.user.id);
            setIsLoggedIn(true);
            setUserId(session.user.id);
            
            // Debounce the fetch to avoid duplicate calls
            debounceFetchProfile(session.user.id);
          } else {
            logger.auth.debug('No user in session after auth event:', event);
            setIsLoadingProfile(false);
            
            // Clear timeout as we're done loading
            if (authTimeoutId) clearTimeout(authTimeoutId);
          }
        }
        // Skip INITIAL_SESSION handling in the auth event listener as we handle it separately
        else if (['SIGNED_UP'].includes(event)) {
          if (session?.user) {
            logger.auth.info('New user signup detected! Setting up retry mechanism...');
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
        logger.auth.debug('Checking for existing session');
        const { data: { session } } = await supabase.auth.getSession();
        
        initialSessionChecked = true;
        
        if (session?.user) {
          logger.auth.debug('Existing session found, user:', session.user.id);
          setIsLoggedIn(true);
          setUserId(session.user.id);
          
          // Debounce the fetch to avoid duplicate calls
          debounceFetchProfile(session.user.id);
        } else {
          logger.auth.debug('No existing session found');
          setIsLoggedIn(false);
          setUserId(null);
          setUsername('');
          setDefaultProfileId(null);
          setIsLoadingProfile(false);
          
          // Clear timeout as we're done loading
          if (authTimeoutId) clearTimeout(authTimeoutId);
        }
      } catch (error) {
        logger.error('Error checking session:', error);
        setIsLoadingProfile(false);
        
        // Clear timeout as we're done loading
        if (authTimeoutId) clearTimeout(authTimeoutId);
      }
    };
    
    checkExistingSession();

    return () => {
      subscription.unsubscribe();
      if (authTimeoutId) clearTimeout(authTimeoutId);
      if (fetchTimeout) clearTimeout(fetchTimeout);
      logger.auth.debug('Auth event listener cleaned up');
    };
  }, []);
};
