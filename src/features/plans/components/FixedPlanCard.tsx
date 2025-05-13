
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { CheckoutButton } from "@/components/subscription/CheckoutButton";
import { formatPrice } from '../utils/pricing-utils';
import PlanCard from './PlanCard';

interface FixedPlanCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  isCurrentPlan: boolean;
  planType: 'teacher' | 'school';
  pricing: {
    price: number;
    billing: string;
    maxUsers: number;
  };
  features: Array<{ icon: string; text: string }>;
}

const FixedPlanCard: React.FC<FixedPlanCardProps> = ({
  title,
  description,
  icon,
  isCurrentPlan,
  planType,
  pricing,
  features
}) => {
  return (
    <PlanCard
      title={title}
      description={description}
      icon={icon}
      isCurrentPlan={isCurrentPlan}
      features={features}
    >
      <div className="text-center mb-4">
        <p className="text-3xl font-bold">${formatPrice(pricing.price)}</p>
        <p className="text-base text-muted-foreground mt-2 py-2">{pricing.billing}</p>
      </div>
      
      <CheckoutButton planType={planType} interval="annual" label="Get Started" className="w-full mb-6" />
    </PlanCard>
  );
};

export default FixedPlanCard;
