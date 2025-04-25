
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import GameContext from './GameContext';
import { GameContextType, GameState, GameProviderProps } from './game-context-types';
import { useGameSettings } from './hooks/useGameSettings';
import { useProblemGenerator } from './hooks/useProblemGenerator';
import { useScoreManagement } from './hooks/useScoreManagement';
import { toast } from 'sonner';
import { Operation, ProblemRange } from '@/types';

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

  // Derive operation and range directly from settings for easier access
  const operation: Operation = settings.operation;
  const range: ProblemRange = settings.range;
  const allowNegatives: boolean = settings.allowNegatives || false;

  const { 
    scoreHistory, 
    fetchUserScores, 
    saveScore, 
    getIsHighScore,
    setScoreHistory 
  } = useScoreManagement(userId);

  // Handle authentication state changes
  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed in GameProvider:', event);
        
        if (event === 'SIGNED_OUT') {
          setIsLoggedIn(false);
          setUserId(null);
          setUsername('');
          setScoreHistory([]);
          
          // Explicitly clear stored sessions to prevent auto-login on refresh
          localStorage.removeItem('supabase.auth.token');
          sessionStorage.removeItem('supabase.auth.token');
          localStorage.clear();
          sessionStorage.clear();
          
          // Force redirect to home page after logout
          window.location.href = '/';
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
          
          // Fetch scores after login
          const scores = await fetchUserScores();
          setScoreHistory(scores);
        }
      }
    );

    // Then check initial session
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
        
        // Fetch scores on initial load if logged in
        const scores = await fetchUserScores();
        setScoreHistory(scores);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserScores]);

  // Refresh scores when gameState changes to 'ended'
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

  // Custom logout function that thoroughly cleans up session data
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      
      // Clear local state
      setIsLoggedIn(false);
      setUserId(null);
      setUsername('');
      setScoreHistory([]);
      
      // Explicitly clear stored tokens
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const value: GameContextType = {
    gameState,
    setGameState,
    settings,
    updateSettings,
    resetSettings,
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
    logout,
    operation,
    range,
    allowNegatives
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;
