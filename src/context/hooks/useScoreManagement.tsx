import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserScore, Operation, ProblemRange } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth/useAuth';
import { getGoalLevel } from '@/hooks/useGoalProgress';

// Local storage key for active profile
const ACTIVE_PROFILE_KEY = 'math_game_active_profile';

export const useScoreManagement = (userId: string | null) => {
  const [scoreHistory, setScoreHistory] = useState<UserScore[]>([]);
  const [savingScore, setSavingScore] = useState(false);
  const { defaultProfileId, isLoadingProfile } = useAuth();

  // Fetch the user scores based on profile ID
  const fetchUserScores = useCallback(async () => {
    if (isLoadingProfile) {
      console.log('Profile still loading, deferring score fetch');
      return [];
    }

    // Get the profile ID from defaultProfileId context or localStorage
    const profileId = defaultProfileId || localStorage.getItem(ACTIVE_PROFILE_KEY);

    if (!userId || !profileId) {
      console.log('Missing userId or profileId in fetchUserScores', { userId, profileId });
      return [];
    }

    try {
      console.log('Fetching scores for profile ID:', profileId);
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('profile_id', profileId)
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
  }, [userId, defaultProfileId, isLoadingProfile]);

  // Effect to fetch scores when profile ID changes or loading completes
  useEffect(() => {
    const profileId = defaultProfileId || localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (profileId && !isLoadingProfile) {
      console.log('Profile ID available and loading complete, fetching scores', profileId);
      fetchUserScores();
    }
  }, [defaultProfileId, fetchUserScores, isLoadingProfile]);

  const saveScore = useCallback(async (
    score: number, 
    operation: Operation, 
    range: ProblemRange, 
    timerSeconds: number,
    focusNumber: number | null = null,
    allowNegatives: boolean = false,
    typingSpeed: number | null = null
  ) => {
    console.log('Calling saveScore with:', {
      score,
      operation,
      range,
      timerSeconds,
      focusNumber,
      allowNegatives,
      typingSpeed,
      userId
    });

    if (savingScore) {
      console.log('Already saving a score, skipping this request');
      return false;
    }

    if (!userId) {
      console.log('No user ID, cannot save score');
      return false;
    }

    if (isLoadingProfile) {
      console.log('Profile still loading, cannot save score yet');
      return false;
    }

    // Get the profile ID from context or localStorage
    const profileId = defaultProfileId || localStorage.getItem(ACTIVE_PROFILE_KEY);
    
    if (!profileId) {
      console.error('No profile ID available, cannot save score');
      toast.error('Unable to save score - no profile found');
      return false;
    }

    return saveScoreWithProfileId(
      profileId,
      score,
      operation,
      range,
      timerSeconds,
      focusNumber,
      allowNegatives,
      typingSpeed
    );
  }, [userId, savingScore, defaultProfileId, isLoadingProfile]);

  // Helper function to save score with a known profile ID
  const saveScoreWithProfileId = async (
    profileId: string,
    score: number,
    operation: Operation,
    range: ProblemRange,
    timerSeconds: number,
    focusNumber: number | null = null,
    allowNegatives: boolean = false,
    typingSpeed: number | null = null
  ) => {
    if (score < 0 || typeof score !== 'number' || isNaN(score)) {
      console.error(`Invalid score value: ${score}`);
      toast.error('Invalid score value');
      return false;
    }

    try {
      setSavingScore(true);
      
      // Calculate total speed and adjusted math speed if typing speed is available
      let totalSpeed = null;
      let adjustedMathSpeed = null;
      
      if (typingSpeed !== null) {
        totalSpeed = score / timerSeconds;
        adjustedMathSpeed = totalSpeed - typingSpeed;
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
        date: new Date().toISOString(),
        typing_speed: typingSpeed,
        total_speed: totalSpeed,
        adjusted_math_speed: adjustedMathSpeed
      };

      console.log('About to save score data with profile_id:', scoreData);
      
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
      toast.success('Score saved!');
      
      // Update goal progress
      await updateGoalProgress(profileId, operation, range, focusNumber, score);
      
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
  };
  
  // Update goal progress based on game results
  const updateGoalProgress = async (
    profileId: string,
    operation: Operation,
    range: ProblemRange,
    focusNumber: number | null,
    score: number
  ) => {
    try {
      // Determine what type of goal this is (focus number or range)
      let goalRange: string;
      
      if (focusNumber !== null) {
        // This is a focus number goal
        goalRange = focusNumber.toString();
      } else {
        // This is a range goal
        goalRange = `${range.min2}-${range.max2}`;
        
        // Check if both operands have the same range, if so use that
        if (range.min1 === range.min2 && range.max1 === range.max2) {
          goalRange = `${range.min1}-${range.max1}`;
        }
      }
      
      // Get existing goal if any
      const { data: existingGoal } = await supabase
        .from('goal_progress')
        .select('*')
        .eq('profile_id', profileId)
        .eq('operation', operation)
        .eq('range', goalRange)
        .single();
      
      const currentBest = existingGoal?.best_score || 0;
      const currentLevel = existingGoal?.level || 'starter';
      const newLevel = getGoalLevel(score);
      const leveledUp = currentLevel !== newLevel && score > currentBest;
      
      // Only update if it's a new best score
      if (score > currentBest) {
        await supabase
          .from('goal_progress')
          .upsert({
            profile_id: profileId,
            operation,
            range: goalRange,
            best_score: score,
            level: newLevel,
            attempts: (existingGoal?.attempts || 0) + 1,
            last_attempt: new Date().toISOString(),
            last_level_up: leveledUp ? new Date().toISOString() : existingGoal?.last_level_up
          }, {
            onConflict: 'profile_id,operation,range'
          });
          
        console.log('Goal progress updated:', { operation, range: goalRange, newLevel });
        
        if (leveledUp) {
          toast.success(`New achievement: ${newLevel.charAt(0).toUpperCase() + newLevel.slice(1)} level!`);
        }
      } else {
        // Just increment attempts
        await supabase
          .from('goal_progress')
          .upsert({
            profile_id: profileId,
            operation,
            range: goalRange,
            best_score: currentBest,
            level: currentLevel,
            attempts: (existingGoal?.attempts || 0) + 1,
            last_attempt: new Date().toISOString(),
            last_level_up: existingGoal?.last_level_up
          }, {
            onConflict: 'profile_id,operation,range'
          });
          
        console.log('Goal attempts updated:', { operation, range: goalRange });
      }
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

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
