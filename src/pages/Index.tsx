
import React from 'react';
import OperationSelection from '@/components/OperationSelection';
import GameScreen from '@/components/GameScreen';
import EndScreen from '@/components/EndScreen';
import useGame from '@/context/useGame';
import TypingWarmup from '@/components/TypingWarmup';

// Main content that uses the game context
const Index = () => {
  const { gameState, setGameState, settings, setTypingSpeed } = useGame();
  
  const handleWarmupComplete = (speed: number) => {
    console.log('Typing warmup completed with speed:', speed);
    setTypingSpeed(speed);
    setGameState('playing');
  };

  return (
    <>
      {gameState === 'selection' && <OperationSelection />}
      {gameState === 'warmup' && 
        <TypingWarmup 
          timeLimit={15}
          customNumberPadEnabled={settings.useCustomNumberPad || false}
          onComplete={handleWarmupComplete}
        />
      }
      {gameState === 'playing' && <GameScreen />}
      {gameState === 'ended' && <EndScreen />}
    </>
  );
};

export default Index;
