
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { AuthContextType, AuthProviderProps } from './auth-types';
import { toast } from 'sonner';

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
      
      // Clear all local storage and session storage
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

  // Fetch the default profile for a user with retry logic
  const fetchDefaultProfile = async (accountId: string) => {
    try {
      setIsLoadingProfile(true);
      console.log('Fetching default profile for account ID:', accountId);
      
      // Give the session a moment to fully establish
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Get a fresh session to ensure RLS policies are properly applied
      const { data: { session: refreshedSession } } = await supabase.auth.getSession();
      if (!refreshedSession?.user) {
        console.log('No valid session found after refreshing');
        setIsLoadingProfile(false);
        return null;
      }
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('account_id', accountId)
        .eq('is_default', true)
        .single();

      if (error) {
        console.error('Error fetching default profile:', error);
        
        // If no default profile, try to get any profile
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
          console.log('Found profile (non-default):', anyProfile);
          setDefaultProfileId(anyProfile.id);
          setUsername(anyProfile.name || 'User');
          setProfileFetchAttempts(0); // Reset attempts count on success
          setIsLoadingProfile(false);
          return anyProfile;
        }
        
        console.log('No profiles found for user');
        setIsLoadingProfile(false);
        return null;
      }

      if (profile) {
        console.log('Found default profile:', profile);
        setDefaultProfileId(profile.id);
        setUsername(profile.name || 'User');
        setProfileFetchAttempts(0); // Reset attempts count on success
        setIsLoadingProfile(false);
        return profile;
      }
      
      setIsLoadingProfile(false);
      return null;
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
          setIsLoadingProfile(false);
          return;
        }
        
        if (session?.user) {
          setIsLoggedIn(true);
          setUserId(session.user.id);
          
          // We need to ensure the session is fully initialized before fetching the profile
          // So we'll fetch the session again explicitly
          setTimeout(async () => {
            try {
              const { data: { session: refreshedSession } } = await supabase.auth.getSession();
              if (refreshedSession?.user) {
                // Now fetch the profile with the confirmed session
                await fetchDefaultProfile(refreshedSession.user.id);
              } else {
                setIsLoadingProfile(false);
              }
            } catch (err) {
              console.error('Error refreshing session:', err);
              setIsLoadingProfile(false);
            }
          }, 300);
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
    // After 5 seconds, if we're still loading profile, set to false
    const timeout = setTimeout(() => {
      if (isLoadingProfile) {
        console.warn('Profile loading timed out - resetting loading state');
        setIsLoadingProfile(false);
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
