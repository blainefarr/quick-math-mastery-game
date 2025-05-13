import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import useAuth from '@/context/auth/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const sessionId = query.get('session_id');
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const { checkAndRefreshSubscription, planType, subscriptionStatus, isSubscriptionActive } = useAuth();
  const { toast } = useToast();
  
  const MAX_VERIFICATION_ATTEMPTS = 10;
  const VERIFICATION_INTERVAL = 1500; // 1.5 seconds between checks
  
  // Check for pending checkout from localStorage
  const checkoutPending = localStorage.getItem('checkout_pending') === 'true';
  const storedPlanType = localStorage.getItem('checkout_plan_type');
  const storedInterval = localStorage.getItem('checkout_interval');
  const sourcePath = localStorage.getItem('checkout_source_path');
  
  const verifyPaymentWithStripe = async () => {
    if (!sessionId) return false;
    
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: { sessionId }
      });
      
      if (error) {
        console.error("Error checking subscription with Stripe:", error);
        return false;
      }
      
      return data?.is_active || false;
    } catch (err) {
      console.error("Exception checking subscription with Stripe:", err);
      return false;
    }
  };

  const verifyPayment = async () => {
    try {
      setIsVerifying(true);
      setVerificationStatus('checking');
      
      // First, check with Supabase by refreshing subscription
      await checkAndRefreshSubscription();
      
      // If subscription is now active, we're done!
      if (isSubscriptionActive()) {
        setVerificationStatus('success');
        localStorage.removeItem('checkout_pending');
        localStorage.removeItem('checkout_plan_type');
        localStorage.removeItem('checkout_interval');
        localStorage.removeItem('checkout_timestamp');
        
        toast({
          title: "Payment verified!",
          description: "Your subscription has been activated.",
        });
        
        return true;
      }
      
      // If not active yet, try direct verification with Stripe
      const stripeVerified = await verifyPaymentWithStripe();
      
      if (stripeVerified) {
        // One more refresh attempt
        await checkAndRefreshSubscription();
        
        setVerificationStatus('success');
        localStorage.removeItem('checkout_pending');
        localStorage.removeItem('checkout_plan_type');
        localStorage.removeItem('checkout_interval');
        localStorage.removeItem('checkout_timestamp');
        
        toast({
          title: "Payment verified!",
          description: "Your subscription has been activated.",
        });
        
        return true;
      }
      
      // If we've made too many attempts, stop trying
      if (verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
        setVerificationStatus('timeout');
        setErrorMessage("Verification timeout. Please check your account page later or contact support.");
        return false;
      }
      
      // Otherwise, increment attempts and continue
      setVerificationAttempts(prev => prev + 1);
      setVerificationStatus('pending');
      return false;
      
    } catch (error) {
      console.error('Error verifying payment:', error);
      setVerificationStatus('error');
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred during verification");
      
      toast({
        title: "Verification error",
        description: "There was a problem confirming your payment. Please check your account status.",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsVerifying(false);
    }
  };
  
  useEffect(() => {
    // If sessionId exists or there's a pending checkout, verify the payment
    if (sessionId || checkoutPending) {
      verifyPayment();
    } else {
      setIsVerifying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);
  
  useEffect(() => {
    // Only continue polling if we're still pending and haven't exceeded attempts
    if (verificationStatus === 'pending' && verificationAttempts < MAX_VERIFICATION_ATTEMPTS) {
      const timer = setTimeout(() => {
        verifyPayment();
      }, VERIFICATION_INTERVAL);
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationStatus, verificationAttempts]);

  const handleManualRefresh = async () => {
    await verifyPayment();
  };

  // Handle navigation based on the stored source path
  const handleReturnNavigation = () => {
    // Return to the source page if available, otherwise go to account
    if (sourcePath && sourcePath !== '/') {
      navigate(sourcePath);
    } else {
      navigate('/account');
    }
  };

  // Clean up localStorage on successful verification
  useEffect(() => {
    if (verificationStatus === 'success') {
      localStorage.removeItem('checkout_pending');
      localStorage.removeItem('checkout_plan_type');
      localStorage.removeItem('checkout_interval');
      localStorage.removeItem('checkout_timestamp');
      // Keep the source path for navigation
    }
  }, [verificationStatus]);

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleReturnNavigation}
        className="mb-8"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {verificationStatus === 'success' ? (
              <>
                <div className="bg-green-100 text-green-700 rounded-full p-1">
                  <Check size={24} />
                </div>
                Payment Successful
              </>
            ) : verificationStatus === 'error' || verificationStatus === 'timeout' ? (
              <>
                <div className="bg-amber-100 text-amber-700 rounded-full p-1">
                  <AlertTriangle size={24} />
                </div>
                Payment Verification Issue
              </>
            ) : (
              <>
                <div className="bg-blue-100 text-blue-700 rounded-full p-1">
                  <RefreshCw size={24} className={isVerifying ? "animate-spin" : ""} />
                </div>
                Verifying Payment
              </>
            )}
          </CardTitle>
          <CardDescription>
            {sessionId ? "Thank you for your purchase" : "Checking subscription status"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {verificationStatus === 'success' ? (
            <div className="bg-green-50 border border-green-100 rounded-md p-4">
              <p className="font-medium text-green-800">Your payment has been completed successfully!</p>
              <p className="text-sm text-green-600 mt-1">
                Your subscription has been activated.
              </p>
            </div>
          ) : verificationStatus === 'error' || verificationStatus === 'timeout' ? (
            <div className="bg-amber-50 border border-amber-100 rounded-md p-4">
              <p className="font-medium text-amber-800">We're having trouble confirming your subscription</p>
              <p className="text-sm text-amber-600 mt-1">
                {errorMessage || "This could be due to a delay in processing. Please check your account status later."}
              </p>
              <Button 
                className="mt-3" 
                variant="outline" 
                size="sm"
                onClick={handleManualRefresh}
                disabled={isVerifying}
              >
                <RefreshCw size={16} className={`mr-1 ${isVerifying ? "animate-spin" : ""}`} />
                Refresh Status
              </Button>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
              <p className="font-medium text-blue-800">
                Verifying your payment... {verificationAttempts > 0 ? `(Attempt ${verificationAttempts}/${MAX_VERIFICATION_ATTEMPTS})` : ''}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                This may take a few moments to complete.
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="font-medium">Current Plan: {planType.charAt(0).toUpperCase() + planType.slice(1)}</p>
            <p className="text-sm text-muted-foreground">Status: {subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)}</p>
            {storedPlanType && (
              <p className="text-sm text-muted-foreground">
                Purchased: {storedPlanType.charAt(0).toUpperCase() + storedPlanType.slice(1)} 
                ({storedInterval})
              </p>
            )}
          </div>
          
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleReturnNavigation}>
              Return
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
