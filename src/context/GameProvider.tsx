
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import GameContext from './GameContext';
import { GameContextType, GameState, GameProviderProps } from './game-context-types';
import { useGameSettings } from './hooks/useGameSettings';
import { useProblemGenerator } from './hooks/useProblemGenerator';
import { useScoreManagement } from './hooks/useScoreManagement';
import { Operation, ProblemRange } from '@/types';
import { toast } from 'sonner';

const GameProvider = ({ children }: GameProviderProps) => {
  const { settings, updateSettings, resetSettings } = useGameSettings();
  const { currentProblem, generateNewProblem: generateProblem } = useProblemGenerator();
  
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
    saveScore: saveFinalScore, 
    getIsHighScore,
    setScoreHistory 
  } = useScoreManagement(userId);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Clear local storage items related to auth
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      
      // Don't toast here - we'll let the auth state change event handle this
      setIsLoggedIn(false);
      setUserId(null);
      setUsername('');
      setScoreHistory([]);
    } catch (error) {
      console.error('Error signing out:', error);
      toast('Failed to log out');
    }
  };

  // Handle authentication state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setIsLoggedIn(false);
          setUserId(null);
          setUsername('');
          setScoreHistory([]);
          toast('Logged out successfully');
        } else if (session?.user) {
          setIsLoggedIn(true);
          setUserId(session.user.id);
          setUsername(
            session.user.user_metadata?.name ??
            session.user.email?.split('@')[0] ??
            session.user.email ??
            ""
          );
          
          // Fetch scores after login
          setTimeout(() => {
            fetchUserScores().then(scores => {
              if (scores) {
                setScoreHistory(scores);
              }
            });
          }, 0);
        }
      }
    );

    // Check initial session
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

    return () => { subscription.unsubscribe(); };
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

  // Wrapper for generateNewProblem to match the interface
  const generateNewProblemWrapper = (
    operation?: Operation, 
    range?: ProblemRange,
    allowNegatives?: boolean,
    focusNumber?: number | null
  ) => {
    return generateProblem(
      operation || settings.operation, 
      range || settings.range,
      allowNegatives !== undefined ? allowNegatives : settings.allowNegatives || false,
      focusNumber !== undefined ? focusNumber : settings.focusNumber || null
    );
  };
  
  // Wrapper for saveScore to match the interface
  const saveScoreWrapper = async (
    finalScore?: number, 
    operation?: Operation, 
    range?: ProblemRange, 
    timerSeconds?: number,
    focusNumberVal?: number | null,
    allowNegatives?: boolean
  ) => {
    const result = await saveFinalScore(
      finalScore !== undefined ? finalScore : score,
      operation || settings.operation,
      range || settings.range,
      timerSeconds || settings.timerSeconds,
      focusNumberVal !== undefined ? focusNumberVal : settings.focusNumber || null,
      allowNegatives !== undefined ? allowNegatives : settings.allowNegatives || false
    );
    
    return result;
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
    generateNewProblem: generateNewProblemWrapper,
    timeLeft,
    setTimeLeft,
    userAnswer,
    setUserAnswer,
    scoreHistory,
    saveScore: saveScoreWrapper,
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
