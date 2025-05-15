
import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import GameProvider from '@/context/GameProvider';
import Header from '@/components/Header';
import Footer from '@/components/common/Footer';
import MathBackground from '@/components/common/MathBackground';
import useGame from '@/context/useGame';

// Component to conditionally render header based on game state
const ConditionalHeader = () => {
  const { gameState } = useGame();
  
  // Hide header during gameplay, warmup, and countdown states
  if (gameState === 'playing' || gameState === 'warmup' || 
      gameState === 'countdown' || gameState === 'warmup-countdown') {
    return null;
  }
  
  return <Header />;
};

// Component to conditionally render footer based on game state
const ConditionalFooter = () => {
  const { gameState } = useGame();
  
  // Hide footer during gameplay, warmup, and countdown states
  if (gameState === 'playing' || gameState === 'warmup' || 
      gameState === 'countdown' || gameState === 'warmup-countdown') {
    return null;
  }
  
  // Return the Footer component directly - not wrapping in a div that might interfere with links
  return <Footer />;
};

const GameLayout = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change or game completion
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <GameProvider>
      <div className="min-h-screen flex flex-col bg-background relative">
        <MathBackground />
        <div className="sticky top-0 z-50">
          <ConditionalHeader />
        </div>
        <main className="flex-1 relative z-10">
          <Outlet />
        </main>
        {/* Ensure Footer has proper z-index and isn't being obstructed */}
        <div className="relative z-10">
          <ConditionalFooter />
        </div>
      </div>
    </GameProvider>
  );
};

export default GameLayout;
