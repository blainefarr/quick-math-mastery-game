
import React from 'react';
import GameProvider from '@/context/GameProvider';
import Header from '@/components/Header';
import OperationSelection from '@/components/OperationSelection';
import GameScreen from '@/components/GameScreen';
import EndScreen from '@/components/EndScreen';
import useGame from '@/context/useGame';
import MathBackground from '@/components/common/MathBackground';

// Main content that uses the game context
const GameContent = () => {
  const { gameState } = useGame();
  
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background math symbols */}
      <MathBackground />
      
      {/* Main content */}
      <Header />
      <main className="flex-1 relative z-10">
        {gameState === 'selection' && <OperationSelection />}
        {gameState === 'playing' && <GameScreen />}
        {gameState === 'ended' && <EndScreen />}
      </main>
    </div>
  );
};

// Index page with context provider
const Index = () => {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
};

export default Index;
