
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AuthModal from './auth/AuthModal';
import UserProfile from './user/UserProfile';
import { Clock, ArrowLeft } from 'lucide-react';
import useAuth from '@/context/auth/useAuth';
import useGame from '@/context/useGame';

const Header = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on a game route
  const isGameRoute = location.pathname === '/';
  // Try to safely access gameState only if we're on a game route
  const gameState = isGameRoute ? useGame()?.gameState : null;
  
  // Hide header during gameplay
  if (isGameRoute && gameState === 'playing') return null;
  
  const handleLogoClick = () => {
    if (isGameRoute && gameState) {
      useGame().setGameState('selection');
    } else {
      navigate('/');
    }
  };

  const showBackButton = location.pathname !== '/';
  
  return (
    <header className="w-full py-4 px-6 flex justify-between items-center bg-white/50 backdrop-blur-sm shadow-sm">
      <div className="flex items-center">
        {showBackButton ? (
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </Button>
        ) : null}
        
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
      </div>
      
      <div className="flex items-center">
        <div className="mr-2 text-xs bg-accent/10 rounded-full px-3 py-1 text-accent-foreground hidden sm:block">
          Math practice for kids!
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
