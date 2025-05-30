
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import useAuth from '@/context/auth/useAuth';
import AuthModal from '@/components/auth/AuthModal';

interface CheckoutButtonProps {
  planType: string;
  interval: 'monthly' | 'annual' | 'one_time';
  label?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  promoCode?: string;
  disabled?: boolean;
}

export const CheckoutButton = ({
  planType,
  interval,
  label = 'Subscribe',
  variant = 'default',
  className = '',
  promoCode,
  disabled = false
}: CheckoutButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { toast } = useToast();
  const { isLoggedIn, checkAndRefreshSubscription } = useAuth();
  const location = useLocation();

  // Store plan selection in localStorage when auth modal is shown
  const storePlanSelection = () => {
    localStorage.setItem('selected_plan_type', planType);
    localStorage.setItem('selected_plan_interval', interval);
    localStorage.setItem('checkout_return_path', location.pathname + location.search);
    if (promoCode) {
      localStorage.setItem('selected_plan_promo', promoCode);
    }
  };

  // Handle checkout process
  const handleCheckout = async () => {
    if (!isLoggedIn) {
      // Store plan details and show auth modal instead of showing error toast
      storePlanSelection();
      setShowAuthModal(true);
      return;
    }

    try {
      setIsLoading(true);
      
      // Store checkout details in localStorage for verification
      localStorage.setItem('checkout_pending', 'true');
      localStorage.setItem('checkout_plan_type', planType);
      localStorage.setItem('checkout_interval', interval);
      localStorage.setItem('checkout_timestamp', new Date().toISOString());
      
      // Always store the current path for return navigation
      // This is critical for the back button functionality
      const returnPath = location.pathname + location.search;
      localStorage.setItem('checkout_return_path', returnPath);
      console.log('Storing checkout return path:', returnPath);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          planType,
          interval,
          promo: promoCode
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        // Redirect in the same tab instead of opening a new one
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create checkout session',
        variant: 'destructive'
      });
      // Clear checkout pending state if there was an error
      localStorage.removeItem('checkout_pending');
      localStorage.removeItem('checkout_plan_type');
      localStorage.removeItem('checkout_interval');
      localStorage.removeItem('checkout_timestamp');
      localStorage.removeItem('checkout_return_path');
    } finally {
      setIsLoading(false);
    }
  };

  // When auth modal closes, check if we should proceed with checkout
  const handleAuthModalClose = (isAuthenticated: boolean) => {
    setShowAuthModal(false);
    if (isAuthenticated) {
      // User just authenticated, proceed with checkout
      handleCheckout();
    }
  };

  return (
    <>
      <Button 
        variant={variant} 
        onClick={handleCheckout} 
        disabled={isLoading || disabled}
        className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? 'Processing...' : disabled ? 'Current Plan' : label}
      </Button>
      
      {showAuthModal && (
        <AuthModal 
          defaultView="register" 
          onClose={handleAuthModalClose}
          open={showAuthModal}
        />
      )}
    </>
  );
};
