
import { Operation, ProblemRange, Problem, UserScore } from '@/types';

export type GameState = 'selection' | 'playing' | 'ended';

export interface GameContextType {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  settings: {
    operation: Operation;
    range: ProblemRange;
    timerSeconds: number;
    allowNegatives?: boolean;
    focusNumber?: number | null;
  };
  updateSettings: (settings: Partial<{
    operation: Operation;
    range: ProblemRange;
    timerSeconds: number;
    allowNegatives?: boolean;
    focusNumber?: number | null;
  }>) => void;
  score: number;
  incrementScore: () => void;
  resetScore: () => void;
  currentProblem: Problem | null;
  generateNewProblem: (
    operation?: Operation, 
    range?: ProblemRange, 
    allowNegatives?: boolean, 
    focusNumber?: number | null
  ) => void;
  timeLeft: number;
  setTimeLeft: (time: number | ((prevTime: number) => number)) => void;
  userAnswer: string;
  setUserAnswer: (answer: string) => void;
  scoreHistory: UserScore[];
  saveScore: (
    score?: number, 
    operation?: Operation, 
    range?: ProblemRange, 
    timerSeconds?: number,
    focusNumber?: number | null,
    allowNegatives?: boolean
  ) => Promise<boolean>;
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  username: string;
  setUsername: (username: string) => void;
  focusNumber: number | null;
  setFocusNumber: (num: number | null) => void;
  getIsHighScore: (score: number, operation: Operation, range: ProblemRange) => boolean;
  userId: string | null;
  handleLogout: () => Promise<void>;
}

export interface GameProviderProps {
  children: React.ReactNode;
}
