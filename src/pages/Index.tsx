
import React, { useEffect } from 'react';
import OperationSelection from '@/components/OperationSelection';
import GameScreen from '@/components/GameScreen';
import EndScreen from '@/components/EndScreen';
import useGame from '@/context/useGame';
import TypingWarmup from '@/components/TypingWarmup';
import GameCountdown from '@/components/GameCountdown';
import HomeSeoContent from '@/components/home/HomeSeoContent';
import logger from '@/utils/logger';

// Main content that uses the game context
const Index = () => {
  const { 
    gameState, 
    setGameState, 
    settings, 
    setTypingSpeed, 
    hasSaveScoreLimitReached,
    setCanSaveCurrentScore 
  } = useGame();
  
  // Define the typing warmup duration
  const TYPING_WARMUP_DURATION = 15;
  
  // Reset canSaveCurrentScore when returning to selection screen
  useEffect(() => {
    if (gameState === 'selection') {
      // Check if user can save scores based on their plan limit
      const limitReached = hasSaveScoreLimitReached();
      setCanSaveCurrentScore(!limitReached);
      
      logger.debug({
        message: 'Reset game state and score saving capability',
        gameState,
        canSave: !limitReached,
        limitReached
      });
    }
  }, [gameState, setCanSaveCurrentScore, hasSaveScoreLimitReached]);
  
  const handleWarmupComplete = (speed: number) => {
    logger.debug({
      message: 'Typing warmup completed',
      speed
    });
    setTypingSpeed(speed);
    setGameState('countdown');
  };

  const handleWarmupCountdownComplete = () => {
    setGameState('warmup');
  };

  const handleCountdownComplete = () => {
    setGameState('playing');
  };

  return (
    <>
      {gameState === 'selection' && (
        <>
          <OperationSelection />
          <HomeSeoContent />
        </>
      )}
      {gameState === 'warmup-countdown' && 
        <GameCountdown 
          onComplete={handleWarmupCountdownComplete}
          message="Let's start with a typing warmup!"
          isTypingWarmup={true}
          upcomingDuration={TYPING_WARMUP_DURATION}
        />
      }
      {gameState === 'warmup' && 
        <TypingWarmup 
          timeLimit={TYPING_WARMUP_DURATION}
          customNumberPadEnabled={settings.useCustomNumberPad || false}
          onComplete={handleWarmupComplete}
        />
      }
      {gameState === 'countdown' && 
        <GameCountdown 
          onComplete={handleCountdownComplete}
          upcomingDuration={settings.timerSeconds}
        />
      }
      {gameState === 'playing' && <GameScreen />}
      {gameState === 'ended' && <EndScreen />}
    </>
  );
};

export default Index;
