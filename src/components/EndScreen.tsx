import React, { useEffect } from 'react';
import useGame from '@/context/useGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, TrendingUp } from 'lucide-react';
import MathIcon from './common/MathIcon';
import ConfettiEffect from './common/ConfettiEffect';
import { Link } from 'react-router-dom';

const EndScreen = () => {
  const { 
    score, 
    resetScore, 
    settings, 
    setGameState, 
    setTimeLeft,
    getIsHighScore,
    isLoggedIn,
    setUserAnswer
  } = useGame();
  
  const isHighScore = getIsHighScore(score, settings.operation, settings.range);
  
  useEffect(() => {
    const audio = new Audio();
    audio.src = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAACsAWlpaWlpaWlpaWlp6enp6enp6enp6enp6enp6epqampqampqampqaurq6urq6urq6urra2tra2tra2tra2vr6+vr6+vr6+vr6GhoaGhoaGhoaGho6Ojo6Ojo6Ojo6OlpaWlpaWlpaWlp6enp6enp6enp6epqampqampqampqa//NCxAAAAANIAAAAAurq6urq6urq6ura2tra2tra2tra2vr6+vr6+vr6+vr6GhoaGhoaGhoaGho6Ojo6Ojo6Ojo6OlpaWlpaWlpaWlpaqqqqqqqqqqqqqqqqqqqqqqqqv/zgMSAAACQABzxQAhAgBgeM4yqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//+ZVZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ';
    audio.volume = 0.2;
    audio.play().catch(err => console.error("Failed to play sound:", err));
  }, []);
  
  const handleRestart = () => {
    resetScore();
    setTimeLeft(settings.timerSeconds);
    setUserAnswer(''); // Clear any previous answer
    setGameState('playing');
  };
  
  const handleBackToSelection = () => {
    resetScore();
    setUserAnswer(''); // Clear any previous answer
    setGameState('selection');
  };
  
  const getOperationName = () => {
    switch (settings.operation) {
      case 'addition': return 'Addition';
      case 'subtraction': return 'Subtraction';
      case 'multiplication': return 'Multiplication';
      case 'division': return 'Division';
      default: return '';
    }
  };
  
  const getRangeDescription = () => {
    const { min1, max1, min2, max2 } = settings.range;
    return `${min1}-${max1} and ${min2}-${max2}`;
  };

  return (
    <main className="flex flex-col items-center w-full min-h-screen px-4 pt-10 sm:pt-16">
      <ConfettiEffect score={score} />
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Game Over!</CardTitle>
          <CardDescription>
            {!isLoggedIn ? "Sign up to save and track your results!" : "Your performance summary"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="text-center bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full w-36 h-36 flex flex-col justify-center items-center shadow-inner animate-pop">
              <span className="text-sm text-muted-foreground">Final Score</span>
              <span className="text-5xl font-bold text-primary">{score}</span>
              {isHighScore && score > 0 ? (
                <span className="text-xs text-accent mt-1 font-bold bg-accent/20 px-2 py-1 rounded-full">
                  New High Score!
                </span>
              ) : score > 10 ? (
                <span className="text-xs text-accent mt-1">Amazing work!</span>
              ) : null}
            </div>
          </div>
          
          {isHighScore && score > 0 && (
            <div className="bg-accent/10 p-3 rounded-lg text-center text-sm">
              <p className="font-medium text-accent">
                New high score for {getOperationName()} with range {getRangeDescription()}!
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center">
              <span>Game Settings</span>
              <MathIcon operation={settings.operation} className="ml-2 text-accent" />
            </h3>
            <div className="bg-muted p-4 rounded-lg">
              <div className="mb-2 flex items-center">
                <span className="font-medium mr-2">Operation:</span> 
                <div className="flex items-center bg-primary/10 px-2 py-1 rounded-md">
                  <MathIcon operation={settings.operation} size={16} className="mr-1" />
                  {getOperationName()}
                </div>
              </div>
              <div className="mb-2">
                <span className="font-medium">Number Range 1:</span> 
                <span className="ml-2 bg-secondary/10 px-2 py-1 rounded-md">{settings.range.min1} to {settings.range.max1}</span>
              </div>
              <div className="mb-2">
                <span className="font-medium">Number Range 2:</span> 
                <span className="ml-2 bg-secondary/10 px-2 py-1 rounded-md">{settings.range.min2} to {settings.range.max2}</span>
              </div>
              <div>
                <span className="font-medium">Time Limit:</span> 
                <span className="ml-2 bg-secondary/10 px-2 py-1 rounded-md">{settings.timerSeconds} seconds</span>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-2">
          <Button 
            onClick={handleRestart}
            className="w-full bg-primary hover:bg-primary/90 flex items-center"
            type="button"
          >
            <RefreshCw className="mr-2" size={16} />
            Restart with Same Settings
          </Button>
          
          {!isLoggedIn ? (
            <Link to="/account?tab=progress" className="w-full">
              <Button 
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary/10 flex items-center"
                type="button"
              >
                <TrendingUp className="mr-2" size={16} />
                Sign Up to Track Your Progress
              </Button>
            </Link>
          ) : (
            <Link to="/account?tab=progress" className="w-full">
              <Button 
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary/10 flex items-center"
                type="button"
              >
                <TrendingUp className="mr-2" size={16} />
                See Your Progress
              </Button>
            </Link>
          )}
          
          <Button 
            onClick={handleBackToSelection}
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary/10 flex items-center"
            type="button"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to Selection
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
};

export default EndScreen;
