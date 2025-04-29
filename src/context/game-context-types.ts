
import { Operation, ProblemRange, UserScore } from '@/types';

export type GameSettings = {
  operation: Operation;
  range: ProblemRange;
  timerSeconds: number;
  focusNumber?: number | null;
  allowNegatives?: boolean;
};

export type GameState = 'selection' | 'playing' | 'ended';

export type Problem = {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number | string;
};

export type GameEndReason = 'timeout' | 'quit' | 'error' | 'manual';

export interface GameContextType {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  settings: GameSettings;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  score: number;
  incrementScore: () => void;
  resetScore: () => void;
  currentProblem: Problem;
  generateNewProblem: (
    operation?: Operation,
    range?: ProblemRange,
    allowNegatives?: boolean,
    focusNumber?: number | null
  ) => void;
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  userAnswer: string;
  setUserAnswer: React.Dispatch<React.SetStateAction<string>>;
  scoreHistory: UserScore[];
  saveScore: (score: number, operation: Operation, range: ProblemRange, timerSeconds: number, focusNumber: number | null, allowNegatives: boolean) => Promise<boolean>;
  isLoggedIn: boolean;
  username: string;
  focusNumber: number | null;
  setFocusNumber: React.Dispatch<React.SetStateAction<number | null>>;
  getIsHighScore: (score: number, operation: Operation, range: ProblemRange) => boolean;
  userId: string | null;
  endGame: (reason: GameEndReason) => Promise<void>;
}

export interface GameProviderProps {
  children: React.ReactNode;
}
