
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showToastOnce } from '@/utils/toastManager';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const authListenerRef = useRef(false);

  // Add console logs to debug toast issues
  console.log('useAuth hook initialized');

  useEffect(() => {
    if (authListenerRef.current) return;
    authListenerRef.current = true;

    console.log('Setting up auth listener in useAuth');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      
      // Handle sign-in event
      if (event === 'SIGNED_IN') {
        showToastOnce({
          id: 'login-success',
          message: "Successfully logged in!",
          type: 'success'
        });
      }
      
      // Handle sign-out event
      if (event === 'SIGNED_OUT') {
        showToastOnce({
          id: 'logout-success',
          message: "You've been logged out",
          type: 'success'
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
      
      // Success is handled by the auth listener
      console.log('Login successful');
      return true;
    } catch (error: any) {
      console.error('Login error:', error.message);
      
      showToastOnce({
        id: 'login-error',
        message: error.message,
        type: 'error'
      });
      
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
      
      showToastOnce({
        id: 'register-success',
        message: "Registration successful! Check your email to verify your account.",
        type: 'success'
      });
      
      return true;
    } catch (error: any) {
      console.error('Registration error:', error.message);
      
      showToastOnce({
        id: 'register-error',
        message: error.message,
        type: 'error'
      });
      
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
      
      showToastOnce({
        id: 'logout-error',
        message: error.message,
        type: 'error'
      });
      
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
