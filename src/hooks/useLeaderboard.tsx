
import { useCallback, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Operation, ProblemRange } from '@/types';
import { supabase } from '@/integrations/supabase/client';

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
    grade: searchParams.get('grade') || DEFAULT_FILTERS.grade,
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
      grade: searchParams.get('grade') || DEFAULT_FILTERS.grade,
      page: parseInt(searchParams.get('page') || String(DEFAULT_FILTERS.page)),
    };
  }, [searchParams]);

  const fetchLeaderboard = useCallback(async () => {
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

      if (leaderboardError) throw leaderboardError;
      
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

      if (countError) throw countError;
      
      console.log('Total count:', countData);

      // Cast the operation field to Operation type
      const typedEntries = leaderboardData?.map(entry => ({
        ...entry,
        operation: entry.operation as Operation
      })) || [];
      
      setEntries(typedEntries as LeaderboardEntry[]);
      setTotalPages(Math.ceil((countData || 0) / 25));

      // Fetch user rank if authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: rankData, error: rankError } = await supabase
          .rpc('get_user_rank', {
            p_user_id: user.id,
            p_operation: currentFilters.operation,
            p_min1: currentFilters.min1,
            p_max1: currentFilters.max1,
            p_min2: currentFilters.min2,
            p_max2: currentFilters.max2,
            p_grade: currentFilters.grade === "all" ? null : currentFilters.grade,
          });

        if (!rankError && rankData !== null) {
          setUserRank(rankData);
        } else {
          setUserRank(null);
        }
      }
    } catch (err) {
      console.error('Leaderboard error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, []); // No dependencies to prevent infinite loop

  // Initial fetch on mount and when URL changes
  useEffect(() => {
    if (!initialLoadDone.current) {
      fetchLeaderboard();
      initialLoadDone.current = true;
    }
  }, [fetchLeaderboard]);

  const updateFilters = useCallback((newFilters: Partial<LeaderboardFilters>) => {
    // For a filter change, reset to page 1 if it's not a page change
    const shouldResetPage = !('page' in newFilters);
    
    const updatedFilters = {
      ...filtersRef.current,
      ...newFilters,
      ...(shouldResetPage ? { page: 1 } : {}),
    };

    // Update the URL without causing extra re-renders
    setSearchParams(
      Object.entries(updatedFilters).reduce((params, [key, value]) => {
        if (value !== null && value !== undefined) {
          params.set(key, String(value));
        } else {
          // For null values, explicitly set 'null' string to maintain in URL
          params.set(key, 'null');
        }
        return params;
      }, new URLSearchParams()),
      { replace: true } // Use replace to avoid adding to browser history
    );

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
  };
};
