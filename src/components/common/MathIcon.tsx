
import React from 'react';
import { Plus, Minus, X, Divide } from 'lucide-react';
import { Operation } from '@/types';

interface MathIconProps {
  operation: Operation;
  size?: number;
  className?: string;
}

const MathIcon = ({ operation, size = 24, className = '' }: MathIconProps) => {
  // Center the icon using a flex container
  return (
    <span
      className={`inline-flex items-center justify-center w-full h-full ${className}`}
      style={{ minWidth: size, minHeight: size }}
    >
      {operation === "addition" && <Plus size={size} />}
      {operation === "subtraction" && <Minus size={size} />}
      {operation === "multiplication" && <X size={size} />}
      {operation === "division" && <Divide size={size} />}
    </span>
  );
};

export default MathIcon;
