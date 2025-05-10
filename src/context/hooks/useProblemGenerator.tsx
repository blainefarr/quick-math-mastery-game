import { useState, useEffect } from 'react';
import { Problem, Operation, ProblemRange } from '@/types';

export const useProblemGenerator = () => {
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [previousProblem, setPreviousProblem] = useState<Problem | null>(null);
  
  // Generate a new math problem based on the operation and number range settings
  const generateNewProblem = (
    operation: Operation, 
    range: ProblemRange,
    allowNegatives: boolean = false,
    focusNumber: number | null = null
  ) => {
    // Store the current problem as previous
    setPreviousProblem(currentProblem);
    
    // Generate random numbers within the specified range
    const getRandomNumber = (min: number, max: number): number => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    
    // Try to generate a different problem than the previous one
    const MAX_ATTEMPTS = 5; // Prevent infinite loops
    let attempts = 0;
    let newProblem: Problem;
    
    do {
      let num1: number;
      let num2: number;
      
      // If there's a focus number, use it for num1
      if (focusNumber !== null) {
        num1 = focusNumber;
      } else {
        num1 = getRandomNumber(range.min1, range.max1);
      }
      num2 = getRandomNumber(range.min2, range.max2);
      
      // For subtraction, ensure no negative results unless allowed
      if (operation === 'subtraction' && !allowNegatives && num2 > num1) {
        // Swap the values to ensure result is non-negative
        [num1, num2] = [num2, num1];
      }
      
      // For division, ensure we'll get a clean integer result
      if (operation === 'division') {
        // Special handling for division to create "clean" division problems
        // First, get a random divisor within the range
        num2 = getRandomNumber(
          Math.max(range.min2, 1), // Ensure divisor is at least 1
          range.max2
        );
        
        // For focus number mode, create a problem that results in the focus number
        if (focusNumber !== null) {
          // To get a desired quotient, multiply quotient × divisor
          num1 = focusNumber * num2;
        } else {
          // Otherwise, create random dividend that's divisible by num2
          const quotient = getRandomNumber(range.min1, range.max1);
          num1 = quotient * num2;
        }
      }
      
      // Calculate the answer based on the operation
      let answer: number;
      switch (operation) {
        case 'addition':
          answer = num1 + num2;
          break;
        case 'subtraction':
          answer = num1 - num2;
          break;
        case 'multiplication':
          answer = num1 * num2;
          break;
        case 'division':
          answer = num1 / num2;
          break;
        default:
          answer = 0;
      }
      
      newProblem = {
        num1,
        num2,
        operation,
        answer
      };
      
      attempts++;
      
      // Check if this is the same problem as the previous one
      // We only check if num1 and num2 are the same (in the same order)
      // This allows problems with the same answer but different operands (e.g., 3+2 and 4+1)
    } while (
      attempts < MAX_ATTEMPTS && 
      previousProblem !== null && 
      previousProblem.num1 === newProblem.num1 && 
      previousProblem.num2 === newProblem.num2 &&
      previousProblem.operation === newProblem.operation
    );
    
    if (attempts >= MAX_ATTEMPTS) {
      console.log("Max attempts reached while trying to generate a different problem");
    }
    
    setCurrentProblem(newProblem);
    return newProblem;
  };
  
  return {
    currentProblem,
    generateNewProblem
  };
};

export default useProblemGenerator;
