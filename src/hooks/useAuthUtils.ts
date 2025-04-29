
import { AuthSession } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Polls for a valid session with exponential backoff
 * @param maxAttempts Maximum number of attempts to get a valid session
 * @param initialDelay Initial delay in ms between attempts
 * @returns A promise that resolves to the session or null if no session is found
 */
export const waitForSession = async (
  maxAttempts = 10,
  initialDelay = 300
): Promise<AuthSession | null> => {
  console.log("Starting session polling...");
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      console.log(`Session poll attempt ${attempts + 1}/${maxAttempts}`);
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error polling for session:", error);
      }
      
      if (data?.session?.user) {
        console.log("Valid session found:", data.session.user.id);
        return data.session;
      }
      
      // Exponential backoff
      const delay = initialDelay * Math.pow(1.5, attempts);
      console.log(`No valid session yet, waiting ${delay}ms before retry`);
      await new Promise(resolve => setTimeout(resolve, delay));
      attempts++;
    } catch (err) {
      console.error("Unexpected error during session polling:", err);
      attempts++;
    }
  }
  
  console.log("Session polling timed out, no valid session found");
  return null;
};

/**
 * Retrieves all profiles for an account with retry mechanism for new users
 * @param accountId The account/user ID to retrieve profiles for
 * @param maxAttempts Maximum number of retry attempts
 * @param initialDelay Initial delay in ms between attempts
 * @returns Array of profile objects or null if retrieval failed after all retries
 */
export const getProfilesForAccount = async (
  accountId: string, 
  maxAttempts = 5, 
  initialDelay = 500
): Promise<any[] | null> => {
  console.log("Getting profiles for account:", accountId);
  
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      // Get all profiles for this account
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, is_active, is_owner, grade, account_id")
        .eq("account_id", accountId)
        .order("created_at", { ascending: false });
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        attempts++;
        
        if (attempts < maxAttempts) {
          const delay = initialDelay * Math.pow(1.5, attempts);
          console.log(`Profile fetch failed, retrying in ${delay}ms (attempt ${attempts + 1}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        return null;
      }
      
      // If profiles exist, return them
      if (profiles && profiles.length > 0) {
        console.log(`Found ${profiles.length} profiles for account:`, accountId);
        return profiles;
      }
      
      // If no profiles found but we have attempts left, retry
      if (attempts < maxAttempts - 1) {
        const delay = initialDelay * Math.pow(1.5, attempts);
        console.log(`No profiles found yet, retrying in ${delay}ms (attempt ${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempts++;
      } else {
        console.log(`No profiles found after ${maxAttempts} attempts`);
        return [];
      }
    } catch (error) {
      console.error("Error in getProfilesForAccount:", error);
      attempts++;
      
      if (attempts < maxAttempts) {
        const delay = initialDelay * Math.pow(1.5, attempts);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return null;
};

/**
 * Retrieves a profile with robust error handling (legacy method that gets a single profile)
 * @param accountId The account/user ID to retrieve a profile for
 * @returns The profile object or null if profile retrieval failed
 */
export const getProfileForAccount = async (accountId: string): Promise<any | null> => {
  console.log("Getting profile for account (legacy method):", accountId);
  
  try {
    const profiles = await getProfilesForAccount(accountId);
    return profiles && profiles.length > 0 ? profiles[0] : null;
  } catch (error) {
    console.error("Error in getProfileForAccount:", error);
    return null;
  }
};

/**
 * Creates a new profile for an account
 * @param accountId The account ID to create a profile for
 * @param name The name for the profile
 * @param isOwner Whether this is the owner profile
 * @returns The created profile or null if creation failed
 */
export const createProfileForAccount = async (
  accountId: string, 
  name?: string, 
  isOwner: boolean = false
): Promise<any | null> => {
  try {
    console.log("Creating new profile for account:", accountId);
    
    // Check if owner profile already exists if we're creating an owner profile
    if (isOwner) {
      const existingProfiles = await getProfilesForAccount(accountId);
      const hasOwnerProfile = existingProfiles?.some(p => p.is_owner === true);
      
      if (hasOwnerProfile) {
        console.log("Owner profile already exists, creating a regular profile instead");
        isOwner = false;
      }
    }
    
    // Get user data to extract name if not provided
    const { data: userData } = await supabase.auth.getUser();
    let profileName = name || 'New User';
    
    if (!name && userData?.user) {
      const userMeta = userData.user.user_metadata;
      
      if (userMeta?.name) {
        profileName = userMeta.name;
      } else if (userMeta?.full_name) {
        profileName = userMeta.full_name;
      } else if (userData.user.email) {
        profileName = userData.user.email.split('@')[0];
      }
    }
    
    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert([{ 
        account_id: accountId,
        name: profileName,
        is_active: true,
        is_owner: isOwner
      }])
      .select()
      .single();
    
    if (createError) {
      console.error("Error creating profile:", createError);
      toast.error("Failed to create your profile. Please try again later.");
      return null;
    }
    
    console.log("Profile created successfully:", newProfile);
    return newProfile;
  } catch (error) {
    console.error("Error in createProfileForAccount:", error);
    return null;
  }
};
