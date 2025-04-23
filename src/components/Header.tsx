
import React from 'react';
import useGame from '@/context/useGame';
import { Button } from '@/components/ui/button';
import AuthModal from './auth/AuthModal';
import UserProfile from './user/UserProfile';
import { Clock } from 'lucide-react';

const Header = () => {
  const { gameState, isLoggedIn } = useGame();
  
  // Only show header if on selection screen or game ended
  if (gameState === 'playing') return null;
  
  return (
    <header className="w-full py-4 px-6 flex justify-between items-center bg-white/50 backdrop-blur-sm shadow-sm">
      <div className="flex items-center">
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
          <UserProfile />
        ) : (
          <AuthModal>
            <Button variant="outline" size="sm" className="shadow-sm hover:shadow">
              Login / Register
            </Button>
          </AuthModal>
        )}
      </div>
    </header>
  );
};

export default Header;
