
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Home, BarChart2, RepeatIcon, Share2 } from 'lucide-react';
import useGame from '@/context/useGame';
import ConfettiEffect from './common/ConfettiEffect';
import { useAuth } from '@/context/auth/useAuth';

const EndScreen = () => {
  const { score, settings, resetScore, setGameState, getIsHighScore } = useGame();
  const { isAuthenticated } = useAuth();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isHighScore, setIsHighScore] = useState(false);
  
  useEffect(() => {
    // Only check for high score if authenticated
    if (isAuthenticated) {
      const highScore = getIsHighScore(score, settings.operation, settings.range);
      setIsHighScore(highScore);
      
      if (highScore) {
        setShowConfetti(true);
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [score, settings, getIsHighScore, isAuthenticated]);
  
  const handlePlayAgain = () => {
    resetScore();
    setGameState('playing');
  };
  
  const handleBackToMenu = () => {
    resetScore();
    setGameState('selection');
  };
  
  const shareScore = () => {
    try {
      const text = `I scored ${score} points in ${settings.timerSeconds} seconds on ${settings.operation} problems in Minute Math!`;
      
      if (navigator.share) {
        navigator.share({
          title: 'My Minute Math Score',
          text: text,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(text);
        alert('Score copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      {showConfetti && <ConfettiEffect score={score} />}
      
      <Card className="shadow-lg border-2 border-primary/20">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-bold">
            Game Over!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center mt-2 mb-6">
            <div className="text-5xl font-bold text-primary mb-2">{score}</div>
            <div className="text-lg text-muted-foreground">Your Score</div>
            {isAuthenticated && isHighScore && (
              <div className="flex items-center gap-1 text-amber-500 font-semibold mt-2">
                <Trophy size={18} className="animate-pulse" />
                <span>New High Score!</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={handlePlayAgain} 
              className="flex items-center gap-2"
              size="lg"
            >
              <RepeatIcon size={18} />
              Play Again
            </Button>
            
            <Button 
              onClick={handleBackToMenu} 
              variant="outline"
              className="flex items-center gap-2"
              size="lg"
            >
              <Home size={18} />
              Main Menu
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {isAuthenticated ? (
              <Button 
                onClick={() => window.location.href = '/progress'} 
                variant="secondary"
                className="flex items-center gap-2"
              >
                <BarChart2 size={18} />
                My Progress
              </Button>
            ) : (
              <div></div>
            )}
            
            <Button 
              onClick={shareScore} 
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Share2 size={18} />
              Share Score
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EndScreen;
