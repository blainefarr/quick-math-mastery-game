
import React, { useEffect } from 'react';
import { useGame } from '@/context/useGame';
import { SavedScoresPaywallModal } from './SavedScoresPaywallModal';
import { useAuth } from '@/context/auth/useAuth';

export function GamePaywallManager() {
  const {
    showScoreSavePaywall,
    setShowScoreSavePaywall,
    scoreSaveLimit,
    currentScoreSaveCount,
    hasSaveScoreLimitReached
  } = useGame();

  const { planType } = useAuth();
  
  // Debug effect to log paywall status
  useEffect(() => {
    if (planType === 'free') {
      console.log('Game Paywall Manager Status:', {
        planType,
        scoreSaveLimit,
        currentScoreSaveCount,
        showScoreSavePaywall,
        limitReached: hasSaveScoreLimitReached ? hasSaveScoreLimitReached() : 'function not available'
      });
    }
  }, [planType, scoreSaveLimit, currentScoreSaveCount, showScoreSavePaywall, hasSaveScoreLimitReached]);

  return (
    <>
      <SavedScoresPaywallModal
        open={showScoreSavePaywall}
        onOpenChange={setShowScoreSavePaywall}
        scoreSaveLimit={scoreSaveLimit}
      />
    </>
  );
}
