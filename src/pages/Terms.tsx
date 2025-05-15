
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Terms = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" onClick={() => window.history.back()} className="h-8 rounded-full">
          <ArrowLeft size={16} className="mr-1" />
          Back
        </Button>
      </div>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-primary">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: May 14, 2025</p>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Practice Mental Math, you agree to be bound by these Terms of Service. If you 
            do not agree to all the terms and conditions, then you may not access the service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Subscriptions</h2>
          <p>
            Some features of the Service require a subscription. By purchasing a subscription, you agree to the pricing, 
            payment, and billing policies provided at the time of subscription.
          </p>
          <p>
            Subscriptions automatically renew unless auto-renew is turned off at least 24 hours before the end of the 
            current period.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. User Accounts</h2>
          <p>
            You are responsible for safeguarding your account and for all activities that occur under your account.
            You must notify us immediately of any unauthorized use of your account.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Acceptable Use</h2>
          <p>
            You agree not to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the Service for any illegal purpose</li>
            <li>Violate any laws in your jurisdiction</li>
            <li>Share your account credentials with others</li>
            <li>Attempt to gain unauthorized access to any part of the Service</li>
            <li>Interfere with or disrupt the Service or servers</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by Practice Mental Math 
            and are protected by international copyright, trademark, and other intellectual property laws.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason, 
            including breach of these Terms. Upon termination, your right to use the Service will cease immediately.
          </p>
        </section>
        
        <div className="border-t pt-6 mt-10">
          <p className="text-sm text-muted-foreground">
            For questions about these terms, please contact us at 
            <a href="mailto:support@practicementalmath.com" className="text-primary hover:underline ml-1">
              support@practicementalmath.com
            </a>. Also see our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
