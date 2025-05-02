
import { useCallback, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Operation } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth/useAuth';

export type LeaderboardFilters = {
  operation: Operation;
  min1: number | null;
  max1: number | null;
  min2: number | null;
  max2: number | null;
  grade: string | null;
  page: number;
};

export type LeaderboardEntry = {
  rank: number;
  user_id: string;
  profile_id: string;
  name: string;
  grade: string | null;
  best_score: number;
  operation: Operation;
  min1: number;
  max1: number;
  min2: number;
  max2: number;
};

const DEFAULT_FILTERS: LeaderboardFilters = {
  operation: 'addition',
  min1: 1,
  max1: 10,
  min2: 1,
  max2: 10,
  grade: null,
  page: 1,
};

export const useLeaderboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [userRank, setUserRank] = useState<number | null>(null);
  const initialLoadDone = useRef(false);
  const fetchInProgress = useRef(false);
  const { defaultProfileId, isLoadingProfile } = useAuth();
  
  // Parse numeric values from search params
  const parseNumericParam = (param: string | null): number | null => {
    if (param === null || param === 'null') return null;
    const value = parseInt(param);
    return isNaN(value) ? null : value;
  };

  // Use ref for currentFilters to avoid re-renders
  const filtersRef = useRef<LeaderboardFilters>({
    operation: (searchParams.get('operation') as Operation) || DEFAULT_FILTERS.operation,
    min1: parseNumericParam(searchParams.get('min1')) ?? DEFAULT_FILTERS.min1,
    max1: parseNumericParam(searchParams.get('max1')) ?? DEFAULT_FILTERS.max1,
    min2: parseNumericParam(searchParams.get('min2')) ?? DEFAULT_FILTERS.min2,
    max2: parseNumericParam(searchParams.get('max2')) ?? DEFAULT_FILTERS.max2,
    grade: searchParams.get('grade') === "null" ? null : searchParams.get('grade') || DEFAULT_FILTERS.grade,
    page: parseInt(searchParams.get('page') || String(DEFAULT_FILTERS.page)),
  });

  // Update filters from URL params when search params change
  useEffect(() => {
    filtersRef.current = {
      operation: (searchParams.get('operation') as Operation) || DEFAULT_FILTERS.operation,
      min1: parseNumericParam(searchParams.get('min1')) ?? DEFAULT_FILTERS.min1,
      max1: parseNumericParam(searchParams.get('max1')) ?? DEFAULT_FILTERS.max1,
      min2: parseNumericParam(searchParams.get('min2')) ?? DEFAULT_FILTERS.min2,
      max2: parseNumericParam(searchParams.get('max2')) ?? DEFAULT_FILTERS.max2,
      grade: searchParams.get('grade') === "null" ? null : searchParams.get('grade') || DEFAULT_FILTERS.grade,
      page: parseInt(searchParams.get('page') || String(DEFAULT_FILTERS.page)),
    };
  }, [searchParams]);

  const fetchLeaderboard = useCallback(async () => {
    // Don't fetch if profile is still loading
    if (isLoadingProfile) {
      console.log('Profile still loading, deferring leaderboard fetch');
      return;
    }
    
    // Prevent concurrent fetches
    if (fetchInProgress.current) return;
    
    fetchInProgress.current = true;
    setIsLoading(true);
    setError(null);

    const currentFilters = filtersRef.current;
    
    try {
      console.log('Fetching leaderboard with filters:', currentFilters);
      
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .rpc('get_leaderboard', {
          p_operation: currentFilters.operation,
          p_min1: currentFilters.min1,
          p_max1: currentFilters.max1,
          p_min2: currentFilters.min2,
          p_max2: currentFilters.max2,
          p_grade: currentFilters.grade === "all" ? null : currentFilters.grade,
          p_page: currentFilters.page,
        });

      if (leaderboardError) {
        console.error('Leaderboard error:', leaderboardError);
        throw leaderboardError;
      }
      
      console.log('Leaderboard data:', leaderboardData);

      const { data: countData, error: countError } = await supabase
        .rpc('get_leaderboard_count', {
          p_operation: currentFilters.operation,
          p_min1: currentFilters.min1,
          p_max1: currentFilters.max1,
          p_min2: currentFilters.min2,
          p_max2: currentFilters.max2,
          p_grade: currentFilters.grade === "all" ? null : currentFilters.grade,
        });

      if (countError) {
        console.error('Count error:', countError);
        throw countError;
      }
      
      console.log('Total count:', countData);

      // Cast the operation field to Operation type
      const typedEntries = leaderboardData?.map(entry => ({
        ...entry,
        operation: entry.operation as Operation
      })) || [];
      
      setEntries(typedEntries as LeaderboardEntry[]);
      setTotalPages(Math.max(1, Math.ceil((countData || 0) / 25)));

      // Skip user rank if we have no profile ID
      if (!defaultProfileId) {
        console.log('No profile ID available, skipping user rank fetch');
        return;
      }

      // Fetch user rank using the profile ID
      const { data: rankData, error: rankError } = await supabase
        .rpc('get_user_rank', {
          p_profile_id: defaultProfileId,
          p_operation: currentFilters.operation,
          p_min1: currentFilters.min1,
          p_max1: currentFilters.max1,
          p_min2: currentFilters.min2,
          p_max2: currentFilters.max2,
          p_grade: currentFilters.grade === "all" ? null : currentFilters.grade,
        });

      if (rankError) {
        console.error('Rank error:', rankError);
      } else {
        setUserRank(rankData);
        console.log('User rank:', rankData);
      }
    } catch (err) {
      console.error('Leaderboard error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      toast.error("Couldn't load the leaderboard data. Please try again.");
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, [defaultProfileId, isLoadingProfile]); 

  // Utility function to calculate ranking for a score against unique profile high scores
  const calculateGuestRankForScore = useCallback(async (
    score: number,
    operation: Operation,
    range: { min1: number, max1: number, min2: number, max2: number },
    grade: string | null = null
  ) => {
    try {
      // Fetch scores with unique profile_id and calculate rank
      const { data, error } = await supabase
        .from('scores')
        .select(`
          profile_id,
          score,
          operation,
          min1,
          max1,
          min2,
          max2
        `)
        .eq('operation', operation)
        .eq('min1', range.min1)
        .eq('max1', range.max1)
        .eq('min2', range.min2)
        .eq('max2', range.max2)
        .eq('duration', 60)
        .eq('allow_negatives', false)
        .order('score', { ascending: false });

      if (error) {
        console.error('Error fetching scores for guest rank:', error);
        return null;
      }

      // Get highest score for each profile
      const profileHighScores = new Map<string, number>();
      data?.forEach(item => {
        const currentBest = profileHighScores.get(item.profile_id) || 0;
        if (item.score > currentBest) {
          profileHighScores.set(item.profile_id, item.score);
        }
      });

      // Convert to array of unique profile high scores
      const uniqueHighScores = Array.from(profileHighScores.values());
      uniqueHighScores.sort((a, b) => b - a);  // Sort descending

      // Calculate rank (how many scores are higher than the given score + 1)
      const rank = uniqueHighScores.filter(s => s > score).length + 1;
      
      console.log('Guest rank calculation:', { score, rank, uniqueScores: uniqueHighScores.length });
      
      return rank;
    } catch (err) {
      console.error('Error calculating guest rank:', err);
      return null;
    }
  }, []);

  // Initial fetch on mount and when URL changes
  useEffect(() => {
    if (!initialLoadDone.current && !isLoadingProfile) {
      console.log('Initial leaderboard fetch');
      fetchLeaderboard();
      initialLoadDone.current = true;
    }
  }, [fetchLeaderboard, isLoadingProfile]);

  // Listen for profile loading completion to trigger refresh
  useEffect(() => {
    if (!isLoadingProfile && defaultProfileId && initialLoadDone.current) {
      console.log('Profile loaded, refreshing leaderboard');
      fetchLeaderboard();
    }
  }, [isLoadingProfile, defaultProfileId, fetchLeaderboard]);

  const updateFilters = useCallback((newFilters: Partial<LeaderboardFilters>) => {
    // For a filter change, reset to page 1 if it's not a page change
    const shouldResetPage = !('page' in newFilters);
    
    const updatedFilters = {
      ...filtersRef.current,
      ...newFilters,
      ...(shouldResetPage ? { page: 1 } : {}),
    };

    // Convert null to "null" strings for URL
    const paramsToSet = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      paramsToSet.set(key, value === null ? "null" : String(value));
    });

    // Update the URL without causing extra re-renders
    setSearchParams(paramsToSet, { replace: true });

    // Update the ref directly
    filtersRef.current = updatedFilters;
    
    // Fetch with updated filters
    setTimeout(() => fetchLeaderboard(), 0);
  }, [fetchLeaderboard, setSearchParams]);

  return {
    filters: filtersRef.current,
    entries,
    isLoading,
    error,
    totalPages,
    userRank,
    updateFilters,
    fetchLeaderboard,
    calculateGuestRankForScore
  };
};
