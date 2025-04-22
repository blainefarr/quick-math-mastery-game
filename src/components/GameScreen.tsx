
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
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
  
  // Initialize game on first load
  useEffect(() => {
    // Generate first problem if we don't have one
    if (!currentProblem) {
      generateNewProblem();
    }
    
    // Set focus on input
    inputRef.current?.focus();
    
    // Start timer
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
    
    // Clean up timer
    return () => clearInterval(timer);
  }, []);
  
  // Handle user answer submission
  const checkAnswer = () => {
    if (!currentProblem) return;
    
    const numAnswer = Number(userAnswer);
    
    if (numAnswer === currentProblem.answer) {
      // Correct answer
      setFeedback('correct');
      incrementScore();
      setUserAnswer('');
      
      // Generate new problem after small delay
      setTimeout(() => {
        generateNewProblem();
        setFeedback(null);
        inputRef.current?.focus();
      }, 300);
    } else {
      // Incorrect answer
      setFeedback('incorrect');
      
      // Clear incorrect feedback after short delay
      setTimeout(() => {
        setFeedback(null);
        setUserAnswer('');
        inputRef.current?.focus();
      }, 500);
    }
  };
  
  // Handle key press (Enter) for submitting answer
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };
  
  // Format operation symbol
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

  // Handle restart game - don't save scores
  const handleRestartGame = () => {
    setGameState('ended');
    // Note: We're not calling saveScore() here
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-xl">
        {/* Timer and Score */}
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
        
        {/* Problem Display */}
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
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={handleKeyPress}
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
        
        {/* Controls */}
        <div className="flex justify-center space-x-4">
          <Button 
            onClick={checkAnswer}
            className="text-lg py-6 px-8 bg-primary hover:bg-primary/90 shadow-md transition-transform transform hover:scale-105"
          >
            Check
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleRestartGame}
            className="text-lg py-6 px-6 border-primary text-primary hover:bg-primary/10 transition-all"
          >
            <RefreshCw className="mr-2" />
            Restart Game
          </Button>
        </div>
        
        {/* Current operation info */}
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
