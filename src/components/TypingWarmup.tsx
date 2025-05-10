import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import useGame from '@/context/useGame';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFocusManagement } from '@/hooks/use-focus-management';
import { useFeedbackManagement } from '@/hooks/use-feedback-management';
import { useTimerManagement } from '@/hooks/use-timer-management';
import { calculateAnswerRange, generateRandomInRange } from '@/utils/answerRangeCalculator';
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
  const [currentNumber, setCurrentNumber] = useState('');
  const [previousNumber, setPreviousNumber] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const correctCountRef = useRef(0);
  const { setGameState, settings } = useGame();
  const hasEndedRef = useRef(false);
  
  // Use the feedback management hook
  const { feedback, showFeedback, cleanupFeedback } = useFeedbackManagement({
    feedbackDuration: 100 // Consistent with game play
  });
  
  // Use the timer management hook
  const { timeLeft } = useTimerManagement({
    initialTime: timeLimit,
    onTimerComplete: () => {
      hasEndedRef.current = true;
      // Calculate typing time per problem using the ref value to get the latest count
      const finalCount = correctCountRef.current;
      // Changed calculation: seconds per correct answer (with safety check for division by zero)
      const typingTimePerProblem = finalCount > 0 ? timeLimit / finalCount : 0;
      console.log(`Typing warmup completed with correct count: ${finalCount}, time limit: ${timeLimit}, calculated typing time per problem: ${typingTimePerProblem}`);
      onComplete(typingTimePerProblem);
    }
  });
  
  // Set up focus management
  const { focusInput, attemptFocus, cleanupFocus } = useFocusManagement({
    inputRef,
    hasEnded: hasEndedRef.current
  });

  // Generate a random number based on answer range from current game settings
  // Now accepts previousNumber to avoid repeats
  const generateTargetNumber = (prevNumber: string | null): string => {
    // Calculate appropriate range based on game settings
    const answerRange = calculateAnswerRange(
      settings.operation,
      settings.range,
      settings.allowNegatives || false
    );
    
    // Log the calculated range for debugging
    console.log(`Generated answer range for ${settings.operation}: ${answerRange.min} to ${answerRange.max}`);
    
    // Maximum number of attempts to avoid an infinite loop
    const MAX_ATTEMPTS = 10;
    let attempts = 0;
    let newNumber: string;
    
    // Keep generating until we get a different number than the previous one
    // or until we reach the max attempts
    do {
      // Generate a number within the calculated range
      const randomNum = generateRandomInRange(answerRange.min, answerRange.max);
      newNumber = String(randomNum);
      attempts++;
      
      // If the range is very small (only 1 or 2 possible values), we might not be able
      // to generate a different number, so break after a few attempts
      if (attempts >= MAX_ATTEMPTS) {
        console.log(`Reached maximum attempts (${MAX_ATTEMPTS}) to generate a different number`);
        break;
      }
    } while (newNumber === prevNumber);
    
    return newNumber;
  };

  // Keep correctCountRef in sync with correctCount state
  useEffect(() => {
    correctCountRef.current = correctCount;
  }, [correctCount]);

  // Initialize the game with improved focus handling
  useEffect(() => {
    const initialNumber = generateTargetNumber(null);
    setCurrentNumber(initialNumber);
    setPreviousNumber(null);
    
    // Initial delay before starting focus attempts - increased for better reliability
    const initialDelay = 1000;
    
    console.log(`Setting initial focus delay of ${initialDelay}ms`);
    setTimeout(attemptFocus, initialDelay);
    
    return () => {
      cleanupFocus();
      cleanupFeedback();
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
    showFeedback('correct');
    
    // Use setTimeout to allow the UI to update before showing feedback
    setTimeout(() => {
      // Increment score
      setCorrectCount(prevCount => prevCount + 1);
      
      // Clear feedback and move to next number after a brief delay
      setTimeout(() => {
        // Save the current number as previous before generating a new one
        setPreviousNumber(currentNumber);
        setUserInput('');
        
        // Generate a new number that isn't the same as the current one
        const newNumber = generateTargetNumber(currentNumber);
        setCurrentNumber(newNumber);
      }, 100);
    }, 100);
  };

  // Handle number pad input with improved feedback
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

      {/* Restart button moved to bottom */}
      <div className="flex justify-center mt-4">
        <Button 
          variant="outline" 
          onClick={handleRestartGame} 
          className="flex items-center gap-2"
        >
          <RotateCw className="h-4 w-4" /> Restart Game
        </Button>
      </div>
    </GameContainer>
  );
};

export default TypingWarmup;
