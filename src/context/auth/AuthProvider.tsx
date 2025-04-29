
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { AuthContextType, AuthProviderProps } from './auth-types';
import { toast } from 'sonner';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

// Local storage key for active profile
const ACTIVE_PROFILE_KEY = 'math_game_active_profile';
const AUTH_TIMEOUT_MS = 5000; // 5 seconds timeout for auth operations

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [defaultProfileId, setDefaultProfileId] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [hasMultipleProfiles, setHasMultipleProfiles] = useState(false);
  const [isNewSignup, setIsNewSignup] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);

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
      setHasMultipleProfiles(false);
      
      // Clear active profile from localStorage
      localStorage.removeItem(ACTIVE_PROFILE_KEY);
      
      console.log('Logout completed successfully');
      window.location.href = '/'; // Redirect to home page after logout
    } catch (error) {
      console.error('Error during logout process:', error);
      // Even if error occurs, still reset client-side state
      setIsLoggedIn(false);
      setUserId(null);
      setUsername('');
      setDefaultProfileId(null);
      setHasMultipleProfiles(false);
    }
  };

  // Function to fetch profile(s) for the current user with retry mechanism
  const fetchUserProfiles = async (accountId: string, isRetry = false): Promise<boolean> => {
    try {
      if (isRetry) {
        console.log(`Retry attempt ${retryAttempts + 1} to fetch profiles for account ID:`, accountId);
      } else {
        console.log('Fetching profiles for account ID:', accountId);
        setIsLoadingProfile(true);
      }
      
      // Get all profiles for this account
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, is_active, is_owner, grade')
        .eq('account_id', accountId)
        .order('created_at', { ascending: false });
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        
        if (!isRetry) {
          toast.error('Failed to load user profiles');
        }
        
        return false;
      }
      
      console.log('Fetched profiles:', profiles);
      
      if (!profiles || profiles.length === 0) {
        console.warn('No profiles found for account:', accountId);
        
        if (!isRetry) {
          // Only show error if this is not a retry attempt
          toast.error('No profiles found for your account');
        }
        
        return false;
      }
      
      // Check if there are multiple profiles
      setHasMultipleProfiles(profiles.length > 1);
      
      // Get the stored profile ID from localStorage
      const storedProfileId = localStorage.getItem(ACTIVE_PROFILE_KEY);
      let selectedProfile = null;
      
      // If there's a stored profile ID, check if it's in the fetched profiles
      if (storedProfileId) {
        selectedProfile = profiles.find(p => p.id === storedProfileId);
        console.log('Found stored profile:', selectedProfile);
      }
      
      // If no stored profile or stored profile not found, auto-select profile
      if (!selectedProfile) {
        // If only one profile exists, use it automatically
        if (profiles.length === 1) {
          selectedProfile = profiles[0];
          console.log('Auto-selecting only profile:', selectedProfile);
        } else {
          // Otherwise try to get the owner profile
          selectedProfile = profiles.find(p => p.is_owner === true);
          console.log('Selecting owner profile:', selectedProfile);
          
          // If no owner profile, use the first one
          if (!selectedProfile) {
            selectedProfile = profiles[0];
            console.log('Falling back to first profile:', selectedProfile);
          }
        }
        
        // Store the selected profile ID in localStorage
        if (selectedProfile) {
          localStorage.setItem(ACTIVE_PROFILE_KEY, selectedProfile.id);
        }
      }
      
      if (selectedProfile) {
        setDefaultProfileId(selectedProfile.id);
        setUsername(selectedProfile.name);
        console.log('Profile selected:', selectedProfile.id, selectedProfile.name);
        
        // If this was a retry after signup, show success message
        if (isNewSignup && isRetry) {
          toast.success('Account created successfully!');
          setIsNewSignup(false);
        }
        
        setIsLoadingProfile(false);
        return true;
      } else {
        console.error('Failed to select a valid profile');
        if (!isRetry) {
          toast.error('Could not find a valid profile');
        }
        return false;
      }
    } catch (error) {
      console.error('Error fetching user profiles:', error);
      if (!isRetry) {
        toast.error('Error loading user data');
      }
      return false;
    } finally {
      if (!isRetry) {
        setIsLoadingProfile(false);
      }
    }
  };

  // Retry profile fetch for new signups
  useEffect(() => {
    const MAX_RETRIES = 4;
    const RETRY_DELAY = 500;
    
    if (isNewSignup && userId && retryAttempts < MAX_RETRIES) {
      const timer = setTimeout(async () => {
        console.log(`Profile retry attempt ${retryAttempts + 1}/${MAX_RETRIES} for new signup...`);
        const success = await fetchUserProfiles(userId, true);
        
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

  // Function to manually refresh the user profile
  const refreshUserProfile = async (): Promise<void> => {
    if (!userId) {
      console.warn('Cannot refresh profile: No user ID available');
      return;
    }
    console.log('Manually refreshing user profile for:', userId);
    await fetchUserProfiles(userId);
  };

  useEffect(() => {
    // Mark as loading profile when initializing
    setIsLoadingProfile(true);
    
    // Set up auth timeout to prevent infinite loading state
    const authTimeout = setTimeout(() => {
      if (isLoadingProfile) {
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
          localStorage.removeItem(ACTIVE_PROFILE_KEY);
          setIsLoadingProfile(false);
          return;
        }
        
        // Handle all sign-in related events including SIGNED_UP
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || 
            event === 'USER_UPDATED' || event === 'INITIAL_SESSION' ||
            event === 'SIGNED_UP') {
            
          if (session?.user) {
            console.log('User authenticated:', session.user.id);
            setIsLoggedIn(true);
            setUserId(session.user.id);
            
            // Check if this is a brand new signup
            if (event === 'SIGNED_UP') {
              console.log('New user signup detected! Setting up retry mechanism...');
              setIsNewSignup(true);
              setRetryAttempts(0);
              // For new signups, we'll let the retry effect handle profile fetching
            } else {
              // For regular sign-ins, fetch user profiles with a slight delay to allow triggers to complete
              setTimeout(() => {
                fetchUserProfiles(session.user.id);
              }, 300);
            }
          } else {
            console.log('No user in session after auth event:', event);
            setIsLoadingProfile(false);
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
            fetchUserProfiles(session.user.id);
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

  const value: AuthContextType = {
    isLoggedIn,
    username,
    userId,
    defaultProfileId,
    isLoadingProfile,
    hasMultipleProfiles,
    isNewSignup,
    setIsLoggedIn,
    setUsername,
    setDefaultProfileId,
    handleLogout,
    refreshUserProfile,
    isAuthenticated: isLoggedIn
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

