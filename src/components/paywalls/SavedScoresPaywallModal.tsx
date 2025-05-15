
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
  const { setGameState, currentScoreSaveCount } = useGame();
  const navigate = useNavigate();
  
  // Handle continuing without saving
  const handleContinueWithoutSaving = () => {
    // Continue with the game but don't save the score
    setGameState('ended');
    toast.info(`Score not saved due to free plan limits (${currentScoreSaveCount}/${scoreSaveLimit} saves used)`);
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
      description={`Your current plan allows up to ${scoreSaveLimit} saved scores. You've used ${currentScoreSaveCount} saves. Upgrade your account to save more scores.`}
      continueText="Continue without saving"
      cancelText="Upgrade"
      onContinue={handleContinueWithoutSaving}
      onCancel={handleUpgrade}
    />
  );
}
