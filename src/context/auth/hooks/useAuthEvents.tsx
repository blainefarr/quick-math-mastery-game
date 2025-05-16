import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchAndSaveAccountProfile } from '../utils/accountProfile';
import { AuthStateType } from '../auth-types';
import { Session } from '@supabase/supabase-js';
import logger from '@/utils/logger';

// This hook handles authentication events and session state
export const useAuthEvents = (authState: AuthStateType) => {
  // Keep track of auth subscription for cleanup
  const authSubscription = useRef<{ subscription: { unsubscribe: () => void } } | null>(null);
  // Track if we're initializing
  const isInitializing = useRef(true);
  // Track session to avoid processing the same session multiple times
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  
  // Set up auth event listeners and retrieve initial session
  useEffect(() => {
    // Track if the component is still mounted
    let isMounted = true;

    // Initialize auth state and event listeners
    const initializeAuth = async () => {
      try {
        logger.debug('Initializing auth events');
        
        // Step 1: Subscribe to auth changes FIRST (important for event order)
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          // Keep all synchronous state updates here at the top
          if (!isMounted) return;
          
          // Log auth events for debugging
          logger.debug(`Auth event: ${event}, user: ${session?.user?.id || 'none'}`);
          
          // Skip if this is the same session we already processed
          if (session?.access_token === currentSession?.access_token) {
            logger.debug('Skipping auth event for already processed session');
            return;
          }
          
          // Update the authentication state with new session
          if (session?.user) {
            // User is logged in
            authState.setUserId(session.user.id);
            authState.setIsLoggedIn(true);
            
            // Save current session to avoid duplicate processing
            setCurrentSession(session);
            
            // Additional user info fetching with setTimeout to avoid auth deadlock
            setTimeout(async () => {
              if (!isMounted) return;
              
              try {
                // Get user profile data if authentication state changed
                const success = await fetchAndSaveAccountProfile(
                  session.user.id,
                  authState,
                  false,
                  false
                );
                
                // Handle failure to fetch profile
                if (!success) {
                  // Increment retry count
                  authState.setRetryAttempts(prev => prev + 1);
                  
                  // If we've retried too many times, show an error or retry
                  if (authState.retryAttempts >= 3) {
                    logger.warn('Failed to fetch profile after multiple attempts');
                  }
                }
              } catch (error) {
                logger.error('Error during profile fetch after auth event:', error);
              }
            }, 0);
            
          } else {
            // User is not logged in
            authState.setUserId(null);
            authState.setIsLoggedIn(false);
            authState.setUsername('');
            authState.setDefaultProfileId(null);
            authState.setRetryAttempts(0);
            setCurrentSession(null);
          }
        });

        // Store subscription for cleanup - fixed to match expected type
        authSubscription.current = {
          subscription: data.subscription
        };
        
        // Step 2: Check initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          logger.debug(`Found existing session for user: ${session.user.id}`);
          
          // Update auth state for existing session
          authState.setUserId(session.user.id);
          authState.setIsLoggedIn(true);
          setCurrentSession(session);
          
          // Get user profile data
          setTimeout(async () => {
            if (!isMounted) return;
            
            try {
              // Fetch profile information
              await fetchAndSaveAccountProfile(session.user.id, authState, false, false);
            } catch (error) {
              logger.error('Error fetching initial profile:', error);
            } finally {
              // Mark initialization as complete
              isInitializing.current = false;
            }
          }, 0);
        } else {
          // No session found
          logger.debug('No active session found');
          authState.setIsLoggedIn(false);
          isInitializing.current = false;
        }
      } catch (error) {
        logger.error('Auth initialization error:', error);
        isInitializing.current = false;
      }
    };

    // Run initialization
    initializeAuth();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      
      // Unsubscribe from auth events
      if (authSubscription.current?.subscription) {
        authSubscription.current.subscription.unsubscribe();
        logger.debug('Unsubscribed from auth events');
      }
    };
  }, []); // Only run on initial mount
};
