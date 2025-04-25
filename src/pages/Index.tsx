
import React from 'react';
import OperationSelection from '@/components/OperationSelection';
import GameScreen from '@/components/GameScreen';
import EndScreen from '@/components/EndScreen';
import useGame from '@/context/useGame';

// Main content that uses the game context
const Index = () => {
  const { gameState } = useGame();
  
  return (
    <>
      {gameState === 'selection' && <OperationSelection />}
      {gameState === 'playing' && <GameScreen />}
      {gameState === 'ended' && <EndScreen />}
    </>
  );
};

export default Index;
