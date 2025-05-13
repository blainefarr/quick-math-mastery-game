
import React from 'react';
import FeatureIcon from './FeatureIcon';

interface Feature {
  icon: string;
  text: string;
}

interface FeatureListProps {
  features: Feature[];
  className?: string;
}

const FeatureList: React.FC<FeatureListProps> = ({ features, className = "space-y-6" }) => {
  return (
    <ul className={className}>
      {features.map((feature, index) => (
        <li key={index} className="flex items-center">
          <FeatureIcon name={feature.icon} />
          <span className="ml-2">{feature.text}</span>
        </li>
      ))}
    </ul>
  );
};

export default FeatureList;
