
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock } from 'lucide-react';
import { useCompactHeight } from '@/hooks/use-compact-height';
import CustomNumberPad from './numberpad/CustomNumberPad';
import { toast } from 'sonner';

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isCompactHeight = useCompactHeight();
  
  // Generate a random number between 1 and 20
  const generateRandomNumber = () => {
    const newNumber = Math.floor(Math.random() * 20) + 1;
    return String(newNumber);
  };

  // Initialize the game
  useEffect(() => {
    setCurrentNumber(generateRandomNumber());
    inputRef.current?.focus();
    
    // Start the timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          const typingSpeed = correctCount / timeLimit;
          
          // Enter transition phase
          setIsTransitioning(true);
          setCountdown(3);
          
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Handle the transition countdown
  useEffect(() => {
    if (isTransitioning && countdown !== null) {
      if (countdown > 0) {
        const countdownTimer = setTimeout(() => {
          setCountdown(countdown - 1);
        }, 1000);
        return () => clearTimeout(countdownTimer);
      } else {
        const typingSpeed = correctCount / timeLimit;
        onComplete(typingSpeed);
      }
    }
  }, [isTransitioning, countdown, correctCount, timeLimit, onComplete]);

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

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div className={`flex justify-center items-center min-h-screen p-4 bg-background ${
      isCompactHeight ? 'pt-0 mt-0' : 'pt-4'
    }`}>
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

        {isTransitioning ? (
          <Card className={`${
            isCompactHeight ? 'mb-4 py-6' : 'mb-6 py-10'
          } px-6 shadow-lg animate-fade-in`}>
            <CardContent className="flex flex-col justify-center items-center text-center gap-4">
              <h2 className="text-2xl font-bold mt-4">Let's now do math questions!</h2>
              <div className="text-4xl font-bold mt-2">
                {countdown}
              </div>
              <p className="text-muted-foreground mt-2">Prepare yourself...</p>
            </CardContent>
          </Card>
        ) : (
          <Card className={`${
            isCompactHeight ? 'mb-4 py-6' : 'mb-6 py-10'
          } px-6 shadow-lg animate-bounce-in`}>
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
                  autoFocus
                  readOnly={customNumberPadEnabled}
                  style={{
                    MozAppearance: 'textfield',
                    WebkitAppearance: 'none',
                    appearance: 'none'
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Custom Number Pad */}
        {customNumberPadEnabled && !isTransitioning && (
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
