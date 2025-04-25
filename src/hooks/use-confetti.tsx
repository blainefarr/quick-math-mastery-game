
import { useState, useCallback } from 'react';

export const useConfetti = () => {
  const [isActive, setIsActive] = useState(false);

  const fireConfetti = useCallback(() => {
    setIsActive(true);
    
    // Reset after animation completes
    setTimeout(() => {
      setIsActive(false);
    }, 3000);
  }, []);

  return { 
    isActive, 
    fireConfetti 
  };
};

export default useConfetti;
