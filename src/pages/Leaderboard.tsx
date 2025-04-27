
import { useEffect } from 'react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { LeaderboardFilters } from '@/components/leaderboard/LeaderboardFilters';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useAuth } from '@/context/auth/useAuth';
import { Card } from '@/components/ui/card';
import { useLocation } from 'react-router-dom';

const Leaderboard = () => {
  const location = useLocation();
  const { userId } = useAuth();
  const {
    filters,
    entries,
    isLoading,
    error,
    totalPages,
    userRank,
    updateFilters,
    fetchLeaderboard,
  } = useLeaderboard();

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Deep linking from game end screen
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const operation = params.get('operation');
    const min1 = params.get('min1');
    const max1 = params.get('max1');
    const min2 = params.get('min2');
    const max2 = params.get('max2');

    if (operation && min1 && max1 && min2 && max2) {
      updateFilters({
        operation: operation as any,
        min1: parseInt(min1),
        max1: parseInt(max1),
        min2: parseInt(min2),
        max2: parseInt(max2),
      });
    }
  }, [location.search]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">See how you stack up!</p>
      </div>

      {userRank && (
        <Card className="p-4 text-center bg-accent/10">
          <p className="text-accent font-semibold">
            Your Current Rank: #{userRank}
          </p>
        </Card>
      )}

      <LeaderboardFilters
        filters={filters}
        onFilterChange={updateFilters}
        className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg shadow-sm z-10"
      />

      {error ? (
        <div className="text-center text-destructive">{error}</div>
      ) : (
        <>
          <LeaderboardTable
            entries={entries}
            currentUserId={userId}
            className={isLoading ? 'opacity-50' : ''}
          />

          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => updateFilters({ page: Math.max(1, filters.page - 1) })}
                    aria-disabled={filters.page === 1}
                    className={filters.page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => updateFilters({ page: Math.min(totalPages, filters.page + 1) })}
                    aria-disabled={filters.page === totalPages}
                    className={filters.page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default Leaderboard;
