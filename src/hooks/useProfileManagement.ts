
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
      return profile;
    } catch (error) {
      console.error('Error in fetchDefaultProfile:', error);
      setIsLoadingProfile(false);
      return null;
    }
  };

  return {
    defaultProfileId,
    username,
    isLoadingProfile,
    setDefaultProfileId,
    setUsername,
    setIsLoadingProfile,
    fetchDefaultProfile,
  };
};
