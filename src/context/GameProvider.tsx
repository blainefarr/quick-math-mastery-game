
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
    typingSpeedRef.current = typingSpeed;
    console.log('Typing speed updated in ref:', typingSpeed);
  }, [typingSpeed]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Reset timer and fetch scores when game state changes
  useEffect(() => {
    if (gameState === 'playing') {
      startGameTimer();
      // Reset the isEnding flag when starting a new game
      isEndingRef.current = false;
    } else if (gameState === 'ended' && userId && defaultProfileId) {
      fetchUserScores().then(scores => {
        if (scores) {
          setScoreHistory(scores);
        }
      });
    }
    
    // Clean up timer when component unmounts or game state changes
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
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
  
  const startGameTimer = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    console.log('Starting game timer with', settings.timerSeconds, 'seconds');
    setTimeLeft(settings.timerSeconds);
    
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prevTime => {
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
    
    // Use the ref to get the accurate score and typing speed regardless of state updates
    const finalScore = scoreRef.current;
    const finalTypingSpeed = typingSpeedRef.current;
    
    console.log(`Ending game with reason: ${reason}, final score: ${finalScore}, typing time per problem: ${finalTypingSpeed}`);
    
    // Clear timer if it's running
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
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
