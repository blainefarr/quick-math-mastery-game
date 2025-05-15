
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth/useAuth';
import { GoalProgress, Operation, GoalLevel } from '@/types';
import { toast } from 'sonner';
import logger from '@/utils/logger';
import { extractData } from '@/utils/supabase-helpers';

export const useGoalProgress = () => {
  const [goals, setGoals] = useState<GoalProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { defaultProfileId } = useAuth();
  
  const fetchGoals = useCallback(async () => {
    if (!defaultProfileId) {
      setGoals([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await supabase
        .from('goal_progress')
        .select('*')
        .eq('profile_id', defaultProfileId as any);
      
      // Use our helper function to safely extract data
      const data = extractData(response, []);
      
      if (!data || !Array.isArray(data)) {
        logger.warn('No goal data returned from database');
        setGoals([]);
        setIsLoading(false);
        return;
      }
      
      // Properly type-cast the operations from the database to match our Operation type
      const typedGoals: GoalProgress[] = data.map(item => ({
        operation: item.operation as Operation,
        level: item.level as GoalLevel,
        profile_id: item.profile_id,
        range: item.range,
        best_score: item.best_score,
        attempts: item.attempts,
        last_attempt: item.last_attempt,
        last_level_up: item.last_level_up
      }));
      
      setGoals(typedGoals);
    } catch (err) {
      logger.error('Error fetching goals:', err);
      setError('Failed to load goals data');
      toast.error('Failed to load goals data');
    } finally {
      setIsLoading(false);
    }
  }, [defaultProfileId]);
  
  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);
  
  const updateGoalProgress = useCallback(async (
    operation: Operation,
    range: string,
    score: number
  ) => {
    if (!defaultProfileId) return null;
    
    try {
      // Determine the level based on score
      const level = getGoalLevel(score);
      
      // Check if we already have this goal
      const existingGoal = goals.find(
        goal => goal.operation === operation && goal.range === range
      );
      
      // Only update if it's a new best score
      const shouldUpdateBestScore = !existingGoal || score > existingGoal.best_score;
      const bestScore = existingGoal && !shouldUpdateBestScore ? existingGoal.best_score : score;
      const previousLevel = existingGoal?.level || 'learning';
      const leveledUp = previousLevel !== level && level !== 'learning';
      
      // Explicitly type the goal data for insert/update
      const goalData = {
        profile_id: defaultProfileId,
        operation,
        range,
        best_score: bestScore,
        level: getGoalLevel(bestScore),
        attempts: existingGoal ? existingGoal.attempts + 1 : 1,
        last_attempt: new Date().toISOString(),
        last_level_up: leveledUp ? new Date().toISOString() : existingGoal?.last_level_up || null
      };
      
      const response = await supabase
        .from('goal_progress')
        .upsert(goalData, {
          onConflict: 'profile_id,operation,range'
        });
        
      if (response.error) {
        throw response.error;
      }
      
      // Refresh goals after update
      fetchGoals();
      
      return { updated: true, leveledUp, newLevel: level };
    } catch (err) {
      logger.error('Error updating goal progress:', err);
      toast.error('Failed to update goal progress');
      return null;
    }
  }, [defaultProfileId, goals, fetchGoals]);
  
  return {
    goals,
    isLoading,
    error,
    fetchGoals,
    updateGoalProgress
  };
};

// Helper functions
export const getGoalLevel = (score: number): GoalLevel => {
  if (score >= 60) return 'legend';
  if (score >= 50) return 'star';
  if (score >= 40) return 'gold';
  if (score >= 30) return 'silver';
  if (score >= 20) return 'bronze';
  return 'learning';
};

export const getLevelEmoji = (level: GoalLevel): string => {
  switch (level) {
    case 'legend': return '👑';
    case 'star': return '🌟';
    case 'gold': return '🥇';
    case 'silver': return '🥈';
    case 'bronze': return '🥉';
    case 'learning':
    default:
      return '🚀';
  }
};

export const getGoalRangeDescription = (range: string): string => {
  if (range.includes('-')) {
    return `Range ${range}`;
  } else {
    return `Focus ${range}`;
  }
};

export default useGoalProgress;
