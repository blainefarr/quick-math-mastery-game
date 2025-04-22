
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GameSettings, Operation, Problem, ProblemRange, UserScore } from '@/types';

// Game states
type GameState = 'selection' | 'playing' | 'ended';

// Context type
interface GameContextType {
  // Game state
  gameState: GameState;
  setGameState: (state: GameState) => void;
  
  // Game settings
  settings: GameSettings;
  updateSettings: (settings: Partial<GameSettings>) => void;
  
  // Game data
  score: number;
  incrementScore: () => void;
  resetScore: () => void;
  
  // Problem management
  currentProblem: Problem | null;
  generateNewProblem: () => void;
  
  // Timer
  timeLeft: number;
  setTimeLeft: (time: number | ((prev: number) => number)) => void;
  
  // User answer
  userAnswer: string;
  setUserAnswer: (answer: string) => void;
  
  // Score history
  scoreHistory: UserScore[];
  saveScore: () => void;
  
  // Auth state (placeholder for future backend)
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  
  // Username (placeholder for future backend)
  username: string;
  setUsername: (name: string) => void;
}

// Default values
const defaultSettings: GameSettings = {
  operation: 'addition',
  range: { min1: 1, max1: 10, min2: 1, max2: 10 },
  timerSeconds: 60
};

// Create context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
export const GameProvider = ({ children }: { children: ReactNode }) => {
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

  // Update game settings
  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Increment score
  const incrementScore = () => setScore(prev => prev + 1);
  
  // Reset score
  const resetScore = () => setScore(0);

  // Generate a new math problem based on current settings
  const generateNewProblem = () => {
    const { operation, range } = settings;
    const { min1, max1, min2, max2 } = range;
    
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
  };
  
  // Save score to history
  const saveScore = () => {
    const newScore: UserScore = {
      score,
      operation: settings.operation,
      range: settings.range,
      date: new Date().toISOString(),
    };
    
    setScoreHistory(prev => [...prev, newScore]);
    
    // In the future, this could send the score to a backend API
  };

  // Provide context values
  const value = {
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
    setUsername
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Custom hook for using the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
