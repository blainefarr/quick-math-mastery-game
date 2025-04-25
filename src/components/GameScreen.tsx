import React, { useState, useEffect, useRef } from 'react';
import useGame from '@/context/useGame';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, RefreshCw } from 'lucide-react';
import MathIcon from './common/MathIcon';
import { showToastOnce } from '@/utils/toastManager';

const GameScreen = () => {
  const {
    score,
    incrementScore,
    currentProblem,
    generateNewProblem,
    timeLeft,
    setTimeLeft,
    userAnswer,
    setUserAnswer,
    setGameState,
    saveScore,
    settings,
    userId,
    isLoggedIn
  } = useGame();

  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isNegative, setIsNegative] = useState(false);
  const scoreRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialProblemGeneratedRef = useRef(false);

  // Update the ref whenever score changes
  useEffect(() => {
    scoreRef.current = score;
    console.log(`Score updated to: ${score}, scoreRef set to: ${scoreRef.current}`);
  }, [score]);

  useEffect(() => {
    console.log('GameScreen mounted with settings:', settings);
    console.log('Initial timer value:', settings.timerSeconds);
    
    if (!initialProblemGeneratedRef.current) {
      generateNewProblem(
        settings.operation, 
        settings.range,
        settings.allowNegatives || false,
        settings.focusNumber || null
      );
      initialProblemGeneratedRef.current = true;
      
      // Only set initial time when starting a new game
      setTimeLeft(settings.timerSeconds);
    }
    
    inputRef.current?.focus();
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setGameState('ended');
          saveGameScore();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      initialProblemGeneratedRef.current = false;
    };
  }, [settings.timerSeconds]);

  useEffect(() => {
    setIsNegative(false);
  }, [currentProblem]);

  const focusInput = () => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
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
    console.log('Restarting game, attempting to save score:', scoreRef.current);
    
    saveGameScore();
    
    setGameState('ended');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const cleanValue = rawValue.replace(/^-/, '');
    setUserAnswer(cleanValue);

    if (currentProblem && cleanValue.trim() !== "") {
      const numericValue = isNegative ? -Number(cleanValue) : Number(cleanValue);
      if (numericValue === currentProblem.answer) {
        setFeedback('correct');
        incrementScore();
        
        setTimeout(() => {
          setUserAnswer('');
          setFeedback(null);
          setIsNegative(false);
          generateNewProblem(
            settings.operation, 
            settings.range,
            settings.allowNegatives || false,
            settings.focusNumber || null
          );
          focusInput();
        }, 100);
      }
    }
  };

  const toggleNegative = () => {
    setIsNegative(prev => !prev);
    focusInput();
  };

  const showNegativeToggle = settings.allowNegatives;

  const saveGameScore = async () => {
    if (!isLoggedIn) {
      // Show signup toast for non-logged in users
      showToastOnce({
        id: 'signup-prompt',
        message: "Sign up to track your scores",
        type: 'info',
        duration: 5000
      });
      return false;
    }

    const success = await saveScore(
      scoreRef.current,
      settings.operation,
      settings.range,
      settings.timerSeconds,
      settings.focusNumber || null,
      settings.allowNegatives || false
    );

    return success;
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-xl">
        <div className="flex justify-between mb-8">
          <Card className={`p-3 flex items-center ${timeLeft < 10 ? 'animate-timer-tick text-destructive' : ''}`}>
            <Clock className="mr-2" />
            <span className="text-xl font-bold">{timeLeft}</span>
          </Card>
          <Card className="p-3">
            <span className="font-medium">Score: </span> 
            <span className="text-xl font-bold">{score}</span>
          </Card>
        </div>

        <Card className={`mb-6 py-10 px-6 shadow-lg animate-bounce-in ${feedback === 'correct' ? 'bg-success/10 border-success' : feedback === 'incorrect' ? 'bg-destructive/10 border-destructive' : ''}`}>
          <CardContent className="flex justify-center items-center text-4xl md:text-6xl font-bold">
            {currentProblem && (
              <>
                <span>{currentProblem.num1}</span>
                <span className="mx-4">{getOperationSymbol()}</span>
                <span>{currentProblem.num2}</span>
                <span className="mx-6 md:mx-8">=</span>
              </>
            )}

            <div className="relative flex items-center">
              <Input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={userAnswer}
                onChange={handleInputChange}
                className="text-4xl md:text-6xl w-24 md:w-32 h-16 text-center font-bold p-0 border-b-4 focus-visible:ring-0 focus-visible:ring-offset-0 appearance-none"
                autoFocus
                toggleNegative={showNegativeToggle}
                isNegative={isNegative}
                onToggleNegative={toggleNegative}
                style={{
                  MozAppearance: 'textfield',
                  WebkitAppearance: 'none',
                  appearance: 'none'
                }}
              />
              {isNegative && (
                <span className="absolute top-1/2 transform -translate-y-1/2 -left-8 text-4xl md:text-6xl z-20 select-none">-</span>
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

        <div className="flex justify-center">
          <Button 
            variant="outline"
            onClick={handleRestartGame}
            className="text-lg py-6 px-6 border-primary text-primary hover:bg-primary/10 transition-all"
          >
            <RefreshCw className="mr-2" />
            Restart Game
          </Button>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground flex justify-center items-center">
          <span>Current mode: </span>
          <span className="ml-1 inline-flex items-center bg-primary/10 px-2 py-1 rounded-full text-primary font-medium">
            <MathIcon operation={currentProblem?.operation || 'addition'} size={14} className="mr-1" />
            {currentProblem?.operation === 'addition' ? 'Addition' :
              currentProblem?.operation === 'subtraction' ? 'Subtraction' :
                currentProblem?.operation === 'multiplication' ? 'Multiplication' : 'Division'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
