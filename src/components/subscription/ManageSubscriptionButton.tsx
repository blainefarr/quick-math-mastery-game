
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import useAuth from '@/context/auth/useAuth';
import { ExternalLink } from 'lucide-react';

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
      } else if (data?.isStripeConfigError) {
        // This is a specific error for unconfigured Stripe Portal
        toast({
          title: 'Stripe Portal Not Configured',
          description: "The Stripe Customer Portal hasn't been set up yet. Please configure it in the Stripe dashboard.",
          variant: 'destructive'
        });
      } else {
        throw new Error("No portal URL received");
      }
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      toast({
        title: 'Error',
        description: "There was an issue opening the subscription management portal. Please try again later.",
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
      {isLoading ? 'Processing...' : (
        <>
          Manage Subscription
          <ExternalLink className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
};
