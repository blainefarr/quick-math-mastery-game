
import React from 'react';
import OperationSelection from '@/components/OperationSelection';
import GameScreen from '@/components/GameScreen';
import EndScreen from '@/components/EndScreen';
import useGame from '@/context/useGame';
import TypingWarmup from '@/components/TypingWarmup';
import GameCountdown from '@/components/GameCountdown';

// Main content that uses the game context
const Index = () => {
  const { gameState, setGameState, settings, setTypingSpeed } = useGame();
  
  // Define the typing warmup duration
  const TYPING_WARMUP_DURATION = 15;
  
  const handleWarmupComplete = (speed: number) => {
    console.log('Typing warmup completed with speed:', speed);
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
      {gameState === 'selection' && <OperationSelection />}
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
