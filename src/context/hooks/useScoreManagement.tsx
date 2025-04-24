
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserScore, Operation, ProblemRange } from '@/types';
import { toast } from 'sonner';

export const useScoreManagement = (userId: string | null) => {
  const [scoreHistory, setScoreHistory] = useState<UserScore[]>([]);
  const [savingScore, setSavingScore] = useState(false); // Added to prevent concurrent saves

  const fetchUserScores = useCallback(async () => {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching scores:', error);
        toast.error('Failed to load your scores');
        return [];
      }

      const transformedData: UserScore[] = (data || []).map(item => ({
        score: item.score,
        operation: item.operation as Operation,
        range: {
          min1: item.min1,
          max1: item.max1,
          min2: item.min2,
          max2: item.max2,
        },
        date: item.date,
        duration: item.duration,
        focusNumber: item.focus_number,
        allowNegatives: item.allow_negatives
      }));

      return transformedData;
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
    // Log all input values to verify state at call time
    console.log('Calling saveScore with:', {
      score,
      operation,
      range,
      timerSeconds,
      focusNumber,
      allowNegatives,
      userId
    });

    // Prevent concurrent saves
    if (savingScore) {
      console.log('Already saving a score, skipping this request');
      return false;
    }

    if (!userId) {
      toast.info('Log in to save your score.');
      return false;
    }

    if (score < 0 || typeof score !== 'number' || isNaN(score)) {
      console.error(`Invalid score value: ${score}`);
      toast.error('Invalid score value');
      return false;
    }

    // Use nullish coalescing to ensure no undefined values
    const scoreData = {
      score,
      operation,
      min1: range.min1 ?? 0,
      max1: range.max1 ?? 0,
      min2: range.min2 ?? 0, 
      max2: range.max2 ?? 0,
      user_id: userId,
      duration: timerSeconds ?? 0,
      focus_number: focusNumber ?? null,
      allow_negatives: allowNegatives ?? false,
      date: new Date().toISOString()
    };

    try {
      setSavingScore(true);
      console.log('About to save score data:', scoreData);
      
      // Add throwOnError() to expose silent Supabase errors
      const { error } = await supabase
        .from('scores')
        .insert(scoreData)
        .throwOnError();

      if (error) {
        console.error('Error saving score:', error);
        toast.error('Failed to save score');
        setSavingScore(false);
        return false;
      }

      console.log('Score saved successfully:', score);
      toast.success('Score saved!');
      
      // Update scores after saving
      const updatedScores = await fetchUserScores();
      setScoreHistory(updatedScores);
      setSavingScore(false);
      return true;
    } catch (error) {
      console.error('Error saving score:', error);
      toast.error('Failed to save score');
      setSavingScore(false);
      return false;
    }
  }, [userId, fetchUserScores, savingScore]);

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
    getIsHighScore,
    savingScore  // Export this state so other components can check if we're currently saving
  };
};
