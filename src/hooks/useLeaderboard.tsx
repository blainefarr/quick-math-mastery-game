
import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Operation, ProblemRange } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export type LeaderboardFilters = {
  operation: Operation;
  min1: number;
  max1: number;
  min2: number;
  max2: number;
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

  const currentFilters = {
    operation: (searchParams.get('operation') as Operation) || DEFAULT_FILTERS.operation,
    min1: parseInt(searchParams.get('min1') || String(DEFAULT_FILTERS.min1)),
    max1: parseInt(searchParams.get('max1') || String(DEFAULT_FILTERS.max1)),
    min2: parseInt(searchParams.get('min2') || String(DEFAULT_FILTERS.min2)),
    max2: parseInt(searchParams.get('max2') || String(DEFAULT_FILTERS.max2)),
    grade: searchParams.get('grade') || DEFAULT_FILTERS.grade,
    page: parseInt(searchParams.get('page') || String(DEFAULT_FILTERS.page)),
  };

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .rpc('get_leaderboard', {
          p_operation: currentFilters.operation,
          p_min1: currentFilters.min1,
          p_max1: currentFilters.max1,
          p_min2: currentFilters.min2,
          p_max2: currentFilters.max2,
          p_grade: currentFilters.grade,
          p_page: currentFilters.page,
        });

      if (leaderboardError) throw leaderboardError;

      const { data: countData, error: countError } = await supabase
        .rpc('get_leaderboard_count', {
          p_operation: currentFilters.operation,
          p_min1: currentFilters.min1,
          p_max1: currentFilters.max1,
          p_min2: currentFilters.min2,
          p_max2: currentFilters.max2,
          p_grade: currentFilters.grade,
        });

      if (countError) throw countError;

      setEntries(leaderboardData || []);
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
            p_grade: currentFilters.grade,
          });

        if (!rankError) {
          setUserRank(rankData);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  }, [currentFilters]);

  const updateFilters = (newFilters: Partial<LeaderboardFilters>) => {
    const updatedFilters = {
      ...currentFilters,
      ...newFilters,
      page: newFilters.page ?? 1, // Reset to page 1 when filters change
    };

    setSearchParams(
      Object.entries(updatedFilters).reduce((params, [key, value]) => {
        if (value !== null && value !== undefined) {
          params.set(key, String(value));
        }
        return params;
      }, new URLSearchParams())
    );
  };

  return {
    filters: currentFilters,
    entries,
    isLoading,
    error,
    totalPages,
    userRank,
    updateFilters,
    fetchLeaderboard,
  };
};
