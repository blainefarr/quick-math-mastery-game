
import React, { useState, useEffect, useRef } from 'react';
import GameContext from './GameContext';
import { GameContextType, GameState, GameProviderProps, GameEndReason } from './game-context-types';
import { useGameSettings } from './hooks/useGameSettings';
import { useProblemGenerator } from './hooks/useProblemGenerator';
import { useScoreManagement } from './hooks/useScoreManagement';
import { useAuth } from './auth/useAuth';
import { toast } from 'sonner';

const GameProvider = ({ children }: GameProviderProps) => {
  const { settings, updateSettings, resetSettings } = useGameSettings();
  const { currentProblem, generateNewProblem } = useProblemGenerator();
  const { userId, defaultProfileId, isAuthenticated, username } = useAuth();
  
  const [gameState, setGameState] = useState<GameState>('selection');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.timerSeconds);
  const [userAnswer, setUserAnswer] = useState('');
  const [focusNumber, setFocusNumber] = useState<number | null>(null);
  
  const scoreRef = useRef(0);
  const gameStateRef = useRef<GameState>('selection');
  const timerRef = useRef<number | null>(null);
  const isEndingRef = useRef(false);
  const timerInitializedRef = useRef(false);
  const authInitializedRef = useRef(false);

  const { 
    scoreHistory, 
    fetchUserScores, 
    saveScore, 
    getIsHighScore,
    setScoreHistory 
  } = useScoreManagement(userId);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    gameStateRef.current = gameState;
    
    if (gameState === 'playing' && !timerInitializedRef.current) {
      console.log('Starting game timer due to gameState change to playing');
      startGameTimer();
      timerInitializedRef.current = true;
    }
    
    if (gameState === 'selection') {
      console.log('Resetting timer as game state changed to selection');
      timerInitializedRef.current = false;
      isEndingRef.current = false;
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setTimeLeft(settings.timerSeconds);
    }
  }, [gameState, settings.timerSeconds]);

  useEffect(() => {
    if (gameState === 'ended' && isAuthenticated && defaultProfileId) {
      console.log('Game ended, fetching scores');
      fetchUserScores().then(scores => {
        if (scores) {
          setScoreHistory(scores);
        }
      });
    }
  }, [gameState, isAuthenticated, defaultProfileId, fetchUserScores, setScoreHistory]);
  
  useEffect(() => {
    authInitializedRef.current = true;
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        console.log('Cleaning up timer on unmount', timerRef.current);
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      timerInitializedRef.current = false;
    };
  }, []);

  const incrementScore = () => {
    if (isEndingRef.current) {
      console.log('Game is ending, not incrementing score');
      return;
    }
    
    setScore(prev => {
      const newScore = prev + 1;
      console.log('Score incremented:', newScore);
      scoreRef.current = newScore;
      return newScore;
    });
  };
  
  const resetScore = () => {
    setScore(0);
    scoreRef.current = 0;
  };
  
  const startGameTimer = () => {
    // Remove authentication check to allow anonymous users to play
    if (timerRef.current) {
      console.log('Clearing existing timer before starting new one');
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    console.log('Starting game timer with', settings.timerSeconds, 'seconds');
    setTimeLeft(settings.timerSeconds);
    
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prevTime => {
        if (gameStateRef.current !== 'playing') {
          console.log('Game no longer in playing state, stopping timer');
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return prevTime;
        }
        
        if (prevTime <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          
          setTimeout(() => endGame('timeout'), 0);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };
  
  const endGame = async (reason: GameEndReason) => {
    isEndingRef.current = true;
    
    const finalScore = scoreRef.current;
    console.log(`Ending game with reason: ${reason}, final score: ${finalScore}`);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    timerInitializedRef.current = false;
    
    if (reason === 'timeout' && isAuthenticated && defaultProfileId) {
      console.log(`Attempting to save score: ${finalScore}`);
      try {
        const success = await saveScore(
          finalScore,
          settings.operation,
          settings.range,
          settings.timerSeconds,
          settings.focusNumber || null,
          settings.allowNegatives || false
        );
        
        if (success) {
          console.log("Score saved successfully");
          setGameState('ended');
        } else {
          console.error("Failed to save score");
          toast.error("Failed to save your score");
          setGameState('ended');
        }
      } catch (error) {
        console.error("Failed to save score:", error);
        toast.error("Failed to save your score");
        setGameState('ended');
      }
    } else {
      setGameState('ended');
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
    generateNewProblem: () => {
      return generateNewProblem(
        settings.operation, 
        settings.range,
        settings.allowNegatives || false,
        settings.focusNumber || null
      );
    },
    timeLeft,
    setTimeLeft,
    userAnswer,
    setUserAnswer,
    scoreHistory,
    saveScore,
    isLoggedIn: isAuthenticated,
    username,
    focusNumber,
    setFocusNumber,
    getIsHighScore,
    userId,
    endGame
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;
