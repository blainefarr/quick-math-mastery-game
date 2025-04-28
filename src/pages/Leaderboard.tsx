import { useEffect } from 'react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { LeaderboardFilters } from '@/components/leaderboard/LeaderboardFilters';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useAuth } from '@/context/auth/useAuth';
import { Card } from '@/components/ui/card';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
const Leaderboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    userId,
    isAuthenticated
  } = useAuth();
  const {
    filters,
    entries,
    isLoading,
    error,
    totalPages,
    userRank,
    updateFilters,
    fetchLeaderboard
  } = useLeaderboard();
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
        max2: parseInt(max2)
      });
    }
  }, []);
  const hasNoEntries = !isLoading && entries.length === 0;
  return <div className="container mx-auto py-8 px-4 max-w-4xl space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="outline" size="sm" onClick={() => navigate('/')} className="h-8 rounded-full">
          <ArrowLeft size={16} className="mr-1" />
          Back to Game
        </Button>
      </div>

      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">See how you stack up!</p>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
          <LeaderboardFilters filters={filters} onFilterChange={updateFilters} />
        </div>

        {userRank && <div className="px-4 pb-4">
            <Card className="p-4 text-center bg-accent/10">
              <p className="text-accent font-semibold">
                Your Current Rank: #{userRank}
              </p>
            </Card>
          </div>}

        {error ? <div className="text-center text-destructive p-8 rounded-lg border border-destructive/20 bg-destructive/5">
            <p className="mb-2">{error}</p>
            <Button onClick={() => fetchLeaderboard()} variant="outline" size="sm" className="mt-2">
              Try Again
            </Button>
          </div> : <>
            {entries.length === 0 ? <Card className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <Trophy className="w-12 h-12 text-muted-foreground/30" />
                  <h3 className="text-xl font-medium">No Scores Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    There are no scores on the leaderboard matching your current filters. 
                    Try changing your filters or be the first to submit a score!
                  </p>
                  {!isAuthenticated && <div className="flex flex-col items-center mt-2 p-4 bg-muted/30 rounded-lg">
                      <Info className="w-5 h-5 mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Sign in to track your scores and compete on the leaderboard
                      </p>
                      <Button size="sm" asChild>
                        <Link to="/login">Sign In</Link>
                      </Button>
                    </div>}
                  {isAuthenticated && <Button className="mt-2" asChild>
                      <Link to="/">Play Now</Link>
                    </Button>}
                </div>
              </Card> : <div className="overflow-x-auto px-[16px] py-0">
                <LeaderboardTable entries={entries} currentUserId={userId} className={isLoading ? 'opacity-50' : ''} />
              </div>}

            {totalPages > 1 && <div className="p-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious onClick={() => updateFilters({
                  page: Math.max(1, filters.page - 1)
                })} aria-disabled={filters.page === 1} className={filters.page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext onClick={() => updateFilters({
                  page: Math.min(totalPages, filters.page + 1)
                })} aria-disabled={filters.page === totalPages} className={filters.page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>}
          </>}
      </Card>
    </div>;
};
export default Leaderboard;