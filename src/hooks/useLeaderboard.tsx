
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
  
  // Parse current filters from URL params
  const filtersRef = useRef<LeaderboardFilters>(parseFiltersFromParams(searchParams));

  // Parse numeric values from search params
  function parseNumericParam(param: string | null): number | null {
    if (param === null || param === 'null') return null;
    const value = parseInt(param);
    return isNaN(value) ? null : value;
  }

  // Helper function to parse filters from URL params
  function parseFiltersFromParams(params: URLSearchParams): LeaderboardFilters {
    return {
      operation: (params.get('operation') as Operation) || DEFAULT_FILTERS.operation,
      min1: parseNumericParam(params.get('min1')) ?? DEFAULT_FILTERS.min1,
      max1: parseNumericParam(params.get('max1')) ?? DEFAULT_FILTERS.max1,
      min2: parseNumericParam(params.get('min2')) ?? DEFAULT_FILTERS.min2,
      max2: parseNumericParam(params.get('max2')) ?? DEFAULT_FILTERS.max2,
      grade: params.get('grade') === "null" ? null : params.get('grade') || DEFAULT_FILTERS.grade,
      page: parseInt(params.get('page') || String(DEFAULT_FILTERS.page)),
    };
  }

  // Update filters from URL params when search params change
  useEffect(() => {
    filtersRef.current = parseFiltersFromParams(searchParams);
  }, [searchParams]);

  // Fetch leaderboard data from Supabase
  const fetchLeaderboard = useCallback(async () => {
    // Don't fetch if profile is still loading or if a fetch is already in progress
    if (isLoadingProfile || fetchInProgress.current) {
      console.log('Skipping leaderboard fetch:', 
        isLoadingProfile ? 'profile still loading' : 'fetch already in progress');
      return;
    }
    
    fetchInProgress.current = true;
    setIsLoading(true);
    setError(null);
    
    const currentFilters = filtersRef.current;
    try {
      console.log('Fetching leaderboard with filters:', currentFilters);
      
      // Get leaderboard entries
      const { data: leaderboardData, error: leaderboardError } = await fetchLeaderboardData(currentFilters);
      if (leaderboardError) throw leaderboardError;
      
      // Get total count for pagination
      const { data: countData, error: countError } = await fetchLeaderboardCount(currentFilters);
      if (countError) throw countError;
      
      // Update state with fetched data
      setEntries(leaderboardData || []);
      setTotalPages(Math.max(1, Math.ceil((countData || 0) / 25)));
      
      // Fetch user rank if profile ID is available
      if (defaultProfileId) {
        await fetchUserRank(defaultProfileId, currentFilters);
      } else {
        console.log('No profile ID available, skipping user rank fetch');
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

  // Helper function to fetch leaderboard data
  async function fetchLeaderboardData(filters: LeaderboardFilters) {
    return supabase.rpc('get_leaderboard', {
      p_operation: filters.operation,
      p_min1: filters.min1,
      p_max1: filters.max1,
      p_min2: filters.min2,
      p_max2: filters.max2,
      p_grade: filters.grade === "all" ? null : filters.grade,
      p_page: filters.page,
    });
  }

  // Helper function to fetch total count for pagination
  async function fetchLeaderboardCount(filters: LeaderboardFilters) {
    return supabase.rpc('get_leaderboard_count', {
      p_operation: filters.operation,
      p_min1: filters.min1,
      p_max1: filters.max1,
      p_min2: filters.min2,
      p_max2: filters.max2,
      p_grade: filters.grade === "all" ? null : filters.grade,
    });
  }

  // Helper function to fetch user rank
  async function fetchUserRank(profileId: string, filters: LeaderboardFilters) {
    try {
      const { data: rankData, error: rankError } = await supabase
        .rpc('get_user_rank', {
          p_profile_id: profileId,
          p_operation: filters.operation,
          p_min1: filters.min1,
          p_max1: filters.max1,
          p_min2: filters.min2,
          p_max2: filters.max2,
          p_grade: filters.grade === "all" ? null : filters.grade,
        });

      if (rankError) {
        console.error('Rank error:', rankError);
      } else {
        setUserRank(rankData);
        console.log('User rank:', rankData);
      }
    } catch (error) {
      console.error('Error fetching user rank:', error);
    }
  }

  // Calculate guest rank for a score
  const calculateGuestRankForScore = useCallback(async (
    score: number,
    operation: Operation,
    range: { min1: number, max1: number, min2: number, max2: number },
    grade: string | null = null
  ) => {
    try {
      console.log('Calculating guest rank for score:', score, 'with operation:', operation, 'and range:', range);
      
      // Use the same get_leaderboard RPC function for consistency
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .rpc('get_leaderboard', {
          p_operation: operation,
          p_min1: range.min1,
          p_max1: range.max1,
          p_min2: range.min2,
          p_max2: range.max2,
          p_grade: grade === "all" ? null : grade,
          p_page: 1,
          p_page_size: 1000 // Get a large number of scores to ensure we have enough for ranking
        });

      if (leaderboardError) {
        console.error('Error fetching leaderboard data for guest rank:', leaderboardError);
        return null;
      }

      console.log('Leaderboard data for guest ranking:', leaderboardData);
      
      if (!leaderboardData || leaderboardData.length === 0) {
        console.log('No leaderboard entries found, guest would be ranked #1');
        return 1;
      }

      // Find where this score would be positioned
      let guestRank = 1; // Default to 1 if higher than all scores
      
      for (const entry of leaderboardData) {
        if (entry.best_score >= score) {
          guestRank++;
        } else {
          break; // Leaderboard data is already sorted by score descending
        }
      }
      
      console.log('Guest rank calculation result:', { score, rank: guestRank, totalEntries: leaderboardData.length });
      return guestRank;
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

  // Fetch when profile loads
  useEffect(() => {
    if (!isLoadingProfile && defaultProfileId && initialLoadDone.current) {
      console.log('Profile loaded, refreshing leaderboard');
      fetchLeaderboard();
    }
  }, [isLoadingProfile, defaultProfileId, fetchLeaderboard]);

  // Update filters and trigger a fetch
  const updateFilters = useCallback((newFilters: Partial<LeaderboardFilters>) => {
    // Reset to page 1 if it's not a page change
    const shouldResetPage = !('page' in newFilters);
    
    const updatedFilters = {
      ...filtersRef.current,
      ...newFilters,
      ...(shouldResetPage ? { page: 1 } : {}),
    };

    // Update URL params
    const paramsToSet = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      paramsToSet.set(key, value === null ? "null" : String(value));
    });

    // Update URL without causing extra re-renders
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
