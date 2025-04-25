
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import GameContext from './GameContext';
import { GameContextType, GameState, GameProviderProps } from './game-context-types';
import { useGameSettings } from './hooks/useGameSettings';
import { useProblemGenerator } from './hooks/useProblemGenerator';
import { useScoreManagement } from './hooks/useScoreManagement';
import { useAuth } from './hooks/useAuth';
import { showToastOnce } from '@/utils/toastManager';

const GameProvider = ({ children }: GameProviderProps) => {
  const { settings, updateSettings, resetSettings } = useGameSettings();
  const { currentProblem, generateNewProblem } = useProblemGenerator();
  const { logout: authLogout } = useAuth();
  
  const [gameState, setGameState] = useState<GameState>('selection');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.timerSeconds);
  const [userAnswer, setUserAnswer] = useState('');
  const [focusNumber, setFocusNumber] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const didSetupRef = React.useRef(false);
  const initialSessionCheckRef = React.useRef(false);

  const { 
    scoreHistory, 
    fetchUserScores, 
    saveScore, 
    getIsHighScore,
    setScoreHistory 
  } = useScoreManagement(userId);

  // Add console logs to debug toast issues
  console.log('GameProvider rendered, isLoggedIn:', isLoggedIn);

  useEffect(() => {
    if (didSetupRef.current) return;
    didSetupRef.current = true;

    console.log('Setting up session and auth listener in GameProvider');
    
    // Check for existing session on mount first
    if (!initialSessionCheckRef.current) {
      initialSessionCheckRef.current = true;
      
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        console.log('Initial session check:', session ? 'Session exists' : 'No session');
        
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
    }

    // Set up auth listener after checking for session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed in GameProvider:', event);
        
        if (session?.user) {
          if (event === 'SIGNED_IN') {
            console.log('User signed in, updating state');
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
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, updating state');
          setIsLoggedIn(false);
          setUserId(null);
          setUsername('');
          setScoreHistory([]);
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

  // Effect to show signup prompt toast when game ends for non-logged-in users
  useEffect(() => {
    if (gameState === 'ended' && !isLoggedIn) {
      showToastOnce({
        id: 'signup-prompt',
        message: "Sign up to track your scores",
        type: 'info',
        duration: 5000
      });
    }
  }, [gameState, isLoggedIn]);

  const incrementScore = () => {
    setScore(prev => prev + 1);
  };
  
  const resetScore = () => {
    setScore(0);
  };

  const handleLogout = async (): Promise<boolean> => {
    try {
      console.log('Handling logout in GameProvider');
      const success = await authLogout();
      if (success) {
        setIsLoggedIn(false);
        setUserId(null);
        setUsername('');
        setScoreHistory([]);
      }
      return success;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
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
