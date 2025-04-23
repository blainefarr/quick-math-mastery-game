
import React from 'react';
import { Plus, Minus, X, Divide } from 'lucide-react';
import { Operation } from '@/types';

interface MathIconProps {
  operation: Operation;
  size?: number;
  className?: string;
}

const MathIcon = ({ operation, size = 24, className = '' }: MathIconProps) => {
  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="flex items-center justify-center">
        {operation === "addition" && <Plus size={size} />}
        {operation === "subtraction" && <Minus size={size} />}
        {operation === "multiplication" && <X size={size} />}
        {operation === "division" && <Divide size={size} />}
      </div>
    </div>
  );
};

export default MathIcon;
