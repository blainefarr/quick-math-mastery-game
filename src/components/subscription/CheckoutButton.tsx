
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
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        
        // Poll for subscription changes
        let attempts = 0;
        const maxAttempts = 10;
        const pollInterval = 2000; // 2 seconds
        
        const pollForSubscriptionChange = async () => {
          if (attempts >= maxAttempts) {
            return;
          }
          
          try {
            await checkAndRefreshSubscription();
            attempts++;
            setTimeout(pollForSubscriptionChange, pollInterval);
          } catch (e) {
            console.error('Error polling for subscription change:', e);
          }
        };
        
        // Start polling after a short delay
        setTimeout(pollForSubscriptionChange, 5000);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create checkout session',
        variant: 'destructive'
      });
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
