
import React, { useState, useEffect, useRef } from 'react';
import GameContext from './GameContext';
import { GameContextType, GameState, GameProviderProps, GameEndReason } from './game-context-types';
import { useGameSettings } from './hooks/useGameSettings';
import { useProblemGenerator } from './hooks/useProblemGenerator';
import { useScoreManagement } from './hooks/useScoreManagement';
import { useTimerManagement } from '@/hooks/use-timer-management';
import { useAuth } from './auth/useAuth';
import { toast } from 'sonner';
import { PaywallModal } from '@/components/paywalls/PaywallModal';

const GameProvider = ({ children }: GameProviderProps) => {
  const { settings, updateSettings } = useGameSettings();
  const { currentProblem, generateNewProblem } = useProblemGenerator();
  const { userId, defaultProfileId, canSaveScores, planType } = useAuth();
  
  const [gameState, setGameState] = useState<GameState>('selection');
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [focusNumber, setFocusNumber] = useState<number | null>(null);
  const [typingSpeed, setTypingSpeed] = useState<number | null>(null);
  const [showScoreLimitModal, setShowScoreLimitModal] = useState(false);
  
  // Use refs to reliably track the current score, typing speed and game state
  const scoreRef = useRef(0);
  const typingSpeedRef = useRef<number | null>(null);
  const gameStateRef = useRef<GameState>('selection');
  // Track if the game is ending
  const isEndingRef = useRef(false);
  // Track if timer has been initialized for the current game session
  const timerInitializedRef = useRef(false);
  // Track if this game session will save score
  const willSaveScoreRef = useRef(true);

  const { 
    scoreHistory, 
    fetchUserScores, 
    saveScore, 
    getIsHighScore,
    setScoreHistory,
    scoreLimit,
    scoreCount,
    fetchScoreLimitInfo
  } = useScoreManagement(userId);

  // Use the timer management hook
  const { 
    timeLeft, 
    startTimer, 
    resetTimer, 
    pauseTimer,
    hasCompleted 
  } = useTimerManagement({
    initialTime: settings.timerSeconds,
    onTimerComplete: () => {
      // Use setTimeout to ensure state updates have completed
      setTimeout(() => endGame('timeout'), 0);
    },
    autoStart: false // We'll manually start the timer when needed
  });

  // Sync state with refs for reliable access in async contexts
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    typingSpeedRef.current = typingSpeed;
  }, [typingSpeed]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Check if user has hit score limit before starting game
  const checkScoreLimit = async () => {
    if (planType === 'free' && userId) {
      const canSave = await canSaveScores();
      if (!canSave) {
        // User has hit their limit, show the paywall modal
        setShowScoreLimitModal(true);
        return false;
      }
    }
    return true;
  };

  // Handle starting game with and without saving
  const handleStartGameWithSaving = async () => {
    setShowScoreLimitModal(false);
    willSaveScoreRef.current = true;
    setGameState('warmup-countdown');
  };

  const handleStartGameWithoutSaving = () => {
    setShowScoreLimitModal(false);
    willSaveScoreRef.current = false;
    setGameState('warmup-countdown');
    toast("This game won't be saved to your history", { 
      duration: 5000,
      position: 'bottom-center'
    });
  };

  // Handle transition from selection to warmup-countdown
  const transitionToWarmup = async () => {
    const canProceed = await checkScoreLimit();
    if (canProceed) {
      willSaveScoreRef.current = true;
      setGameState('warmup-countdown');
    }
  };

  // Handle game state changes and timer management
  useEffect(() => {
    if (gameState === 'playing' && !timerInitializedRef.current) {
      // Reset and start the timer only when first changing to playing state
      resetTimer(settings.timerSeconds);
      startTimer();
      
      // Mark timer as initialized
      timerInitializedRef.current = true;
      
      // Reset the isEnding flag when starting a new game
      isEndingRef.current = false;
    } else if (gameState === 'ended' && userId && defaultProfileId) {
      // Reset timer initialized flag when game ends
      timerInitializedRef.current = false;
      
      fetchUserScores().then(scores => {
        if (scores) {
          setScoreHistory(scores);
        }
      });
      fetchScoreLimitInfo(); // Refresh score limit info
    } else if (gameState !== 'playing') {
      // Reset timer initialized flag for non-playing states
      timerInitializedRef.current = false;
    }
  }, [gameState, userId, fetchUserScores, setScoreHistory, defaultProfileId, resetTimer, startTimer, settings.timerSeconds, fetchScoreLimitInfo]);

  // Update timer when settings change - but only if we're not already playing
  useEffect(() => {
    // Only reset timer if settings change while not in active gameplay
    if (gameState !== 'playing') {
      // This is a settings change outside of active gameplay, so don't start timer
      resetTimer(settings.timerSeconds);
    }
  }, [settings.timerSeconds, resetTimer, gameState]);

  const incrementScore = () => {
    // Don't increment score if the game is ending
    if (isEndingRef.current) {
      return;
    }
    
    setScore(prev => {
      const newScore = prev + 1;
      scoreRef.current = newScore;
      return newScore;
    });
  };
  
  const resetScore = () => {
    setScore(0);
    scoreRef.current = 0;
    setTypingSpeed(null);
    typingSpeedRef.current = null;
  };

  // Get auth state from useAuth
  const { isLoggedIn, username } = useAuth();
  
  const endGame = async (reason: GameEndReason) => {
    // Set the ending flag to prevent further score increments
    isEndingRef.current = true;
    
    // Use the ref to get the accurate score and typing speed regardless of state updates
    const finalScore = scoreRef.current;
    const finalTypingSpeed = typingSpeedRef.current;
    
    // Only save score on timeout (normal game end) and when user is logged in
    if (reason === 'timeout' && isLoggedIn && defaultProfileId && willSaveScoreRef.current) {
      try {
        // Calculate metrics with updated logic and variables
        // Now assuming typing speed represents seconds per typing problem
        let answer_time_per_problem = finalScore > 0 ? settings.timerSeconds / finalScore : 0;
        let math_time_per_problem = answer_time_per_problem;
        
        // Adjust math time if typing speed is available
        if (finalTypingSpeed !== null) {
          // Typing speed is now seconds per typing problem
          // Math time is answer time minus typing time
          math_time_per_problem = Math.max(0, answer_time_per_problem - finalTypingSpeed);
        }
        
        const success = await saveScore(
          finalScore,
          settings.operation,
          settings.range,
          settings.timerSeconds,
          settings.focusNumber || null,
          settings.allowNegatives || false,
          finalTypingSpeed
        );
        
        if (success) {
          // Set game state to ended only after successful save
          setGameState('ended');
        } else {
          toast.error("Failed to save your score");
          // Still move to ended state
          setGameState('ended');
        }
      } catch (error) {
        toast.error("Failed to save your score");
        // Still move to ended state
        setGameState('ended');
      }
    } else {
      // If not saving score, just set game state to ended
      setGameState('ended');
    }
  };

  const value: GameContextType = {
    gameState,
    setGameState: (state) => {
      if (state === 'warmup-countdown') {
        transitionToWarmup();
      } else {
        setGameState(state);
      }
    },
    settings: {
      operation: settings.operation,
      range: settings.range,
      timerSeconds: settings.timerSeconds,
      allowNegatives: settings.allowNegatives || false,
      focusNumber: settings.focusNumber || null,
      useLearnerMode: settings.useLearnerMode || false,
      useCustomNumberPad: settings.useCustomNumberPad || false,
      typingSpeedAdjustment: settings.typingSpeedAdjustment || false
    },
    updateSettings,
    score,
    incrementScore,
    resetScore,
    currentProblem,
    generateNewProblem: () => generateNewProblem(),
    timeLeft,
    setTimeLeft: resetTimer, 
    userAnswer,
    setUserAnswer,
    scoreHistory,
    saveScore,
    isLoggedIn,
    username,
    focusNumber,
    setFocusNumber,
    getIsHighScore,
    userId,
    endGame,
    typingSpeed,
    setTypingSpeed,
    willSaveScore: willSaveScoreRef.current
  };

  return (
    <GameContext.Provider value={value}>
      {showScoreLimitModal && (
        <PaywallModal
          open={showScoreLimitModal}
          onOpenChange={setShowScoreLimitModal}
          title="Score Limit Reached"
          description={`You've reached the limit of ${scoreLimit} saved scores for your free account. Upgrade to save unlimited scores!`}
          cancelText="Continue without saving"
          onCancel={handleStartGameWithoutSaving}
          actionText="Upgrade"
          onAction={handleStartGameWithSaving}
        />
      )}
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;
