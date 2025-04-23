import React, { useState, useEffect } from 'react';
import { GameSettings, Operation, Problem, ProblemRange, UserScore } from '@/types';
import { GameContextType, GameState, GameProviderProps } from './game-context-types';
import GameContext from './GameContext';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

const defaultSettings: GameSettings = {
  operation: 'addition',
  range: { min1: 1, max1: 10, min2: 1, max2: 10 },
  timerSeconds: 60,
  allowNegatives: false // default
};

const GameProvider = ({ children }: GameProviderProps) => {
  const [gameState, setGameState] = useState<GameState>('selection');
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [score, setScore] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [timeLeft, setTimeLeft] = useState(defaultSettings.timerSeconds);
  const [userAnswer, setUserAnswer] = useState('');
  const [scoreHistory, setScoreHistory] = useState<UserScore[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [focusNumber, setFocusNumber] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setIsLoggedIn(true);
          setUserId(session.user.id);
          setUsername(
            session.user.user_metadata?.name ??
            session.user.email?.split('@')[0] ??
            session.user.email ??
            ""
          );
        } else {
          setIsLoggedIn(false);
          setUserId(null);
          setUsername('');
        }
      }
    );
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setUserId(session.user.id);
        setUsername(
          session.user.user_metadata?.name ??
          session.user.email?.split('@')[0] ??
          session.user.email ??
          ""
        );
      }
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchUserScores(userId);
    } else {
      setScoreHistory([]);
    }
  }, [isLoggedIn, userId]);

  const fetchUserScores = async (uid: string) => {
    const { data, error } = await supabase
      .from('scores')
      .select('score, operation, min1, max1, min2, max2, date')
      .eq('user_id', uid)
      .order('date', { ascending: false });
    if (error) {
      toast.error('Failed to load your scores');
      setScoreHistory([]);
      return;
    }
    
    const scores: UserScore[] = (data || []).map((row) => {
      const operation = validateOperation(row.operation);
      return {
        score: row.score,
        operation,
        range: {
          min1: row.min1,
          max1: row.max1,
          min2: row.min2,
          max2: row.max2,
        },
        date: row.date,
      };
    });
    
    setScoreHistory(scores);
  };

  const validateOperation = (op: string): Operation => {
    const validOperations: Operation[] = ['addition', 'subtraction', 'multiplication', 'division'];
    if (validOperations.includes(op as Operation)) {
      return op as Operation;
    }
    return 'addition';
  };

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      return updated;
    });
    setCurrentProblem(null);
  };

  const incrementScore = () => setScore(prev => prev + 1);

  const resetScore = () => setScore(0);

  const getIsHighScore = (newScore: number, operation: Operation, range: ProblemRange) => {
    if (scoreHistory.length === 0) return true;
    const matchingScores = scoreHistory.filter(s =>
      s.operation === operation &&
      s.range.min1 === range.min1 &&
      s.range.max1 === range.max1 &&
      s.range.min2 === range.min2 &&
      s.range.max2 === range.max2
    );
    if (matchingScores.length === 0) return true;
    const highestScore = Math.max(...matchingScores.map(s => s.score));
    return newScore > highestScore;
  };

  const generateNewProblem = () => {
    const { operation, range, allowNegatives = false } = settings;
    let { min1, max1, min2, max2 } = range;

    const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    if (!allowNegatives) {
      min1 = Math.max(min1, 1); max1 = Math.max(max1, 1);
      min2 = Math.max(min2, 1); max2 = Math.max(max2, 1);
    }

    if (focusNumber !== null) {
      let num1: number, num2: number, answer: number;
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
          num2 = focusNumber;
          answer = random(min1, max1);
          num1 = answer * num2;
          break;
        default:
          num1 = 0; num2 = 0; answer = 0;
      }
      setCurrentProblem({ num1, num2, operation, answer });
    } else {
      let num1 = random(min1, max1);
      let num2 = random(min2, max2);
      let answer: number;

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
      setCurrentProblem({ num1, num2, operation, answer });
    }
  };

  const saveScore = async () => {
    if (isLoggedIn && score > 0 && userId) {
      const newScore = {
        score,
        operation: settings.operation,
        min1: settings.range.min1,
        max1: settings.range.max1,
        min2: settings.range.min2,
        max2: settings.range.max2,
        date: new Date().toISOString(),
        user_id: userId,
      };
      const { error } = await supabase
        .from('scores')
        .insert([newScore]);
      if (error) {
        toast.error('Failed to save your score');
        return false;
      }
      fetchUserScores(userId);
      toast.success('Score saved!');
      return true;
    } else {
      toast.info('Log in to save your score.');
      return false;
    }
  };

  useEffect(() => {
    document.body.classList.remove('ReactModal__Body--open');
    document.body.style.pointerEvents = '';
  }, [gameState]);

  const value: GameContextType = {
    gameState,
    setGameState,
    settings,
    updateSettings,
    score,
    incrementScore,
    resetScore,
    currentProblem,
    generateNewProblem,
    timeLeft,
    setTimeLeft,
    userAnswer,
    setUserAnswer,
    scoreHistory,
    saveScore,
    isLoggedIn,
    setIsLoggedIn,
    username,
    setUsername,
    focusNumber,
    setFocusNumber,
    getIsHighScore,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;
