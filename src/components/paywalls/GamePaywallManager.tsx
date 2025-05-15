
import React from 'react';
import { useGame } from '@/context/useGame';
import { SavedScoresPaywallModal } from './SavedScoresPaywallModal';

export function GamePaywallManager() {
  const {
    showScoreSavePaywall,
    setShowScoreSavePaywall,
    scoreSaveLimit
  } = useGame();

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
