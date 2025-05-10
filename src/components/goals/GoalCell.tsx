
import React, { useState } from 'react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GoalLevel, GoalProgress } from '@/types';
import { getLevelEmoji } from '@/hooks/useGoalProgress';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';

interface GoalCellProps {
  goal?: GoalProgress;
  operation: string;
  range: string;
}

const GoalCell: React.FC<GoalCellProps> = ({ goal, operation, range }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  if (!goal) {
    return <EmptyGoalCell operation={operation} range={range} />;
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
  
  // Handle play button click to navigate to game with settings
  const handlePlay = () => {
    setIsDialogOpen(false);
    
    // Parse the range to determine if it's a focus number or a regular range
    const isFocusNumber = !range.includes('-');
    
    // Construct URL with query parameters for game settings
    const params = new URLSearchParams();
    params.append('operation', operation);
    
    if (isFocusNumber) {
      // It's a focus number
      params.append('focusNumber', range);
    } else {
      // It's a range like "1-5"
      const [min, max] = range.split('-').map(Number);
      params.append('rangeMin', min.toString());
      params.append('rangeMax', max.toString());
    }
    
    navigate(`/?${params.toString()}`);
  };
  
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={`w-full h-12 flex items-center justify-center border-2 rounded-md transition-all duration-200 cursor-pointer hover:shadow-md ${cellStyle}`}
              onClick={() => setIsDialogOpen(true)}
            >
              <span className="text-xl">{getLevelEmoji(level)}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="p-3 max-w-[200px] text-center">
            <div className="space-y-1">
              <div className="font-semibold">{best_score > 0 ? `Best: ${best_score}` : 'Not attempted'}</div>
              {attempts > 0 && <div className="text-sm">Attempts: {attempts}</div>}
              <div className="text-xs text-muted-foreground">{lastAttemptText}</div>
              <div className="text-xs text-primary">Click for details</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {operation.charAt(0).toUpperCase() + operation.slice(1)} • Range {range}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Level:</span>
                <span className="font-medium flex items-center gap-2">
                  <span className="text-xl">{getLevelEmoji(level)}</span>
                  <span>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                </span>
              </div>
              
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Best Score:</span>
                <span className="font-medium">{best_score || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Attempts:</span>
                <span className="font-medium">{attempts}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Last Attempt:</span>
                <span className="text-sm">{last_attempt ? formatDistanceToNow(new Date(last_attempt), { addSuffix: true }) : 'Never'}</span>
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={handlePlay} 
                className="w-full flex items-center justify-center gap-2"
              >
                <Play size={16} />
                Play Game
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const EmptyGoalCell = ({ operation, range }: { operation: string, range: string }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  const handlePlay = () => {
    setIsDialogOpen(false);
    
    // Parse the range to determine if it's a focus number or a regular range
    const isFocusNumber = !range.includes('-');
    
    // Construct URL with query parameters for game settings
    const params = new URLSearchParams();
    params.append('operation', operation);
    
    if (isFocusNumber) {
      // It's a focus number
      params.append('focusNumber', range);
    } else {
      // It's a range like "1-5"
      const [min, max] = range.split('-').map(Number);
      params.append('rangeMin', min.toString());
      params.append('rangeMax', max.toString());
    }
    
    navigate(`/?${params.toString()}`);
  };
  
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className="w-full h-12 flex items-center justify-center border border-dashed border-slate-200 rounded-md bg-slate-50/50 text-slate-400 cursor-pointer hover:bg-slate-100/50 transition-all"
              onClick={() => setIsDialogOpen(true)}
            >
              <span className="text-xs">-</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Not attempted yet - Click to try</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {operation.charAt(0).toUpperCase() + operation.slice(1)} • Range {range}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="text-center text-muted-foreground py-4">
              You haven't attempted this combination yet.
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={handlePlay} 
                className="w-full flex items-center justify-center gap-2"
              >
                <Play size={16} />
                Start Game
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GoalCell;
