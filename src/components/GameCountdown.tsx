
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';
import useGame from '@/context/useGame';
import { useTimerManagement } from '@/hooks/use-timer-management';
import GameContainer from './game/GameContainer';
import GameCard from './game/GameCard';

interface GameCountdownProps {
  onComplete: () => void;
  message?: string;
  isTypingWarmup?: boolean;
  upcomingDuration?: number;
}

const GameCountdown = ({ 
  onComplete,
  message = "⚡ It's game time! ⚡",
  isTypingWarmup = false,
  upcomingDuration
}: GameCountdownProps) => {
  const { setGameState, settings, scoreHistory, isLoggedIn } = useGame();

  // Use the timer management hook for countdown
  const { timeLeft } = useTimerManagement({
    initialTime: 3,
    onTimerComplete: () => {
      // Use a timeout to allow for the "GO!" to display briefly
      setTimeout(onComplete, 500);
    }
  });

  // Get the best score for the current game settings, including duration
  const getBestScore = () => {
    if (!isLoggedIn || !scoreHistory || scoreHistory.length === 0) {
      return null;
    }

    // Filter scores that match current game settings, INCLUDING duration
    const matchingScores = scoreHistory.filter(s => 
      s.operation === settings.operation &&
      s.range.min1 === settings.range.min1 &&
      s.range.max1 === settings.range.max1 &&
      s.range.min2 === settings.range.min2 &&
      s.range.max2 === settings.range.max2 &&
      s.allowNegatives === (settings.allowNegatives || false) &&
      s.focusNumber === (settings.focusNumber || null) &&
      s.duration === settings.timerSeconds // Added this filter for duration
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

  // Handle restart game
  const handleRestartGame = () => {
    setGameState('selection');
  };

  // Empty handler functions for the required props
  const handleContainerInteraction = () => {};
  const handleCardInteraction = () => {};

  return (
    <GameContainer
      timeLeft={upcomingDuration || 0} // Show the upcoming duration in the timer
      score={null} // Hide the score
      onContainerInteraction={handleContainerInteraction} // Add the required prop
    >
      <GameCard
        feedback={null} // Add the required prop
        onCardInteraction={handleCardInteraction} // Add the required prop
      >
        <h2 className="text-2xl font-bold mb-4">{message}</h2>
        <div className="text-4xl md:text-6xl font-bold mb-4 text-green-500">
          {timeLeft || "GO!"}
        </div>
        {/* Only show motivational text for game countdown, not typing warmup */}
        {!isTypingWarmup && <p className="text-gray-600 mb-2">{getMotivationalText()}</p>}
      </GameCard>

      {/* Restart button */}
      <div className="flex justify-center mt-4">
        <Button 
          variant="outline" 
          onClick={handleRestartGame} 
          className="flex items-center gap-2"
        >
          <RotateCw className="h-4 w-4" /> Restart Game
        </Button>
      </div>
    </GameContainer>
  );
};

export default GameCountdown;
