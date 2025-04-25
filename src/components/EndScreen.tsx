import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useGame from '@/context/useGame';
import { Button } from '@/components/ui/button';
import { Confetti } from './Confetti';
import { useConfetti } from '@/hooks/use-confetti';
import { Separator } from '@/components/ui/separator';
import { ModeToggle } from './ModeToggle';
import { Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const EndScreen = () => {
  const navigate = useNavigate();
  const { 
    score, 
    resetScore, 
    settings, 
    resetSettings, 
    generateNewProblem, 
    operation, 
    range, 
    setGameState,
    saveScore,
    isLoggedIn,
    getIsHighScore,
    focusNumber,
    allowNegatives
  } = useGame();
  const { fireConfetti } = useConfetti();
  const [isSaving, setIsSaving] = useState(false);
  const isHighScore = getIsHighScore(score, operation, range);

  useEffect(() => {
    if (isHighScore) {
      fireConfetti();
    }
  }, [isHighScore, fireConfetti]);

  const handlePlayAgain = () => {
    resetScore();
    generateNewProblem(operation, range, allowNegatives, focusNumber);
    setGameState('playing');
  };

  const handleGoBack = () => {
    resetScore();
    resetSettings();
    setGameState('selection');
    navigate('/');
  };

  const handleSaveScore = async () => {
    setIsSaving(true);
    const saved = await saveScore(score, operation, range, settings.timerSeconds, focusNumber, allowNegatives);
    setIsSaving(false);

    if (saved) {
      if (!isLoggedIn) {
        toast.info("Sign up to save your score!");
      }
    } else {
      toast.error("Failed to save score.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <Confetti />
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 math-font">
          {isHighScore ? '🎉 New High Score!' : 'Game Over!'}
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          Your Score: <span className="font-semibold text-primary">{score}</span>
        </p>

        <div className="space-x-4">
          <Button onClick={handlePlayAgain} variant="outline">
            Play Again
          </Button>
          <Button onClick={handleGoBack} variant="secondary">
            Back to Menu
          </Button>
          <Button 
            onClick={handleSaveScore} 
            disabled={isSaving}
            className="disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Score'}
          </Button>
        </div>
      </div>

      <footer className="absolute bottom-4 left-0 w-full flex items-center justify-between p-4 border-t border-border mt-8">
        <Link 
          to="https://github.com/jimmyhmiller/minute-math" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Github size={16} className="inline-block mr-1" />
          Open Source
        </Link>
        <ModeToggle />
      </footer>
    </div>
  );
};

export default EndScreen;
