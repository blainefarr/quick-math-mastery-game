
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Local storage key for active profile
export const ACTIVE_PROFILE_KEY = 'math_game_active_profile';

export const useProfileManagement = () => {
  const [defaultProfileId, setDefaultProfileId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileFetchAttempts, setProfileFetchAttempts] = useState(0);
  const MAX_PROFILE_FETCH_ATTEMPTS = 3;

  // Check if a profile exists and create one if it doesn't
  const ensureProfileExists = async (accountId: string) => {
    try {
      console.log('Checking if profile exists for account ID:', accountId);
      
      // Check if a profile exists for this user
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('account_id', accountId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors
      
      if (profileCheckError) {
        console.error('Error checking for existing profile:', profileCheckError);
        return null;
      }
      
      // If profile exists, return it
      if (existingProfile) {
        console.log('Existing profile found:', existingProfile);
        return existingProfile;
      }
      
      console.log('No profile found, attempting to create one');
      
      // Get user information to create a profile
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No user found for profile creation');
        return null;
      }
      
      // Extract name from user metadata or email
      let profileName = '';
      if (user.user_metadata && user.user_metadata.full_name) {
        profileName = user.user_metadata.full_name;
      } else if (user.user_metadata && user.user_metadata.name) {
        profileName = user.user_metadata.name;
      } else if (user.email) {
        // Extract username from email (before @)
        profileName = user.email.split('@')[0];
      } else {
        profileName = 'New User';
      }
      
      // Create a new profile
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([
          { 
            account_id: accountId,
            name: profileName,
            is_active: true,
            is_owner: true
          }
        ])
        .select('id, name')
        .single();
      
      if (createError) {
        console.error('Error creating profile:', createError);
        return null;
      }
      
      console.log('Successfully created new profile:', newProfile);
      return newProfile;
    } catch (error) {
      console.error('Error in ensureProfileExists:', error);
      return null;
    }
  };

  // Fetch the profile for a user with retry logic and profile creation
  const fetchDefaultProfile = async (accountId: string, forceLogout: (message: string) => void) => {
    try {
      setIsLoadingProfile(true);
      console.log('Fetching profile for account ID:', accountId);
      
      // Get a fresh session to ensure RLS policies are properly applied
      const { data: { session: refreshedSession } } = await supabase.auth.getSession();
      if (!refreshedSession?.user) {
        console.log('No valid session found after refreshing');
        setIsLoadingProfile(false);
        forceLogout('Your session has expired. Please log in again.');
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
          .maybeSingle(); // Use maybeSingle instead of single
          
        if (!storedProfileError && storedProfile) {
          console.log('Successfully retrieved stored profile:', storedProfile);
          profile = storedProfile;
        } else {
          console.log('Stored profile not found or error, will try to find another profile');
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
          .maybeSingle(); // Use maybeSingle instead of single
          
        if (anyProfileError) {
          console.error('Error fetching any profile:', anyProfileError);
          
          // Only retry if we haven't exceeded max attempts
          if (profileFetchAttempts < MAX_PROFILE_FETCH_ATTEMPTS) {
            console.log(`Retry attempt ${profileFetchAttempts + 1}/${MAX_PROFILE_FETCH_ATTEMPTS} in 500ms...`);
            setProfileFetchAttempts(prev => prev + 1);
            
            // Retry after a short delay
            setTimeout(() => {
              fetchDefaultProfile(accountId, forceLogout);
            }, 500);
            return null;
          }
          
          // After max attempts, try to create a profile as a fallback
          console.log('Max fetch attempts reached, trying to create a profile');
          profile = await ensureProfileExists(accountId);
          
          if (!profile) {
            // If profile creation also fails, trigger a logout
            setIsLoadingProfile(false);
            forceLogout('Unable to load or create your profile. Please try again later.');
            return null;
          }
        } else if (anyProfile) {
          console.log('Found profile:', anyProfile);
          profile = anyProfile;
        } else {
          // No profile found, try to create one
          console.log('No profiles found, trying to create one');
          profile = await ensureProfileExists(accountId);
          
          if (!profile) {
            setIsLoadingProfile(false);
            forceLogout('Unable to create a profile for your account. Please try again.');
            return null;
          }
        }
        
        // Store the found/created profile ID in localStorage
        if (profile && profile.id) {
          localStorage.setItem(ACTIVE_PROFILE_KEY, profile.id);
        }
      }

      // Only set profile info if we actually have a valid profile
      if (profile && profile.id) {
        setDefaultProfileId(profile.id);
        setUsername(profile.name || '');
        setProfileFetchAttempts(0); // Reset attempts count on success
        console.log('Profile successfully loaded:', profile);
      } else {
        console.error('Invalid profile object:', profile);
        forceLogout('Invalid profile data. Please try logging in again.');
        return null;
      }
      
      setIsLoadingProfile(false);
      return profile;
    } catch (error) {
      console.error('Error in fetchDefaultProfile:', error);
      setIsLoadingProfile(false);
      forceLogout('Error loading profile. Please try logging in again.');
      return null;
    }
  };

  const clearProfileData = () => {
    setDefaultProfileId(null);
    setUsername('');
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
  };

  return {
    defaultProfileId,
    username,
    isLoadingProfile,
    setDefaultProfileId,
    setUsername,
    setIsLoadingProfile,
    fetchDefaultProfile,
    clearProfileData,
    ensureProfileExists
  };
};
