
import { ReactNode } from 'react';
import { UserScore, Operation, ProblemRange, MathProblem } from '@/types';

export type GameState = 'selection' | 'warmup-countdown' | 'warmup' | 'countdown' | 'playing' | 'ended';

export type GameEndReason = 'timeout' | 'manual' | 'error';

export interface GameProviderProps {
  children: ReactNode;
}

export interface GameContextType {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  settings: {
    operation: Operation;
    range: ProblemRange;
    timerSeconds: number;
    allowNegatives: boolean;
    focusNumber: number | null;
    useLearnerMode: boolean;
    useCustomNumberPad: boolean;
  };
  updateSettings: (settings: Partial<GameContextType['settings']>) => void;
  score: number;
  incrementScore: () => void;
  resetScore: () => void;
  currentProblem: MathProblem;
  generateNewProblem: () => MathProblem;
  timeLeft: number;
  setTimeLeft: (seconds: number) => void;
  userAnswer: string;
  setUserAnswer: (answer: string) => void;
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
  isLoggedIn: boolean;
  username: string;
  focusNumber: number | null;
  setFocusNumber: (num: number | null) => void;
  getIsHighScore: (
    score: number, 
    operation: Operation, 
    range: ProblemRange
  ) => boolean;
  userId: string | null;
  endGame: (reason: GameEndReason) => Promise<void>;
  typingSpeed: number | null;
  setTypingSpeed: (speed: number | null) => void;
  willSaveScore: boolean;
}

export interface GameCardProps {
  game: UserScore;
}
