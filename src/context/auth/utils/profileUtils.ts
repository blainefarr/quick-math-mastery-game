
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AuthStateType } from '../auth-types';

// Local storage key for active profile
export const ACTIVE_PROFILE_KEY = 'math_game_active_profile';

export const fetchUserProfiles = async (
  accountId: string, 
  authState: AuthStateType,
  isRetry = false
): Promise<boolean> => {
  const { 
    setUsername, 
    setDefaultProfileId, 
    setHasMultipleProfiles, 
    setIsLoadingProfile,
    setIsNewSignup,
    isNewSignup
  } = authState;
  
  try {
    if (!isRetry) {
      setIsLoadingProfile(true);
    }
    
    // Check if account exists first (this is critical)
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id, name')
      .eq('id', accountId)
      .maybeSingle();
      
    if (accountError) {
      if (!isRetry) {
        toast.error('Account not found');
      }
      return false;
    }
    
    if (!accountData) {
      if (!isRetry) {
        toast.error('Account not found');
      }
      return false;
    }
    
    // Get all profiles for this account
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, is_active, is_owner, grade')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });
    
    if (profilesError) {
      if (!isRetry) {
        toast.error('Failed to load user profiles');
      }
      return false;
    }
    
    if (!profiles || profiles.length === 0) {
      if (!isRetry) {
        // Only show error if this is not a retry attempt
        toast.error('No profiles found for your account');
      }
      return false;
    }
    
    // Check if there are multiple profiles
    const hasMultiple = profiles.length > 1;
    setHasMultipleProfiles(hasMultiple);
    
    // Get the stored profile ID from localStorage
    const storedProfileId = localStorage.getItem(ACTIVE_PROFILE_KEY);
    
    let selectedProfile = null;
    
    // If there's a stored profile ID, check if it's in the fetched profiles
    if (storedProfileId) {
      selectedProfile = profiles.find(p => p.id === storedProfileId);
    }
    
    // If no stored profile or stored profile not found, auto-select profile
    if (!selectedProfile) {
      // If only one profile exists, use it automatically
      if (profiles.length === 1) {
        selectedProfile = profiles[0];
      } else {
        // Otherwise try to get the owner profile
        selectedProfile = profiles.find(p => p.is_owner === true);
        
        // If no owner profile, use the first one
        if (!selectedProfile) {
          selectedProfile = profiles[0];
        }
      }
      
      // Store the selected profile ID in localStorage
      if (selectedProfile) {
        localStorage.setItem(ACTIVE_PROFILE_KEY, selectedProfile.id);
      }
    }
    
    if (selectedProfile) {
      // Use account name instead of profile name
      setDefaultProfileId(selectedProfile.id);
      // IMPORTANT: Always use the account name which should be correctly saved
      setUsername(accountData.name || selectedProfile.name);
      
      // If this was a retry after signup, show success message
      if (isNewSignup && isRetry) {
        toast.success('Account created successfully!');
        setIsNewSignup(false);
      }
      
      setIsLoadingProfile(false);
      return true;
    } else {
      if (!isRetry) {
        toast.error('Could not find a valid profile');
      }
      return false;
    }
  } catch (error) {
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
