
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const authListenerRef = useRef(false);
  const loginToastShown = useRef(false);
  const logoutToastShown = useRef(false);

  // Add console logs to debug toast issues
  console.log('useAuth hook initialized');

  useEffect(() => {
    if (authListenerRef.current) return;
    authListenerRef.current = true;

    console.log('Setting up auth listener in useAuth');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      
      // Handle sign-in event
      if (event === 'SIGNED_IN' && !loginToastShown.current) {
        loginToastShown.current = true;
        
        // Dismiss any existing login toasts to avoid duplicates
        toast.dismiss('login-success');
        
        // Show login success toast with delay to avoid duplicates
        setTimeout(() => {
          toast.success("Successfully logged in!", { 
            id: 'login-success'
          });
        }, 300);
        
        // Reset login toast flag after a while
        setTimeout(() => {
          loginToastShown.current = false;
        }, 3000);
      }
      
      // Handle sign-out event
      if (event === 'SIGNED_OUT' && !logoutToastShown.current) {
        logoutToastShown.current = true;
        
        // Dismiss any existing logout toasts to avoid duplicates
        toast.dismiss('logout');
        
        // Show logout success toast with delay to avoid duplicates
        setTimeout(() => {
          toast.success("You've been logged out", { 
            id: 'logout'
          });
        }, 300);
        
        // Reset logout toast flag after a while
        setTimeout(() => {
          logoutToastShown.current = false;
        }, 3000);
      }
    });

    return () => {
      subscription.unsubscribe();
      authListenerRef.current = false;
    };
  }, []);

  const login = useCallback(async ({ email, password }: { email: string; password: string }) => {
    try {
      setLoading(true);
      console.log('Attempting login');
      
      // Dismiss any existing login-related toasts
      toast.dismiss('login-error');
      
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // Success is handled by the auth listener, no need for a toast here
      console.log('Login successful');
      return true;
    } catch (error: any) {
      console.error('Login error:', error.message);
      toast.error(error.message, { id: 'login-error' });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async ({ email, password }: { email: string; password: string }) => {
    try {
      setLoading(true);
      console.log('Attempting registration');
      
      // Dismiss any existing registration-related toasts
      toast.dismiss('register-success');
      toast.dismiss('register-error');
      
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      
      toast.success("Registration successful! Check your email to verify your account.", {
        id: 'register-success'
      });
      return true;
    } catch (error: any) {
      console.error('Registration error:', error.message);
      toast.error(error.message, { id: 'register-error' });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Attempting logout in useAuth');
      
      // Clear any stored auth tokens
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Remove any stored tokens to ensure complete logout
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      
      // We don't show toast here as it's handled by the auth listener
      console.log('Logout successful in useAuth');
      return true;
    } catch (error: any) {
      console.error('Logout error:', error.message);
      
      // Dismiss any existing logout error toasts
      toast.dismiss('logout-error');
      
      toast.error(error.message, { id: 'logout-error' });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    login,
    logout,
    register,
    loading
  };
};
