
import { useCallback, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Operation } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth/useAuth';
import { 
  LeaderboardEntry as LeaderboardEntryType
} from '@/types/supabase-extensions';
import { 
  safeRPCGetLeaderboard, 
  safeRPCGetLeaderboardCount, 
  safeRPCGetUserRank 
} from '@/utils/supabase-helpers';
import logger from '@/utils/logger';

// Export the type so it can be used by LeaderboardTable
export type LeaderboardEntry = {
  rank: number;
  user_id: string;
  profile_id: string;
  name: string;
  grade: string | null;
  best_score: number;
  operation: string;
  min1: number;
  max1: number;
  min2: number;
  max2: number;
};

export type LeaderboardFilters = {
  operation: Operation;
  min1: number | null;
  max1: number | null;
  min2: number | null;
  max2: number | null;
  grade: string | null;
  page: number;
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

  // Helper function to fetch user rank
  async function fetchUserRank(profileId: string, filters: LeaderboardFilters) {
    try {
      const rankData = await safeRPCGetUserRank({
        p_profile_id: profileId,
        p_operation: filters.operation,
        p_min1: filters.min1 ?? undefined,
        p_max1: filters.max1 ?? undefined,
        p_min2: filters.min2 ?? undefined,
        p_max2: filters.max2 ?? undefined,
        p_grade: filters.grade === "all" ? null : filters.grade,
      });
      
      if (rankData !== null) {
        setUserRank(rankData);
        logger.debug('User rank:', rankData);
      }
    } catch (error) {
      logger.error('Error fetching user rank:', error);
    }
  }

  // Fetch leaderboard data from Supabase
  const fetchLeaderboard = useCallback(async () => {
    // Don't fetch if profile is still loading or if a fetch is already in progress
    if (isLoadingProfile || fetchInProgress.current) {
      logger.debug('Skipping leaderboard fetch:', 
        isLoadingProfile ? 'profile still loading' : 'fetch already in progress');
      return;
    }
    
    fetchInProgress.current = true;
    setIsLoading(true);
    setError(null);
    
    const currentFilters = filtersRef.current;
    try {
      logger.debug('Fetching leaderboard with filters:', currentFilters);
      
      // Get leaderboard entries using our safe RPC helper
      const leaderboardData = await safeRPCGetLeaderboard({
        p_operation: currentFilters.operation,
        p_min1: currentFilters.min1 ?? undefined,
        p_max1: currentFilters.max1 ?? undefined,
        p_min2: currentFilters.min2 ?? undefined,
        p_max2: currentFilters.max2 ?? undefined,
        p_grade: currentFilters.grade === "all" ? null : currentFilters.grade,
        p_page: currentFilters.page,
        p_page_size: 25
      });
      
      // Get total count for pagination using our safe RPC helper
      const countData = await safeRPCGetLeaderboardCount({
        p_operation: currentFilters.operation,
        p_min1: currentFilters.min1 ?? undefined,
        p_max1: currentFilters.max1 ?? undefined,
        p_min2: currentFilters.min2 ?? undefined,
        p_max2: currentFilters.max2 ?? undefined,
        p_grade: currentFilters.grade === "all" ? null : currentFilters.grade,
      });
      
      // Update state with fetched data - ensure proper casting
      setEntries(leaderboardData || []);
      
      // Safely convert countData to number for pagination
      const totalCount = typeof countData === 'number' ? countData : 0;
      setTotalPages(Math.max(1, Math.ceil(totalCount / 25)));
      
      // Fetch user rank if profile ID is available
      if (defaultProfileId) {
        await fetchUserRank(defaultProfileId, currentFilters);
      } else {
        logger.debug('No profile ID available, skipping user rank fetch');
      }
    } catch (err) {
      logger.error('Leaderboard error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      toast.error("Couldn't load the leaderboard data. Please try again.");
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, [defaultProfileId, isLoadingProfile]);

  // Calculate guest rank for a score
  const calculateGuestRankForScore = useCallback(async (
    score: number,
    operation: Operation,
    range: { min1: number, max1: number, min2: number, max2: number },
    grade: string | null = null
  ) => {
    try {
      logger.debug('Calculating guest rank for score:', score, 'with operation:', operation, 'and range:', range);
      
      // Use our safe RPC helper
      const leaderboardData = await safeRPCGetLeaderboard({
        p_operation: operation,
        p_min1: range.min1,
        p_max1: range.max1,
        p_min2: range.min2,
        p_max2: range.max2,
        p_grade: grade === "all" ? null : grade,
        p_page: 1,
        p_page_size: 1000 // Get a large number of scores to ensure we have enough for ranking
      });

      // Ensure we have an array even if null is returned
      const entries = leaderboardData || [];
      
      if (entries.length === 0) {
        logger.debug('No leaderboard entries found, guest would be ranked #1');
        return 1;
      }

      // Find where this score would be positioned
      let guestRank = 1; // Default to 1 if higher than all scores
      
      for (const entry of entries) {
        if (entry.best_score >= score) {
          guestRank++;
        } else {
          break; // Leaderboard data is already sorted by score descending
        }
      }
      
      logger.debug('Guest rank calculation result:', { score, rank: guestRank, totalEntries: entries.length });
      return guestRank;
    } catch (err) {
      logger.error('Error calculating guest rank:', err);
      return null;
    }
  }, []);

  // Initial fetch on mount and when URL changes
  useEffect(() => {
    if (!initialLoadDone.current && !isLoadingProfile) {
      logger.debug('Initial leaderboard fetch');
      fetchLeaderboard();
      initialLoadDone.current = true;
    }
  }, [fetchLeaderboard, isLoadingProfile]);

  // Fetch when profile loads
  useEffect(() => {
    if (!isLoadingProfile && defaultProfileId && initialLoadDone.current) {
      logger.debug('Profile loaded, refreshing leaderboard');
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
