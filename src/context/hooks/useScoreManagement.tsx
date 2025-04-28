
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserScore, Operation, ProblemRange } from '@/types';
import { toast } from 'sonner';

export const useScoreManagement = (userId: string | null) => {
  const [scoreHistory, setScoreHistory] = useState<UserScore[]>([]);
  const [savingScore, setSavingScore] = useState(false);
  const [defaultProfileId, setDefaultProfileId] = useState<string | null>(null);

  // Fetch the default profile ID for the user
  const fetchDefaultProfileId = useCallback(async () => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('account_id', userId)
        .eq('is_default', true)
        .single();

      if (error) {
        console.error('Error fetching default profile:', error);
        return null;
      }

      if (data) {
        setDefaultProfileId(data.id);
        return data.id;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching default profile:', error);
      return null;
    }
  }, [userId]);

  const fetchUserScores = useCallback(async () => {
    if (!userId) return [];

    try {
      // Make sure we have the default profile ID
      const profileId = defaultProfileId || await fetchDefaultProfileId();
      
      if (!profileId) {
        console.error('No default profile found for user');
        return [];
      }

      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', userId)
        .eq('profile_id', profileId)
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
  }, [userId, defaultProfileId, fetchDefaultProfileId]);

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
      userId
    });

    if (savingScore) {
      console.log('Already saving a score, skipping this request');
      return false;
    }

    if (!userId) {
      return false;
    }

    if (score < 0 || typeof score !== 'number' || isNaN(score)) {
      console.error(`Invalid score value: ${score}`);
      toast.error('Invalid score value');
      return false;
    }

    try {
      setSavingScore(true);
      
      // Make sure we have the default profile ID
      const profileId = defaultProfileId || await fetchDefaultProfileId();
      
      if (!profileId) {
        console.error('No default profile found for user');
        toast.error('Unable to save score - no profile found');
        setSavingScore(false);
        return false;
      }

      const scoreData = {
        score,
        operation,
        min1: range.min1 ?? 0,
        max1: range.max1 ?? 0,
        min2: range.min2 ?? 0, 
        max2: range.max2 ?? 0,
        user_id: userId,
        profile_id: profileId,
        duration: timerSeconds ?? 0,
        focus_number: focusNumber ?? null,
        allow_negatives: allowNegatives ?? false,
        date: new Date().toISOString()
      };

      console.log('About to save score data:', scoreData);
      
      const { error } = await supabase
        .from('scores')
        .insert(scoreData)
        .throwOnError();

      if (error) {
        console.error('Error saving score:', error);
        return false;
      }

      console.log('Score saved successfully:', score);
      
      const updatedScores = await fetchUserScores();
      setScoreHistory(updatedScores);
      setSavingScore(false);
      return true;
    } catch (error) {
      console.error('Error saving score:', error);
      setSavingScore(false);
      return false;
    }
  }, [userId, fetchUserScores, savingScore, defaultProfileId, fetchDefaultProfileId]);

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

  // Initialize the default profile ID when the component mounts
  useCallback(() => {
    if (userId && !defaultProfileId) {
      fetchDefaultProfileId();
    }
  }, [userId, defaultProfileId, fetchDefaultProfileId]);

  return { 
    scoreHistory, 
    setScoreHistory, 
    fetchUserScores, 
    saveScore, 
    getIsHighScore,
    savingScore
  };
};
