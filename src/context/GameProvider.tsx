
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import GameContext from './GameContext';
import { GameContextType, GameState, GameProviderProps } from './game-context-types';
import { useGameSettings } from './hooks/useGameSettings';
import { useProblemGenerator } from './hooks/useProblemGenerator';
import { useScoreManagement } from './hooks/useScoreManagement';

const GameProvider = ({ children }: GameProviderProps) => {
  const { settings, updateSettings, resetSettings } = useGameSettings();
  const { currentProblem, generateNewProblem } = useProblemGenerator();
  
  const [gameState, setGameState] = useState<GameState>('selection');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.timerSeconds);
  const [userAnswer, setUserAnswer] = useState('');
  const [focusNumber, setFocusNumber] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  const { 
    scoreHistory, 
    fetchUserScores, 
    saveScore, 
    getIsHighScore,
    setScoreHistory 
  } = useScoreManagement(userId);

  // Comprehensive logout function that ensures all session data is cleared
  const handleLogout = async () => {
    try {
      console.log('Logout initiated');
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signOut error:', error);
        throw error;
      }
      
      // Reset all authentication states
      setIsLoggedIn(false);
      setUserId(null);
      setUsername('');
      setScoreHistory([]);
      
      // Clear all local storage and session storage
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      
      // Don't use a full clear as it might affect other app functionality
      // Instead, remove specific auth-related items
      const authItems = ['supabase.auth.token', 'supabase-auth-token'];
      authItems.forEach(item => {
        localStorage.removeItem(item);
        sessionStorage.removeItem(item);
      });

      console.log('Logout completed successfully');
    } catch (error) {
      console.error('Error during logout process:', error);
      // Even if error occurs, still reset client-side state
      setIsLoggedIn(false);
      setUserId(null);
      setUsername('');
      setScoreHistory([]);
    }
  };

  useEffect(() => {
    // Handle auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed in GameProvider:', event);
        
        if (event === 'SIGNED_OUT') {
          setIsLoggedIn(false);
          setUserId(null);
          setUsername('');
          setScoreHistory([]);
          return;
        }
        
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
      }
    );

    // Check for existing session on initial load
    const checkExistingSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('Existing session found, user:', session.user.email);
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
        } else {
          console.log('No existing session found');
          // Ensure we're truly logged out
          setIsLoggedIn(false);
          setUserId(null);
          setUsername('');
          setScoreHistory([]);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };
    
    checkExistingSession();

    return () => {
      subscription.unsubscribe();
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
    handleLogout
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;
