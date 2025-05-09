
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';
import { useCompactHeight } from '@/hooks/use-compact-height';
import useGame from '@/context/useGame';

interface GameCountdownProps {
  onComplete: () => void;
  message?: string;
  isTypingWarmup?: boolean;
}

const GameCountdown = ({ 
  onComplete,
  message = "⚡ It's game time! ⚡",
  isTypingWarmup = false
}: GameCountdownProps) => {
  const [countdown, setCountdown] = useState<number>(3);
  const isCompactHeight = useCompactHeight();
  const { setGameState, settings, scoreHistory, isLoggedIn } = useGame();
  
  // Refs for time tracking
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);
  const rafIdRef = useRef<number | null>(null);
  const isCompletedRef = useRef<boolean>(false);

  // Get the best score for the current game settings
  const getBestScore = () => {
    if (!isLoggedIn || !scoreHistory || scoreHistory.length === 0) {
      return null;
    }

    // Filter scores that match current game settings
    const matchingScores = scoreHistory.filter(s => 
      s.operation === settings.operation &&
      s.range.min1 === settings.range.min1 &&
      s.range.max1 === settings.range.max1 &&
      s.range.min2 === settings.range.min2 &&
      s.range.max2 === settings.range.max2 &&
      s.allowNegatives === (settings.allowNegatives || false) &&
      s.focusNumber === (settings.focusNumber || null)
    );

    if (matchingScores.length === 0) {
      return null;
    }

    // Return the highest score
    return Math.max(...matchingScores.map(s => s.score));
  };

  // Get motivational text based on user's best score
  const getMotivationalText = () => {
    const bestScore = getBestScore();
    
    if (bestScore) {
      return `🔥 Beat your record: ${bestScore}`;
    }
    
    return "🔥 Set a new record";
  };

  // Handle visibility change events
  useEffect(() => {
    const handleVisibilityChange = () => {
      // If document is hidden (tab switched), record current time and pause animation
      if (document.hidden) {
        console.log("Tab visibility: hidden");
        isVisibleRef.current = false;
        
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        pausedTimeRef.current = Date.now();
      } else {
        console.log("Tab visibility: visible");
        isVisibleRef.current = true;
        
        // If we were paused and not already completed, adjust start time and resume
        if (pausedTimeRef.current > 0 && !isCompletedRef.current) {
          const pauseDuration = Date.now() - pausedTimeRef.current;
          startTimeRef.current += pauseDuration;
          pausedTimeRef.current = 0;
          
          // Resume countdown animation
          if (rafIdRef.current === null) {
            rafIdRef.current = requestAnimationFrame(updateCountdown);
          }
        }
      }
    };
    
    // Register visibility change listener
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Update function that will run on each animation frame
  const updateCountdown = () => {
    // If already completed or not visible, don't proceed
    if (isCompletedRef.current || !isVisibleRef.current) {
      return;
    }
    
    const elapsedTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const newCountdown = 3 - elapsedTime;
    
    if (newCountdown <= 0) {
      // Countdown complete, clean up and proceed
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      setCountdown(0);
      isCompletedRef.current = true;
      // Small delay for "GO!" to be visible
      setTimeout(() => onComplete(), 500);
      return;
    }
    
    setCountdown(newCountdown);
    // Schedule next update
    rafIdRef.current = requestAnimationFrame(updateCountdown);
  };

  // Initialize countdown when component mounts
  useEffect(() => {
    // Reset the state
    isCompletedRef.current = false;
    isVisibleRef.current = true;
    pausedTimeRef.current = 0;
    startTimeRef.current = Date.now();
    setCountdown(3); // Reset countdown to ensure we start at 3
    
    // Start the animation loop
    rafIdRef.current = requestAnimationFrame(updateCountdown);
    
    // Cleanup function
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [onComplete]);

  // Handle restart game
  const handleRestartGame = () => {
    setGameState('selection');
  };

  return (
    <div className={`flex justify-center items-center min-h-screen p-4 bg-background ${
      isCompactHeight ? 'pt-0 mt-0' : 'pt-4'
    }`}>
      <div className={`w-full max-w-xl ${
        isCompactHeight ? 'mt-0' : 'mt-8'
      }`}>
        <Card className={`${
          isCompactHeight ? 'mb-4 py-6' : 'mb-6 py-10'
        } px-6 shadow-lg animate-fade-in`}>
          <CardContent className="flex flex-col justify-center items-center text-center gap-4">
            <h2 className="text-2xl font-bold mt-4">{message}</h2>
            <div className="text-4xl font-bold mt-2 text-green-500">
              {countdown || "GO!"}
            </div>
            {/* Only show motivational text for game countdown, not typing warmup */}
            {!isTypingWarmup && <p className="text-gray-600">{getMotivationalText()}</p>}
          </CardContent>
        </Card>

        {/* Restart button */}
        <div className="flex justify-center mb-4">
          <Button 
            variant="outline" 
            onClick={handleRestartGame} 
            className="flex items-center gap-2"
          >
            <RotateCw className="h-4 w-4" /> Restart Game
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameCountdown;
