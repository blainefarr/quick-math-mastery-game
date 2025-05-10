import React, { useState, useEffect, useRef } from 'react';
import useGame from '@/context/useGame';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, RotateCw } from 'lucide-react';
import MathIcon from './common/MathIcon';
import { useCompactHeight } from '@/hooks/use-compact-height';
import CustomNumberPad from './numberpad/CustomNumberPad';
import { useIsMobile } from '@/hooks/use-mobile';

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

  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isNegative, setIsNegative] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialProblemGeneratedRef = useRef(false);
  const hasEndedRef = useRef(false);
  const focusAttemptsMadeRef = useRef(0);
  const maxFocusAttempts = 5; // Try focusing multiple times
  const isCompactHeight = useCompactHeight();
  const isMobile = useIsMobile(); // Add mobile detection
  
  // Learner mode states
  const [isShowingAnswer, setIsShowingAnswer] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [currentQuestionShown, setCurrentQuestionShown] = useState(false);
  const learnerTimeoutRef = useRef<number | null>(null);
  const showAnswerTimeoutRef = useRef<number | null>(null);

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
    
    // Reset focus attempts counter when component mounts
    focusAttemptsMadeRef.current = 0;
    
    // Enhanced focus method with multiple attempts
    const attemptFocus = () => {
      if (hasEndedRef.current || focusAttemptsMadeRef.current >= maxFocusAttempts) return;
      
      if (inputRef.current) {
        console.log(`Focus attempt ${focusAttemptsMadeRef.current + 1} for GameScreen input`);
        inputRef.current.focus();
        focusAttemptsMadeRef.current++;
      }
      
      // Continue trying to focus if not at max attempts
      if (focusAttemptsMadeRef.current < maxFocusAttempts) {
        setTimeout(attemptFocus, isMobile ? 500 : 200);
      }
    };
    
    // Delay initial focus attempt to ensure component is fully rendered
    setTimeout(attemptFocus, isMobile ? 500 : 300);
    
    return () => {
      initialProblemGeneratedRef.current = false;
      clearLearnerModeTimeouts();
      // Reset focus attempts on unmount
      focusAttemptsMadeRef.current = 0;
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

  const focusInput = () => {
    if (hasEndedRef.current) return;
    
    // Use a longer timeout on mobile
    setTimeout(() => {
      if (inputRef.current) {
        console.log('Manual focus triggered on GameScreen input');
        inputRef.current.focus();
      }
    }, isMobile ? 300 : 100);
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
        setFeedback('correct');
        
        // Always increment score when user enters correct answer, even after hint was shown
        incrementScore();
        
        // Clear learner mode timeouts
        clearLearnerModeTimeouts();
        
        setTimeout(() => {
          setUserAnswer('');
          setFeedback(null);
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
          setFeedback('correct');
          incrementScore();
          clearLearnerModeTimeouts();
          
          setTimeout(() => {
            setUserAnswer('');
            setFeedback(null);
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
    
    // Fix: Using direct string manipulation instead of function with prevAnswer parameter
    setUserAnswer(userAnswer.slice(0, -1));
  };

  const toggleNegative = () => {
    if (!isShowingAnswer && !hasEndedRef.current) {
      setIsNegative(!isNegative);
      focusInput();
    }
  };

  const showNegativeToggle = settings.allowNegatives;
  const useCustomNumberPad = settings.useCustomNumberPad;

  // Touch handler for container to help with focus
  const handleContainerTouch = () => {
    if (isMobile) {
      focusInput();
    }
  };

  return (
    <div 
      className={`flex justify-center items-center min-h-screen p-4 bg-background ${
        isCompactHeight ? 'pt-0 mt-0' : 'pt-4'
      }`}
      onTouchStart={handleContainerTouch}
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
            <span className="font-medium">Score: </span>
            <span className="text-xl font-bold">{score}</span>
          </Card>
        </div>

        <Card 
          className={`${
            isCompactHeight ? 'mb-4 py-6' : 'mb-6 py-10'
          } px-6 shadow-lg animate-bounce-in ${
            feedback === 'correct' ? 'bg-success/10 border-success' : 
            feedback === 'incorrect' ? 'bg-destructive/10 border-destructive' : ''
          }`}
          onClick={focusInput} // Add click handler for better accessibility
        >
          <CardContent className="flex justify-center items-center text-4xl md:text-6xl font-bold">
            {currentProblem && (
              <>
                <span>{currentProblem.num1}</span>
                <span className="mx-4">{getOperationSymbol()}</span>
                <span>{currentProblem.num2}</span>
                <span className={`${showNegativeToggle ? 'mx-8 md:mx-10' : 'mx-6 md:mx-8'}`}>=</span>
              </>
            )}

            <div className="relative flex items-center">
              <Input
                ref={inputRef}
                type="text"
                inputMode={useCustomNumberPad ? "none" : "numeric"}
                pattern="[0-9]*"
                value={userAnswer}
                onChange={handleInputChange}
                className={`text-4xl md:text-6xl w-24 md:w-32 h-16 text-center font-bold p-0 border-b-4 focus-visible:ring-0 focus-visible:ring-offset-0 appearance-none ${
                  isShowingAnswer ? 'text-destructive' : ''
                }`}
                autoComplete="off" // Prevent autocomplete from interfering
                autoFocus={!isMobile} // Only use autoFocus on non-mobile
                readOnly={isShowingAnswer || useCustomNumberPad}
                style={{
                  MozAppearance: 'textfield',
                  WebkitAppearance: 'none',
                  appearance: 'none'
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
          </CardContent>
        </Card>

        {/* Encouragement message for learner mode */}
        {showEncouragement && settings.learnerMode && (
          <div className="text-center mb-4 animate-fade-in">
            <p className="text-lg font-medium text-primary">
              You got this! Try again 💪
            </p>
          </div>
        )}

        {/* Custom Number Pad */}
        {useCustomNumberPad && (
          <div className="w-full max-w-md mx-auto md:max-w-xl">
            <CustomNumberPad 
              onNumberPress={handleNumberPress}
              onDelete={handleDelete}
              onNegativeToggle={toggleNegative}
              isNegative={isNegative}
              showNegativeToggle={showNegativeToggle}
              onButtonPress={focusInput} // Add this new prop to reset focus
            />
          </div>
        )}

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
      </div>
    </div>
  );
};

export default GameScreen;
