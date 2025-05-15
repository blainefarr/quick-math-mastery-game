
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Privacy = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" onClick={() => window.history.back()} className="h-8 rounded-full">
          <ArrowLeft size={16} className="mr-1" />
          Back
        </Button>
      </div>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-primary">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: May 14, 2025</p>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Introduction</h2>
          <p>
            This Privacy Policy describes how Mental Math ("we", "us", or "our") collects, uses, and discloses your 
            information when you use our service. We are committed to protecting your personal information and your 
            right to privacy.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Information We Collect</h2>
          <p>
            We collect information that you provide directly to us when you:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Create an account</li>
            <li>Subscribe to a plan</li>
            <li>Use our application</li>
            <li>Contact our support team</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process your subscriptions and payments</li>
            <li>Send you technical notices and updates</li>
            <li>Respond to your comments and questions</li>
            <li>Track and analyze trends and usage</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information. However,
            no method of transmission over the Internet or electronic storage is 100% secure, and we cannot
            guarantee absolute security.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
            <br />
            <a href="mailto:privacy@mentalmath.com" className="text-primary hover:underline">
              privacy@mentalmath.com
            </a>
          </p>
        </section>
        
        <div className="border-t pt-6 mt-10">
          <p className="text-sm text-muted-foreground">
            For more information about how we protect your data or to update your preferences, please visit our 
            <Link to="/terms" className="text-primary hover:underline ml-1">Terms of Service</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
