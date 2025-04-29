
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getProfileForAccount, createProfileForAccount } from './useAuthUtils';

// Local storage key for active profile
export const ACTIVE_PROFILE_KEY = 'math_game_active_profile';

export const useProfileManagement = () => {
  const [defaultProfileId, setDefaultProfileId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Fetch the default profile for a user with proper error handling
  const fetchDefaultProfile = async (accountId: string, forceLogout: (message: string) => void) => {
    try {
      setIsLoadingProfile(true);
      console.log('Fetching profile for account ID:', accountId);
      
      // Get stored profile ID from localStorage
      const storedProfileId = localStorage.getItem(ACTIVE_PROFILE_KEY);
      let profile = null;
      
      if (storedProfileId) {
        console.log('Found stored profile ID:', storedProfileId);
        
        // Try to get the stored profile
        const { data: storedProfile, error: storedProfileError } = await supabase
          .from('profiles')
          .select('id, name, grade')
          .eq('id', storedProfileId)
          .eq('account_id', accountId)
          .maybeSingle();
          
        if (!storedProfileError && storedProfile) {
          console.log('Successfully retrieved stored profile:', storedProfile);
          profile = storedProfile;
        } else {
          console.log('Stored profile not found or error:', storedProfileError);
          localStorage.removeItem(ACTIVE_PROFILE_KEY);
        }
      }
      
      // If no stored profile was found, get any profile for this account
      if (!profile) {
        profile = await getProfileForAccount(accountId);
        
        // If still no profile, use database trigger to create one
        if (!profile) {
          console.log('No profile found, this should not happen with our DB trigger.');
          console.log('Attempting manual profile creation as a fallback...');
          
          // As a last resort, manually create a profile
          profile = await createProfileForAccount(accountId, undefined, true);
          
          if (!profile) {
            setIsLoadingProfile(false);
            forceLogout('Unable to load or create your profile. Please try again later.');
            return null;
          }
        }
        
        // Store the found/created profile ID in localStorage
        if (profile && profile.id) {
          localStorage.setItem(ACTIVE_PROFILE_KEY, profile.id);
        }
      }

      // Set profile info
      if (profile && profile.id) {
        setDefaultProfileId(profile.id);
        setUsername(profile.name || '');
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
    clearProfileData
  };
};
