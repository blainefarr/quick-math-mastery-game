
import { useState, useEffect, useRef } from 'react';

interface UseTimerManagementOptions {
  initialTime: number;
  onTimerComplete?: () => void;
  onTimerTick?: (timeLeft: number) => void;
  autoStart?: boolean;
  delay?: number;
}

export function useTimerManagement({
  initialTime,
  onTimerComplete,
  onTimerTick,
  autoStart = true,
  delay = 0
}: UseTimerManagementOptions) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timerRef = useRef<number | null>(null);
  const hasCompletedRef = useRef(false);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (delay > 0) {
      setTimeout(() => {
        initializeTimer();
      }, delay);
    } else {
      initializeTimer();
    }
  };

  const initializeTimer = () => {
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;
        
        if (newTime <= 0) {
          clearInterval(timerRef.current!);
          hasCompletedRef.current = true;
          
          if (onTimerComplete) {
            onTimerComplete();
          }
          
          return 0;
        }
        
        if (onTimerTick) {
          onTimerTick(newTime);
        }
        
        return newTime;
      });
    }, 1000);
  };

  const resetTimer = (newTime?: number) => {
    clearInterval(timerRef.current!);
    hasCompletedRef.current = false;
    setTimeLeft(newTime !== undefined ? newTime : initialTime);
    
    if (autoStart) {
      startTimer();
    }
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (autoStart) {
      startTimer();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    timeLeft,
    hasCompleted: hasCompletedRef.current,
    startTimer,
    resetTimer,
    pauseTimer,
    setTimeLeft
  };
}
