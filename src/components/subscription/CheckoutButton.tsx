
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import useAuth from '@/context/auth/useAuth';

interface CheckoutButtonProps {
  planType: string;
  interval: 'monthly' | 'annual' | 'one_time';
  label?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  promoCode?: string;
}

export const CheckoutButton = ({
  planType,
  interval,
  label = 'Subscribe',
  variant = 'default',
  className = '',
  promoCode
}: CheckoutButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isLoggedIn, checkAndRefreshSubscription } = useAuth();

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to subscribe.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Store checkout details in localStorage for verification
      localStorage.setItem('checkout_pending', 'true');
      localStorage.setItem('checkout_plan_type', planType);
      localStorage.setItem('checkout_interval', interval);
      localStorage.setItem('checkout_timestamp', new Date().toISOString());
      
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      onClick={handleCheckout} 
      disabled={isLoading}
      className={className}
    >
      {isLoading ? 'Processing...' : label}
    </Button>
  );
};
