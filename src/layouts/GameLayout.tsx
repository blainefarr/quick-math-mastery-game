
import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import GameProvider from '@/context/GameProvider';
import Header from '@/components/Header';
import MathBackground from '@/components/common/MathBackground';
import useGame from '@/context/useGame';

const GameLayout = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change or game completion
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <GameProvider>
      <GameLayoutContent />
    </GameProvider>
  );
};

// Separate component so it can access the GameProvider context
const GameLayoutContent = () => {
  const { gameState } = useGame();
  
  // Don't show header during active gameplay or typing warmup
  const hideHeader = ['playing', 'warmup', 'countdown', 'warmup-countdown'].includes(gameState);
  
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <MathBackground />
      {!hideHeader && <Header />}
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default GameLayout;
