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

export type GameSettings = {
  operation: Operation;
  range: ProblemRange;
  timerSeconds: number;
};

export interface UserScore {
  score: number;
  operation: Operation;
  range: ProblemRange;
  date: string;
}
