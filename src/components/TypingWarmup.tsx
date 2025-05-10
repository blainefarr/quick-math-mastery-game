import React, { useState, useEffect, useRef } from 'react';
import { useCompactHeight } from '@/hooks/use-compact-height';
import useGame from '@/context/useGame';
import { useGameInput } from '@/hooks/useGameInput';
import GamePlayArea from './common/GamePlayArea';

interface TypingWarmupProps {
  timeLimit: number;
  customNumberPadEnabled: boolean;
  onComplete: (speed: number) => void;
}

const TypingWarmup = ({ timeLimit, customNumberPadEnabled, onComplete }: TypingWarmupProps) => {
  // State
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [currentNumber, setCurrentNumber] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const correctCountRef = useRef(0);
  const { setGameState } = useGame();
  const isCompactHeight = useCompactHeight();

  // Generate a random number between 1 and 20
  const generateRandomNumber = () => {
    const newNumber = Math.floor(Math.random() * 20) + 1;
    return String(newNumber);
  };

  // Keep correctCountRef in sync with correctCount state
  useEffect(() => {
    correctCountRef.current = correctCount;
  }, [correctCount]);

  // Handle correct answer
  const handleCorrectAnswer = () => {
    setCorrectCount(prevCount => prevCount + 1);
    setCurrentNumber(generateRandomNumber());
  };

  // Use the shared hook for input handling
  const {
    userInput,
    setUserInput,
    isNegative,
    feedback,
    setFeedback,
    inputRef,
    handleInputChange,
    handleNumberPress,
    handleDelete,
    toggleNegative,
    handleContainerTouch
  } = useGameInput({
    onCorrectAnswer: handleCorrectAnswer,
    timeLeft,
    correctAnswer: currentNumber,
    customNumberPadEnabled
  });

  // Initialize the game
  useEffect(() => {
    setCurrentNumber(generateRandomNumber());
    
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
    };
  }, []);

  // Handle restart game
  const handleRestartGame = () => {
    setGameState('selection');
  };

  // Question content
  const questionContent = (
    <div className="flex flex-col justify-center items-center text-center">
      <h2 className="text-xl font-bold mb-6">Type the number as fast as you can!</h2>
      <div className="text-4xl md:text-6xl font-bold mb-6">
        {currentNumber}
      </div>
    </div>
  );

  // Mobile instruction message
  const mobileInstruction = (
    <div className="text-center mb-2 text-sm text-muted-foreground">
      Use the keypad below to enter your answer
    </div>
  );

  return (
    <GamePlayArea
      timeLeft={timeLeft}
      scoreLabel="Warmup"
      scoreValue={correctCount}
      questionContent={questionContent}
      userInput={userInput}
      isNegative={isNegative}
      feedback={feedback}
      inputRef={inputRef}
      onInputChange={handleInputChange}
      customNumberPadEnabled={customNumberPadEnabled}
      onNumberPress={handleNumberPress}
      onDelete={handleDelete}
      onNegativeToggle={toggleNegative}
      showNegativeToggle={false}
      onContainerTouch={handleContainerTouch}
      onRestartGame={handleRestartGame}
      footerContent={customNumberPadEnabled && mobileInstruction}
    />
  );
};

export default TypingWarmup;
