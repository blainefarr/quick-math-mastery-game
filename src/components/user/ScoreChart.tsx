
import React, { useState } from 'react';
import { UserScore } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer } from 'recharts';

interface ScoreChartProps {
  scores: UserScore[];
}

const ScoreChart = ({ scores }: ScoreChartProps) => {
  const [operationFilter, setOperationFilter] = useState<string>('all');
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  // Filter scores by selected operation
  const filteredScores = scores.filter(score => {
    return operationFilter === 'all' || score.operation === operationFilter;
  });
  
  // Sort scores by date (chronological order)
  const sortedScores = [...filteredScores].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Prepare data for chart
  const chartData = sortedScores.map(score => ({
    date: formatDate(score.date),
    score: score.score,
    operation: score.operation
  }));
  
  // Calculate average score if there are scores
  const averageScore = sortedScores.length 
    ? Math.round(sortedScores.reduce((sum, score) => sum + score.score, 0) / sortedScores.length)
    : 0;
  
  // Find personal best
  const personalBest = sortedScores.length 
    ? Math.max(...sortedScores.map(score => score.score))
    : 0;
  
  // If no scores, show empty state
  if (scores.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">You haven't completed any games yet.</p>
        <p className="text-sm">Play a game to see your progress!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <h3 className="text-lg font-medium">Your Progress</h3>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={operationFilter} onValueChange={setOperationFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by operation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Operations</SelectItem>
              <SelectItem value="addition">Addition</SelectItem>
              <SelectItem value="subtraction">Subtraction</SelectItem>
              <SelectItem value="multiplication">Multiplication</SelectItem>
              <SelectItem value="division">Division</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Average Score</div>
          <div className="text-3xl font-bold text-primary">{averageScore}</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Personal Best</div>
          <div className="text-3xl font-bold text-accent">{personalBest}</div>
        </Card>
      </div>
      
      {chartData.length === 0 ? (
        <Card className="p-8 text-center">
          <p>No scores match your selected filters.</p>
        </Card>
      ) : (
        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#9b87f5" name="Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ScoreChart;
