
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getProfilesForAccount, createProfileForAccount } from './useAuthUtils';

// Local storage key for active profile
export const ACTIVE_PROFILE_KEY = 'math_game_active_profile';

export const useProfileManagement = () => {
  const [defaultProfileId, setDefaultProfileId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [shouldShowProfileSelector, setShouldShowProfileSelector] = useState(false);

  // Fetch profiles for a user with proper error handling
  const fetchDefaultProfile = async (accountId: string, forceLogout: (message: string) => void) => {
    try {
      setIsLoadingProfile(true);
      console.log('Fetching profile for account ID:', accountId);
      
      // Get stored profile ID from localStorage
      const storedProfileId = localStorage.getItem(ACTIVE_PROFILE_KEY);
      let selectedProfile = null;
      
      // Get all profiles for this account - using retry mechanism
      const profiles = await getProfilesForAccount(accountId, 5, 500);
      
      if (!profiles) {
        console.error('Error fetching profiles, possible network issue');
        setIsLoadingProfile(false);
        forceLogout('Unable to load your profile. Please check your connection and try again.');
        return null;
      }
      
      if (profiles.length === 0) {
        console.log('No profiles found for this account, attempting to create one');
        
        // As a last resort, manually create a profile
        const newProfile = await createProfileForAccount(accountId, undefined, true);
        
        if (!newProfile) {
          console.error('Failed to create default profile');
          setIsLoadingProfile(false);
          forceLogout('Unable to create your profile. Please try again later.');
          return null;
        }
        
        console.log('Successfully created new profile:', newProfile);
        selectedProfile = newProfile;
        
        // Store the new profile ID in localStorage
        localStorage.setItem(ACTIVE_PROFILE_KEY, selectedProfile.id);
      } else if (profiles.length === 1) {
        // If there's only one profile, use it
        console.log('Single profile found, using it automatically');
        selectedProfile = profiles[0];
        localStorage.setItem(ACTIVE_PROFILE_KEY, selectedProfile.id);
      } else {
        console.log('Multiple profiles found:', profiles.length);
        
        if (storedProfileId) {
          // Try to find the stored profile in the available profiles
          selectedProfile = profiles.find(p => p.id === storedProfileId);
        }
        
        if (!selectedProfile) {
          // If no stored profile or stored profile not found, show profile selector
          console.log('No matching stored profile found, showing profile selector');
          setShouldShowProfileSelector(true);
          // Use the first profile as default until user selects one
          selectedProfile = profiles[0];
        }
        
        // Always update localStorage with whatever profile we're using
        localStorage.setItem(ACTIVE_PROFILE_KEY, selectedProfile.id);
      }

      // Set profile info
      if (selectedProfile && selectedProfile.id) {
        setDefaultProfileId(selectedProfile.id);
        setUsername(selectedProfile.name || '');
        console.log('Profile successfully loaded:', selectedProfile);
      } else {
        console.error('Invalid profile object:', selectedProfile);
        forceLogout('Invalid profile data. Please try logging in again.');
        return null;
      }
      
      setIsLoadingProfile(false);
      return selectedProfile;
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
    setShouldShowProfileSelector(false);
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
  };

  return {
    defaultProfileId,
    username,
    isLoadingProfile,
    shouldShowProfileSelector,
    setDefaultProfileId,
    setUsername,
    setIsLoadingProfile,
    setShouldShowProfileSelector,
    fetchDefaultProfile,
    clearProfileData
  };
};
