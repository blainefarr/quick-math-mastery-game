
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Target, TrendingUp } from 'lucide-react';
import useGoalProgress from '@/hooks/useGoalProgress';
import GoalsGrid from '@/components/goals/GoalsGrid';
import GoalsLegend from '@/components/goals/GoalsLegend';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth/useAuth';

const GoalsPage: React.FC = () => {
  const { goals, isLoading } = useGoalProgress();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center">
          <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center mr-3 shadow-md">
            <Target size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">Goals</h1>
            <p className="text-sm text-muted-foreground">Track your math skills progress</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center"
          onClick={() => navigate('/progress')}
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          View Detailed Progress
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Goal Progress</CardTitle>
              <CardDescription>
                Track your mastery level across different math operations and number ranges
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <GoalsGrid 
                goals={goals}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <GoalsLegend />
          
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
    </div>
  );
};

export default GoalsPage;
