
import React from 'react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GoalLevel, GoalProgress } from '@/types';
import { getLevelEmoji } from '@/hooks/useGoalProgress';
import { formatDistanceToNow } from 'date-fns';

interface GoalCellProps {
  goal?: GoalProgress;
  operation: string;
  range: string;
}

const GoalCell: React.FC<GoalCellProps> = ({ goal, operation, range }) => {
  if (!goal) {
    return <EmptyGoalCell />;
  }
  
  const { level, best_score, attempts, last_attempt } = goal;
  const lastAttemptText = last_attempt 
    ? `Last attempt: ${formatDistanceToNow(new Date(last_attempt), { addSuffix: true })}` 
    : 'Not attempted yet';
  
  // Function to determine what CSS classes to apply based on level
  const getLevelStyle = (level: GoalLevel) => {
    switch (level) {
      case 'legend':
        return 'bg-teal-100/50 border-teal-500 text-teal-800';
      case 'star':
        return 'bg-purple-100/50 border-purple-500 text-purple-800';
      case 'gold':
        return 'bg-amber-100/50 border-amber-500 text-amber-800';
      case 'silver':
        return 'bg-blue-100/50 border-blue-400 text-blue-800';
      case 'bronze':
        return 'bg-stone-100/50 border-stone-400 text-stone-700';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-500';
    }
  };
  
  const cellStyle = getLevelStyle(level);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="w-full">
          <div 
            className={`w-full h-12 flex items-center justify-center border-2 rounded-md transition-all duration-200 cursor-pointer hover:shadow-md ${cellStyle}`}
          >
            <span className="text-xl">{getLevelEmoji(level)}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="p-3 max-w-[200px] text-center">
          <div className="space-y-1">
            <div className="font-semibold">{best_score > 0 ? `Best: ${best_score}` : 'Not attempted'}</div>
            {attempts > 0 && <div className="text-sm">Attempts: {attempts}</div>}
            <div className="text-xs text-muted-foreground">{lastAttemptText}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const EmptyGoalCell = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="w-full">
          <div className="w-full h-12 flex items-center justify-center border border-dashed border-slate-200 rounded-md bg-slate-50/50 text-slate-400">
            <span className="text-xs">-</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Not attempted yet</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default GoalCell;
