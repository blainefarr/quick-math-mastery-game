
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PaywallModal } from './PaywallModal';
import { useGame } from '@/context/useGame';

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
  const { setGameState } = useGame();
  
  // Handle continuing without saving
  const handleContinueWithoutSaving = () => {
    // Continue with the game but don't save the score
    setGameState('playing');
  };
  
  return (
    <PaywallModal
      open={open}
      onOpenChange={onOpenChange}
      title="Score Save Limit Reached"
      description={`Your current plan allows up to ${scoreSaveLimit} saved scores. Upgrade your account to save more scores.`}
      continueText="Continue without saving"
      cancelText="Upgrade"
      onContinue={handleContinueWithoutSaving}
    />
  );
}
