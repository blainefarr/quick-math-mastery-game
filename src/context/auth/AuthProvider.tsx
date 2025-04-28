
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
  const [isLoadingProfile, setIsLoadingProfile] = useState(true); // Add loading state

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

  // Fetch the default profile for a user
  const fetchDefaultProfile = async (accountId: string) => {
    try {
      setIsLoadingProfile(true); // Set loading state to true when fetching
      console.log('Fetching default profile for account ID:', accountId);
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
          setIsLoadingProfile(false); // Make sure we set loading to false even on error
          return null;
        }
        
        if (anyProfile) {
          console.log('Found profile (non-default):', anyProfile);
          setDefaultProfileId(anyProfile.id);
          setUsername(anyProfile.name || 'User');
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
          setIsLoadingProfile(false); // No need to load profile when logged out
          return;
        }
        
        if (session?.user) {
          setIsLoggedIn(true);
          setUserId(session.user.id);
          
          // Fetch the default profile to get the username
          await fetchDefaultProfile(session.user.id);
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
          
          // Fetch the default profile
          await fetchDefaultProfile(session.user.id);
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
    isLoadingProfile, // Expose the loading state to consumers
    setIsLoggedIn,
    setUsername,
    handleLogout,
    isAuthenticated: isLoggedIn // Map isAuthenticated to isLoggedIn
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
