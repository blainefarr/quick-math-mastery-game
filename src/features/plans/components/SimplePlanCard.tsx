
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import FeatureList from './FeatureList';

interface SimplePlanCardProps {
  title: string;
  description?: string;
  features: Array<{ icon: string; text: string }>;
  footerContent: React.ReactNode;
}

const SimplePlanCard: React.FC<SimplePlanCardProps> = ({
  title,
  description,
  features,
  footerContent
}) => {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && <p className="mb-4">{description}</p>}
      </CardHeader>
      <CardContent>
        <FeatureList features={features} className="space-y-3" />
      </CardContent>
      <CardFooter>
        {footerContent}
      </CardFooter>
    </Card>
  );
};

export default SimplePlanCard;
