
import { supabase } from '@/integrations/supabase/client';
import { ACTIVE_PROFILE_KEY } from './profileUtils';

/**
 * Complete signup process that ensures account and profile creation
 * before allowing the user to proceed
 */
export const completeSignUp = async (email: string, password: string, displayName: string) => {
  // Step 1: Auth Sign Up with enhanced security options
  const { data: authData, error: authError } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        name: displayName
      },
      emailRedirectTo: window.location.origin // Ensure redirects go back to our app
    }
  });
  
  if (authError || !authData.user) {
    throw new Error('Authentication signup failed: ' + authError?.message);
  }
  
  const userId = authData.user.id;
  
  // IMPORTANT: Wait for Supabase to fully commit the account/profile creation
  // Reduced from 2500ms to 1500ms
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Step 2: Explicitly verify account creation
  const maxAccountRetries = 5; // Reduced from 10 to 5
  const retryDelay = 800; // Reduced from 1000ms to 800ms
  let accountId = null;
  
  // Try multiple times to get the account - it should be created by DB trigger
  for (let i = 0; i < maxAccountRetries; i++) {
    // Wait a consistent delay between retries
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
    
    // Check current auth session before query
    const { data: sessionData } = await supabase.auth.getSession();
    
    // Verify the session has our target user ID before proceeding
    if (!sessionData.session || sessionData.session.user.id !== userId) {
      // Try to refresh the session
      await supabase.auth.refreshSession();
    }
    
    // Check if the account was created
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', userId as any)  // In your schema, account.id = user.id
      .maybeSingle();
    
    if (!accountError && accountData && 'id' in accountData) {
      accountId = accountData.id;
      break;
    }
  }
  
  if (!accountId) {
    throw new Error('Account creation failed. Please try again or contact support.');
  }
  
  // Step 3: Check if profile exists
  let retryCount = 0;
  const maxProfileRetries = 5; // Reduced from 10 to 5
  let profileCreated = false;
  let profileId = null;
  
  while (retryCount < maxProfileRetries && !profileCreated) {
    try {
      // First attempt doesn't need additional delay since we just found the account
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
      
      // Check if profile exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('account_id', userId as any)
        .maybeSingle();
      
      if (!profileError && profileData && 'id' in profileData) {
        profileCreated = true;
        profileId = profileData.id;
        
        // Store the profile ID in localStorage
        localStorage.setItem(ACTIVE_PROFILE_KEY, profileData.id);
        
        // IMPORTANT: Update the profile name if it doesn't match the display name
        // This ensures the profile name matches what the user entered during signup
        if ('name' in profileData && profileData.name !== displayName) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ name: displayName })
            .eq('id', profileData.id as any);
            
          if (updateError) {
            console.error('Failed to update profile name:', updateError);
          }
        }
        
        break;
      }
      
      retryCount++;
    } catch (error) {
      retryCount++;
    }
  }
  
  if (!profileCreated) {
    throw new Error('Profile creation failed after multiple attempts. Please try again or contact support.');
  }
  
  return { userId, accountId, profileId };
};
