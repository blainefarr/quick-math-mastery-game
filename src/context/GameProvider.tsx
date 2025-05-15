
import React, { useState, useEffect, useRef } from 'react';
import GameContext from './GameContext';
import { GameContextType, GameState, GameProviderProps, GameEndReason } from './game-context-types';
import { useGameSettings } from './hooks/useGameSettings';
import { useProblemGenerator } from './hooks/useProblemGenerator';
import { useScoreManagement } from './hooks/useScoreManagement';
import { useTimerManagement } from '@/hooks/use-timer-management';
import { useAuth } from './auth/useAuth';
import { toast } from 'sonner';
import logger from '@/utils/logger';

const GameProvider = ({ children }: GameProviderProps) => {
  const { settings, updateSettings } = useGameSettings();
  const { currentProblem, generateNewProblem } = useProblemGenerator();
  const { userId, defaultProfileId, planType } = useAuth();
  
  const [gameState, setGameState] = useState<GameState>('selection');
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [focusNumber, setFocusNumber] = useState<number | null>(null);
  const [typingSpeed, setTypingSpeed] = useState<number | null>(null);
  const [showScoreSavePaywall, setShowScoreSavePaywall] = useState(false);
  // New state to track if the current game's score can be saved
  const [canSaveCurrentScore, setCanSaveCurrentScore] = useState(true);
  
  // Use refs to reliably track the current score, typing speed and game state
  const scoreRef = useRef(0);
  const typingSpeedRef = useRef<number | null>(null);
  const gameStateRef = useRef<GameState>('selection');
  // Track if the game is ending
  const isEndingRef = useRef(false);
  // Track if timer has been initialized for the current game session
  const timerInitializedRef = useRef(false);

  const { 
    scoreHistory, 
    fetchUserScores, 
    saveScore, 
    getIsHighScore,
    setScoreHistory,
    hasSaveScoreLimitReached,
    scoreSaveLimit,
    currentScoreSaveCount,
    setShowSaveScorePaywall,
    showSaveScorePaywall,
    resetFetchedFlag
  } = useScoreManagement(userId);

  // Use the timer management hook
  const { 
    timeLeft, 
    startTimer, 
    resetTimer, 
    pauseTimer,
    hasCompleted 
  } = useTimerManagement({
    initialTime: settings.timerSeconds,
    onTimerComplete: () => {
      // Use setTimeout to ensure state updates have completed
      setTimeout(() => endGame('timeout'), 0);
    },
    autoStart: false // We'll manually start the timer when needed
  });

  // Sync state with refs for reliable access in async contexts
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    typingSpeedRef.current = typingSpeed;
  }, [typingSpeed]);

  useEffect(() => {
    gameStateRef.current = gameState;
    
    // When game state changes, reset the fetched flag to allow
    // a fresh fetch of scores
    if (gameState === 'selection') {
      resetFetchedFlag();
    }
  }, [gameState, resetFetchedFlag]);

  // Handle game state changes and timer management
  useEffect(() => {
    if (gameState === 'playing' && !timerInitializedRef.current) {      
      // Reset and start the timer only when first changing to playing state
      resetTimer(settings.timerSeconds);
      startTimer();
      
      // Mark timer as initialized
      timerInitializedRef.current = true;
      
      // Reset the isEnding flag when starting a new game
      isEndingRef.current = false;
    } else if (gameState === 'ended') {
      // Reset timer initialized flag when game ends
      timerInitializedRef.current = false;
    } else if (gameState !== 'playing') {
      // Reset timer initialized flag for non-playing states
      timerInitializedRef.current = false;
    }
  }, [gameState, userId, fetchUserScores, setScoreHistory, defaultProfileId, resetTimer, startTimer, settings.timerSeconds, planType, hasSaveScoreLimitReached, setShowSaveScorePaywall, resetFetchedFlag]);

  // Update timer when settings change - but only if we're not already playing
  useEffect(() => {
    // Only reset timer if settings change while not in active gameplay
    if (gameState !== 'playing') {
      // This is a settings change outside of active gameplay, so don't start timer
      resetTimer(settings.timerSeconds);
    }
  }, [settings.timerSeconds, resetTimer, gameState]);

  const incrementScore = () => {
    // Don't increment score if the game is ending
    if (isEndingRef.current) {
      return;
    }
    
    setScore(prev => {
      const newScore = prev + 1;
      scoreRef.current = newScore;
      return newScore;
    });
  };
  
  const resetScore = () => {
    setScore(0);
    scoreRef.current = 0;
    setTypingSpeed(null);
    typingSpeedRef.current = null;
  };

  // Get auth state from useAuth
  const { isLoggedIn, username } = useAuth();
  
  const endGame = async (reason: GameEndReason) => {
    // Set the ending flag to prevent further score increments
    isEndingRef.current = true;
    
    // Use the ref to get the accurate score and typing speed regardless of state updates
    const finalScore = scoreRef.current;
    const finalTypingSpeed = typingSpeedRef.current;
    
    // Only save score on timeout (normal game end), when user is logged in, and when the score can be saved
    if (reason === 'timeout' && isLoggedIn && defaultProfileId && canSaveCurrentScore) {
      try {
        logger.debug({ 
          message: 'Attempting to save score', 
          canSaveCurrentScore, 
          finalScore, 
          finalTypingSpeed 
        });
        
        const success = await saveScore(
          finalScore,
          settings.operation,
          settings.range,
          settings.timerSeconds,
          settings.focusNumber || null,
          settings.allowNegatives || false,
          finalTypingSpeed
        );
        
        if (success) {
          // Set game state to ended only after successful save
          setGameState('ended');
        } else {
          toast.error("Failed to save your score");
          // Still move to ended state
          setGameState('ended');
        }
      } catch (error) {
        logger.error("Failed to save score:", error);
        toast.error("Failed to save your score");
        // Still move to ended state
        setGameState('ended');
      }
    } else {
      // If not saving score, just set game state to ended
      if (reason === 'timeout' && !canSaveCurrentScore && isLoggedIn) {
        toast.info("Score not saved (free plan limit reached)");
      }
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
    setTimeLeft: resetTimer, 
    userAnswer,
    setUserAnswer,
    scoreHistory,
    saveScore,
    isLoggedIn,
    username,
    focusNumber,
    setFocusNumber,
    getIsHighScore,
    userId,
    endGame,
    typingSpeed,
    setTypingSpeed,
    showScoreSavePaywall,
    setShowScoreSavePaywall,
    scoreSaveLimit,
    currentScoreSaveCount,
    hasSaveScoreLimitReached,
    canSaveCurrentScore,
    setCanSaveCurrentScore
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;
