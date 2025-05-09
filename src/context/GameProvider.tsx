import React, { useState, useEffect, useRef } from 'react';
import GameContext from './GameContext';
import { GameContextType, GameState, GameProviderProps, GameEndReason } from './game-context-types';
import { useGameSettings } from './hooks/useGameSettings';
import { useProblemGenerator } from './hooks/useProblemGenerator';
import { useScoreManagement } from './hooks/useScoreManagement';
import { useAuth } from './auth/useAuth';
import { toast } from 'sonner';

// Game session storage keys
const GAME_SESSION_ID_KEY = 'math_game_session_id';
const GAME_START_TIME_KEY = 'math_game_start_time';
const GAME_STATE_KEY = 'math_game_state';

const GameProvider = ({ children }: GameProviderProps) => {
  const { settings, updateSettings, resetSettings } = useGameSettings();
  const { currentProblem, generateNewProblem } = useProblemGenerator();
  const { userId, defaultProfileId } = useAuth();
  
  const [gameState, setGameState] = useState<GameState>('selection');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.timerSeconds);
  const [userAnswer, setUserAnswer] = useState('');
  const [focusNumber, setFocusNumber] = useState<number | null>(null);
  const [typingSpeed, setTypingSpeed] = useState<number | null>(null);
  
  // Use refs to reliably track the current score, typing speed and game state
  const scoreRef = useRef(0);
  const typingSpeedRef = useRef<number | null>(null);
  const gameStateRef = useRef<GameState>('selection');
  const timerRef = useRef<number | null>(null);
  // Add a new ref to track if the game is ending
  const isEndingRef = useRef(false);
  // Add reference for game start time
  const gameStartTimeRef = useRef<number | null>(null);
  // Animation frame reference
  const animationFrameRef = useRef<number | null>(null);
  // New ref to track if timer has been initialized for this game session
  const timerInitializedRef = useRef(false);
  // Track current game session ID
  const gameSessionIdRef = useRef<string | null>(null);
  // Track document visibility
  const isDocumentVisibleRef = useRef(true);

  const { 
    scoreHistory, 
    fetchUserScores, 
    saveScore, 
    getIsHighScore,
    setScoreHistory 
  } = useScoreManagement(userId);

  // Handle document visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      isDocumentVisibleRef.current = document.visibilityState === 'visible';
      
      // If document becomes visible and game is playing, resume timer without restarting
      if (isDocumentVisibleRef.current && gameStateRef.current === 'playing' && gameStartTimeRef.current) {
        // Resume animation frame loop without resetting the start time
        if (animationFrameRef.current === null) {
          const updateTimerWithoutReset = () => {
            if (gameStateRef.current !== 'playing') return;
            
            const elapsedSeconds = (Date.now() - gameStartTimeRef.current!) / 1000;
            const newTimeLeft = Math.max(0, settings.timerSeconds - Math.floor(elapsedSeconds));
            
            setTimeLeft(newTimeLeft);
            
            if (newTimeLeft <= 0) {
              if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
              }
              
              setTimeout(() => endGame('timeout'), 0);
              return;
            }
            
            animationFrameRef.current = requestAnimationFrame(updateTimerWithoutReset);
          };
          
          animationFrameRef.current = requestAnimationFrame(updateTimerWithoutReset);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [settings.timerSeconds]);

  // Attempt to restore game session from sessionStorage
  useEffect(() => {
    const storedSessionId = sessionStorage.getItem(GAME_SESSION_ID_KEY);
    const storedStartTime = sessionStorage.getItem(GAME_START_TIME_KEY);
    const storedGameState = sessionStorage.getItem(GAME_STATE_KEY);
    
    if (storedSessionId && storedStartTime && storedGameState === 'playing') {
      // Restore game session
      gameSessionIdRef.current = storedSessionId;
      gameStartTimeRef.current = parseInt(storedStartTime, 10);
      gameStateRef.current = 'playing';
      setGameState('playing');
      timerInitializedRef.current = true;
      
      // Resume timer
      startGameTimer(false); // false means don't reset the timer
    }
  }, []);

  // Sync state with refs for reliable access in async contexts
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    typingSpeedRef.current = typingSpeed;
    console.log('Typing speed updated in ref:', typingSpeed);
  }, [typingSpeed]);

  useEffect(() => {
    gameStateRef.current = gameState;
    
    // Store current game state in sessionStorage
    if (gameState === 'playing') {
      sessionStorage.setItem(GAME_STATE_KEY, gameState);
    } else if (gameState !== 'playing' && sessionStorage.getItem(GAME_STATE_KEY) === 'playing') {
      // Clear session storage when exiting playing state
      sessionStorage.removeItem(GAME_STATE_KEY);
    }
    
    // Reset timer initialization when game state changes to anything other than playing
    if (gameState !== 'playing') {
      timerInitializedRef.current = false;
      
      // Clean up any existing animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Clear game session when leaving playing state
      if (gameState !== 'countdown' && gameState !== 'warmup' && gameState !== 'warmup-countdown') {
        gameSessionIdRef.current = null;
        gameStartTimeRef.current = null;
        sessionStorage.removeItem(GAME_SESSION_ID_KEY);
        sessionStorage.removeItem(GAME_START_TIME_KEY);
      }
    }
  }, [gameState]);

  // Reset timer and fetch scores when game state changes
  useEffect(() => {
    if (gameState === 'playing') {
      // Only start a new timer if one isn't already initialized
      if (!timerInitializedRef.current) {
        console.log('Starting new game timer');
        
        // Generate new game session ID
        if (!gameSessionIdRef.current) {
          gameSessionIdRef.current = Date.now().toString();
          sessionStorage.setItem(GAME_SESSION_ID_KEY, gameSessionIdRef.current);
        }
        
        startGameTimer(true); // true means reset the timer
        
        // Reset the isEnding flag when starting a new game
        isEndingRef.current = false;
      } else {
        console.log('Game timer already initialized, not starting a new one');
      }
    } else if (gameState === 'ended' && userId && defaultProfileId) {
      fetchUserScores().then(scores => {
        if (scores) {
          setScoreHistory(scores);
        }
      });
    }
    
    // Clean up timer when component unmounts or game state changes
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [gameState, userId, fetchUserScores, setScoreHistory, defaultProfileId]);

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
    setTypingSpeed(null);
    typingSpeedRef.current = null;
  };

  // Get auth state from useAuth
  const { isLoggedIn, username } = useAuth();
  
  const startGameTimer = (resetTimer: boolean = true) => {
    // Clear any existing animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    console.log('Starting game timer with', settings.timerSeconds, 'seconds, resetTimer:', resetTimer);
    
    // Only reset the timer if specifically requested
    if (resetTimer) {
      setTimeLeft(settings.timerSeconds);
      
      // Set the start time and mark timer as initialized
      gameStartTimeRef.current = Date.now();
      // Store start time in sessionStorage for persistence
      sessionStorage.setItem(GAME_START_TIME_KEY, gameStartTimeRef.current.toString());
      timerInitializedRef.current = true;
    }
    
    // Function to update the timer based on elapsed time
    const updateTimer = () => {
      if (gameStartTimeRef.current === null) return;
      
      // Only update if document is visible, to save resources
      if (isDocumentVisibleRef.current) {
        const elapsedSeconds = (Date.now() - gameStartTimeRef.current) / 1000;
        const newTimeLeft = Math.max(0, settings.timerSeconds - Math.floor(elapsedSeconds));
        
        setTimeLeft(newTimeLeft);
        
        if (newTimeLeft <= 0) {
          // Time's up
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
          
          // Use setTimeout to ensure state updates have completed
          setTimeout(() => endGame('timeout'), 0);
          return;
        }
      }
      
      // Continue the animation loop
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    };
    
    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(updateTimer);
  };
  
  const endGame = async (reason: GameEndReason) => {
    // Set the ending flag to prevent further score increments
    isEndingRef.current = true;
    
    // Use the ref to get the accurate score and typing speed regardless of state updates
    const finalScore = scoreRef.current;
    const finalTypingSpeed = typingSpeedRef.current;
    
    console.log(`Ending game with reason: ${reason}, final score: ${finalScore}, typing time per problem: ${finalTypingSpeed}`);
    
    // Clear any running animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Clear game session data
    gameSessionIdRef.current = null;
    gameStartTimeRef.current = null;
    timerInitializedRef.current = false;
    
    // Clear session storage
    sessionStorage.removeItem(GAME_SESSION_ID_KEY);
    sessionStorage.removeItem(GAME_START_TIME_KEY);
    sessionStorage.removeItem(GAME_STATE_KEY);
    
    // Only save score on timeout (normal game end) and when user is logged in
    if (reason === 'timeout' && isLoggedIn && defaultProfileId) {
      console.log(`Attempting to save score: ${finalScore}`);
      try {
        // Calculate metrics with updated logic and variables
        // Now assuming typing speed represents seconds per typing problem
        let answer_time_per_problem = finalScore > 0 ? settings.timerSeconds / finalScore : 0;
        let math_time_per_problem = answer_time_per_problem;
        
        // Adjust math time if typing speed is available
        if (finalTypingSpeed !== null) {
          // Typing speed is now seconds per typing problem
          // Math time is answer time minus typing time
          math_time_per_problem = Math.max(0, answer_time_per_problem - finalTypingSpeed);
          console.log(`Typing time per problem: ${finalTypingSpeed}, Answer time per problem: ${answer_time_per_problem}, Math time per problem: ${math_time_per_problem}`);
        }
        
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
    isLoggedIn,
    username,
    focusNumber,
    setFocusNumber,
    getIsHighScore,
    userId,
    endGame,
    typingSpeed,
    setTypingSpeed
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;
