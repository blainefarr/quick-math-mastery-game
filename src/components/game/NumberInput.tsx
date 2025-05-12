
import React, { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useIsMobileOrTablet } from '@/hooks/use-mobile';

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
  const isMobileOrTablet = useIsMobileOrTablet();
  
  // IMPORTANT: On desktop, never set readOnly when using custom number pad
  // This allows keyboard input to work alongside the custom number pad
  const shouldBeReadOnly = readOnly || (useCustomNumberPad && isMobileOrTablet);
  
  // Always use numeric inputMode for keyboard accessibility
  const effectiveInputMode = 'numeric';

  useEffect(() => {
    // Focus the input when component mounts or when the value changes
    if (inputRef.current && !readOnly && !isMobileOrTablet) {
      inputRef.current.focus();
    }
  }, [inputRef, readOnly, isMobileOrTablet]);
  
  useEffect(() => {
    const currentInput = inputRef.current;
    if (currentInput && useCustomNumberPad) {
      // Reset selection when value changes
      const selectionHandler = () => {
        if (isMobileOrTablet) {
          // Move cursor to end without selecting all text on mobile/tablet
          currentInput.setSelectionRange(currentInput.value.length, currentInput.value.length);
        }
      };
      
      currentInput.addEventListener('focus', selectionHandler);
      // Also handle after value updates
      if (value) selectionHandler();
      
      return () => {
        currentInput.removeEventListener('focus', selectionHandler);
      };
    }
  }, [inputRef, value, useCustomNumberPad, isMobileOrTablet]);

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    
    if (onInputInteraction) {
      onInputInteraction();
    }
    
    // Always focus on click - this is crucial for desktop
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

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
        // Only auto-focus on desktop
        autoFocus={!isMobileOrTablet}
        readOnly={shouldBeReadOnly}
        style={{
          MozAppearance: 'textfield',
          WebkitAppearance: 'none',
          appearance: 'none',
          // Only hide cursor on mobile/tablet with custom keypad
          caretColor: useCustomNumberPad && isMobileOrTablet ? 'transparent' : 'auto'
        }}
        onClick={handleClick}
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
