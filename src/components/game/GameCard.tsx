
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useCompactHeight } from '@/hooks/use-compact-height';

type FeedbackType = 'correct' | 'incorrect' | null;

interface GameCardProps {
  children: React.ReactNode;
  feedback: FeedbackType;
  onCardInteraction: (e: React.MouseEvent | React.TouchEvent) => void;
}

const GameCard: React.FC<GameCardProps> = ({
  children,
  feedback,
  onCardInteraction
}) => {
  const isCompactHeight = useCompactHeight();

  return (
    <Card 
      className={`${
        isCompactHeight ? 'mb-4' : 'mb-6'
      } shadow-lg animate-bounce-in ${
        feedback === 'correct' ? 'bg-success/10 border-success' : 
        feedback === 'incorrect' ? 'bg-destructive/10 border-destructive' : ''
      }`}
      onClick={onCardInteraction}
    >
      <CardContent className="flex flex-col justify-center items-center text-center py-10">
        {children}
      </CardContent>
    </Card>
  );
};

export default GameCard;
