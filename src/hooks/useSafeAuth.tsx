
import { supabase } from '@/integrations/supabase/client';

// Custom hook that safely tries to use auth context if available
const useSafeAuth = () => {
  try {
    // Dynamically import to avoid reference errors
    const { useAuth } = require('@/context/auth/useAuth');
    return useAuth();
  } catch (error) {
    // Return default values that match the shape of auth context
    return {
      isLoggedIn: false,
      username: '',
      userId: null,
      handleLogout: async () => {
        await supabase.auth.signOut();
      },
    };
  }
};

export default useSafeAuth;
