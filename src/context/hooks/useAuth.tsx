
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const authListenerRef = useRef(false);

  useEffect(() => {
    if (authListenerRef.current) return;
    authListenerRef.current = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async ({ email, password }: { email: string; password: string }) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast.success("Registration successful! Check your email to verify your account.");
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any stored auth tokens
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      
      return true;
    } catch (error: any) {
      toast.error(error.message);
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
