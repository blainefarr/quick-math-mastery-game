import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, RotateCw } from 'lucide-react';
import { useCompactHeight } from '@/hooks/use-compact-height';
import CustomNumberPad from './numberpad/CustomNumberPad';
import { toast } from 'sonner';
import useGame from '@/context/useGame';
import { useIsMobile } from '@/hooks/use-mobile';

interface TypingWarmupProps {
  timeLimit: number;
  customNumberPadEnabled: boolean;
  onComplete: (speed: number) => void;
}

const TypingWarmup = ({ timeLimit, customNumberPadEnabled, onComplete }: TypingWarmupProps) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [currentNumber, setCurrentNumber] = useState('');
  const [userInput, setUserInput] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const correctCountRef = useRef(0);
  const isCompactHeight = useCompactHeight();
  const { setGameState } = useGame();
  const isMobile = useIsMobile();
  const focusAttemptsMadeRef = useRef(0);
  const maxFocusAttempts = 10;

  // Generate a random number between 1 and 20
  const generateRandomNumber = () => {
    const newNumber = Math.floor(Math.random() * 20) + 1;
    return String(newNumber);
  };

  // Enhanced focus mechanism with multiple attempts
  const attemptFocus = () => {
    if (timeLeft <= 0 || focusAttemptsMadeRef.current >= maxFocusAttempts) return;
    
    if (inputRef.current) {
      console.log(`Focus attempt ${focusAttemptsMadeRef.current + 1} for TypingWarmup input`);
      inputRef.current.focus();
      
      // Force scroll to input on mobile
      if (isMobile) {
        inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      focusAttemptsMadeRef.current++;
    }
    
    // Continue trying to focus if not at max attempts with adaptive timing
    if (focusAttemptsMadeRef.current < maxFocusAttempts) {
      setTimeout(attemptFocus, isMobile ? 300 : 150);
    }
  };

  // Keep correctCountRef in sync with correctCount state
  useEffect(() => {
    correctCountRef.current = correctCount;
  }, [correctCount]);

  // Initialize the game with improved focus handling
  useEffect(() => {
    setCurrentNumber(generateRandomNumber());
    
    // Reset focus attempts counter
    focusAttemptsMadeRef.current = 0;
    
    // Initial delay before starting focus attempts - increased for better reliability
    const initialDelay = isMobile ? 1000 : 500;
    
    console.log(`Setting initial focus delay of ${initialDelay}ms`);
    setTimeout(attemptFocus, initialDelay);
    
    // Start the timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          // Calculate typing time per problem using the ref value to get the latest count
          const finalCount = correctCountRef.current;
          // Changed calculation: seconds per correct answer (with safety check for division by zero)
          const typingTimePerProblem = finalCount > 0 ? timeLimit / finalCount : 0;
          console.log(`Typing warmup completed with correct count: ${finalCount}, time limit: ${timeLimit}, calculated typing time per problem: ${typingTimePerProblem}`);
          onComplete(typingTimePerProblem);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(timer);
      // Reset focus attempts on unmount
      focusAttemptsMadeRef.current = 0;
    };
  }, []);

  // Handle user input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);
    
    if (value === currentNumber) {
      // Correct input
      setCorrectCount(prevCount => prevCount + 1);
      setUserInput('');
      setCurrentNumber(generateRandomNumber());
    }
  };

  // Handle number pad input
  const handleNumberPress = (number: string) => {
    const newInput = userInput + number;
    setUserInput(newInput);
    
    if (newInput === currentNumber) {
      // Correct input
      setCorrectCount(prevCount => prevCount + 1);
      setUserInput('');
      setCurrentNumber(generateRandomNumber());
    }
  };

  const handleDelete = () => {
    setUserInput(prev => prev.slice(0, -1));
  };

  // Enhanced focus input with better mobile support
  const focusInput = () => {
    // Reset the attempt counter to allow a fresh batch of focus attempts
    focusAttemptsMadeRef.current = 0;
    
    console.log('Manual focus triggered on TypingWarmup input - beginning focus attempts');
    attemptFocus();
  };

  // Handle restart game
  const handleRestartGame = () => {
    setGameState('selection');
  };
  
  // More aggressive touch handler for container to help with focus
  const handleContainerTouch = () => {
    console.log('Container touched - attempting to focus input');
    focusInput();
    
    // For iOS devices, we also click the input directly as a fallback
    if (inputRef.current && isMobile) {
      inputRef.current.click();
    }
  };

  return (
    <div 
      className={`flex justify-center items-center min-h-screen p-4 bg-background ${
        isCompactHeight ? 'pt-0 mt-0' : 'pt-4'
      }`}
      onTouchStart={handleContainerTouch}
      onClick={focusInput}
    >
      <div className={`w-full max-w-xl ${
        isCompactHeight ? 'mt-0' : 'mt-8'
      }`}>
        <div className={`flex justify-between ${
          isCompactHeight ? 'mb-4' : 'mb-8'
        }`}>
          <Card className={`p-3 flex items-center ${timeLeft < 10 ? 'animate-timer-tick text-destructive' : ''}`}>
            <Clock className="mr-2" />
            <span className="text-xl font-bold">{timeLeft}</span>
          </Card>
          <Card className="p-3">
            <span className="font-medium">Warmup: </span>
            <span className="text-xl font-bold">{correctCount}</span>
          </Card>
        </div>

        <Card 
          className={`${
            isCompactHeight ? 'mb-4 py-6' : 'mb-6 py-10'
          } px-6 shadow-lg animate-bounce-in`}
          onClick={(e) => {
            e.stopPropagation();
            focusInput();
          }}
        >
          <CardContent className="flex flex-col justify-center items-center text-center">
            <h2 className="text-xl font-bold mb-6">Type the number as fast as you can!</h2>
            <div className="text-4xl md:text-6xl font-bold mb-6">
              {currentNumber}
            </div>
            <div className="relative flex items-center">
              <Input
                ref={inputRef}
                type="text"
                inputMode={customNumberPadEnabled ? "none" : "numeric"}
                pattern="[0-9]*"
                value={userInput}
                onChange={handleInputChange}
                className="text-4xl md:text-6xl w-24 md:w-32 h-16 text-center font-bold p-0 border-b-4 focus-visible:ring-0 focus-visible:ring-offset-0 appearance-none"
                autoComplete="off"
                autoFocus
                readOnly={customNumberPadEnabled}
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
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Restart button */}
        <div className="flex justify-center mb-4">
          <Button 
            variant="outline" 
            onClick={handleRestartGame} 
            className="flex items-center gap-2"
          >
            <RotateCw className="h-4 w-4" /> Restart Game
          </Button>
        </div>

        {/* Custom Number Pad */}
        {customNumberPadEnabled && (
          <div className="w-full max-w-md mx-auto md:max-w-xl">
            <CustomNumberPad 
              onNumberPress={handleNumberPress}
              onDelete={handleDelete}
              onNegativeToggle={() => {}}
              isNegative={false}
              showNegativeToggle={false}
              onButtonPress={focusInput}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TypingWarmup;
