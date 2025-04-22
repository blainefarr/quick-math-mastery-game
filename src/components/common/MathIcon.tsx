
import React from 'react';
import { Plus, Minus, X, Divide } from 'lucide-react';
import { Operation } from '@/types';

interface MathIconProps {
  operation: Operation;
  size?: number;
  className?: string;
}

const MathIcon = ({ operation, size = 24, className = '' }: MathIconProps) => {
  switch (operation) {
    case 'addition':
      return <Plus size={size} className={className} />;
    case 'subtraction':
      return <Minus size={size} className={className} />;
    case 'multiplication':
      return <X size={size} className={className} />;
    case 'division':
      return <Divide size={size} className={className} />;
    default:
      return null;
  }
};

export default MathIcon;
