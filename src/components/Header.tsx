
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AuthModal from './auth/AuthModal';
import UserProfile from './user/UserProfile';
import { Clock, Trophy, TrendingUp, LayoutTemplate } from 'lucide-react';
import useAuth from '@/context/auth/useAuth';
import useGame from '@/context/useGame';

const Header = () => {
  const { isLoggedIn, planType } = useAuth();
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

  const isFreeTier = planType === 'free' || planType === 'guest';
  
  return (
    <header className="w-full py-4 px-6 flex justify-between items-center bg-white/50 backdrop-blur-sm shadow-sm sticky top-0 z-50">
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
              onClick={() => navigate('/leaderboard')}
            >
              <Trophy size={18} />
              Leaderboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex items-center gap-2"
              onClick={() => navigate('/plans')}
            >
              <LayoutTemplate size={18} />
              Plans
            </Button>
          </>
        )}
        
        {isLoggedIn && isFreeTier && (
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-2 text-primary border-primary hover:bg-primary/10"
            onClick={() => navigate('/plans')}
          >
            Upgrade
          </Button>
        )}
        
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
