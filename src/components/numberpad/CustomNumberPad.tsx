
import React from 'react';
import { Button } from '@/components/ui/button';
import { Delete } from 'lucide-react';

interface CustomNumberPadProps {
  onNumberPress: (number: string) => void;
  onDelete: () => void;
  onNegativeToggle: () => void;
  isNegative: boolean;
}

const CustomNumberPad: React.FC<CustomNumberPadProps> = ({
  onNumberPress,
  onDelete,
  onNegativeToggle,
  isNegative
}) => {
  return (
    <div className="mt-4 w-full max-w-xs mx-auto">
      <div className="grid grid-cols-3 gap-2">
        {/* First row */}
        {[1, 2, 3].map((num) => (
          <Button
            key={num}
            variant="outline"
            onClick={() => onNumberPress(num.toString())}
            className="text-xl h-14 font-medium"
          >
            {num}
          </Button>
        ))}
        
        {/* Second row */}
        {[4, 5, 6].map((num) => (
          <Button
            key={num}
            variant="outline"
            onClick={() => onNumberPress(num.toString())}
            className="text-xl h-14 font-medium"
          >
            {num}
          </Button>
        ))}
        
        {/* Third row */}
        {[7, 8, 9].map((num) => (
          <Button
            key={num}
            variant="outline"
            onClick={() => onNumberPress(num.toString())}
            className="text-xl h-14 font-medium"
          >
            {num}
          </Button>
        ))}
        
        {/* Fourth row */}
        <Button
          variant="outline"
          onClick={onNegativeToggle}
          className={`text-xl h-14 font-medium ${isNegative ? 'bg-muted' : ''}`}
          aria-pressed={isNegative}
          aria-label={isNegative ? "Positive" : "Negative"}
        >
          +/-
        </Button>
        <Button
          variant="outline"
          onClick={() => onNumberPress('0')}
          className="text-xl h-14 font-medium"
        >
          0
        </Button>
        <Button
          variant="outline"
          onClick={onDelete}
          className="text-xl h-14 font-medium"
          aria-label="Delete"
        >
          <Delete className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default CustomNumberPad;
