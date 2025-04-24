
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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setIsLoggedIn(true);
          setUserId(session.user.id);
          setUsername(
            session.user.user_metadata?.name ??
            session.user.email?.split('@')[0] ??
            session.user.email ??
            ""
          );
        } else {
          setIsLoggedIn(false);
          setUserId(null);
          setUsername('');
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setUserId(session.user.id);
        setUsername(
          session.user.user_metadata?.name ??
          session.user.email?.split('@')[0] ??
          session.user.email ??
          ""
        );
      }
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchUserScores().then(scores => {
        setScoreHistory(scores);
      });
    }
  }, [isLoggedIn, userId, fetchUserScores]);

  const incrementScore = () => setScore(prev => prev + 1);
  const resetScore = () => setScore(0);

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
