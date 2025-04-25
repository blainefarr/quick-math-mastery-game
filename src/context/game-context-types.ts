
import { ReactNode } from "react";
import { GameSettings, Operation, Problem, ProblemRange, UserScore } from "@/types";

export type GameState = 'selection' | 'playing' | 'ended';

export interface GameContextType {
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
  generateNewProblem: (
    operation: Operation, 
    range: ProblemRange, 
    allowNegatives?: boolean, 
    focusNumber?: number | null
  ) => Problem;
  
  // Timer
  timeLeft: number;
  setTimeLeft: (time: number | ((prev: number) => number)) => void;
  
  // User answer
  userAnswer: string;
  setUserAnswer: (answer: string) => void;
  
  // Score history
  scoreHistory: UserScore[];
  saveScore: (
    score: number, 
    operation: Operation, 
    range: ProblemRange, 
    timerSeconds: number,
    focusNumber?: number | null,
    allowNegatives?: boolean
  ) => Promise<boolean>;
  
  // Auth state
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  
  // Username
  username: string;
  setUsername: (name: string) => void;
  
  // Focus number
  focusNumber: number | null;
  setFocusNumber: (num: number | null) => void;
  
  // Check for high score
  getIsHighScore: (newScore: number, operation: Operation, range: ProblemRange) => boolean;
  
  // User ID
  userId: string | null;
  
  // Logout function
  logout: () => Promise<void>;
}

export interface GameProviderProps {
  children: ReactNode;
}
