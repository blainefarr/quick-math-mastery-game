
import React from 'react';
import { Button } from '@/components/ui/button';
import { Delete } from 'lucide-react';

interface CustomNumberPadProps {
  onNumberPress: (number: string) => void;
  onDelete: () => void;
  onNegativeToggle: () => void;
  isNegative: boolean;
  showNegativeToggle: boolean;
}

const CustomNumberPad: React.FC<CustomNumberPadProps> = ({
  onNumberPress,
  onDelete,
  onNegativeToggle,
  isNegative,
  showNegativeToggle
}) => {
  return (
    <div className="mt-4 w-full mx-auto">
      <div className="grid grid-cols-3 gap-2">
        {/* First row */}
        {[1, 2, 3].map((num) => (
          <Button
            key={num}
            variant="outline"
            onClick={() => onNumberPress(num.toString())}
            className="text-2xl h-16 font-medium bg-primary/10 hover:bg-primary/20 active:bg-primary/30 transition-colors"
            aria-label={num.toString()}
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
            className="text-2xl h-16 font-medium bg-primary/10 hover:bg-primary/20 active:bg-primary/30 transition-colors"
            aria-label={num.toString()}
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
            className="text-2xl h-16 font-medium bg-primary/10 hover:bg-primary/20 active:bg-primary/30 transition-colors"
            aria-label={num.toString()}
          >
            {num}
          </Button>
        ))}
        
        {/* Fourth row */}
        {showNegativeToggle ? (
          <Button
            variant="outline"
            onClick={onNegativeToggle}
            className={`text-2xl h-16 font-medium bg-secondary/20 hover:bg-secondary/30 active:bg-secondary/40 transition-colors ${isNegative ? 'ring-2 ring-primary' : ''}`}
            aria-pressed={isNegative}
            aria-label={isNegative ? "Positive" : "Negative"}
          >
            +/-
          </Button>
        ) : (
          <div></div> // Empty cell when negative numbers are not allowed
        )}
        <Button
          variant="outline"
          onClick={() => onNumberPress('0')}
          className="text-2xl h-16 font-medium bg-primary/10 hover:bg-primary/20 active:bg-primary/30 transition-colors"
          aria-label="0"
        >
          0
        </Button>
        <Button
          variant="outline"
          onClick={onDelete}
          className="text-2xl h-16 font-medium bg-secondary/20 hover:bg-secondary/30 active:bg-secondary/40 transition-colors"
          aria-label="Delete"
        >
          <Delete className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default CustomNumberPad;
