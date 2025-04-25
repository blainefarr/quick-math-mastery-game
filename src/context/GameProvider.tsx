
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import GameContext from './GameContext';
import { GameContextType, GameState, GameProviderProps } from './game-context-types';
import { useGameSettings } from './hooks/useGameSettings';
import { useProblemGenerator } from './hooks/useProblemGenerator';
import { useScoreManagement } from './hooks/useScoreManagement';
import { toast } from 'sonner';
import { useAuth } from './hooks/useAuth';

const GameProvider = ({ children }: GameProviderProps) => {
  const { settings, updateSettings, resetSettings } = useGameSettings();
  const { currentProblem, generateNewProblem } = useProblemGenerator();
  const { logout } = useAuth();
  
  const [gameState, setGameState] = useState<GameState>('selection');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.timerSeconds);
  const [userAnswer, setUserAnswer] = useState('');
  const [focusNumber, setFocusNumber] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const didSetupRef = React.useRef(false);

  const { 
    scoreHistory, 
    fetchUserScores, 
    saveScore, 
    getIsHighScore,
    setScoreHistory 
  } = useScoreManagement(userId);

  useEffect(() => {
    if (didSetupRef.current) return;
    didSetupRef.current = true;

    // Check for existing session on mount first
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setUserId(session.user.id);
        setUsername(
          session.user.user_metadata?.name ??
          session.user.email?.split('@')[0] ??
          session.user.email ??
          ""
        );
        
        const scores = await fetchUserScores();
        setScoreHistory(scores);
      }
    });

    // Set up auth listener after checking for session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          if (event === 'SIGNED_IN') {
            setIsLoggedIn(true);
            setUserId(session.user.id);
            setUsername(
              session.user.user_metadata?.name ??
              session.user.email?.split('@')[0] ??
              session.user.email ??
              ""
            );
            
            // Only show toast for actual sign-in events, not session recovery
            toast.success("Successfully logged in!");
            
            const scores = await fetchUserScores();
            setScoreHistory(scores);
          }
        } else if (event === 'SIGNED_OUT') {
          setIsLoggedIn(false);
          setUserId(null);
          setUsername('');
          setScoreHistory([]);
          
          // We'll handle the logout toast in useAuth.tsx to avoid duplicates
        }
      }
    );

    return () => { 
      subscription.unsubscribe();
      didSetupRef.current = false;
    };
  }, [fetchUserScores]);

  useEffect(() => {
    if (gameState === 'ended' && isLoggedIn && userId) {
      fetchUserScores().then(scores => {
        if (scores) {
          setScoreHistory(scores);
        }
      });
    }
  }, [gameState, isLoggedIn, userId, fetchUserScores]);

  const incrementScore = () => {
    setScore(prev => prev + 1);
  };
  
  const resetScore = () => {
    setScore(0);
  };

  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) {
        setIsLoggedIn(false);
        setUserId(null);
        setUsername('');
        setScoreHistory([]);
      }
      return success; // Return the boolean result from the logout function
    } catch (error) {
      console.error('Error during logout:', error);
      return false; // Return false in case of error
    }
  };

  const value: GameContextType = {
    gameState,
    setGameState,
    settings,
    updateSettings,
    score,
    incrementScore,
    resetScore,
    currentProblem,
    generateNewProblem,
    timeLeft,
    setTimeLeft,
    userAnswer,
    setUserAnswer,
    scoreHistory,
    saveScore,
    isLoggedIn,
    setIsLoggedIn,
    username,
    setUsername,
    focusNumber,
    setFocusNumber,
    getIsHighScore,
    userId,
    logout: handleLogout
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;
