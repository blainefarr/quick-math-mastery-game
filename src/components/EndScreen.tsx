
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useGame from '@/context/useGame';
import ConfettiEffect from './common/ConfettiEffect';
import { useCompactHeight } from '@/hooks/use-compact-height';
import MathIcon from './common/MathIcon';
import { toast } from 'sonner';

const EndScreen = () => {
  const { score, resetScore, settings, updateSettings, setGameState } = useGame();
  const isCompactHeight = useCompactHeight();
  const isHighScore = useGame().getIsHighScore(score, settings.operation, settings.range);

  // Play again button should respect the typing speed adjustment setting
  const handlePlayAgain = () => {
    resetScore();
    
    // Preserve typingSpeedAdjustment setting
    if (settings.typingSpeedAdjustment) {
      setGameState('warmup-countdown');
    } else {
      setGameState('countdown');
    }
    
    toast.success('New game started!');
  };

  const handleBackToSelection = () => {
    resetScore();
    setGameState('selection');
  };

  return (
    <div className={`flex justify-center items-center min-h-screen p-4 bg-background ${
      isCompactHeight ? 'pt-0 mt-0' : 'pt-8'
    }`}>
      {isHighScore && <ConfettiEffect score={score} />}
      <div className="w-full max-w-md animate-fade-in-up">
        <Card className="border-2 border-primary shadow-lg">
          <CardHeader className="text-center bg-primary/10 py-6">
            <CardTitle className="text-2xl md:text-3xl font-bold">
              Game Over!
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center mb-8 space-y-4">
              <div>
                <p className="text-lg">Your score</p>
                <p className="text-4xl md:text-5xl font-bold text-primary">{score}</p>
              </div>
              
              <div className="flex items-center justify-center gap-2">
                <p className="text-sm text-muted-foreground">Game mode:</p>
                <div className="inline-flex items-center bg-primary/10 px-2 py-1 rounded-full text-primary text-sm">
                  <MathIcon operation={settings.operation} size={14} className="mr-1" />
                  {settings.operation.charAt(0).toUpperCase() + settings.operation.slice(1)}
                </div>
              </div>
              
              {isHighScore && (
                <div className="py-2 px-4 bg-success/20 text-success-foreground rounded-md animate-pulse">
                  <p className="font-medium">New high score!</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col space-y-3">
              <Button onClick={handlePlayAgain} size="lg" className="w-full">
                Play Again
              </Button>
              <Button onClick={handleBackToSelection} variant="outline" size="lg" className="w-full">
                Change Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EndScreen;
