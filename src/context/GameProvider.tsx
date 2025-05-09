
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
const GAME_END_TIME_KEY = 'math_game_end_time';

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
  const isEndingRef = useRef(false);
  const gameStartTimeRef = useRef<number | null>(null);
  const gameEndTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerInitializedRef = useRef(false);
  const gameSessionIdRef = useRef<string | null>(null);
  const isDocumentVisibleRef = useRef(true);
  const lastVisibilityTimestampRef = useRef<number | null>(null);

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
      const now = Date.now();
      const wasVisible = isDocumentVisibleRef.current;
      isDocumentVisibleRef.current = document.visibilityState === 'visible';
      
      // If game state is 'playing' and the tab becomes visible again
      if (isDocumentVisibleRef.current && gameStateRef.current === 'playing') {
        console.log('Tab became visible, updating timer');
        
        // Calculate hidden duration if we have a previous timestamp
        if (lastVisibilityTimestampRef.current !== null && !wasVisible) {
          const hiddenDuration = now - lastVisibilityTimestampRef.current;
          console.log(`Tab was hidden for ${hiddenDuration/1000} seconds`);
          
          // Check if game should have ended during hidden time
          if (gameStartTimeRef.current !== null && gameEndTimeRef.current !== null) {
            if (now >= gameEndTimeRef.current) {
              console.log('Game should have ended while tab was hidden');
              // End the game on next tick to avoid state update conflicts
              setTimeout(() => endGame('timeout'), 0);
              return;
            }
            
            // Force an immediate UI update of the time left
            const newTimeLeft = Math.max(0, Math.ceil((gameEndTimeRef.current - now) / 1000));
            setTimeLeft(newTimeLeft);
            console.log(`Updated time left: ${newTimeLeft}`);
          }
        }
        
        // Resume animation frame loop only if we were in playing state and timer was not running
        if (animationFrameRef.current === null) {
          console.log('Resuming timer animation frame');
          startGameTimer(false); // false means don't reset the timer
        }
      } else if (!isDocumentVisibleRef.current) {
        // Tab became hidden, save the timestamp
        console.log('Tab became hidden');
        
        // Cancel the animation frame to save resources
        if (animationFrameRef.current !== null) {
          console.log('Cancelling animation frame on tab hide');
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      }
      
      // Update the last visibility timestamp
      lastVisibilityTimestampRef.current = now;
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
    const storedEndTime = sessionStorage.getItem(GAME_END_TIME_KEY);
    
    // Only restore if we have all the required data and the stored state is 'playing'
    if (storedSessionId && storedStartTime && storedGameState === 'playing' && storedEndTime) {
      const startTime = parseInt(storedStartTime, 10);
      const endTime = parseInt(storedEndTime, 10);
      const now = Date.now();
      
      // Check if the game should have ended
      if (now >= endTime) {
        console.log('Game should have ended based on stored end time');
        // Clean up storage and end game
        sessionStorage.removeItem(GAME_SESSION_ID_KEY);
        sessionStorage.removeItem(GAME_START_TIME_KEY);
        sessionStorage.removeItem(GAME_STATE_KEY);
        sessionStorage.removeItem(GAME_END_TIME_KEY);
        setGameState('ended');
        return;
      }
      
      // Restore game session
      gameSessionIdRef.current = storedSessionId;
      gameStartTimeRef.current = startTime;
      gameEndTimeRef.current = endTime;
      gameStateRef.current = 'playing';
      setGameState('playing');
      timerInitializedRef.current = true;
      
      // Update time left immediately
      const newTimeLeft = Math.max(0, Math.ceil((endTime - now) / 1000));
      setTimeLeft(newTimeLeft);
      
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
      sessionStorage.removeItem(GAME_END_TIME_KEY);
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
        gameEndTimeRef.current = null;
        sessionStorage.removeItem(GAME_SESSION_ID_KEY);
        sessionStorage.removeItem(GAME_START_TIME_KEY);
        sessionStorage.removeItem(GAME_END_TIME_KEY);
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
      const now = Date.now();
      setTimeLeft(settings.timerSeconds);
      
      // Set the start time and calculate end time
      gameStartTimeRef.current = now;
      gameEndTimeRef.current = now + (settings.timerSeconds * 1000);
      
      // Store times in sessionStorage for persistence
      sessionStorage.setItem(GAME_START_TIME_KEY, gameStartTimeRef.current.toString());
      sessionStorage.setItem(GAME_END_TIME_KEY, gameEndTimeRef.current.toString());
      
      timerInitializedRef.current = true;
      lastVisibilityTimestampRef.current = now;
    }
    
    // Function to update the timer based on absolute time elapsed
    const updateTimer = () => {
      if (gameStartTimeRef.current === null || gameEndTimeRef.current === null) return;
      
      const now = Date.now();
      const newTimeLeft = Math.max(0, Math.ceil((gameEndTimeRef.current - now) / 1000));
      
      // Only update UI if needed
      if (newTimeLeft !== timeLeft) {
        setTimeLeft(newTimeLeft);
      }
      
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
      
      // Continue the animation loop if document is visible
      if (isDocumentVisibleRef.current) {
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      } else {
        // If document becomes hidden, we'll stop the animation frame
        // and rely on the visibility change event to resume it later
        animationFrameRef.current = null;
      }
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
    gameEndTimeRef.current = null;
    timerInitializedRef.current = false;
    
    // Clear session storage
    sessionStorage.removeItem(GAME_SESSION_ID_KEY);
    sessionStorage.removeItem(GAME_START_TIME_KEY);
    sessionStorage.removeItem(GAME_STATE_KEY);
    sessionStorage.removeItem(GAME_END_TIME_KEY);
    
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
