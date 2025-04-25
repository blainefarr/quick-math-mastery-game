
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AuthModal from './auth/AuthModal';
import UserProfile from './user/UserProfile';
import { Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Custom hook that safely tries to use game context if available
const useSafeGame = () => {
  try {
    // Dynamically import to avoid reference errors
    const { useGame } = require('@/context/useGame');
    return useGame();
  } catch (error) {
    // Return default values that match the shape of game context
    return {
      gameState: undefined,
      isLoggedIn: false,
      setGameState: () => {},
      handleLogout: async () => {
        await supabase.auth.signOut();
      },
    };
  }
};

const Header = () => {
  const navigate = useNavigate();
  const { gameState, isLoggedIn, setGameState } = useSafeGame();
  const [authStatus, setAuthStatus] = React.useState<boolean | null>(null);
  
  // Check authentication status directly from Supabase as a fallback
  React.useEffect(() => {
    if (authStatus === null) {
      const checkAuth = async () => {
        const { data } = await supabase.auth.getSession();
        setAuthStatus(!!data.session);
      };
      checkAuth();
    }
  }, [authStatus]);
  
  // Skip rendering header during active gameplay
  if (gameState === 'playing') return null;
  
  const handleLogoClick = () => {
    if (setGameState) {
      setGameState('selection');
    }
    navigate('/');
  };

  // Use either the context's isLoggedIn or the direct auth check
  const userIsLoggedIn = isLoggedIn || authStatus;
  
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
        
        {userIsLoggedIn ? (
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
