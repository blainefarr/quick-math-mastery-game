
import React, { useState, useEffect, useRef } from 'react';
import useGame from '@/context/useGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Operation } from '@/types';

const GameScreen = () => {
  const {
    currentProblem,
    generateNewProblem,
    score,
    incrementScore,
    userAnswer,
    setUserAnswer,
    timeLeft,
    endGame
  } = useGame();

  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isIncorrect, setIsIncorrect] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input field when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Generate the first problem when the component mounts
    generateNewProblem();
  }, []);

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isAnswerCorrect = 
      userAnswer.trim() === currentProblem.answer.toString();

    if (isAnswerCorrect) {
      setIsCorrect(true);
      setIsIncorrect(false);

      // Show correct animation briefly
      setTimeout(() => {
        setIsCorrect(null);
        incrementScore();
        setUserAnswer('');
        generateNewProblem(); // Generate a new problem
      }, 300);
    } else {
      setIsCorrect(false);
      setIsIncorrect(true);

      // Show incorrect animation briefly
      setTimeout(() => {
        setIsIncorrect(null);
        setUserAnswer('');
      }, 300);
    }
  };

  const getOperationSymbol = (op: Operation) => {
    switch (op) {
      case 'addition':
        return '+';
      case 'subtraction':
        return '-';
      case 'multiplication':
        return '×';
      case 'division':
        return '÷';
      default:
        return '+';
    }
  };

  const handleQuit = () => {
    endGame('manual');
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
      {/* Timer and Score Display */}
      <div className="flex w-full justify-between mb-6">
        <div className="text-xl font-bold">
          Time: <span className={`${timeLeft <= 10 ? 'text-red-500' : ''}`}>{timeLeft}s</span>
        </div>
        <div className="text-xl font-bold">Score: {score}</div>
      </div>

      {/* Problem Card */}
      <Card 
        className={`w-full ${
          isCorrect ? 'bg-green-100 border-green-500' : 
          isIncorrect ? 'bg-red-100 border-red-500' : ''
        } transition-colors`}
      >
        <CardContent className="pt-6">
          <div className="text-4xl font-bold text-center mb-6">
            {currentProblem.num1} {getOperationSymbol(currentProblem.operation)} {currentProblem.num2} = ?
          </div>

          <form onSubmit={handleAnswerSubmit}>
            <Input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9-]*"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="text-2xl text-center"
              autoFocus
            />
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleQuit}>Quit</Button>
          <Button onClick={handleAnswerSubmit}>Submit</Button>
        </CardFooter>
      </Card>

      {/* Keyboard hints for mobile */}
      <div className="mt-6 grid grid-cols-3 gap-2 w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            variant="outline"
            onClick={() => setUserAnswer(prev => `${prev}${num}`)}
            className="text-xl h-12"
          >
            {num}
          </Button>
        ))}
        <Button
          variant="outline"
          onClick={() => setUserAnswer(prev => prev.startsWith('-') ? prev.substring(1) : `-${prev}`)}
          className="text-xl h-12"
        >
          +/-
        </Button>
        <Button
          variant="outline"
          onClick={() => setUserAnswer(prev => `${prev}0`)}
          className="text-xl h-12"
        >
          0
        </Button>
        <Button
          variant="outline"
          onClick={() => setUserAnswer('')}
          className="text-xl h-12"
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default GameScreen;
