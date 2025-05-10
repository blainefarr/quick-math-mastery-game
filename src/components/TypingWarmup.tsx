import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import useGame from '@/context/useGame';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFocusManagement } from '@/hooks/use-focus-management';
import GameContainer from './game/GameContainer';
import GameCard from './game/GameCard';
import NumberInput from './game/NumberInput';
import NumberPadContainer from './game/NumberPadContainer';

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
  const [feedback, setFeedback] = useState<'correct' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const correctCountRef = useRef(0);
  const { setGameState } = useGame();
  const hasEndedRef = useRef(false);
  
  // Set up focus management
  const { focusInput, attemptFocus, cleanupFocus } = useFocusManagement({
    inputRef,
    hasEnded: hasEndedRef.current
  });

  // Generate a random number between 1 and 20
  const generateRandomNumber = () => {
    const newNumber = Math.floor(Math.random() * 20) + 1;
    return String(newNumber);
  };

  // Keep correctCountRef in sync with correctCount state
  useEffect(() => {
    correctCountRef.current = correctCount;
  }, [correctCount]);

  // Initialize the game with improved focus handling
  useEffect(() => {
    setCurrentNumber(generateRandomNumber());
    
    // Initial delay before starting focus attempts - increased for better reliability
    const initialDelay = 1000;
    
    console.log(`Setting initial focus delay of ${initialDelay}ms`);
    setTimeout(attemptFocus, initialDelay);
    
    // Start the timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          hasEndedRef.current = true;
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
      cleanupFocus();
    };
  }, []);

  // Handle user input for keyboard typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);
    
    if (value === currentNumber) {
      processCorrectAnswer();
    }
  };

  // Process a correct answer with feedback
  const processCorrectAnswer = () => {
    // Show feedback
    setFeedback('correct');
    
    // Use setTimeout to allow the UI to update before showing feedback
    setTimeout(() => {
      // Increment score
      setCorrectCount(prevCount => prevCount + 1);
      
      // Clear feedback and move to next number after a brief delay
      setTimeout(() => {
        setUserInput('');
        setFeedback(null);
        setCurrentNumber(generateRandomNumber());
      }, 100);
    }, 250);
  };

  // Handle number pad input with improved feedback like GameScreen
  const handleNumberPress = (number: string) => {
    // Add the pressed number to current input
    const newInput = userInput + number;
    setUserInput(newInput);
    
    // Check if the answer is correct
    if (newInput === currentNumber) {
      processCorrectAnswer();
    }
  };

  const handleDelete = () => {
    setUserInput(prev => prev.slice(0, -1));
  };

  // Handle restart game
  const handleRestartGame = () => {
    setGameState('selection');
  };

  // Handler for card interaction
  const handleCardInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    focusInput();
  };

  return (
    <GameContainer
      timeLeft={timeLeft}
      score={correctCount}
      scoreLabel="Warmup:"
      onContainerInteraction={focusInput}
    >
      <GameCard
        feedback={feedback}
        onCardInteraction={handleCardInteraction}
      >
        <h2 className="text-xl font-bold mb-6">Type the number as fast as you can!</h2>
        <div className="text-4xl md:text-6xl font-bold mb-6">
          {currentNumber}
        </div>
        <NumberInput
          inputRef={inputRef}
          value={userInput}
          onChange={handleInputChange}
          readOnly={customNumberPadEnabled}
          feedback={feedback}
          inputMode={customNumberPadEnabled ? "none" : "numeric"}
          onInputInteraction={focusInput}
        />
      </GameCard>

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

      {/* Custom Number Pad with improved mobile styling */}
      <NumberPadContainer
        enabled={customNumberPadEnabled}
        onNumberPress={handleNumberPress}
        onDelete={handleDelete}
        onNegativeToggle={() => {}}
        isNegative={false}
        showNegativeToggle={false}
        onButtonPress={focusInput}
      />
    </GameContainer>
  );
};

export default TypingWarmup;
