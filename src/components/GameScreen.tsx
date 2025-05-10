
import React, { useState, useEffect, useRef } from 'react';
import useGame from '@/context/useGame';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';
import MathIcon from './common/MathIcon';
import { useFocusManagement } from '@/hooks/use-focus-management';
import { useFeedbackManagement } from '@/hooks/use-feedback-management';
import GameContainer from './game/GameContainer';
import GameCard from './game/GameCard';
import NumberInput from './game/NumberInput';
import NumberPadContainer from './game/NumberPadContainer';

const GameScreen = () => {
  const {
    score,
    incrementScore,
    currentProblem,
    generateNewProblem,
    timeLeft,
    userAnswer,
    setUserAnswer,
    settings,
    endGame,
    setGameState
  } = useGame();

  const [isNegative, setIsNegative] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialProblemGeneratedRef = useRef(false);
  const hasEndedRef = useRef(false);
  
  // Learner mode states
  const [isShowingAnswer, setIsShowingAnswer] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [currentQuestionShown, setCurrentQuestionShown] = useState(false);
  const learnerTimeoutRef = useRef<number | null>(null);
  const showAnswerTimeoutRef = useRef<number | null>(null);

  // Use the feedback management hook
  const { feedback, showFeedback, clearFeedback, cleanupFeedback } = useFeedbackManagement();

  // Setup focus management
  const { focusInput, attemptFocus, cleanupFocus } = useFocusManagement({
    inputRef,
    hasEnded: hasEndedRef.current
  });

  useEffect(() => {
    if (timeLeft <= 0) {
      hasEndedRef.current = true;
    } else {
      hasEndedRef.current = false;
    }
  }, [timeLeft]);

  useEffect(() => {
    console.log('GameScreen mounted with settings:', settings);
    
    setUserAnswer('');
    
    if (!initialProblemGeneratedRef.current) {
      generateNewProblem(
        settings.operation, 
        settings.range,
        settings.allowNegatives || false,
        settings.focusNumber || null
      );
      initialProblemGeneratedRef.current = true;
    }
    
    // Initial delay before starting focus attempts - increased for better reliability
    const initialDelay = 1000;
    
    console.log(`Setting initial focus delay of ${initialDelay}ms`);
    setTimeout(attemptFocus, initialDelay);
    
    return () => {
      initialProblemGeneratedRef.current = false;
      clearLearnerModeTimeouts();
      cleanupFocus();
      cleanupFeedback();
    };
  }, []);

  useEffect(() => {
    setIsNegative(false);
    setIsShowingAnswer(false);
    setShowEncouragement(false);
    setCurrentQuestionShown(false);
    clearLearnerModeTimeouts();
    
    // Set up learner mode timer for the new problem
    if (settings.learnerMode && currentProblem) {
      startLearnerModeTimer();
    }
  }, [currentProblem]);
  
  // Clean up timeouts when leaving the page
  useEffect(() => {
    return () => {
      clearLearnerModeTimeouts();
    };
  }, []);
  
  const clearLearnerModeTimeouts = () => {
    if (learnerTimeoutRef.current) {
      window.clearTimeout(learnerTimeoutRef.current);
      learnerTimeoutRef.current = null;
    }
    if (showAnswerTimeoutRef.current) {
      window.clearTimeout(showAnswerTimeoutRef.current);
      showAnswerTimeoutRef.current = null;
    }
  };
  
  const startLearnerModeTimer = () => {
    if (settings.learnerMode && !hasEndedRef.current) {
      // Clear any existing timeouts
      clearLearnerModeTimeouts();
      
      // Set timeout to show answer after 6 seconds
      learnerTimeoutRef.current = window.setTimeout(() => {
        if (!hasEndedRef.current && currentProblem) {
          // Convert answer to string and handle negative numbers
          const answerStr = String(Math.abs(currentProblem.answer));
          
          // Show the answer
          setUserAnswer(answerStr);
          setIsNegative(currentProblem.answer < 0);
          setIsShowingAnswer(true);
          setCurrentQuestionShown(true);
          
          // Set timeout to hide answer and prompt retry after 2 seconds
          showAnswerTimeoutRef.current = window.setTimeout(() => {
            if (!hasEndedRef.current) {
              setUserAnswer('');
              setIsShowingAnswer(false);
              setShowEncouragement(true);
              inputRef.current?.focus();
            }
          }, 2000);
        }
      }, 6000);
    }
  };

  const getOperationSymbol = () => {
    if (!currentProblem) return '';
    switch (currentProblem.operation) {
      case 'addition': return '+';
      case 'subtraction': return '−';
      case 'multiplication': return '×';
      case 'division': return '÷';
      default: return '';
    }
  };

  const handleRestartGame = () => {
    console.log('Restarting game early, not saving the score');
    clearLearnerModeTimeouts();
    setGameState('selection');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const cleanValue = rawValue.replace(/^-/, '');
    
    // Don't update input if we're showing the answer in learner mode
    if (!isShowingAnswer) {
      setUserAnswer(cleanValue);
    }

    if (hasEndedRef.current || isShowingAnswer) {
      console.log('Game has ended or showing answer, not processing input');
      return;
    }

    if (currentProblem && cleanValue.trim() !== "") {
      const numericValue = isNegative ? -Number(cleanValue) : Number(cleanValue);
      if (numericValue === currentProblem.answer) {
        showFeedback('correct');
        
        // Always increment score when user enters correct answer, even after hint was shown
        incrementScore();
        
        // Clear learner mode timeouts
        clearLearnerModeTimeouts();
        
        setTimeout(() => {
          setUserAnswer('');
          setIsNegative(false);
          setShowEncouragement(false);
          setCurrentQuestionShown(false);
          
          generateNewProblem(
            settings.operation, 
            settings.range,
            settings.allowNegatives || false,
            settings.focusNumber || null
          );
          
          inputRef.current?.focus();
        }, 100);
      }
    }
  };

  const handleNumberPress = (number: string) => {
    if (isShowingAnswer || hasEndedRef.current) return;
    
    // Fix: Using direct string instead of function with prevAnswer parameter
    setUserAnswer(userAnswer + number);
    
    // Check if this is the correct answer
    if (currentProblem) {
      const numericValue = isNegative ? -Number(userAnswer + number) : Number(userAnswer + number);
      if (numericValue === currentProblem.answer) {
        // Use setTimeout to allow the UI to update before showing feedback
        setTimeout(() => {
          showFeedback('correct');
          incrementScore();
          clearLearnerModeTimeouts();
          
          setTimeout(() => {
            setUserAnswer('');
            setIsNegative(false);
            setShowEncouragement(false);
            setCurrentQuestionShown(false);
            
            generateNewProblem(
              settings.operation, 
              settings.range,
              settings.allowNegatives || false,
              settings.focusNumber || null
            );
          }, 100);
        }, 10);
      }
    }
  };

  const handleDelete = () => {
    if (isShowingAnswer || hasEndedRef.current) return;
    setUserAnswer(userAnswer.slice(0, -1));
  };

  const toggleNegative = () => {
    if (!isShowingAnswer && !hasEndedRef.current) {
      setIsNegative(!isNegative);
      focusInput();
    }
  };

  // Card interaction handler
  const handleCardInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    focusInput();
  };

  const showNegativeToggle = settings.allowNegatives;
  const useCustomNumberPad = settings.useCustomNumberPad;

  return (
    <GameContainer
      timeLeft={timeLeft}
      score={score}
      onContainerInteraction={focusInput}
    >
      <GameCard
        feedback={feedback}
        onCardInteraction={handleCardInteraction}
      >
        <div className="flex justify-center items-center text-4xl md:text-6xl font-bold">
          {currentProblem && (
            <>
              <span>{currentProblem.num1}</span>
              <span className="mx-4">{getOperationSymbol()}</span>
              <span>{currentProblem.num2}</span>
              <span className={`${showNegativeToggle ? 'mx-8 md:mx-10' : 'mx-6 md:mx-8'}`}>=</span>
            </>
          )}

          <NumberInput
            inputRef={inputRef}
            value={userAnswer}
            onChange={handleInputChange}
            readOnly={isShowingAnswer || useCustomNumberPad}
            isNegative={isNegative}
            feedback={feedback}
            inputMode={useCustomNumberPad ? "none" : "numeric"}
            onInputInteraction={focusInput}
          />
        </div>
      </GameCard>

      {/* Encouragement message for learner mode */}
      {showEncouragement && settings.learnerMode && (
        <div className="text-center mb-4 animate-fade-in">
          <p className="text-lg font-medium text-primary">
            You got this! Try again 💪
          </p>
        </div>
      )}

      {/* Custom Number Pad */}
      <NumberPadContainer
        enabled={useCustomNumberPad}
        onNumberPress={handleNumberPress}
        onDelete={handleDelete}
        onNegativeToggle={toggleNegative}
        isNegative={isNegative}
        showNegativeToggle={showNegativeToggle}
        onButtonPress={focusInput}
      />

      <div className="flex justify-center mt-4">
        <Button 
          variant="outline" 
          onClick={handleRestartGame} 
          className="flex items-center gap-2"
        >
          <RotateCw className="h-4 w-4" /> Restart Game
        </Button>
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground flex justify-center items-center">
        <span>Current mode: </span>
        <div className="ml-1 inline-flex items-center bg-primary/10 px-2 py-1 rounded-full text-primary font-medium">
          <MathIcon operation={currentProblem?.operation || 'addition'} size={14} className="mr-1" />
          {currentProblem?.operation === 'addition' ? 'Addition' :
            currentProblem?.operation === 'subtraction' ? 'Subtraction' :
              currentProblem?.operation === 'multiplication' ? 'Multiplication' : 'Division'}
        </div>
        {settings.learnerMode && (
          <div className="ml-2 inline-flex items-center bg-accent/30 px-2 py-1 rounded-full text-primary font-medium">
            Learner Mode
          </div>
        )}
      </div>
    </GameContainer>
  );
};

export default GameScreen;
