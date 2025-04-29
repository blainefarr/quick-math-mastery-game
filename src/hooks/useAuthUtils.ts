
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
        // Don't throw, just continue polling
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
 * Creates or retrieves a profile for a user with robust error handling
 * @param accountId The account/user ID to create or retrieve a profile for
 * @returns The profile object or null if profile creation/retrieval failed
 */
export const ensureUserProfile = async (accountId: string): Promise<any | null> => {
  console.log("Ensuring user profile exists for:", accountId);
  
  try {
    // First verify the account exists to prevent foreign key constraint errors
    const { data: accountData, error: accountError } = await supabase
      .from("accounts")
      .select("id")
      .eq("id", accountId)
      .single();
    
    // Account doesn't exist, create it first
    if (!accountData || accountError) {
      console.log("Account not found, creating account first");
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        console.error("No user data available for account creation");
        return null;
      }
      
      // Extract name from various possible sources
      let userName = "";
      const userMeta = userData.user.user_metadata;
      
      if (userMeta) {
        if (userMeta.name) {
          userName = userMeta.name;
        } else if (userMeta.full_name) {
          userName = userMeta.full_name;
        } else if (userMeta.user_name) {
          userName = userMeta.user_name;
        }
      }
      
      // If no name found in metadata, try to extract from email
      if (!userName && userData.user.email) {
        userName = userData.user.email.split('@')[0];
      }
      
      // Create account with retry logic
      let accountCreated = false;
      let attempts = 0;
      
      while (!accountCreated && attempts < 3) {
        const { error: createAccountError } = await supabase
          .from("accounts")
          .insert([{
            id: accountId,
            email: userData.user.email,
            name: userName || "New User",
          }]);
          
        if (!createAccountError) {
          accountCreated = true;
          console.log("Account created successfully");
        } else {
          console.error(`Failed to create account, attempt ${attempts + 1}/3:`, createAccountError);
          
          // If the error is not a foreign key constraint error and we've hit the limit, fail
          if (attempts === 2) {
            toast.error("Failed to create your account. Please try again.");
            return null;
          }
          
          // Exponential backoff
          const delay = 500 * Math.pow(2, attempts);
          await new Promise(resolve => setTimeout(resolve, delay));
          attempts++;
        }
      }
      
      if (!accountCreated) {
        console.error("Failed to create account after multiple attempts");
        return null;
      }
    }
    
    // Now check if profile exists
    console.log("Checking if profile exists");
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, is_active, is_owner")
      .eq("account_id", accountId)
      .maybeSingle();
    
    // Profile exists, return it
    if (existingProfile) {
      console.log("Existing profile found:", existingProfile);
      return existingProfile;
    }
    
    // No profile found, create one
    console.log("No profile found, creating a new one");
    const { data: authUser } = await supabase.auth.getUser();
    
    if (!authUser?.user) {
      console.error("No authenticated user found for profile creation");
      return null;
    }
    
    // Get name from user metadata
    let profileName = "New User";
    const metadata = authUser.user.user_metadata;
    
    if (metadata) {
      if (metadata.name) {
        profileName = metadata.name;
      } else if (metadata.full_name) {
        profileName = metadata.full_name;
      } else if (metadata.user_name) {
        profileName = metadata.user_name;
      } else if (authUser.user.email) {
        profileName = authUser.user.email.split('@')[0];
      }
    }
    
    // Create profile with retry logic
    let profileCreated = false;
    let attempts = 0;
    let profile = null;
    
    while (!profileCreated && attempts < 3) {
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert([{ 
          account_id: accountId,
          name: profileName,
          is_active: true,
          is_owner: true
        }])
        .select()
        .single();
      
      if (newProfile && !createError) {
        profileCreated = true;
        profile = newProfile;
        console.log("Profile created successfully:", newProfile);
      } else {
        console.error(`Failed to create profile, attempt ${attempts + 1}/3:`, createError);
        
        // If hitting the limit, fail
        if (attempts === 2) {
          toast.error("Failed to create your profile. Please try again later.");
          return null;
        }
        
        // Exponential backoff
        const delay = 800 * Math.pow(2, attempts);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempts++;
      }
    }
    
    return profile;
  } catch (error) {
    console.error("Error in ensureUserProfile:", error);
    return null;
  }
};
