
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import GameProvider from '@/context/GameProvider';
import useAuth from '@/context/auth/useAuth';

const GameLayout = () => {
  const { rememberCurrentRoute } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if there's a stored path to restore after refresh
    const lastPath = localStorage.getItem('last_path');
    if (lastPath && window.location.pathname === '/') {
      navigate(lastPath, { replace: true });
      localStorage.removeItem('last_path');
    } else {
      // Remember the current route for future refreshes
      rememberCurrentRoute();
    }
  }, [navigate, rememberCurrentRoute]);
  
  return (
    <GameProvider>
      <Header />
      <Outlet />
    </GameProvider>
  );
};

export default GameLayout;
