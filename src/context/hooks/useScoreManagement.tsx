
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserScore, Operation, ProblemRange } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth/useAuth';
import { getGoalLevel } from '@/hooks/useGoalProgress';
import logger from '@/utils/logger';
import { extractData } from '@/utils/supabase-helpers';

// Local storage key for active profile
const ACTIVE_PROFILE_KEY = 'math_game_active_profile';

// Type definition for the submit_score function that doesn't exist in the types.ts file
interface SupabaseCustomFunctions {
  submit_score(args: {
    p_profile_id: string;
    p_score: number;
    p_operation: string;
    p_min1: number;
    p_max1: number;
    p_min2: number;
    p_max2: number;
    p_duration: number;
    p_focus_number: number | null;
    p_allow_negatives: boolean;
    p_typing_speed: number | null;
    p_total_speed: number | null;
    p_adjusted_math_speed: number | null;
  }): Promise<{ data: string; error: null } | { data: null; error: any }>;
}

export const useScoreManagement = (userId: string | null) => {
  const [scoreHistory, setScoreHistory] = useState<UserScore[]>([]);
  const [savingScore, setSavingScore] = useState(false);
  const [showSaveScorePaywall, setShowSaveScorePaywall] = useState(false);
  const [scoreSaveLimit, setScoreSaveLimit] = useState<number | null>(null);
  const [currentScoreSaveCount, setCurrentScoreSaveCount] = useState<number>(0);
  const [scoresAlreadyFetched, setScoresAlreadyFetched] = useState(false);
  const { defaultProfileId, isLoadingProfile, planType } = useAuth();

  // Fetch score save limit based on plan type
  const fetchScoreSaveLimit = useCallback(async () => {
    if (!userId || !planType) return;
    
    try {
      const response = await supabase
        .from('plans')
        .select('max_saved_scores, can_save_score')
        .eq('plan_type', planType as any)
        .single();
      
      const planData = extractData(response);
      
      if (planData && typeof planData === 'object') {
        // Use safe property access with optional chaining
        const maxSavedScores = 'max_saved_scores' in planData ? planData.max_saved_scores : null;
        setScoreSaveLimit(maxSavedScores);
        logger.debug(`Score save limit for ${planType} plan: ${maxSavedScores}`);
      }
    } catch (err) {
      logger.error('Error fetching score save limit:', err);
    }
  }, [userId, planType]);

  // Fetch current score save count
  const fetchCurrentScoreSaveCount = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await supabase
        .from('accounts')
        .select('score_save_count')
        .eq('id', userId as any)
        .single();
      
      const accountData = extractData(response);
      
      if (accountData && typeof accountData === 'object' && 'score_save_count' in accountData) {
        setCurrentScoreSaveCount(accountData.score_save_count);
        logger.debug({ message: 'Current score save count', count: accountData.score_save_count });
      }
    } catch (err) {
      logger.error('Error fetching score save count:', err);
    }
  }, [userId]);

  // Fetch the user scores based on profile ID
  const fetchUserScores = useCallback(async () => {
    if (isLoadingProfile) {
      logger.debug('Profile still loading, deferring score fetch');
      return [];
    }

    // Get the profile ID from defaultProfileId context or localStorage
    const profileId = defaultProfileId || localStorage.getItem(ACTIVE_PROFILE_KEY);

    if (!userId || !profileId) {
      logger.debug({ message: 'Missing userId or profileId in fetchUserScores', userId, profileId });
      return [];
    }

    try {
      logger.debug(`Fetching scores for profile ID: ${profileId}`);
      const response = await supabase
        .from('scores')
        .select('*')
        .eq('profile_id', profileId as any)
        .order('date', { ascending: false });

      const fetchedData = extractData(response, []);

      if (!fetchedData || !Array.isArray(fetchedData)) {
        logger.error('Unexpected response format:', fetchedData);
        toast.error('Failed to load scores: unexpected data format');
        return [];
      }

      logger.debug({ message: 'Retrieved scores data', count: fetchedData.length });
      
      // Safely transform the data with null checks
      const transformedData: UserScore[] = fetchedData.map(item => {
        if (!item) return {
          score: 0,
          operation: 'addition' as Operation,
          range: {
            min1: 0,
            max1: 0,
            min2: 0,
            max2: 0,
          },
          date: new Date().toISOString(),
          duration: 60,
          focusNumber: null,
          allowNegatives: false
        };
        
        return {
          score: item.score || 0,
          operation: (item.operation || 'addition') as Operation,
          range: {
            min1: item.min1 ?? 0,
            max1: item.max1 ?? 0,
            min2: item.min2 ?? 0,
            max2: item.max2 ?? 0,
          },
          date: item.date || new Date().toISOString(),
          duration: item.duration ?? 60,
          focusNumber: item.focus_number ?? null,
          allowNegatives: item.allow_negatives ?? false
        };
      });

      setScoreHistory(transformedData);
      setScoresAlreadyFetched(true); // Mark scores as fetched to prevent loops
      return transformedData;
    } catch (error) {
      logger.error('Error fetching scores:', error);
      toast.error('Failed to load your scores');
      return [];
    }
  }, [userId, defaultProfileId, isLoadingProfile]);

  // Reset the fetched flag when profile or game state changes
  const resetFetchedFlag = useCallback(() => {
    setScoresAlreadyFetched(false);
  }, []);

  // Effect to fetch scores when profile ID changes or loading completes
  useEffect(() => {
    const profileId = defaultProfileId || localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (profileId && !isLoadingProfile && !scoresAlreadyFetched) {
      logger.debug(`Profile ID available and loading complete, fetching scores: ${profileId}`);
      fetchUserScores();
    }
  }, [defaultProfileId, fetchUserScores, isLoadingProfile, scoresAlreadyFetched]);

  // Effect to fetch score save limit and current count
  useEffect(() => {
    if (userId && planType) {
      fetchScoreSaveLimit();
      fetchCurrentScoreSaveCount();
    }
  }, [userId, planType, fetchScoreSaveLimit, fetchCurrentScoreSaveCount]);

  // Check if the user can save score based on their plan limits
  const canSaveScore = useCallback(async () => {
    // If not logged in, cannot save scores
    if (!userId) return { allowed: false, limitReached: false };
    
    try {
      // Get the current plan details
      const planResponse = await supabase
        .from('plans')
        .select('can_save_score, max_saved_scores')
        .eq('plan_type', planType as any)
        .single();
      
      const planData = extractData(planResponse);
      
      if (!planData) {
        logger.error('Error fetching plan details: No plan data returned');
        return { allowed: false, limitReached: false };
      }
      
      // If the plan allows saving scores
      if ('can_save_score' in planData && planData.can_save_score) {
        // If there's no limit (null means unlimited)
        if ('max_saved_scores' in planData && planData.max_saved_scores === null) {
          return { allowed: true, limitReached: false };
        }
        
        // Update current score save count
        await fetchCurrentScoreSaveCount();
        
        // Log the current count and limit
        logger.debug({ 
          message: "Score limit check", 
          currentCount: currentScoreSaveCount, 
          limit: planData.max_saved_scores 
        });
        
        // If there is a limit, check against current save count
        return {
          allowed: currentScoreSaveCount < (planData.max_saved_scores || 0),
          limitReached: currentScoreSaveCount >= (planData.max_saved_scores || 0)
        };
      }
      
      return { allowed: false, limitReached: false };
    } catch (error) {
      logger.error('Error checking if user can save scores:', error);
      return { allowed: false, limitReached: false };
    }
  }, [userId, planType, currentScoreSaveCount, fetchCurrentScoreSaveCount]);

  const saveScore = useCallback(async (
    score: number, 
    operation: Operation, 
    range: ProblemRange, 
    timerSeconds: number,
    focusNumber: number | null = null,
    allowNegatives: boolean = false,
    typingSpeed: number | null = null
  ) => {
    logger.debug({
      message: 'Calling saveScore',
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
      logger.debug('Already saving a score, skipping this request');
      return false;
    }

    if (!userId) {
      logger.debug('No user ID, cannot save score');
      return false;
    }

    if (isLoadingProfile) {
      logger.debug('Profile still loading, cannot save score yet');
      return false;
    }

    // Check if user can save score based on their plan
    const saveScoreCheck = await canSaveScore();
    if (!saveScoreCheck.allowed) {
      if (saveScoreCheck.limitReached) {
        // Show paywall modal if limit reached
        logger.debug('Score save limit reached, showing paywall');
        setShowSaveScorePaywall(true);
        return false;
      }
      logger.debug('User plan does not allow score saving');
      return false;
    }

    // Get the profile ID from context or localStorage
    const profileId = defaultProfileId || localStorage.getItem(ACTIVE_PROFILE_KEY);
    
    if (!profileId) {
      logger.error('No profile ID available, cannot save score');
      toast.error('Unable to save score - no profile found');
      return false;
    }

    try {
      setSavingScore(true);
      
      // Calculate metrics
      let total_speed = null;
      let adjusted_math_speed = null;
      
      if (score > 0) {
        // Changed calculation: seconds per math problem
        total_speed = timerSeconds / score;
        
        // If typing speed is available (it represents seconds per typing problem)
        if (typingSpeed !== null) {
          // Changed calculation: actual math time is typing time subtracted from total answer time
          adjusted_math_speed = Math.max(0, total_speed - typingSpeed);
        }
      }
      
      // Use the rpc method with the appropriate type
      const { data, error } = await supabase.rpc('submit_score', {
        p_profile_id: profileId,
        p_score: score,
        p_operation: operation,
        p_min1: range.min1 ?? 0,
        p_max1: range.max1 ?? 0,
        p_min2: range.min2 ?? 0, 
        p_max2: range.max2 ?? 0,
        p_duration: timerSeconds ?? 0,
        p_focus_number: focusNumber,
        p_allow_negatives: allowNegatives,
        p_typing_speed: typingSpeed,
        p_total_speed: total_speed,
        p_adjusted_math_speed: adjusted_math_speed
      });

      if (error) {
        logger.error('Error from submit_score function:', error);
        toast.error(error.message || 'Failed to save your score');
        setSavingScore(false);
        return false;
      }

      logger.debug({ message: 'Score saved successfully', score, scoreId: data });
      toast.success('Score saved!');
      
      // Reset scoresAlreadyFetched flag to allow fetching updated scores
      setScoresAlreadyFetched(false); 
      
      // Fetch current score count as it was updated in the database function
      await fetchCurrentScoreSaveCount();
      
      const updatedScores = await fetchUserScores();
      setScoreHistory(updatedScores);
      setSavingScore(false);
      return true;
    } catch (error: any) {
      logger.error('Error saving score:', error);
      toast.error(error.message || 'Failed to save your score');
      setSavingScore(false);
      return false;
    }
  }, [userId, savingScore, defaultProfileId, isLoadingProfile, canSaveScore, fetchCurrentScoreSaveCount, fetchUserScores]);
  
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

  // Check if save score limit has been reached
  const hasSaveScoreLimitReached = useCallback(() => {
    if (scoreSaveLimit === null) return false;
    const limitReached = currentScoreSaveCount >= scoreSaveLimit;
    logger.debug({ 
      message: "Score save limit check", 
      currentCount: currentScoreSaveCount, 
      limit: scoreSaveLimit, 
      limitReached 
    });
    return limitReached;
  }, [scoreSaveLimit, currentScoreSaveCount]);

  return { 
    scoreHistory, 
    setScoreHistory, 
    fetchUserScores, 
    saveScore, 
    getIsHighScore,
    savingScore,
    showSaveScorePaywall,
    setShowSaveScorePaywall,
    scoreSaveLimit,
    currentScoreSaveCount,
    hasSaveScoreLimitReached,
    resetFetchedFlag
  };
};
