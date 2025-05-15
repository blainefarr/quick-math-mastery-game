
import { Award, Trophy } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeaderboardEntry } from "@/hooks/useLeaderboard";
import { useAuth } from "@/context/auth/useAuth";
import { memo } from "react";
import logger from "@/utils/logger";

type Props = {
  entries: LeaderboardEntry[];
  currentUserId?: string | null;
  className?: string;
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Award className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
  return null;
};

// Using memo to prevent unnecessary re-renders
export const LeaderboardTable = memo(({ entries, className = '' }: Props) => {
  const { defaultProfileId } = useAuth();
  
  if (entries.length === 0) {
    logger.debug('No leaderboard entries to display');
    return null; // Return null as we'll handle the empty state in the parent component
  }

  return (
    <div className={`rounded-md border ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="w-[80px]">Score</TableHead>
            <TableHead>Operation</TableHead>
            <TableHead>Range</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            try {
              // Check if the current user matches the profile_id
              const isCurrentUser = entry.profile_id === defaultProfileId;
              
              return (
                <TableRow
                  key={entry.profile_id}
                  className={isCurrentUser ? "bg-muted" : undefined}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getRankIcon(entry.rank)}
                      <span>{entry.rank}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{entry.name ? entry.name.split(' ')[0] : 'Anonymous'}</span>
                      {entry.grade && (
                        <span className="text-xs text-muted-foreground">
                          {entry.grade}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">{entry.best_score}</TableCell>
                  <TableCell>
                    {entry.operation.charAt(0).toUpperCase() + entry.operation.slice(1)}
                  </TableCell>
                  <TableCell>{`${entry.min1}-${entry.max1}`}</TableCell>
                </TableRow>
              );
            } catch (error) {
              logger.error('Error rendering leaderboard entry:', error);
              return null; // Skip rendering this entry if there's an error
            }
          })}
        </TableBody>
      </Table>
    </div>
  );
});

LeaderboardTable.displayName = "LeaderboardTable";
