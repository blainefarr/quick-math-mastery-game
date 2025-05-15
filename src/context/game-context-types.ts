
import { ReactNode } from "react";
import { GameSettings, Operation, Problem, ProblemRange, UserScore } from "@/types";

export type GameState = 'selection' | 'warmup-countdown' | 'warmup' | 'countdown' | 'playing' | 'ended';
export type GameEndReason = 'timeout' | 'manual';

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
    allowNegatives?: boolean,
    typingSpeed?: number | null
  ) => Promise<boolean>;
  
  // Auth state (now pulled from AuthContext)
  isLoggedIn: boolean;
  username: string;
  
  // Focus number
  focusNumber: number | null;
  setFocusNumber: (num: number | null) => void;
  
  // Check for high score
  getIsHighScore: (newScore: number, operation: Operation, range: ProblemRange) => boolean;
  
  // User ID (from AuthContext)
  userId: string | null;
  
  // Game end handler
  endGame: (reason: GameEndReason) => Promise<void>;

  // Typing speed
  typingSpeed: number | null;
  setTypingSpeed: (speed: number) => void;
  
  // Score save paywall
  showScoreSavePaywall: boolean;
  setShowScoreSavePaywall: (show: boolean) => void;
  scoreSaveLimit: number | null;
  currentScoreSaveCount: number;
  hasSaveScoreLimitReached: () => boolean;
  
  // New property: Can save current score
  canSaveCurrentScore: boolean;
  setCanSaveCurrentScore: (canSave: boolean) => void;
}

export interface GameProviderProps {
  children: ReactNode;
}
