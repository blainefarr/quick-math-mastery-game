import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { AuthContextType, AuthProviderProps } from './auth-types';
import { toast } from 'sonner';

// Local storage keys
const ACTIVE_PROFILE_KEY = 'math_game_active_profile';
const PROFILE_NAME_PREFIX = 'profile_name_';
const AUTH_CACHE_EXPIRY = 'auth_cache_expiry';
const AUTH_CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [defaultProfileId, setDefaultProfileId] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileFetchAttempts, setProfileFetchAttempts] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
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
      setAuthError(null);
      
      // Clear all auth-related items from localStorage
      localStorage.removeItem(ACTIVE_PROFILE_KEY);
      localStorage.removeItem(AUTH_CACHE_EXPIRY);
      
      // Clear all profile name cache entries
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(PROFILE_NAME_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear all local storage and session storage related to auth
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      
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
      setAuthError(null);
    }
  };

  // Check if cached auth data is still valid
  const isAuthCacheValid = () => {
    const expiryStr = localStorage.getItem(AUTH_CACHE_EXPIRY);
    if (!expiryStr) return false;
    
    const expiry = parseInt(expiryStr, 10);
    return !isNaN(expiry) && Date.now() < expiry;
  };

  // Update auth cache expiry
  const updateAuthCacheExpiry = () => {
    localStorage.setItem(
      AUTH_CACHE_EXPIRY, 
      (Date.now() + AUTH_CACHE_DURATION_MS).toString()
    );
  };

  // Create a new profile for a user if one doesn't exist
  const createDefaultProfile = async (accountId: string) => {
    try {
      console.log('Creating default profile for account ID:', accountId);
      
      // Generate a profile name (could extract from email or use default)
      const profileName = 'New User';
      
      // Create a new profile
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          account_id: accountId,
          name: profileName,
          is_active: true,
          is_owner: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id, name, is_owner, is_active')
        .single();
        
      if (createError) {
        console.error('Error creating profile:', createError);
        return null;
      }
      
      console.log('Successfully created new profile:', newProfile);
      
      // Store the created profile ID in localStorage
      if (newProfile?.id) {
        localStorage.setItem(ACTIVE_PROFILE_KEY, newProfile.id);
        localStorage.setItem(`${PROFILE_NAME_PREFIX}${newProfile.id}`, newProfile.name || 'User');
      }
      
      return newProfile;
    } catch (error) {
      console.error('Error in createDefaultProfile:', error);
      return null;
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
          .select('id, name, is_owner, is_active')
          .eq('id', storedProfileId)
          .eq('account_id', accountId)
          .single();
          
        if (!storedProfileError && storedProfile) {
          console.log('Successfully retrieved stored profile:', storedProfile);
          profile = storedProfile;
          
          // Set profile information immediately from localStorage
          setDefaultProfileId(storedProfile.id);
          setUsername(storedProfile.name || 'User');
          
          // Cache the profile name for faster loading next time
          localStorage.setItem(`${PROFILE_NAME_PREFIX}${storedProfile.id}`, storedProfile.name || 'User');
        } else {
          console.log('Stored profile not found or error, will try to find another profile');
          // If there's an error or no profile found, we'll fall back to getting any profile
          localStorage.removeItem(ACTIVE_PROFILE_KEY);
        }
      }
      
      if (!profile) {
        // Try to get the owner profile first, or any active profile, or any profile at all
        const { data: anyProfile, error: anyProfileError } = await supabase
          .from('profiles')
          .select('id, name, is_owner, is_active')
          .eq('account_id', accountId)
          .order('is_owner', { ascending: false })  // Owner profiles first
          .order('is_active', { ascending: false }) // Then active profiles
          .order('created_at', { ascending: false }) // Then newest profiles
          .limit(1)
          .single();
          
        if (anyProfileError) {
          console.error('Error fetching any profile:', anyProfileError);
          
          // Check if we got a "no rows returned" error, which likely means no profile exists yet
          if (anyProfileError.message.includes('no rows') || 
              anyProfileError.message.includes('0 rows') ||
              anyProfileError.code === 'PGRST116') {
            
            console.log('No profiles found, attempting to create a default profile');
            
            // Try to create a default profile
            const createdProfile = await createDefaultProfile(accountId);
            if (createdProfile) {
              profile = createdProfile;
              setDefaultProfileId(createdProfile.id);
              setUsername(createdProfile.name || 'User');
            } else {
              // If profile creation failed after retries, show error
              setAuthError('Unable to create a profile. Please try again later.');
            }
          } else if (profileFetchAttempts < MAX_PROFILE_FETCH_ATTEMPTS) {
            // Only retry for other errors if we haven't exceeded max attempts
            console.log(`Retry attempt ${profileFetchAttempts + 1}/${MAX_PROFILE_FETCH_ATTEMPTS} in 500ms...`);
            setProfileFetchAttempts(prev => prev + 1);
            
            // Retry after a short delay
            setTimeout(() => {
              fetchDefaultProfile(accountId);
            }, 500);
            return null;
          } else {
            // If we've exceeded max retries
            setAuthError('Unable to load your profile. Please try logging in again.');
          }
          
          setIsLoadingProfile(false);
          return profile;
        }
        
        if (anyProfile) {
          console.log('Found profile:', anyProfile);
          profile = anyProfile;
          
          // Store the found profile ID in localStorage
          localStorage.setItem(ACTIVE_PROFILE_KEY, anyProfile.id);
          // Cache the profile name
          localStorage.setItem(`${PROFILE_NAME_PREFIX}${anyProfile.id}`, anyProfile.name || 'User');
          
          setDefaultProfileId(anyProfile.id);
          setUsername(anyProfile.name || 'User');
        } else {
          // This case should not happen after our single() call above,
          // but keeping as a fallback
          console.log('No profiles found, attempting to create a default profile');
          const createdProfile = await createDefaultProfile(accountId);
          if (createdProfile) {
            profile = createdProfile;
            setDefaultProfileId(createdProfile.id);
            setUsername(createdProfile.name || 'User');
          }
        }
      }

      if (!profile) {
        console.log('No profiles found for user and unable to create one');
        setAuthError('No profiles found for your account. Please contact support.');
      }
      
      setProfileFetchAttempts(0); // Reset attempts count on success
      setIsLoadingProfile(false);
      updateAuthCacheExpiry(); // Update the cache expiry
      return profile;
    } catch (error) {
      console.error('Error in fetchDefaultProfile:', error);
      setAuthError('Error fetching profile. Please try again.');
      setIsLoadingProfile(false);
      return null;
    }
  };

  useEffect(() => {
    // Mark as loading profile when initializing
    setIsLoadingProfile(true);
    setAuthError(null);
    
    // Handle auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed in AuthProvider:', event);
        
        if (event === 'SIGNED_OUT') {
          setIsLoggedIn(false);
          setUserId(null);
          setUsername('');
          setDefaultProfileId(null);
          setAuthError(null);
          
          // Clear active profile from localStorage on signout
          localStorage.removeItem(ACTIVE_PROFILE_KEY);
          localStorage.removeItem(AUTH_CACHE_EXPIRY);
          
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
            const cachedProfileName = localStorage.getItem(`${PROFILE_NAME_PREFIX}${storedProfileId}`);
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
          if (storedProfileId && isAuthCacheValid()) {
            // Try to get the cached profile name
            const cachedProfileName = localStorage.getItem(`${PROFILE_NAME_PREFIX}${storedProfileId}`);
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
        setAuthError('Error checking your session. Please try logging in again.');
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
    // After 10 seconds, if we're still loading profile, set to false
    const timeout = setTimeout(() => {
      if (isLoadingProfile) {
        console.warn('Profile loading timed out - resetting loading state');
        setIsLoadingProfile(false);
        setAuthError('Profile loading timed out. Please try logging in again.');
      }
    }, 10000);
    
    return () => clearTimeout(timeout);
  }, [isLoadingProfile]);

  const value: AuthContextType = {
    isLoggedIn,
    username,
    userId,
    defaultProfileId,
    isLoadingProfile,
    authError,
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
