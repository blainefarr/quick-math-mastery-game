
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

      if (error) {
        console.error('Error fetching scores:', error);
        toast.error('Failed to load your scores');
        return [];
      }

      console.log("Raw score data from Supabase:", data);

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

      console.log("Transformed score data:", transformedData);
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
    if (!userId) {
      toast.info('Log in to save your score.');
      return false;
    }

    const scoreData = {
      score,
      operation,
      min1: range.min1,
      max1: range.max1,
      min2: range.min2,
      max2: range.max2,
      user_id: userId,
      duration: timerSeconds,
      focus_number: focusNumber,
      allow_negatives: allowNegatives,
      date: new Date().toISOString()
    };

    console.log('Attempting to save score with payload:', scoreData);

    try {
      const { data, error } = await supabase
        .from('scores')
        .insert(scoreData);

      if (error) {
        console.error('Detailed score save error:', error);
        toast.error(`Failed to save score: ${error.message}`);
        return false;
      }

      console.log('Score saved successfully:', data);
      toast.success('Score saved!');
      
      // Refresh score history after saving
      const updatedScores = await fetchUserScores();
      setScoreHistory(updatedScores);

      return true;
    } catch (error) {
      console.error('Unexpected error saving score:', error);
      toast.error('An unexpected error occurred while saving your score');
      return false;
    }
  }, [userId, fetchUserScores]);

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
