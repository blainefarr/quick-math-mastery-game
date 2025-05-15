
export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';

export interface ProblemRange {
  min1: number;
  max1: number;
  min2: number;
  max2: number;
}

export interface Problem {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
}

// Add MathProblem type that was missing
export interface MathProblem {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
}

export type GameSettings = {
  operation: Operation;
  range: ProblemRange;
  timerSeconds: number;
  allowNegatives?: boolean;
  focusNumber?: number | null;
  // Rename learnerMode to useLearnerMode for consistency
  useLearnerMode?: boolean;
  useCustomNumberPad?: boolean;
  // Add typingSpeedAdjustment to GameSettings
  typingSpeedAdjustment?: boolean;
};

export interface UserScore {
  score: number;
  operation: Operation;
  range: ProblemRange;
  date: string;
  duration?: number;
  focusNumber?: number | null;
  allowNegatives?: boolean;
}

// Goal feature types
export type GoalLevel = 'learning' | 'bronze' | 'silver' | 'gold' | 'star' | 'legend';

export interface GoalProgress {
  profile_id: string;
  operation: Operation;
  range: string; // Format: '1-5', '7' (focus number)
  best_score: number;
  level: GoalLevel;
  attempts: number;
  last_attempt: string | null;
  last_level_up: string | null;
}

export interface GoalCategory {
  title: string;
  ranges: string[];
  isFocusNumber?: boolean;
}
