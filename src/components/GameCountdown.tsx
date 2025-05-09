
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
  
  // Refs to track the countdown state even when component doesn't re-render
  const startTimeRef = useRef<number>(Date.now());
  const countdownDurationSeconds = 3; // 3 second countdown
  const animationFrameRef = useRef<number | null>(null);
  const isCompletedRef = useRef(false);
  const countdownIdRef = useRef<string>(Date.now().toString());
  const isVisibleRef = useRef(true);
  const lastVisibilityTimestampRef = useRef<number>(Date.now());
  const endTimeRef = useRef<number>(Date.now() + countdownDurationSeconds * 1000);
  
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

  // Handle document visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const now = Date.now();
      const wasVisible = isVisibleRef.current;
      isVisibleRef.current = document.visibilityState === 'visible';
      
      // If becoming visible after being hidden
      if (isVisibleRef.current && !wasVisible) {
        const hiddenDuration = now - lastVisibilityTimestampRef.current;
        console.log(`Tab was hidden for ${hiddenDuration/1000} seconds`);
        
        // Check if countdown should have ended during hidden time
        if (now >= endTimeRef.current) {
          console.log('Countdown should have completed while tab was hidden');
          if (!isCompletedRef.current) {
            isCompletedRef.current = true;
            setCountdown(0);
            setTimeout(() => onComplete(), 0);
          }
          return;
        }
        
        // Adjust start time to account for hidden duration
        startTimeRef.current += hiddenDuration;
        
        // Force update the countdown display
        const remainingSeconds = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
        setCountdown(remainingSeconds);
      }
      
      // Update the last visibility timestamp
      lastVisibilityTimestampRef.current = now;
      
      // If document becomes visible and countdown is in progress, resume without restarting
      if (isVisibleRef.current && !isCompletedRef.current && animationFrameRef.current === null) {
        // Start a new animation frame loop
        startCountdownAnimation();
      } else if (!isVisibleRef.current && animationFrameRef.current) {
        // Cancel animation frame when tab becomes hidden to save resources
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onComplete]);

  // Function to start or resume countdown animation
  const startCountdownAnimation = () => {
    const updateCountdown = () => {
      const now = Date.now();
      const elapsedSeconds = (now - startTimeRef.current) / 1000;
      const newCountdown = Math.max(0, countdownDurationSeconds - Math.floor(elapsedSeconds));
      
      setCountdown(newCountdown);
      
      if (newCountdown <= 0) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        
        if (!isCompletedRef.current) {
          isCompletedRef.current = true;
          onComplete();
        }
        return;
      }
      
      animationFrameRef.current = requestAnimationFrame(updateCountdown);
    };
    
    animationFrameRef.current = requestAnimationFrame(updateCountdown);
  };

  // Track time using animation frame and timestamp for consistent timing
  useEffect(() => {
    // Set the initial start time when the countdown begins
    const now = Date.now();
    startTimeRef.current = now;
    lastVisibilityTimestampRef.current = now;
    endTimeRef.current = now + countdownDurationSeconds * 1000;
    isCompletedRef.current = false;
    isVisibleRef.current = document.visibilityState === 'visible';
    
    // Start the countdown animation
    startCountdownAnimation();
    
    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
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
