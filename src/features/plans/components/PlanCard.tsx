
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FeatureList from './FeatureList';
import { LucideIcon } from 'lucide-react';

interface PlanCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  isCurrentPlan?: boolean;
  features: Array<{ icon: string; text: string }>;
  children?: React.ReactNode;
  footerContent?: React.ReactNode;
}

const PlanCard: React.FC<PlanCardProps> = ({
  title,
  description,
  icon: Icon,
  isCurrentPlan = false,
  features,
  children,
  footerContent
}) => {
  return (
    <Card className={`relative flex flex-col ${isCurrentPlan ? 'border-primary border-2' : ''}`}>
      {isCurrentPlan && <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">Your Plan</Badge>}
      <CardHeader className="text-center pb-2">
        <div className="mx-auto bg-primary/10 rounded-full p-3 mb-2">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        {children}
        <FeatureList features={features} />
      </CardContent>
      {footerContent && <CardFooter>{footerContent}</CardFooter>}
    </Card>
  );
};

export default PlanCard;
