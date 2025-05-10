
import React from 'react';
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
}

const NumberInput: React.FC<NumberInputProps> = ({
  inputRef,
  value,
  onChange,
  readOnly = false,
  isNegative = false,
  feedback = null,
  inputMode = 'numeric',
  onInputInteraction
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="relative flex items-center">
      <Input
        ref={inputRef}
        type="text"
        inputMode={inputMode}
        pattern="[0-9]*"
        value={value}
        onChange={onChange}
        className={`text-4xl md:text-6xl w-24 md:w-32 h-16 text-center font-bold p-0 border-b-4 focus-visible:ring-0 focus-visible:ring-offset-0 appearance-none ${
          feedback === 'correct' ? 'text-success' : 
          feedback === 'incorrect' ? 'text-destructive' : ''
        }`}
        autoComplete="off"
        autoFocus
        readOnly={readOnly}
        style={{
          MozAppearance: 'textfield',
          WebkitAppearance: 'none',
          appearance: 'none'
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
