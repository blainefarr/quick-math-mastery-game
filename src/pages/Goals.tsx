
import React from 'react';
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';
import useGoalProgress from '@/hooks/useGoalProgress';
import GoalsGrid from '@/components/goals/GoalsGrid';
import GoalsLegend from '@/components/goals/GoalsLegend';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const GoalsPage: React.FC = () => {
  const { goals, isLoading } = useGoalProgress();
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-8 px-2 sm:px-4">
      <div className="mx-auto max-w-[800px]">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/')} 
            className="h-8 rounded-full mr-auto"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Game
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Goals</h1>
          <p className="text-muted-foreground">Track your math skills progress</p>
        </div>

        <div className="mt-6 mb-8">
          <GoalsLegend />
        </div>
        
        <div className="mt-6 mb-8">
          <Card>
          <CardContent className="px-2 sm:px-6 py-6">
              <GoalsGrid 
                goals={goals}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 bg-accent/10 rounded-md p-4 text-sm">
          <h3 className="font-medium mb-2">How it works</h3>
          <p className="text-muted-foreground mb-3">
            Each cell shows your current achievement level for that combination 
            of operation and number range.
          </p>
          <p className="text-muted-foreground">
            Play games to improve your scores and earn higher achievement levels!
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoalsPage;
