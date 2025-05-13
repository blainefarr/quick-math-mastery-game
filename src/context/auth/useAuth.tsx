import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/auth-helpers-react';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  subscriptionStatus: string;
  planType: string;
  isSubscriptionActive: () => boolean;
  checkAndRefreshSubscription: () => Promise<void>;
  signOut: () => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  rememberCurrentRoute: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState('inactive');
  const [planType, setPlanType] = useState('free');
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const getInitialSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();

        setSession(session);
        setUser(session?.user || null);
        await checkAndRefreshSubscription();
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user || null);
      await checkAndRefreshSubscription();
    });
  }, []);

  const checkAndRefreshSubscription = useCallback(async () => {
    if (!user?.id) {
      setSubscriptionStatus('inactive');
      setPlanType('free');
      return;
    }

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_status, plan_type')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile data:", profileError);
        setSubscriptionStatus('inactive');
        setPlanType('free');
        return;
      }

      const { subscription_status, plan_type } = profileData || {};

      setSubscriptionStatus(subscription_status || 'inactive');
      setPlanType(plan_type || 'free');
    } catch (error) {
      console.error("Error refreshing subscription:", error);
      setSubscriptionStatus('inactive');
      setPlanType('free');
    }
  }, [user?.id]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setSubscriptionStatus('inactive');
      setPlanType('free');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isLoggedIn = !!session?.user;
  
  const isSubscriptionActive = () => {
    return subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
  };

  const rememberCurrentRoute = () => {
    const currentPath = window.location.pathname;
    if (currentPath !== '/' && !currentPath.includes('reset-password')) {
      localStorage.setItem('last_path', currentPath);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoggedIn,
        isLoading,
        subscriptionStatus,
        planType,
        isSubscriptionActive,
        checkAndRefreshSubscription,
        signOut,
        showAuthModal,
        setShowAuthModal,
        rememberCurrentRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;
