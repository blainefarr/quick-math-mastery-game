
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import useAuth from '@/context/auth/useAuth';

interface ManageSubscriptionButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

export const ManageSubscriptionButton = ({
  variant = 'outline',
  className = '',
}: ManageSubscriptionButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { subscriptionStatus, isSubscriptionActive } = useAuth();
  
  // Only show this button for active subscriptions
  if (!isSubscriptionActive() || subscriptionStatus === 'one_time') {
    return null;
  }

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: {}
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        // Open Stripe customer portal in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to open customer portal',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      onClick={handleManageSubscription} 
      disabled={isLoading}
      className={className}
    >
      {isLoading ? 'Processing...' : 'Manage Subscription'}
    </Button>
  );
};
