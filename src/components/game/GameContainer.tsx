
import React from 'react';
import { useCompactHeight } from '@/hooks/use-compact-height';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface GameContainerProps {
  children: React.ReactNode;
  timeLeft: number;
  score: number | null;
  scoreLabel?: string;
  onContainerInteraction: () => void;
}

const GameContainer: React.FC<GameContainerProps> = ({
  children,
  timeLeft,
  score,
  scoreLabel = "Score:",
  onContainerInteraction
}) => {
  const isCompactHeight = useCompactHeight();

  return (
    <div 
      className={`flex justify-center items-center min-h-screen p-4 bg-background ${
        isCompactHeight ? 'pt-0 mt-0' : 'pt-4'
      }`}
      onTouchStart={onContainerInteraction}
      onClick={onContainerInteraction}
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
            <span className="font-medium">{scoreLabel} </span>
            <span className="text-xl font-bold">{score}</span>
          </Card>
        </div>
        
        {children}
      </div>
    </div>
  );
};

export default GameContainer;
