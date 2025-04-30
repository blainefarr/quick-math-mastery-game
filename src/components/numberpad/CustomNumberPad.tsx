
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
  const touchedButtons = useRef<Set<string>>(new Set());
  
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

  // Handle touch start - register the touch but don't trigger action yet
  const handleTouchStart = useCallback((e: React.TouchEvent, buttonId: string) => {
    e.preventDefault(); // Prevent default to avoid delays
    // Add this button to our tracked set
    touchedButtons.current.add(buttonId);
  }, []);

  // Handle touch end - only trigger if this was a legitimate touch that started on this button
  const handleTouchEnd = useCallback((e: React.TouchEvent, buttonId: string, callback: () => void) => {
    e.preventDefault();
    // Only trigger if we recorded a touch start on this button
    if (touchedButtons.current.has(buttonId)) {
      touchedButtons.current.delete(buttonId);
      callback();
    }
  }, []);
  
  // Clear button tracking when touch is canceled or moved outside
  const handleTouchCancel = useCallback((e: React.TouchEvent, buttonId: string) => {
    e.preventDefault();
    touchedButtons.current.delete(buttonId);
  }, []);

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
              onClick={() => handleNumberPress(num.toString())}
              onTouchStart={(e) => handleTouchStart(e, buttonId)}
              onTouchEnd={(e) => handleTouchEnd(e, buttonId, () => handleNumberPress(num.toString()))}
              onTouchCancel={(e) => handleTouchCancel(e, buttonId)}
              className="text-3xl h-16 font-semibold bg-primary/15 hover:bg-primary/25 active:bg-primary/40 transition-colors"
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
              onClick={() => handleNumberPress(num.toString())}
              onTouchStart={(e) => handleTouchStart(e, buttonId)}
              onTouchEnd={(e) => handleTouchEnd(e, buttonId, () => handleNumberPress(num.toString()))}
              onTouchCancel={(e) => handleTouchCancel(e, buttonId)}
              className="text-3xl h-16 font-semibold bg-primary/15 hover:bg-primary/25 active:bg-primary/40 transition-colors"
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
              onClick={() => handleNumberPress(num.toString())}
              onTouchStart={(e) => handleTouchStart(e, buttonId)}
              onTouchEnd={(e) => handleTouchEnd(e, buttonId, () => handleNumberPress(num.toString()))}
              onTouchCancel={(e) => handleTouchCancel(e, buttonId)}
              className="text-3xl h-16 font-semibold bg-primary/15 hover:bg-primary/25 active:bg-primary/40 transition-colors"
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
            onClick={handleNegativeToggle}
            onTouchStart={(e) => handleTouchStart(e, 'toggle-negative')}
            onTouchEnd={(e) => handleTouchEnd(e, 'toggle-negative', handleNegativeToggle)}
            onTouchCancel={(e) => handleTouchCancel(e, 'toggle-negative')}
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
          onTouchStart={(e) => handleTouchStart(e, 'num-0')}
          onTouchEnd={(e) => handleTouchEnd(e, 'num-0', () => handleNumberPress('0'))}
          onTouchCancel={(e) => handleTouchCancel(e, 'num-0')}
          className="text-3xl h-16 font-semibold bg-primary/15 hover:bg-primary/25 active:bg-primary/40 transition-colors"
          aria-label="0"
        >
          0
        </Button>
        <Button
          variant="outline"
          onClick={handleDelete}
          onTouchStart={(e) => handleTouchStart(e, 'delete')}
          onTouchEnd={(e) => handleTouchEnd(e, 'delete', handleDelete)}
          onTouchCancel={(e) => handleTouchCancel(e, 'delete')}
          className="h-16 font-semibold bg-secondary/20 hover:bg-secondary/30 active:bg-secondary/40 transition-colors"
          aria-label="Delete"
        >
          
            <Delete className="h-10 w-10 stroke-[2.5] shrink-0" />
          
        </Button>
      </div>
    </div>
  );
};

export default CustomNumberPad;
