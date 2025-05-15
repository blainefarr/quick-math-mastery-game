
import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckoutButton } from "@/components/subscription/CheckoutButton";
import { formatPrice, getBillingLabel } from '../utils/pricing-utils';
import PlanCard from './PlanCard';
import { PaymentInterval } from '@/context/auth/auth-types';

interface IntervalPlanCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  isCurrentPlan: boolean;
  planType: 'individual' | 'family';
  pricing: {
    monthly: number;
    annual: number;
    one_time: number;
    maxUsers: number;
  };
  features: Array<{ icon: string; text: string }>;
}

const IntervalPlanCard: React.FC<IntervalPlanCardProps> = ({
  title,
  description,
  icon,
  isCurrentPlan,
  planType,
  pricing,
  features
}) => {
  const [interval, setInterval] = useState<PaymentInterval>('annual');

  return (
    <PlanCard
      title={title}
      description={description}
      icon={icon}
      isCurrentPlan={isCurrentPlan}
      features={features}
    >
      <div className="text-center mb-4">
        <p className="text-3xl font-bold">${formatPrice(pricing[interval], interval)}</p>
        <Select 
          value={interval} 
          onValueChange={(value: string) => setInterval(value as PaymentInterval)}
        >
          <SelectTrigger className="w-full mt-2">
            <SelectValue placeholder={getBillingLabel(interval)} />
          </SelectTrigger>
          <SelectContent className="bg-background text-center">
            <SelectItem value="monthly" className="text-center justify-center">Paid Monthly</SelectItem>
            <SelectItem value="annual" className="text-center justify-center">Paid Annually</SelectItem>
            <SelectItem value="one_time" className="text-center justify-center">Lifetime</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <CheckoutButton 
        planType={planType} 
        interval={interval} 
        label="Get Started" 
        className="w-full mb-6"
        disabled={isCurrentPlan} 
      />
    </PlanCard>
  );
};

export default IntervalPlanCard;
