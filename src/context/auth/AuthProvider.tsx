
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { AuthContextType, AuthProviderProps } from './auth-types';
import { toast } from 'sonner';

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

  // Function to fetch profile(s) for the current user
  const fetchUserProfiles = async (accountId: string): Promise<void> => {
    try {
      setIsLoadingProfile(true);
      console.log('Fetching profiles for account ID:', accountId);
      
      // Get all profiles for this account
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, is_active, is_owner')
        .eq('account_id', accountId)
        .order('created_at', { ascending: false });
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setIsLoadingProfile(false);
        return;
      }
      
      console.log('Fetched profiles:', profiles);
      
      if (!profiles || profiles.length === 0) {
        console.warn('No profiles found for account:', accountId);
        setIsLoadingProfile(false);
        return;
      }
      
      // Check if there are multiple profiles
      setHasMultipleProfiles(profiles.length > 1);
      
      // Get the stored profile ID from localStorage
      const storedProfileId = localStorage.getItem(ACTIVE_PROFILE_KEY);
      let selectedProfile = null;
      
      // If there's a stored profile ID, check if it's in the fetched profiles
      if (storedProfileId) {
        selectedProfile = profiles.find(p => p.id === storedProfileId);
      }
      
      // If no stored profile or stored profile not found, use the first profile
      if (!selectedProfile) {
        // First try to get the owner profile
        selectedProfile = profiles.find(p => p.is_owner === true);
        
        // If no owner profile, use the first one
        if (!selectedProfile) {
          selectedProfile = profiles[0];
        }
        
        // Store the selected profile ID in localStorage
        if (selectedProfile) {
          localStorage.setItem(ACTIVE_PROFILE_KEY, selectedProfile.id);
        }
      }
      
      if (selectedProfile) {
        setDefaultProfileId(selectedProfile.id);
        setUsername(selectedProfile.name);
      }
      
      setIsLoadingProfile(false);
    } catch (error) {
      console.error('Error fetching user profiles:', error);
      setIsLoadingProfile(false);
    }
  };

  // Function to manually refresh the user profile
  const refreshUserProfile = async (): Promise<void> => {
    if (!userId) return;
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
      async (event, session) => {
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
        
        if (event === 'SIGNED_IN' || event === 'SIGNED_UP' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            console.log('User authenticated:', session.user.id);
            setIsLoggedIn(true);
            setUserId(session.user.id);
            
            // Fetch user profiles with a slight delay to allow triggers to complete
            setTimeout(() => {
              fetchUserProfiles(session.user.id);
            }, 300);
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
