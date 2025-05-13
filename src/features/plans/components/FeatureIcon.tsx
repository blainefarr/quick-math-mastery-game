
import React from 'react';
import { Check, User, Users, Goal, LineChart, Keyboard, ClipboardList, CircleCheck, Lock, School } from 'lucide-react';

type FeatureIconProps = {
  name: string;
};

const FeatureIcon: React.FC<FeatureIconProps> = ({ name }) => {
  switch (name) {
    case 'users':
      return <Users className="h-5 w-5 text-primary" />;
    case 'user':
      return <User className="h-5 w-5 text-primary" />;
    case 'goals':
      return <Goal className="h-5 w-5 text-primary" />;
    case 'progress':
      return <LineChart className="h-5 w-5 text-primary" />;
    case 'typing':
      return <Keyboard className="h-5 w-5 text-primary" />;
    case 'reports':
      return <LineChart className="h-5 w-5 text-primary" />;
    case 'roster':
      return <ClipboardList className="h-5 w-5 text-primary" />;
    case 'saved':
      return <CircleCheck className="h-5 w-5 text-primary" />;
    case 'clever':
      return <Lock className="h-5 w-5 text-primary" />;
    case 'clipboard':
      return <ClipboardList className="h-5 w-5 text-primary" />;
    case 'school':
      return <School className="h-5 w-5 text-primary" />;
    default:
      return <Check className="h-5 w-5 text-primary" />;
  }
};

export default FeatureIcon;
