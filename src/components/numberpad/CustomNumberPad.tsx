
import React from 'react';
import { Delete } from 'lucide-react';

interface CustomNumberPadProps {
  onNumberPress: (number: string) => void;
  onBackspace: () => void;
  onToggleSign: () => void;
  isNegative: boolean;
}

const CustomNumberPad: React.FC<CustomNumberPadProps> = ({
  onNumberPress,
  onBackspace,
  onToggleSign,
  isNegative
}) => {
  const handleNumberClick = (number: string) => {
    onNumberPress(number);
  };

  const buttonClass = "flex items-center justify-center h-14 rounded-md bg-muted/60 hover:bg-muted/80 transition-colors text-xl font-medium";
  const operationButtonClass = "flex items-center justify-center h-14 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors text-muted-foreground";

  return (
    <div className="animate-fade-in w-full max-w-md mx-auto mt-4">
      <div className="grid grid-cols-3 gap-2">
        <button 
          className={buttonClass}
          onClick={() => handleNumberClick('1')}
          aria-label="Number 1"
        >
          1
        </button>
        <button 
          className={buttonClass}
          onClick={() => handleNumberClick('2')}
          aria-label="Number 2"
        >
          2
        </button>
        <button 
          className={buttonClass}
          onClick={() => handleNumberClick('3')}
          aria-label="Number 3"
        >
          3
        </button>
        <button 
          className={buttonClass}
          onClick={() => handleNumberClick('4')}
          aria-label="Number 4"
        >
          4
        </button>
        <button 
          className={buttonClass}
          onClick={() => handleNumberClick('5')}
          aria-label="Number 5"
        >
          5
        </button>
        <button 
          className={buttonClass}
          onClick={() => handleNumberClick('6')}
          aria-label="Number 6"
        >
          6
        </button>
        <button 
          className={buttonClass}
          onClick={() => handleNumberClick('7')}
          aria-label="Number 7"
        >
          7
        </button>
        <button 
          className={buttonClass}
          onClick={() => handleNumberClick('8')}
          aria-label="Number 8"
        >
          8
        </button>
        <button 
          className={buttonClass}
          onClick={() => handleNumberClick('9')}
          aria-label="Number 9"
        >
          9
        </button>
        <button 
          className={operationButtonClass}
          onClick={onToggleSign}
          aria-label="Toggle positive or negative"
        >
          {isNegative ? '+' : '−'}
        </button>
        <button 
          className={buttonClass}
          onClick={() => handleNumberClick('0')}
          aria-label="Number 0"
        >
          0
        </button>
        <button 
          className={operationButtonClass}
          onClick={onBackspace}
          aria-label="Backspace"
        >
          <Delete size={20} />
        </button>
      </div>
    </div>
  );
};

export default CustomNumberPad;
