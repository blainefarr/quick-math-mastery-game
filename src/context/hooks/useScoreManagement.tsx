
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserScore, Operation, ProblemRange } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth/useAuth';

export const useScoreManagement = (userId: string | null) => {
  const [scoreHistory, setScoreHistory] = useState<UserScore[]>([]);
  const [savingScore, setSavingScore] = useState(false);
  const { defaultProfileId } = useAuth();

  // Fetch the user scores based on profile ID
  const fetchUserScores = useCallback(async () => {
    if (!userId || !defaultProfileId) {
      console.log('Missing userId or defaultProfileId in fetchUserScores', { userId, defaultProfileId });
      return [];
    }

    try {
      console.log('Fetching scores for profile ID:', defaultProfileId);
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('profile_id', defaultProfileId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching scores:', error);
        toast.error('Failed to load your scores');
        return [];
      }

      console.log('Retrieved scores data:', data);
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

      setScoreHistory(transformedData);
      return transformedData;
    } catch (error) {
      console.error('Error fetching scores:', error);
      toast.error('Failed to load your scores');
      return [];
    }
  }, [userId, defaultProfileId]);

  // Effect to fetch scores when profile ID changes
  useEffect(() => {
    if (defaultProfileId) {
      console.log('Profile ID changed, fetching scores', defaultProfileId);
      fetchUserScores();
    }
  }, [defaultProfileId, fetchUserScores]);

  const saveScore = useCallback(async (
    score: number, 
    operation: Operation, 
    range: ProblemRange, 
    timerSeconds: number,
    focusNumber: number | null = null,
    allowNegatives: boolean = false
  ) => {
    console.log('Calling saveScore with:', {
      score,
      operation,
      range,
      timerSeconds,
      focusNumber,
      allowNegatives,
      userId,
      profileId: defaultProfileId
    });

    if (savingScore) {
      console.log('Already saving a score, skipping this request');
      return false;
    }

    if (!userId) {
      console.log('No user ID, cannot save score');
      return false;
    }

    if (!defaultProfileId) {
      console.error('No profile ID available, cannot save score');
      toast.error('Unable to save score - no profile found');
      return false;
    }

    if (score < 0 || typeof score !== 'number' || isNaN(score)) {
      console.error(`Invalid score value: ${score}`);
      toast.error('Invalid score value');
      return false;
    }

    try {
      setSavingScore(true);
      
      const scoreData = {
        score,
        operation,
        min1: range.min1 ?? 0,
        max1: range.max1 ?? 0,
        min2: range.min2 ?? 0, 
        max2: range.max2 ?? 0,
        user_id: userId,
        profile_id: defaultProfileId,
        duration: timerSeconds ?? 0,
        focus_number: focusNumber ?? null,
        allow_negatives: allowNegatives ?? false,
        date: new Date().toISOString()
      };

      console.log('About to save score data:', scoreData);
      
      const { error } = await supabase
        .from('scores')
        .insert(scoreData);

      if (error) {
        console.error('Error saving score:', error);
        toast.error('Failed to save your score');
        setSavingScore(false);
        return false;
      }

      console.log('Score saved successfully:', score);
      
      const updatedScores = await fetchUserScores();
      setScoreHistory(updatedScores);
      setSavingScore(false);
      return true;
    } catch (error) {
      console.error('Error saving score:', error);
      toast.error('Failed to save your score');
      setSavingScore(false);
      return false;
    }
  }, [userId, fetchUserScores, savingScore, defaultProfileId]);

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
    savingScore
  };
};
