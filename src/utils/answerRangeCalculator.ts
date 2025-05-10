
/**
 * Calculates the expected range of answers based on the operation and input ranges
 * This helps make typing warmup more reflective of actual game answers
 */
import { Operation, ProblemRange } from '@/types';

interface AnswerRange {
  min: number;
  max: number;
}

export const calculateAnswerRange = (
  operation: Operation,
  range: ProblemRange,
  allowNegatives: boolean = false
): AnswerRange => {
  const { min1, max1, min2, max2 } = range;
  
  switch (operation) {
    case 'addition':
      return {
        min: min1 + min2,
        max: max1 + max2
      };
      
    case 'subtraction':
      if (allowNegatives) {
        return {
          min: min1 - max2,
          max: max1 - min2
        };
      } else {
        // For non-negative results, ensure min is at least 0
        return {
          min: Math.max(0, min1 - max2),
          max: max1 - min2
        };
      }
      
    case 'multiplication':
      // Handle potential negative numbers
      if (allowNegatives) {
        // Need to consider all possible combinations when negatives are allowed
        const products = [
          min1 * min2,
          min1 * max2,
          max1 * min2,
          max1 * max2
        ];
        return {
          min: Math.min(...products),
          max: Math.max(...products)
        };
      } else {
        // When all positive, min product is min1*min2 and max product is max1*max2
        return {
          min: min1 * min2,
          max: max1 * max2
        };
      }
      
    case 'division':
      if (min2 === 0) {
        // Avoid division by zero by setting minimum divisor to 1
        const safeMin2 = 1;
        return {
          min: Math.floor(min1 / max2),
          max: Math.ceil(max1 / safeMin2)
        };
      } else {
        return {
          min: Math.floor(min1 / max2), // Floor for smallest possible result
          max: Math.ceil(max1 / min2)   // Ceiling for largest possible result
        };
      }
      
    default:
      // Fallback range if operation is not recognized
      return { min: 1, max: 20 };
  }
};

/**
 * Generates a random number within the given range (inclusive)
 */
export const generateRandomInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
