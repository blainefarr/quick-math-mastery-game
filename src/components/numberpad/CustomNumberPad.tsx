
import React, { useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Delete } from 'lucide-react';

interface CustomNumberPadProps {
  onNumberPress: (number: string) => void;
  onDelete: () => void;
  onNegativeToggle: () => void;
  isNegative: boolean;
  showNegativeToggle: boolean;
  onButtonPress?: () => void;
}

const CustomNumberPad: React.FC<CustomNumberPadProps> = ({
  onNumberPress,
  onDelete,
  onNegativeToggle,
  isNegative,
  showNegativeToggle,
  onButtonPress
}) => {
  // Track which buttons have been touched to prevent double triggers
  
  // Create a wrapper for button presses that calls both handlers
  const handleNumberPress = useCallback((number: string) => {
    onNumberPress(number);
    if (onButtonPress) onButtonPress();
  }, [onNumberPress, onButtonPress]);

  // Similarly for delete
  const handleDelete = useCallback(() => {
    onDelete();
    if (onButtonPress) onButtonPress();
  }, [onDelete, onButtonPress]);

  // And for negative toggle
  const handleNegativeToggle = useCallback(() => {
    onNegativeToggle();
    if (onButtonPress) onButtonPress();
  }, [onNegativeToggle, onButtonPress]);

  return (
    <div className="w-full mx-auto mt-4">
      <div className="grid grid-cols-3 gap-2">
        {/* First row */}
        {[1, 2, 3].map((num) => {
          const buttonId = `num-${num}`;
          return (
            <Button
              key={num}
              variant="outline"
              onPointerDown={() => handleNumberPress(...)}
              className="text-3xl h-16 font-semibold bg-primary/15 hover:bg-primary/25 active:bg-primary/40 transition-colors min-h-[48px] min-w-[48px] select-none touch-manipulation"
              aria-label={num.toString()}
            >
              {num}
            </Button>
          );
        })}
        
        {/* Second row */}
        {[4, 5, 6].map((num) => {
          const buttonId = `num-${num}`;
          return (
            <Button
              key={num}
              variant="outline"
              onPointerDown={() => handleNumberPress(...)}
              className="text-3xl h-16 font-semibold bg-primary/15 hover:bg-primary/25 active:bg-primary/40 transition-colors min-h-[48px] min-w-[48px] select-none touch-manipulation"
              aria-label={num.toString()}
            >
              {num}
            </Button>
          );
        })}
        
        {/* Third row */}
        {[7, 8, 9].map((num) => {
          const buttonId = `num-${num}`;
          return (
            <Button
              key={num}
              variant="outline"
              onPointerDown={() => handleNumberPress(...)}
              className="text-3xl h-16 font-semibold bg-primary/15 hover:bg-primary/25 active:bg-primary/40 transition-colors min-h-[48px] min-w-[48px] select-none touch-manipulation"
              aria-label={num.toString()}
            >
              {num}
            </Button>
          );
        })}
        
        {/* Fourth row */}
        {showNegativeToggle ? (
          <Button
            variant="outline"
            onPointerDown={() => handleNumberPress(...)}
            className={`text-3xl h-16 font-semibold bg-secondary/20 hover:bg-secondary/30 active:bg-secondary/40 transition-colors min-h-[48px] min-w-[48px] select-none touch-manipulation ${isNegative ? 'ring-2 ring-primary' : ''}`}
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
          onPointerDown={() => handleNumberPress(...)}
          className="text-3xl h-16 font-semibold bg-primary/15 hover:bg-primary/25 active:bg-primary/40 transition-colors min-h-[48px] min-w-[48px] select-none touch-manipulation"
          aria-label="0"
        >
          0
        </Button>
        <Button
          variant="outline"
          onPointerDown={() => handleNumberPress(...)}
          className="h-16 font-semibold bg-secondary/20 hover:bg-secondary/30 active:bg-secondary/40 transition-colors min-h-[48px] min-w-[48px] select-none touch-manipulation"
          aria-label="Delete"
        >
          
          <span className="text-3xl sm:text-4xl font-bold -mt-0.5">←</span>
          
        </Button>
      </div>
    </div>
  );
};

export default CustomNumberPad;
