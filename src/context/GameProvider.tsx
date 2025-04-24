
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

  // Handle authentication state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
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
          console.log("Fetched scores after auth change:", scores?.length || 0);
          setScoreHistory(scores);
        } else {
          setIsLoggedIn(false);
          setUserId(null);
          setUsername('');
          setScoreHistory([]);
        }
      }
    );

    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        console.log("Initial auth session found:", session.user.id);
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
        console.log("Fetched scores on initial load:", scores?.length || 0);
        setScoreHistory(scores);
      } else {
        console.log("No initial auth session");
      }
    });

    return () => { subscription.unsubscribe(); };
  }, [fetchUserScores]);

  // Refresh scores when gameState changes to 'ended'
  useEffect(() => {
    if (gameState === 'ended' && isLoggedIn && userId) {
      console.log("Game ended, refreshing scores");
      fetchUserScores().then(scores => {
        console.log("Updated scores after game end:", scores?.length || 0);
        setScoreHistory(scores);
      });
    }
  }, [gameState, isLoggedIn, userId, fetchUserScores]);

  const incrementScore = () => {
    setScore(prev => {
      console.log(`Incrementing score from ${prev} to ${prev + 1}`);
      return prev + 1;
    });
  };
  
  const resetScore = () => {
    console.log("Resetting score to 0");
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
    userId
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;
