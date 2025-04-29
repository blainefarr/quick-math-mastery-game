
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { AuthContextType, AuthProviderProps } from './auth-types';
import { toast } from 'sonner';

// Local storage key for active profile
const ACTIVE_PROFILE_KEY = 'math_game_active_profile';

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [defaultProfileId, setDefaultProfileId] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isReady, setIsReady] = useState(false); // New state for fully initialized auth
  const [profileFetchAttempts, setProfileFetchAttempts] = useState(0);
  const MAX_PROFILE_FETCH_ATTEMPTS = 3;

  // Comprehensive logout function that ensures all session data is cleared
  const handleLogout = async () => {
    try {
      console.log('Logout initiated');
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signOut error:', error);
        throw error;
      }
      
      // Reset all authentication states
      setIsLoggedIn(false);
      setUserId(null);
      setUsername('');
      setDefaultProfileId(null);
      
      // Clear active profile from localStorage
      localStorage.removeItem(ACTIVE_PROFILE_KEY);
      
      // Clear all local storage and session storage related to auth
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      
      // Don't use a full clear as it might affect other app functionality
      // Instead, remove specific auth-related items
      const authItems = ['supabase.auth.token', 'supabase-auth-token'];
      authItems.forEach(item => {
        localStorage.removeItem(item);
        sessionStorage.removeItem(item);
      });

      console.log('Logout completed successfully');
      window.location.href = '/'; // Redirect to home page after logout
    } catch (error) {
      console.error('Error during logout process:', error);
      // Even if error occurs, still reset client-side state
      setIsLoggedIn(false);
      setUserId(null);
      setUsername('');
      setDefaultProfileId(null);
    }
  };

  // Fetch the profile for a user with retry logic
  const fetchDefaultProfile = async (accountId: string) => {
    try {
      setIsLoadingProfile(true);
      console.log('Fetching profile for account ID:', accountId);
      
      // Get a fresh session to ensure RLS policies are properly applied
      const { data: { session: refreshedSession } } = await supabase.auth.getSession();
      if (!refreshedSession?.user) {
        console.log('No valid session found after refreshing');
        setIsLoadingProfile(false);
        setIsReady(true); // Mark as ready even if not authenticated
        return null;
      }

      // First check if we have a stored profile ID in localStorage
      const storedProfileId = localStorage.getItem(ACTIVE_PROFILE_KEY);
      let profile = null;
      
      if (storedProfileId) {
        console.log('Found stored profile ID in localStorage:', storedProfileId);
        
        // Try to get the stored profile
        const { data: storedProfile, error: storedProfileError } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('id', storedProfileId)
          .eq('account_id', accountId)
          .single();
          
        if (!storedProfileError && storedProfile) {
          console.log('Successfully retrieved stored profile:', storedProfile);
          profile = storedProfile;
        } else {
          console.log('Stored profile not found or error, will try to find another profile');
          // If there's an error or no profile found, we'll fall back to getting any profile
          localStorage.removeItem(ACTIVE_PROFILE_KEY);
        }
      }
      
      if (!profile) {
        // Try to get any profile for this account
        const { data: anyProfile, error: anyProfileError } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('account_id', accountId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (anyProfileError) {
          console.error('Error fetching any profile:', anyProfileError);
          
          // Only retry if we haven't exceeded max attempts
          if (profileFetchAttempts < MAX_PROFILE_FETCH_ATTEMPTS) {
            console.log(`Retry attempt ${profileFetchAttempts + 1}/${MAX_PROFILE_FETCH_ATTEMPTS} in 500ms...`);
            setProfileFetchAttempts(prev => prev + 1);
            
            // Retry after a short delay
            setTimeout(() => {
              fetchDefaultProfile(accountId);
            }, 500);
            return null;
          }
          
          setIsLoadingProfile(false);
          setIsReady(true); // Mark as ready even if profile fetch failed
          return null;
        }
        
        if (anyProfile) {
          console.log('Found profile:', anyProfile);
          profile = anyProfile;
          
          // Store the found profile ID in localStorage
          localStorage.setItem(ACTIVE_PROFILE_KEY, anyProfile.id);
        }
      }

      if (profile) {
        setDefaultProfileId(profile.id);
        setUsername(profile.name || 'User');
        setProfileFetchAttempts(0); // Reset attempts count on success
      } else {
        console.log('No profiles found for user');
      }
      
      setIsLoadingProfile(false);
      setIsReady(true); // Mark auth as ready
      return profile;
    } catch (error) {
      console.error('Error in fetchDefaultProfile:', error);
      setIsLoadingProfile(false);
      setIsReady(true); // Mark as ready even if there was an error
      return null;
    }
  };

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
          localStorage.removeItem(ACTIVE_PROFILE_KEY);
          
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

  const value: AuthContextType = {
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
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
