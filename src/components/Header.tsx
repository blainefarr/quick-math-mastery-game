
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AuthModal from './auth/AuthModal';
import UserProfile from './user/UserProfile';
import { Trophy, LayoutTemplate, Menu, X } from 'lucide-react';
import useAuth from '@/context/auth/useAuth';
import useGame from '@/context/useGame';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';

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
  
  // Ensure consistent header styling across all layouts
  const headerClasses = "w-full py-4 px-6 flex justify-between items-center bg-white/50 backdrop-blur-sm shadow-sm z-50";
  
  return (
    <header className={headerClasses}>
      <div 
        className="flex items-center cursor-pointer" 
        onClick={handleLogoClick}
      >
        {/* Updated logo with new image */}
        <img 
          src="/lovable-uploads/4463cbd4-7351-4295-8e2c-325db82c4e6c.png" 
          alt="Mental Math Logo" 
          className="w-10 h-10 mr-3" 
        />
        <h1 className="text-2xl font-bold text-primary math-font">
          Mental Math
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Show these buttons to everyone, logged in or not - only on larger screens */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden md:flex items-center gap-2"
          onClick={() => navigate('/leaderboard')}
        >
          <Trophy size={18} />
          Leaderboard
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="hidden md:flex items-center gap-2"
          onClick={() => navigate('/plans')}
        >
          <LayoutTemplate size={18} />
          Plans
        </Button>
        
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
        
        {/* Mobile hamburger menu - updated to use Sheet for side menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu size={24} />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[250px] sm:w-[300px] p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="p-4 space-y-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate('/leaderboard')}
              >
                <Trophy size={18} className="mr-2" />
                Leaderboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate('/plans')}
              >
                <LayoutTemplate size={18} className="mr-2" />
                Plans
              </Button>
              {isLoggedIn && isFreeTier && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-primary border-primary hover:bg-primary/10"
                  onClick={() => navigate('/plans')}
                >
                  Upgrade
                </Button>
              )}
              <SheetClose asChild>
                <Button variant="outline" size="sm" className="w-full mt-4">Close</Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
