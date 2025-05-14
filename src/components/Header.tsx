
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AuthModal from './auth/AuthModal';
import UserProfile from './user/UserProfile';
import { Trophy, LayoutTemplate } from 'lucide-react';
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
  
  // Ensure consistent header styling across all layouts
  const headerClasses = "w-full py-4 px-6 flex justify-between items-center bg-white/50 backdrop-blur-sm shadow-sm z-50";
  
  return (
    <header className={headerClasses}>
      <div 
        className="flex items-center cursor-pointer" 
        onClick={handleLogoClick}
      >
        {/* Updated logo to use the new image */}
        <img 
          src="/lovable-uploads/bde173f2-96b8-4d53-b2e1-e352b314f98b.png" 
          alt="Mental Math Logo" 
          className="w-10 h-10 mr-3 shadow-md" 
        />
        <h1 className="text-2xl font-bold text-primary math-font">
          <span className="text-accent">Practice</span> Mental Math
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Show these buttons to everyone, logged in or not */}
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
