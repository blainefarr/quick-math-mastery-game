import { useState } from 'react';
import { Problem, Operation, ProblemRange } from '@/types';

export const useProblemGenerator = () => {
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);

  const generateNewProblem = (
    operation: Operation, 
    range: ProblemRange, 
    allowNegatives: boolean = false, 
    focusNumber: number | null = null
  ) => {
    const random = (min: number, max: number) => 
      Math.floor(Math.random() * (max - min + 1)) + min;

    let num1, num2, answer;
    const { min1, max1, min2, max2 } = range;

    if (focusNumber !== null) {
      switch (operation) {
        case 'addition':
          num1 = focusNumber;
          num2 = random(min2, max2);
          answer = num1 + num2;
          break;
        case 'subtraction':
          num1 = focusNumber;
          num2 = random(min2, max2);
          if (!allowNegatives && num1 < num2) [num1, num2] = [num2, num1];
          answer = num1 - num2;
          break;
        case 'multiplication':
          num1 = focusNumber;
          num2 = random(min2, max2);
          answer = num1 * num2;
          break;
        case 'division':
          // FIXED: For division with focus number, use focus number as divisor
          num2 = focusNumber; // focus number is the divisor
          
          // Generate a random multiplier from the second range
          const multiplier = random(min2, max2);
          
          // Calculate dividend by multiplying the focus number by the multiplier
          num1 = num2 * multiplier;
          
          // The answer is the multiplier
          answer = multiplier;
          
          console.log(`Generated division problem: ${num1} ÷ ${num2} = ${answer}`);
          break;
        default:
          num1 = 0; num2 = 0; answer = 0;
      }
    } else {
      num1 = random(min1, max1);
      num2 = random(min2, max2);

      switch (operation) {
        case 'addition':
          answer = num1 + num2;
          break;
        case 'subtraction':
          if (!allowNegatives && num1 < num2) [num1, num2] = [num2, num1];
          answer = num1 - num2;
          break;
        case 'multiplication':
          answer = num1 * num2;
          break;
        case 'division':
          answer = random(min1, max1);
          num2 = random(min2, max2) || 1;
          if (num2 === 0) num2 = 1;
          num1 = answer * num2;
          break;
        default:
          answer = 0;
      }
    }

    const problem: Problem = { num1, num2, operation, answer };
    setCurrentProblem(problem);
    return problem;
  };

  return { currentProblem, generateNewProblem };
};
