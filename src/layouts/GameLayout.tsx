
import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import GameProvider from '@/context/GameProvider';
import Header from '@/components/Header';
import MathBackground from '@/components/common/MathBackground';

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
        <Header />
        <main className="flex-1 relative z-10">
          <Outlet />
        </main>
      </div>
    </GameProvider>
  );
};

export default GameLayout;
