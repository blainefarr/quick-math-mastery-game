import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PaywallModal } from './PaywallModal';
import { useGame } from '@/context/useGame';
import { toast } from 'sonner';

interface SavedScoresPaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scoreSaveLimit: number | null;
}

export function SavedScoresPaywallModal({
  open,
  onOpenChange,
  scoreSaveLimit
}: SavedScoresPaywallModalProps) {
  const { 
    setGameState, 
    currentScoreSaveCount,
    gameState, 
    setCanSaveCurrentScore,
    resetScore,
    settings,
    setTimeLeft,
    setUserAnswer
  } = useGame();
  const navigate = useNavigate();
  
  // Handle continuing without saving
  const handleContinueWithoutSaving = () => {
    // Set flag that indicates this game's score cannot be saved
    setCanSaveCurrentScore(false);
    
    // If we're showing this before the game starts, we need to start the game now
    if (gameState === 'selection') {
      toast.info(`You'll be able to play, but your score won't be saved`);
      
      // Go to countdown before playing
      setGameState('countdown');
    } else if (gameState === 'ended') {
      // We're at the end of a game and the user clicked "Play Again"
      // Reset game state for a new game
      resetScore();
      setTimeLeft(settings.timerSeconds);
      setUserAnswer(''); // Clear any previous answer
      
      if (settings.typingSpeedAdjustment) {
        // If typing speed adjustment is enabled, start with warmup-countdown
        setGameState('warmup-countdown');
      } else {
        // Otherwise go directly to countdown
        setGameState('countdown');
      }
      
      toast.info(`Score not saved due to free plan limits`);
    } else {
      // Any other state, just continue without saving
      setGameState('ended');
      toast.info(`Score not saved due to free plan limits`);
    }
    
    onOpenChange(false);
  };
  
  // Handle upgrading the account
  const handleUpgrade = () => {
    navigate('/plans');
    onOpenChange(false);
  };
  
  return (
    <PaywallModal
      open={open}
      onOpenChange={onOpenChange}
      title="Score Save Limit Reached"
      description={`Your current plan allows up to ${scoreSaveLimit} saved scores. Upgrade to save more scores.`}
      continueText="Continue without saving"
      cancelText="Upgrade"
      onContinue={handleContinueWithoutSaving}
      onCancel={handleUpgrade}
    />
  );
}
