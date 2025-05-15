
import React from 'react';
import { useGame } from '@/context/useGame';
import { SavedScoresPaywallModal } from './SavedScoresPaywallModal';
import { useAuth } from '@/context/auth/useAuth';

export function GamePaywallManager() {
  const {
    showScoreSavePaywall,
    setShowScoreSavePaywall,
    scoreSaveLimit,
    currentScoreSaveCount,
    hasSaveScoreLimitReached,
    gameState,
    setGameState,
    setCanSaveCurrentScore
  } = useGame();

  const { planType } = useAuth();
  
  return (
    <>
      <SavedScoresPaywallModal
        open={showScoreSavePaywall}
        onOpenChange={(open) => {
          setShowScoreSavePaywall(open);
          
          // If user is closing the modal without making a choice,
          // we'll assume they're not proceeding with the game
          if (!open && gameState === 'selection') {
            // Do nothing - let them stay on the selection screen
            console.log('User closed the paywall modal without making a choice');
          }
        }}
        scoreSaveLimit={scoreSaveLimit}
      />
    </>
  );
}
