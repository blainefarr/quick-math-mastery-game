
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const authListenerRef = useRef(false);

  // Add console logs to debug toast issues
  console.log('useAuth hook initialized');

  useEffect(() => {
    if (authListenerRef.current) return;
    authListenerRef.current = true;

    console.log('Setting up auth listener in useAuth');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_OUT') {
        // Dismiss any existing logout toasts before creating a new one
        toast.dismiss('logout');
        toast.success("You've been logged out", { 
          id: 'logout'
        });
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
      console.log('Attempting logout');
      
      // Clear any stored auth tokens
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      
      // We don't show toast here as it's handled by the auth listener
      console.log('Logout successful');
      return true;
    } catch (error: any) {
      console.error('Logout error:', error.message);
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
