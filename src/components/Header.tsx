
import React from 'react';
import useGame from '@/context/useGame';
import { Button } from '@/components/ui/button';
import AuthModal from './auth/AuthModal';
import UserProfile from './user/UserProfile';
import { Clock } from 'lucide-react';

const Header = () => {
  const { gameState, isLoggedIn, setGameState, userProfile } = useGame();
  
  if (gameState === 'playing') return null;
  
  const handleLogoClick = () => {
    setGameState('selection');
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
      
      <div className="flex items-center">
        <div className="mr-2 text-xs bg-accent/10 rounded-full px-3 py-1 text-accent-foreground hidden sm:block">
          Math practice for kids!
        </div>
        
        {isLoggedIn ? (
          <div className="relative">
            <UserProfile />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <AuthModal defaultView="login">
              <Button variant="ghost" size="sm">
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
