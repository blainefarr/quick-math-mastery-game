
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AuthModal from './auth/AuthModal';
import UserProfile from './user/UserProfile';
import { Clock, Trophy, TrendingUp } from 'lucide-react';
import useAuth from '@/context/auth/useAuth';
import useGame from '@/context/useGame';

const Header = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isGameRoute = location.pathname === '/';
  const gameState = isGameRoute ? useGame()?.gameState : null;
  
  if (isGameRoute && gameState === 'playing') return null;
  
  const handleLogoClick = () => {
    if (isGameRoute && gameState) {
      useGame().setGameState('selection');
    } else {
      navigate('/');
    }
  };
  
  return (
    <header className="w-full py-4 px-6 flex justify-between items-center bg-white/50 backdrop-blur-sm shadow-sm">
      <div 
        className="flex items-center cursor-pointer" 
        onClick={handleLogoClick}
      >
        <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center mr-3 shadow-md">
          <Clock size={20} />
        </div>
        <h1 className="text-2xl font-bold text-primary math-font">
          <span className="text-accent">Minute</span> Math
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        {isLoggedIn && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex items-center gap-2"
              onClick={() => navigate('/progress')}
            >
              <TrendingUp size={18} />
              My Progress
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex items-center gap-2"
              onClick={() => navigate('/leaderboard')}
            >
              <Trophy size={18} />
              Leaderboard
            </Button>
          </>
        )}

        <div className="mr-2 text-xs bg-accent/10 rounded-full px-3 py-1 text-accent-foreground hidden sm:block">
          {isLoggedIn ? 'Track your progress!' : 'Login to save your scores!'}
        </div>
        
        {isLoggedIn ? (
          <UserProfile />
        ) : (
          <div className="flex items-center gap-2">
            <AuthModal defaultView="login">
              <Button variant="outline" size="sm" className="shadow-sm hover:shadow">
                Login
              </Button>
            </AuthModal>
            <AuthModal defaultView="register">
              <Button variant="default" size="sm" className="shadow-sm hover:shadow font-semibold">
                Sign Up
              </Button>
            </AuthModal>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
