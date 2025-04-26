
import React, { useState, useEffect } from 'react';
import GameContext from './GameContext';
import { GameContextType, GameState, GameProviderProps, GameEndReason } from './game-context-types';
import { useGameSettings } from './hooks/useGameSettings';
import { useProblemGenerator } from './hooks/useProblemGenerator';
import { useScoreManagement } from './hooks/useScoreManagement';
import useAuth from './auth/useAuth';

const GameProvider = ({ children }: GameProviderProps) => {
  const { settings, updateSettings, resetSettings } = useGameSettings();
  const { currentProblem, generateNewProblem } = useProblemGenerator();
  const { userId } = useAuth();
  
  const [gameState, setGameState] = useState<GameState>('selection');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.timerSeconds);
  const [userAnswer, setUserAnswer] = useState('');
  const [focusNumber, setFocusNumber] = useState<number | null>(null);

  const { 
    scoreHistory, 
    fetchUserScores, 
    saveScore, 
    getIsHighScore,
    setScoreHistory 
  } = useScoreManagement(userId);

  useEffect(() => {
    if (gameState === 'ended' && userId) {
      fetchUserScores().then(scores => {
        if (scores) {
          setScoreHistory(scores);
        }
      });
    }
  }, [gameState, userId, fetchUserScores]);

  const incrementScore = () => {
    setScore(prev => prev + 1);
  };
  
  const resetScore = () => {
    setScore(0);
  };

  // Get auth state from useAuth
  const { isLoggedIn, username } = useAuth();
  
  // New endGame function to handle game end in a centralized way
  const endGame = async (reason: GameEndReason) => {
    console.log(`Ending game with reason: ${reason}, final score: ${score}`);
    
    // Only save the score if the game ended because the timer ran out
    if (reason === 'timeout' && isLoggedIn) {
      console.log(`Attempting to save score: ${score}`);
      try {
        await saveScore(
          score,
          settings.operation,
          settings.range,
          settings.timerSeconds,
          settings.focusNumber || null,
          settings.allowNegatives || false
        );
        console.log("Score saved successfully");
      } catch (error) {
        console.error("Failed to save score:", error);
      }
    } else if (reason === 'manual') {
      console.log("Game was ended manually, not saving score");
    } else if (!isLoggedIn) {
      console.log("User not logged in, not saving score");
    }
    
    // Change the game state to ended
    setGameState('ended');
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
    endGame
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;
