
import React, { useState, useEffect } from 'react';
import { UserScore } from '@/types';
import { Card } from '@/components/ui/card';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer } from 'recharts';

interface ScoreChartProps {
  scores: UserScore[];
}

const ScoreChart = ({ scores = [] }: ScoreChartProps) => {
  const [validScores, setValidScores] = useState<UserScore[]>([]);
  
  // Process scores on component mount and when scores prop changes
  useEffect(() => {
    console.log('ScoreChart received scores:', scores);
    // Filter out invalid scores
    const filtered = Array.isArray(scores) ? scores.filter(score => 
      score && 
      typeof score === 'object' && 
      score.operation && 
      score.date && 
      score.range
    ) : [];
    setValidScores(filtered);
    console.log('Filtered valid scores for chart:', filtered);
  }, [scores]);
  
  // Format date for display with error handling
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
  // Sort scores by date (chronological order) with error handling
  const sortedScores = [...validScores].sort((a, b) => {
    try {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } catch (error) {
      console.error('Error sorting dates:', error);
      return 0;
    }
  });
  
  // Prepare data for chart with error handling
  const chartData = sortedScores.map(score => ({
    date: formatDate(score.date),
    score: score.score,
    operation: score.operation,
    duration: score.duration || 60,
    settings: `${score.focusNumber ? 'Focus: ' + score.focusNumber : ''}${score.allowNegatives ? ' Negatives' : ''}`
  }));
  
  // Calculate average score if there are scores
  const averageScore = sortedScores.length 
    ? Math.round(sortedScores.reduce((sum, score) => sum + score.score, 0) / sortedScores.length)
    : 0;
  
  // Find personal best
  const personalBest = sortedScores.length 
    ? Math.max(...sortedScores.map(score => score.score))
    : 0;
  
  // If no valid scores, show empty state
  if (validScores.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">You haven't completed any games yet.</p>
        <p className="text-sm">Play a game to see your progress!</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Your Progress</h3>
      
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
              <Tooltip
                formatter={(value, name, props) => {
                  if (name === 'score') return [value, 'Score'];
                  return [value, name];
                }}
                labelFormatter={(label) => `Date: ${label}`}
              />
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
