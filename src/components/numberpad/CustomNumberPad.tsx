
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
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

  // Determine button height based on device
  const buttonHeight = isMobile ? 'h-16 sm:h-18' : 'h-14 sm:h-16';
  // Enhanced styles for better visibility on mobile
  const numberButtonClass = `text-3xl ${buttonHeight} font-semibold 
    bg-primary/20 hover:bg-primary/30 active:bg-primary/40 
    transition-colors min-h-[56px] min-w-[56px] 
    select-none touch-manipulation 
    ${isMobile ? 'shadow-md' : ''}`;
  
  const actionButtonClass = `${buttonHeight} font-semibold 
    bg-secondary/25 hover:bg-secondary/35 active:bg-secondary/45 
    transition-colors min-h-[56px] min-w-[56px] 
    select-none touch-manipulation
    ${isMobile ? 'shadow-md' : ''}`;

  return (
    <div className="w-full mx-auto mt-4">
      <div className={`grid grid-cols-3 gap-2 ${isMobile ? 'gap-3' : 'gap-1.5 sm:gap-2'}`}>
        {/* First row */}
        {[1, 2, 3].map((num) => (
          <Button
            key={num}
            variant="outline"
            onPointerDown={() => handleNumberPress(num.toString())}
            className={numberButtonClass}
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
            onPointerDown={() => handleNumberPress(num.toString())}
            className={numberButtonClass}
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
            onPointerDown={() => handleNumberPress(num.toString())}
            className={numberButtonClass}
            aria-label={num.toString()}
          >
            {num}
          </Button>
        ))}
        
        {/* Fourth row */}
        {showNegativeToggle ? (
          <Button
            variant="outline"
            onPointerDown={handleNegativeToggle}
            className={`${actionButtonClass} ${isNegative ? 'ring-2 ring-primary' : ''}`}
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
          onPointerDown={() => handleNumberPress('0')}
          className={numberButtonClass}
          aria-label="0"
        >
          0
        </Button>
        <Button
          variant="outline"
          onPointerDown={handleDelete}
          className={actionButtonClass}
          aria-label="Delete"
        >
          <span className="text-3xl sm:text-4xl font-bold -mt-0.5">←</span>
        </Button>
      </div>
    </div>
  );
};

export default CustomNumberPad;
