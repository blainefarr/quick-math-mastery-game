
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserScore, Operation, ProblemRange } from '@/types';
import { toast } from 'sonner';

export const useScoreManagement = (userId: string | null) => {
  const [scoreHistory, setScoreHistory] = useState<UserScore[]>([]);

  const fetchUserScores = useCallback(async () => {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      return data as UserScore[];
    } catch (error) {
      console.error('Error fetching scores:', error);
      toast.error('Failed to load your scores');
      return [];
    }
  }, [userId]);

  const saveScore = useCallback(async (
    score: number, 
    operation: Operation, 
    range: ProblemRange, 
    timerSeconds: number,
    focusNumber: number | null = null,
    allowNegatives: boolean = false
  ) => {
    if (!userId || score <= 0) {
      if (!userId) toast.info('Log in to save your score.');
      return false;
    }

    try {
      const { error } = await supabase
        .from('scores')
        .insert({
          score,
          operation,
          min1: range.min1,
          max1: range.max1,
          min2: range.min2,
          max2: range.max2,
          user_id: userId,
          duration: timerSeconds,
          focus_number: focusNumber,
          allow_negatives: allowNegatives
        });

      if (error) throw error;

      toast.success('Score saved!');
      return true;
    } catch (error) {
      console.error('Score save error:', error);
      toast.error('Failed to save your score');
      return false;
    }
  }, [userId]);

  const getIsHighScore = useCallback((
    newScore: number, 
    operation: Operation, 
    range: ProblemRange
  ) => {
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
  }, [scoreHistory]);

  return { 
    scoreHistory, 
    setScoreHistory, 
    fetchUserScores, 
    saveScore, 
    getIsHighScore 
  };
};
