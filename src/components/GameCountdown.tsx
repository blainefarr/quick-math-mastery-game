
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';
import { useCompactHeight } from '@/hooks/use-compact-height';
import useGame from '@/context/useGame';

interface GameCountdownProps {
  onComplete: () => void;
  message?: string;
  isTypingWarmup?: boolean;
}

const GameCountdown = ({ 
  onComplete,
  message = "⚡ It's game time! ⚡",
  isTypingWarmup = false
}: GameCountdownProps) => {
  const [countdown, setCountdown] = useState<number>(3);
  const isCompactHeight = useCompactHeight();
  const { setGameState, settings, scoreHistory, isLoggedIn } = useGame();

  // Get the best score for the current game settings
  const getBestScore = () => {
    if (!isLoggedIn || !scoreHistory || scoreHistory.length === 0) {
      return null;
    }

    // Filter scores that match current game settings
    const matchingScores = scoreHistory.filter(s => 
      s.operation === settings.operation &&
      s.range.min1 === settings.range.min1 &&
      s.range.max1 === settings.range.max1 &&
      s.range.min2 === settings.range.min2 &&
      s.range.max2 === settings.range.max2 &&
      s.allowNegatives === (settings.allowNegatives || false) &&
      s.focusNumber === (settings.focusNumber || null)
    );

    if (matchingScores.length === 0) {
      return null;
    }

    // Return the highest score
    return Math.max(...matchingScores.map(s => s.score));
  };

  // Get motivational text based on user's best score
  const getMotivationalText = () => {
    const bestScore = getBestScore();
    
    if (bestScore) {
      return `🔥 Beat your record: ${bestScore}`;
    }
    
    return "🔥 Set a new record";
  };

  // Handle the countdown
  useEffect(() => {
    if (countdown > 0) {
      const countdownTimer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(countdownTimer);
    } else {
      // Countdown is complete, proceed to the game
      onComplete();
    }
  }, [countdown, onComplete]);

  // Handle restart game
  const handleRestartGame = () => {
    setGameState('selection');
  };

  return (
    <div className={`flex justify-center items-center min-h-screen p-4 bg-background ${
      isCompactHeight ? 'pt-0 mt-0' : 'pt-4'
    }`}>
      <div className={`w-full max-w-xl ${
        isCompactHeight ? 'mt-0' : 'mt-8'
      }`}>
        <Card className={`${
          isCompactHeight ? 'mb-4 py-6' : 'mb-6 py-10'
        } px-6 shadow-lg animate-fade-in`}>
          <CardContent className="flex flex-col justify-center items-center text-center gap-4">
            <h2 className="text-2xl font-bold mt-4">{message}</h2>
            <div className="text-4xl font-bold mt-2 text-green-500">
              {countdown || "GO!"}
            </div>
            {/* Only show motivational text for game countdown, not typing warmup */}
            {!isTypingWarmup && <p className="text-gray-600">{getMotivationalText()}</p>}
          </CardContent>
        </Card>

        {/* Restart button */}
        <div className="flex justify-center mb-4">
          <Button 
            variant="outline" 
            onClick={handleRestartGame} 
            className="flex items-center gap-2"
          >
            <RotateCw className="h-4 w-4" /> Restart Game
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameCountdown;
