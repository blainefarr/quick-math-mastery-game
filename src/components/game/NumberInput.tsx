
import React, { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';

interface NumberInputProps {
  inputRef: React.RefObject<HTMLInputElement>;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  isNegative?: boolean;
  feedback?: 'correct' | 'incorrect' | null;
  inputMode?: 'numeric' | 'none';
  onInputInteraction?: () => void;
  useCustomNumberPad?: boolean;
}

const NumberInput: React.FC<NumberInputProps> = ({
  inputRef,
  value,
  onChange,
  readOnly = false,
  isNegative = false,
  feedback = null,
  inputMode = 'numeric',
  onInputInteraction,
  useCustomNumberPad = false
}) => {
  const isMobile = useIsMobile();
  
  // Only set readOnly on mobile with custom number pad
  // Desktop should allow keyboard input even with custom number pad
  const shouldBeReadOnly = readOnly || (useCustomNumberPad && isMobile);
  
  // Always use numeric inputMode on desktop, regardless of custom keypad
  const effectiveInputMode = 'numeric'; // Always allow numeric input for keyboard accessibility
  
  // Prevent text selection when using custom keypad
  useEffect(() => {
    const currentInput = inputRef.current;
    if (currentInput && useCustomNumberPad) {
      // Reset selection when value changes
      const selectionHandler = () => {
        // Move cursor to end without selecting all text
        currentInput.setSelectionRange(currentInput.value.length, currentInput.value.length);
      };
      
      currentInput.addEventListener('focus', selectionHandler);
      // Also handle after value updates
      if (value) selectionHandler();
      
      return () => {
        currentInput.removeEventListener('focus', selectionHandler);
      };
    }
  }, [inputRef, value, useCustomNumberPad]);

  return (
    <div className="relative flex items-center">
      <Input
        ref={inputRef}
        type="text"
        inputMode={effectiveInputMode}
        pattern="[0-9]*"
        value={value}
        onChange={onChange}
        className={`text-4xl md:text-6xl w-24 md:w-32 h-16 text-center font-bold p-0 border-b-4 focus-visible:ring-0 focus-visible:ring-offset-0 appearance-none ${
          feedback === 'correct' ? 'text-success' : 
          feedback === 'incorrect' ? 'text-destructive' : ''
        }`}
        autoComplete="off"
        autoFocus
        readOnly={shouldBeReadOnly}
        style={{
          MozAppearance: 'textfield',
          WebkitAppearance: 'none',
          appearance: 'none',
          caretColor: useCustomNumberPad && isMobile ? 'transparent' : 'auto' // Only hide cursor on mobile with custom keypad
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (isMobile) {
            e.currentTarget.focus();
          }
          if (onInputInteraction) {
            onInputInteraction();
          }
        }}
      />
      {isNegative && (
        <span className="absolute top-1/2 transform -translate-y-1/2 -left-10 text-4xl md:text-6xl z-20 select-none">-</span>
      )}
      {feedback && (
        <div
          className={`absolute top-0 right-0 transform translate-x-full -translate-y-1/4 rounded-full p-1 
            ${feedback === 'correct' ? 'bg-success text-white' : 'bg-destructive text-white'}`}
        >
          {feedback === 'correct' ? '✓' : '✗'}
        </div>
      )}
    </div>
  );
};

export default NumberInput;
