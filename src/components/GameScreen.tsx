import React, { useState, useEffect, useRef } from 'react';
import useGame from '@/context/useGame';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, RefreshCw } from 'lucide-react';
import MathIcon from './common/MathIcon';

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
    settings
  } = useGame();

  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log('GameScreen mounted with settings:', settings);
    
    if (!currentProblem) {
      generateNewProblem();
    }
    
    inputRef.current?.focus();
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setGameState('ended');
          saveScore();
          return 0;
        } else {
          return prevTime - 1;
        }
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

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
    saveScore();
    setGameState('ended');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setUserAnswer(newValue);

    if (currentProblem) {
      if (newValue.trim() === "") return;
      if (Number(newValue) === currentProblem.answer) {
        setFeedback('correct');
        incrementScore();
        setTimeout(() => {
          setUserAnswer('');
          setFeedback(null);
          generateNewProblem();
          focusInput();
        }, 100);
      }
    }
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
                <span className="mx-4">=</span>
              </>
            )}
            
            <div className="relative">
              <Input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={userAnswer}
                onChange={handleInputChange}
                className="text-4xl md:text-6xl w-24 md:w-32 h-16 text-center font-bold p-0 border-b-4 focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                autoFocus
              />
              
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
