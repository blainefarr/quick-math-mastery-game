
import React, { useState, useEffect, useRef } from 'react';
import useGame from '@/context/useGame';
import { useGameInput } from '@/hooks/useGameInput';
import GamePlayArea from './common/GamePlayArea';
import MathIcon from './common/MathIcon';
import { useIsMobile } from '@/hooks/use-mobile';

const GameScreen = () => {
  const {
    score,
    incrementScore,
    currentProblem,
    generateNewProblem,
    timeLeft,
    settings,
    endGame,
    setGameState
  } = useGame();
  
  // Learner mode states
  const [isShowingAnswer, setIsShowingAnswer] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [currentQuestionShown, setCurrentQuestionShown] = useState(false);
  const learnerTimeoutRef = useRef<number | null>(null);
  const showAnswerTimeoutRef = useRef<number | null>(null);
  const hasEndedRef = useRef(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (timeLeft <= 0) {
      hasEndedRef.current = true;
    } else {
      hasEndedRef.current = false;
    }
  }, [timeLeft]);

  // Handle correct answer
  const handleCorrectAnswer = () => {
    // Always increment score when user enters correct answer
    incrementScore();
    
    // Clear learner mode timeouts
    clearLearnerModeTimeouts();
    
    // Reset learner mode states
    setIsShowingAnswer(false);
    setShowEncouragement(false);
    setCurrentQuestionShown(false);
    
    // Generate new problem
    generateNewProblem(
      settings.operation, 
      settings.range,
      settings.allowNegatives || false,
      settings.focusNumber || null
    );
  };

  // Use the shared hook for input handling
  const {
    userInput,
    setUserInput,
    isNegative,
    setIsNegative,
    feedback,
    setFeedback,
    inputRef,
    handleInputChange: baseHandleInputChange,
    handleNumberPress: baseHandleNumberPress,
    handleDelete,
    toggleNegative,
    handleContainerTouch
  } = useGameInput({
    onCorrectAnswer: handleCorrectAnswer,
    timeLeft,
    correctAnswer: currentProblem?.answer,
    allowNegatives: settings.allowNegatives || false,
    customNumberPadEnabled: settings.useCustomNumberPad || false
  });

  // Custom input handlers that respect learner mode
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isShowingAnswer) {
      baseHandleInputChange(e);
    }
  };

  const handleNumberPress = (number: string) => {
    if (!isShowingAnswer) {
      baseHandleNumberPress(number);
    }
  };

  useEffect(() => {
    console.log('GameScreen mounted with settings:', settings);
    
    if (!currentProblem) {
      generateNewProblem(
        settings.operation, 
        settings.range,
        settings.allowNegatives || false,
        settings.focusNumber || null
      );
    }
    
    return () => {
      clearLearnerModeTimeouts();
    };
  }, []);

  // Reset learner mode states when problem changes
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
    if (settings.learnerMode && !hasEndedRef.current && currentProblem) {
      // Clear any existing timeouts
      clearLearnerModeTimeouts();
      
      // Set timeout to show answer after 6 seconds
      learnerTimeoutRef.current = window.setTimeout(() => {
        if (!hasEndedRef.current && currentProblem) {
          // Convert answer to string and handle negative numbers
          const answerStr = String(Math.abs(currentProblem.answer));
          
          // Show the answer
          setUserInput(answerStr);
          setIsNegative(currentProblem.answer < 0);
          setIsShowingAnswer(true);
          setCurrentQuestionShown(true);
          
          // Set timeout to hide answer and prompt retry after 2 seconds
          showAnswerTimeoutRef.current = window.setTimeout(() => {
            if (!hasEndedRef.current) {
              setUserInput('');
              setIsShowingAnswer(false);
              setShowEncouragement(true);
              inputRef.current?.focus();
            }
          }, 2000);
        }
      }, 6000);
    }
  };

  const handleRestartGame = () => {
    console.log('Restarting game early, not saving the score');
    clearLearnerModeTimeouts();
    setGameState('selection');
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

  // Generate question content
  const questionContent = (
    <div className="flex justify-center items-center text-4xl md:text-6xl font-bold">
      {currentProblem && (
        <>
          <span>{currentProblem.num1}</span>
          <span className="mx-4">{getOperationSymbol()}</span>
          <span>{currentProblem.num2}</span>
          <span className={`${settings.allowNegatives ? 'mx-8 md:mx-10' : 'mx-6 md:mx-8'}`}>=</span>
        </>
      )}
    </div>
  );

  // Generate footer content
  const footerContent = currentProblem && (
    <div className="flex justify-center items-center">
      <span>Current mode: </span>
      <div className="ml-1 inline-flex items-center bg-primary/10 px-2 py-1 rounded-full text-primary font-medium">
        <MathIcon operation={currentProblem.operation} size={14} className="mr-1" />
        {currentProblem.operation === 'addition' ? 'Addition' :
          currentProblem.operation === 'subtraction' ? 'Subtraction' :
            currentProblem.operation === 'multiplication' ? 'Multiplication' : 'Division'}
      </div>
      {settings.learnerMode && (
        <div className="ml-2 inline-flex items-center bg-accent/30 px-2 py-1 rounded-full text-primary font-medium">
          Learner Mode
        </div>
      )}
    </div>
  );

  // Encouragement message for learner mode
  const encouragementMessage = showEncouragement && settings.learnerMode 
    ? "You got this! Try again 💪" 
    : null;

  return (
    <GamePlayArea
      timeLeft={timeLeft}
      scoreLabel="Score"
      scoreValue={score}
      timeClass={timeLeft < 10 ? 'animate-timer-tick text-destructive' : ''}
      questionContent={questionContent}
      userInput={userInput}
      isNegative={isNegative}
      feedback={feedback}
      inputRef={inputRef}
      onInputChange={handleInputChange}
      customNumberPadEnabled={settings.useCustomNumberPad || false}
      onNumberPress={handleNumberPress}
      onDelete={handleDelete}
      onNegativeToggle={toggleNegative}
      showNegativeToggle={settings.allowNegatives || false}
      onContainerTouch={handleContainerTouch}
      onRestartGame={handleRestartGame}
      encouragementMessage={encouragementMessage}
      footerContent={footerContent}
      readOnlyInput={isShowingAnswer}
    />
  );
};

export default GameScreen;
