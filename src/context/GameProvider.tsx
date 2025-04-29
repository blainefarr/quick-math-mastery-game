
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
  const { userId, defaultProfileId, isAuthenticated } = useAuth();
  
  const [gameState, setGameState] = useState<GameState>('selection');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.timerSeconds);
  const [userAnswer, setUserAnswer] = useState('');
  const [focusNumber, setFocusNumber] = useState<number | null>(null);
  
  // Use refs to reliably track the current score and game state
  const scoreRef = useRef(0);
  const gameStateRef = useRef<GameState>('selection');
  const timerRef = useRef<number | null>(null);
  // Add a new ref to track if the game is ending
  const isEndingRef = useRef(false);
  // Add a new ref to track if the timer was already initialized for the current game
  const timerInitializedRef = useRef(false);
  // Add a new ref to track we tried authentication
  const authInitializedRef = useRef(false);

  const { 
    scoreHistory, 
    fetchUserScores, 
    saveScore, 
    getIsHighScore,
    setScoreHistory 
  } = useScoreManagement(userId);

  // Sync state with refs for reliable access in async contexts
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    gameStateRef.current = gameState;
    
    // When game state changes to 'playing', start the timer
    if (gameState === 'playing' && !timerInitializedRef.current) {
      console.log('Starting game timer due to gameState change to playing');
      startGameTimer();
      timerInitializedRef.current = true;
    }
    
    // Reset timer when game state changes to 'selection'
    if (gameState === 'selection') {
      console.log('Resetting timer as game state changed to selection');
      timerInitializedRef.current = false;
      // Reset the isEnding flag
      isEndingRef.current = false;
      
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Reset the time left to the initial value
      setTimeLeft(settings.timerSeconds);
    }
  }, [gameState, settings.timerSeconds]);

  // Fetch scores when game ends
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
  
  // Check authentication status before starting game
  useEffect(() => {
    // Only do this once
    if (!authInitializedRef.current) {
      authInitializedRef.current = true;
      
      // If not authenticated but trying to play, redirect to selection
      if (gameState === 'playing' && (!isAuthenticated || !defaultProfileId)) {
        console.log('User not authenticated or no profile, redirecting to selection');
        setGameState('selection');
        toast.error("Please log in to play the game");
      }
    }
  }, [gameState, isAuthenticated, defaultProfileId]);

  // Clean up the timer when component unmounts
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
    // Don't increment score if the game is ending
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
    // Check if user is authenticated
    if (!isAuthenticated || !defaultProfileId) {
      console.log('Cannot start game - user not authenticated or no profile');
      setGameState('selection');
      toast.error("Please log in to play the game");
      return;
    }
    
    // Clear any existing timer
    if (timerRef.current) {
      console.log('Clearing existing timer before starting new one');
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    console.log('Starting game timer with', settings.timerSeconds, 'seconds');
    setTimeLeft(settings.timerSeconds);
    
    // Use window.setInterval to ensure consistent timing
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prevTime => {
        // Only execute timer logic if game is still in playing state
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
          
          // Use setTimeout to ensure state updates have completed
          setTimeout(() => endGame('timeout'), 0);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };
  
  const endGame = async (reason: GameEndReason) => {
    // Set the ending flag to prevent further score increments
    isEndingRef.current = true;
    
    // Use the ref to get the accurate score regardless of state updates
    const finalScore = scoreRef.current;
    console.log(`Ending game with reason: ${reason}, final score: ${finalScore}`);
    
    // Clear timer if it's running
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Reset timer initialization flag
    timerInitializedRef.current = false;
    
    // Only save score on timeout (normal game end) and when user is logged in with profile
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
          // Set game state to ended only after successful save
          setGameState('ended');
        } else {
          console.error("Failed to save score");
          toast.error("Failed to save your score");
          // Still move to ended state
          setGameState('ended');
        }
      } catch (error) {
        console.error("Failed to save score:", error);
        toast.error("Failed to save your score");
        // Still move to ended state
        setGameState('ended');
      }
    } else {
      // If not saving score, just set game state to ended
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
    generateNewProblem,
    timeLeft,
    setTimeLeft,
    userAnswer,
    setUserAnswer,
    scoreHistory,
    saveScore,
    isLoggedIn: isAuthenticated,
    // Remove the username shorthand which was causing the error
    // username,  
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
