
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from 'lucide-react';
import useAuth from '@/context/auth/useAuth';
import { useToast } from '@/hooks/use-toast';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const sessionId = query.get('session_id');
  const [isVerifying, setIsVerifying] = useState(true);
  const { checkAndRefreshSubscription, planType, subscriptionStatus } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setIsVerifying(true);
        
        // Wait a bit to allow webhook processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check subscription status
        await checkAndRefreshSubscription();
        
        toast({
          title: "Payment successful!",
          description: "Your subscription has been activated.",
        });
      } catch (error) {
        console.error('Error verifying payment:', error);
        toast({
          title: "Verification in progress",
          description: "Your payment is being processed. It may take a few minutes to activate.",
        });
      } finally {
        setIsVerifying(false);
      }
    };
    
    if (sessionId) {
      verifyPayment();
    } else {
      setIsVerifying(false);
    }
  }, [sessionId, checkAndRefreshSubscription, toast]);

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => navigate('/account')}
        className="mb-8"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to Account
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="bg-green-100 text-green-700 rounded-full p-1">
              <Check size={24} />
            </div>
            Payment Successful
          </CardTitle>
          <CardDescription>
            Thank you for your purchase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-100 rounded-md p-4">
            <p className="font-medium text-green-800">Your payment has been completed successfully!</p>
            <p className="text-sm text-green-600 mt-1">
              {isVerifying 
                ? "We're verifying your payment..." 
                : "Your subscription has been activated."}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="font-medium">Current Plan: {planType.charAt(0).toUpperCase() + planType.slice(1)}</p>
            <p className="text-sm text-muted-foreground">Status: {subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)}</p>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => navigate('/account')}>
              View Account
            </Button>
            <Button variant="default" onClick={() => navigate('/')}>
              Start Playing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
