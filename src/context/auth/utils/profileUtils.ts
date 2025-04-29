
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
    if (isRetry) {
      console.log(`fetchUserProfiles: Retry attempt ${authState.retryAttempts + 1} for account ID:`, accountId);
    } else {
      console.log('fetchUserProfiles: Starting for account ID:', accountId);
      setIsLoadingProfile(true);
    }
    
    // Check if account exists first (this is critical)
    console.log('fetchUserProfiles: Checking if account exists first with ID:', accountId);
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', accountId)
      .maybeSingle();
      
    if (accountError) {
      console.error('fetchUserProfiles: Error fetching account:', accountError);
      if (!isRetry) {
        toast.error('Account not found');
      }
      return false;
    }
    
    if (!accountData) {
      console.error('fetchUserProfiles: Account not found for ID:', accountId);
      if (!isRetry) {
        toast.error('Account not found');
      }
      return false;
    }
    
    console.log('fetchUserProfiles: Account found:', accountData.id);
    
    // Get all profiles for this account
    console.log('fetchUserProfiles: Querying profiles for account_id:', accountId);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, is_active, is_owner, grade')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });
    
    if (profilesError) {
      console.error('fetchUserProfiles: Error fetching profiles:', profilesError);
      if (!isRetry) {
        toast.error('Failed to load user profiles');
      }
      return false;
    }
    
    console.log('fetchUserProfiles: Fetched profiles:', profiles);
    
    if (!profiles || profiles.length === 0) {
      console.warn('fetchUserProfiles: No profiles found for account:', accountId);
      if (!isRetry) {
        // Only show error if this is not a retry attempt
        toast.error('No profiles found for your account');
      }
      return false;
    }
    
    // Check if there are multiple profiles
    const hasMultiple = profiles.length > 1;
    console.log(`fetchUserProfiles: User has ${hasMultiple ? 'multiple' : 'single'} profile(s)`);
    setHasMultipleProfiles(hasMultiple);
    
    // Get the stored profile ID from localStorage
    const storedProfileId = localStorage.getItem(ACTIVE_PROFILE_KEY);
    console.log('fetchUserProfiles: Retrieved stored profile ID from localStorage:', storedProfileId);
    
    let selectedProfile = null;
    
    // If there's a stored profile ID, check if it's in the fetched profiles
    if (storedProfileId) {
      selectedProfile = profiles.find(p => p.id === storedProfileId);
      console.log('fetchUserProfiles: Found stored profile in fetched profiles:', !!selectedProfile);
    }
    
    // If no stored profile or stored profile not found, auto-select profile
    if (!selectedProfile) {
      // If only one profile exists, use it automatically
      if (profiles.length === 1) {
        selectedProfile = profiles[0];
        console.log('fetchUserProfiles: Auto-selecting only profile:', selectedProfile);
      } else {
        // Otherwise try to get the owner profile
        selectedProfile = profiles.find(p => p.is_owner === true);
        console.log('fetchUserProfiles: Selecting owner profile:', selectedProfile);
        
        // If no owner profile, use the first one
        if (!selectedProfile) {
          selectedProfile = profiles[0];
          console.log('fetchUserProfiles: Falling back to first profile:', selectedProfile);
        }
      }
      
      // Store the selected profile ID in localStorage
      if (selectedProfile) {
        console.log('fetchUserProfiles: Saving newly selected profile ID to localStorage:', selectedProfile.id);
        localStorage.setItem(ACTIVE_PROFILE_KEY, selectedProfile.id);
      }
    }
    
    if (selectedProfile) {
      console.log('fetchUserProfiles: Setting selected profile in auth state:', selectedProfile.id, selectedProfile.name);
      setDefaultProfileId(selectedProfile.id);
      setUsername(selectedProfile.name);
      
      // If this was a retry after signup, show success message
      if (isNewSignup && isRetry) {
        console.log('fetchUserProfiles: New signup completed successfully');
        toast.success('Account created successfully!');
        setIsNewSignup(false);
      }
      
      setIsLoadingProfile(false);
      return true;
    } else {
      console.error('fetchUserProfiles: Failed to select a valid profile');
      if (!isRetry) {
        toast.error('Could not find a valid profile');
      }
      return false;
    }
  } catch (error) {
    console.error('fetchUserProfiles: Error fetching user profiles:', error);
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
