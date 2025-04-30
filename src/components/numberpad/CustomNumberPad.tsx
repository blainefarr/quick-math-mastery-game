
import React, { useCallback } from 'react';
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

  // Improve touch responsiveness by handling touch events directly
  const handleTouchStart = useCallback((e: React.TouchEvent, callback: () => void) => {
    e.preventDefault(); // Prevent default to avoid delays
    callback();
  }, []);

  return (
    <div className="w-full mx-auto mt-4">
      <div className="grid grid-cols-3 gap-2">
        {/* First row */}
        {[1, 2, 3].map((num) => (
          <Button
            key={num}
            variant="outline"
            onClick={() => handleNumberPress(num.toString())}
            onTouchStart={(e) => handleTouchStart(e, () => handleNumberPress(num.toString()))}
            className="text-3xl h-16 font-semibold bg-primary/15 hover:bg-primary/25 active:bg-primary/40 transition-colors"
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
            onClick={() => handleNumberPress(num.toString())}
            onTouchStart={(e) => handleTouchStart(e, () => handleNumberPress(num.toString()))}
            className="text-3xl h-16 font-semibold bg-primary/15 hover:bg-primary/25 active:bg-primary/40 transition-colors"
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
            onClick={() => handleNumberPress(num.toString())}
            onTouchStart={(e) => handleTouchStart(e, () => handleNumberPress(num.toString()))}
            className="text-3xl h-16 font-semibold bg-primary/15 hover:bg-primary/25 active:bg-primary/40 transition-colors"
            aria-label={num.toString()}
          >
            {num}
          </Button>
        ))}
        
        {/* Fourth row */}
        {showNegativeToggle ? (
          <Button
            variant="outline"
            onClick={handleNegativeToggle}
            onTouchStart={(e) => handleTouchStart(e, () => handleNegativeToggle())}
            className={`text-3xl h-16 font-semibold bg-secondary/20 hover:bg-secondary/30 active:bg-secondary/40 transition-colors ${isNegative ? 'ring-2 ring-primary' : ''}`}
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
          onClick={() => handleNumberPress('0')}
          onTouchStart={(e) => handleTouchStart(e, () => handleNumberPress('0'))}
          className="text-3xl h-16 font-semibold bg-primary/15 hover:bg-primary/25 active:bg-primary/40 transition-colors"
          aria-label="0"
        >
          0
        </Button>
        <Button
          variant="outline"
          onClick={handleDelete}
          onTouchStart={(e) => handleTouchStart(e, () => handleDelete())}
          className="h-16 font-semibold bg-secondary/20 hover:bg-secondary/30 active:bg-secondary/40 transition-colors"
          aria-label="Delete"
        >
          <div className="flex items-center justify-center w-full h-full">
            <Delete className="h-8 w-8 stroke-[2.5] shrink-0" />
          </div>
        </Button>
      </div>
    </div>
  );
};

export default CustomNumberPad;
