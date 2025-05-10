
import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import GameProvider from '@/context/GameProvider';
import Header from '@/components/Header';
import MathBackground from '@/components/common/MathBackground';
import useGame from '@/context/useGame';

// Component to conditionally render header based on game state
const ConditionalHeader = () => {
  const { gameState } = useGame();
  
  // Hide header during gameplay and warmup
  if (gameState === 'playing' || gameState === 'warmup') {
    return null;
  }
  
  return <Header />;
};

const GameLayout = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change or game completion
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <GameProvider>
      <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
        <MathBackground />
        <ConditionalHeader />
        <main className="flex-1 relative z-10">
          <Outlet />
        </main>
      </div>
    </GameProvider>
  );
};

export default GameLayout;
