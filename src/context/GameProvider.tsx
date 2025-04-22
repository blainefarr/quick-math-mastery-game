
import React, { useState, useEffect } from 'react';
import { GameSettings, Operation, Problem, ProblemRange, UserScore } from '@/types';
import { GameContextType, GameState, GameProviderProps } from './game-context-types';
import GameContext from './GameContext';

// Default values
const defaultSettings: GameSettings = {
  operation: 'addition',
  range: { min1: 1, max1: 10, min2: 1, max2: 10 },
  timerSeconds: 60 // always 60s, not user-configurable
};

const GameProvider = ({ children }: GameProviderProps) => {
  // Game state
  const [gameState, setGameState] = useState<GameState>('selection');
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [score, setScore] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [timeLeft, setTimeLeft] = useState(defaultSettings.timerSeconds);
  const [userAnswer, setUserAnswer] = useState('');
  const [scoreHistory, setScoreHistory] = useState<UserScore[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [focusNumber, setFocusNumber] = useState<number | null>(null);
  
  // Load user data from localStorage on initial render
  useEffect(() => {
    const savedUserData = localStorage.getItem('mathUserData');
    if (savedUserData) {
      try {
        console.log('Loading user data from localStorage:', savedUserData);
        const userData = JSON.parse(savedUserData);
        setIsLoggedIn(true);
        setUsername(userData.username || '');
        // Ensure we have valid score history
        if (Array.isArray(userData.scoreHistory)) {
          console.log('Loaded score history:', userData.scoreHistory);
          // Filter out any invalid score entries
          const validScores = userData.scoreHistory.filter((score: any) => 
            score && 
            typeof score === 'object' && 
            score.operation && 
            score.date && 
            score.range && 
            typeof score.range === 'object' &&
            'min1' in score.range &&
            'max1' in score.range &&
            'min2' in score.range &&
            'max2' in score.range
          );
          setScoreHistory(validScores);
        } else {
          setScoreHistory([]);
        }
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        // Reset to defaults if there's an error
        setIsLoggedIn(false);
        setUsername('');
        setScoreHistory([]);
      }
    }
  }, []);
  
  // Save user data to localStorage when relevant state changes
  useEffect(() => {
    if (isLoggedIn && username) {
      const userData = {
        username,
        scoreHistory
      };
      const dataString = JSON.stringify(userData);
      console.log('Saving user data to localStorage:', dataString);
      localStorage.setItem('mathUserData', dataString);
    }
  }, [isLoggedIn, username, scoreHistory]);

  // Update game settings
  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Increment score
  const incrementScore = () => setScore(prev => prev + 1);
  
  // Reset score
  const resetScore = () => setScore(0);
  
  // Check if this is a new high score for the operation and range
  const getIsHighScore = (newScore: number, operation: Operation, range: ProblemRange) => {
    if (scoreHistory.length === 0) return true;
    
    // Filter scores by operation and range
    const matchingScores = scoreHistory.filter(s => 
      s.operation === operation && 
      s.range.min1 === range.min1 && 
      s.range.max1 === range.max1 && 
      s.range.min2 === range.min2 && 
      s.range.max2 === range.max2
    );
    
    if (matchingScores.length === 0) return true;
    
    // Find highest score
    const highestScore = Math.max(...matchingScores.map(s => s.score));
    
    return newScore > highestScore;
  };

  // Generate a new math problem based on current settings
  const generateNewProblem = () => {
    const { operation, range } = settings;
    const { min1, max1, min2, max2 } = range;
    
    // Use focus number if set
    if (focusNumber !== null) {
      // For focus number, we'll use it as the first number
      const num1 = focusNumber;
      let num2 = Math.floor(Math.random() * (max2 - min2 + 1)) + min2;
      
      // Ensure no division by zero
      if (operation === 'division' && num2 === 0) {
        num2 = 1;
      }
      
      // For division, ensure we get whole number answers
      let adjustedNum1 = num1;
      if (operation === 'division') {
        adjustedNum1 = num1 * num2; // This guarantees a whole number result
      }
      
      // For subtraction, ensure no negative results if needed
      if (operation === 'subtraction' && num1 < num2) {
        // Swap numbers to ensure positive result
        const temp = adjustedNum1;
        adjustedNum1 = num2;
        num2 = temp;
      }
      
      // Calculate answer
      let answer: number;
      switch (operation) {
        case 'addition':
          answer = num1 + num2;
          break;
        case 'subtraction':
          answer = adjustedNum1 - num2;
          break;
        case 'multiplication':
          answer = num1 * num2;
          break;
        case 'division':
          answer = adjustedNum1 / num2;
          break;
        default:
          answer = 0;
      }
      
      setCurrentProblem({
        num1: operation === 'subtraction' ? adjustedNum1 : num1,
        num2,
        operation,
        answer
      });
    } else {
      // Regular random number generation (existing logic)
      // Generate random numbers within range
      const num1 = Math.floor(Math.random() * (max1 - min1 + 1)) + min1;
      let num2 = Math.floor(Math.random() * (max2 - min2 + 1)) + min2;
      
      // Ensure no division by zero
      if (operation === 'division' && num2 === 0) {
        num2 = 1;
      }
      
      // For division, ensure we get whole number answers
      let adjustedNum1 = num1;
      if (operation === 'division') {
        adjustedNum1 = num1 * num2; // This guarantees a whole number result
      }
      
      // For subtraction, ensure no negative results if needed
      if (operation === 'subtraction' && num1 < num2) {
        // Swap numbers to ensure positive result
        const temp = adjustedNum1;
        adjustedNum1 = num2;
        num2 = temp;
      }
      
      // Calculate answer
      let answer: number;
      switch (operation) {
        case 'addition':
          answer = num1 + num2;
          break;
        case 'subtraction':
          answer = adjustedNum1 - num2;
          break;
        case 'multiplication':
          answer = num1 * num2;
          break;
        case 'division':
          answer = adjustedNum1 / num2;
          break;
        default:
          answer = 0;
      }
      
      setCurrentProblem({
        num1: operation === 'subtraction' ? adjustedNum1 : num1,
        num2,
        operation,
        answer
      });
    }
  };
  
  // Save score to history
  const saveScore = () => {
    if (isLoggedIn && score > 0) {
      console.log('Saving score:', score, 'for operation:', settings.operation);
      const newScore: UserScore = {
        score,
        operation: settings.operation,
        range: {
          min1: settings.range.min1,
          max1: settings.range.max1,
          min2: settings.range.min2,
          max2: settings.range.max2
        },
        date: new Date().toISOString(),
      };
      
      // Add the new score to history
      const updatedScores = [...scoreHistory, newScore];
      console.log('Updated score history:', updatedScores);
      setScoreHistory(updatedScores);
      
      // Force an immediate save to localStorage
      const userData = {
        username,
        scoreHistory: updatedScores
      };
      localStorage.setItem('mathUserData', JSON.stringify(userData));
    } else {
      console.log('Not saving score: user not logged in or score is 0', { isLoggedIn, score });
    }
  };

  // Fix for focus trap bug
  useEffect(() => {
    document.body.classList.remove('ReactModal__Body--open');
  }, [isLoggedIn]);

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
    getIsHighScore
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;
