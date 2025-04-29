
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
      console.log('Fetching profile for account ID:', accountId);
      
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
          
          // Set profile information immediately from localStorage
          setDefaultProfileId(storedProfile.id);
          setUsername(storedProfile.name || 'User');
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
          return null;
        }
        
        if (anyProfile) {
          console.log('Found profile:', anyProfile);
          profile = anyProfile;
          
          // Store the found profile ID in localStorage
          localStorage.setItem(ACTIVE_PROFILE_KEY, anyProfile.id);
          
          setDefaultProfileId(anyProfile.id);
          setUsername(anyProfile.name || 'User');
        }
      }

      if (!profile) {
        console.log('No profiles found for user');
      }
      
      setProfileFetchAttempts(0); // Reset attempts count on success
      setIsLoadingProfile(false);
      return profile;
    } catch (error) {
      console.error('Error in fetchDefaultProfile:', error);
      setIsLoadingProfile(false);
      return null;
    }
  };

  useEffect(() => {
    // Mark as loading profile when initializing
    setIsLoadingProfile(true);
    
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
          return;
        }
        
        if (session?.user) {
          // Immediately set login state to improve perceived performance
          setIsLoggedIn(true);
          setUserId(session.user.id);
          
          // Check for cached profile ID in localStorage to show username immediately
          const storedProfileId = localStorage.getItem(ACTIVE_PROFILE_KEY);
          if (storedProfileId) {
            // Try to get the cached profile name from localStorage
            const cachedProfileName = localStorage.getItem(`profile_name_${storedProfileId}`);
            if (cachedProfileName) {
              setUsername(cachedProfileName);
              setDefaultProfileId(storedProfileId);
              // We still need to fetch the profile to verify it's valid
            }
          }
          
          // Fetch the profile in parallel with session initialization
          fetchDefaultProfile(session.user.id);
        } else {
          // If no session, mark profile as not loading
          setIsLoadingProfile(false);
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
          
          // Check for cached profile in localStorage
          const storedProfileId = localStorage.getItem(ACTIVE_PROFILE_KEY);
          if (storedProfileId) {
            // Try to get the cached profile name
            const cachedProfileName = localStorage.getItem(`profile_name_${storedProfileId}`);
            if (cachedProfileName) {
              setUsername(cachedProfileName);
              setDefaultProfileId(storedProfileId);
              // We'll still verify the profile
            }
          }
          
          // Fetch or verify the profile
          fetchDefaultProfile(session.user.id);
        } else {
          console.log('No existing session found');
          // Ensure we're truly logged out and not loading profile
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
    };
  }, []);

  // Extra safeguard - if profile loading state gets stuck somehow
  useEffect(() => {
    // After 3 seconds, if we're still loading profile, set to false
    const timeout = setTimeout(() => {
      if (isLoadingProfile) {
        console.warn('Profile loading timed out - resetting loading state');
        setIsLoadingProfile(false);
      }
    }, 3000); // Reduced from 5 seconds to 3 seconds for better UX
    
    return () => clearTimeout(timeout);
  }, [isLoadingProfile]);

  const value: AuthContextType = {
    isLoggedIn,
    username,
    userId,
    defaultProfileId,
    isLoadingProfile,
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
