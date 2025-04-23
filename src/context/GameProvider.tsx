import React, { useState, useEffect } from 'react';
import { GameSettings, Operation, Problem, ProblemRange, UserScore } from '@/types';
import { GameContextType, GameState, GameProviderProps } from './game-context-types';
import GameContext from './GameContext';
import { toast } from 'sonner';

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
        toast.error('Error loading your saved data');
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
    console.log('Updating settings:', newSettings);
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      console.log('New settings:', updated);
      return updated;
    });
    
    // Reset game state when settings change
    setCurrentProblem(null);
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
    // Use current settings
    const { operation, range } = settings;
    console.log('Generating problem with settings:', operation, range);
    
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
      
      let answer: number;
      let adjustedNum1 = num1;
      
      // Handle operations differently to ensure whole number results
      switch (operation) {
        case 'addition':
          answer = num1 + num2;
          break;
        case 'subtraction':
          // Ensure positive result
          if (num1 < num2) {
            const temp = num1;
            adjustedNum1 = num2;
            num2 = temp;
          }
          answer = adjustedNum1 - num2;
          break;
        case 'multiplication':
          answer = num1 * num2;
          break;
        case 'division':
          // For division, START with the answer and work backwards
          // This means num2 is the divisor, and we calculate the dividend (num1)
          // to ensure we get whole number results
          answer = num1; // The focus number becomes the answer
          adjustedNum1 = answer * num2; // This guarantees a whole number result
          break;
        default:
          answer = 0;
      }
      
      setCurrentProblem({
        num1: operation === 'division' ? adjustedNum1 : adjustedNum1,
        num2,
        operation,
        answer
      });
    } else {
      // Regular random number generation (without focus number)
      let num1 = Math.floor(Math.random() * (max1 - min1 + 1)) + min1;
      let num2 = Math.floor(Math.random() * (max2 - min2 + 1)) + min2;
      
      // Ensure no division by zero
      if (operation === 'division' && num2 === 0) {
        num2 = 1;
      }
      
      let answer: number;
      
      // Handle operations differently to ensure whole number results
      switch (operation) {
        case 'addition':
          answer = num1 + num2;
          break;
        case 'subtraction':
          // Ensure positive result by swapping if needed
          if (num1 < num2) {
            const temp = num1;
            num1 = num2;
            num2 = temp;
          }
          answer = num1 - num2;
          break;
        case 'multiplication':
          answer = num1 * num2;
          break;
        case 'division':
          // For division, START with 2 random numbers
          // But use one as answer, one as divisor, then calculate dividend
          answer = num1;
          num1 = answer * num2; // This guarantees a whole number result
          break;
        default:
          answer = 0;
      }
      
      setCurrentProblem({
        num1,
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
      
      // Create a fresh copy of the score history
      const newHistory = Array.isArray(scoreHistory) ? [...scoreHistory] : [];
      
      // Add the new score to history
      newHistory.push(newScore);
      console.log('Updated score history:', newHistory);
      
      // Update state with the new score history
      setScoreHistory(newHistory);
      
      // Force an immediate save to localStorage
      const userData = {
        username,
        scoreHistory: newHistory
      };
      localStorage.setItem('mathUserData', JSON.stringify(userData));
      
      return true;
    } else {
      console.log('Not saving score: user not logged in or score is 0', { isLoggedIn, score });
      return false;
    }
  };

  // Fix for focus trap bug
  useEffect(() => {
    document.body.classList.remove('ReactModal__Body--open');
    document.body.style.pointerEvents = '';
  }, [gameState]);

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
