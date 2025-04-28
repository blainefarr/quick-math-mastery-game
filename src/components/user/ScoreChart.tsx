import React, { useState, useEffect } from 'react';
import { UserScore } from '@/types';
import { Card } from '@/components/ui/card';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer } from 'recharts';

interface ScoreChartProps {
  scores: UserScore[];
}

const ScoreChart = ({ scores = [] }: ScoreChartProps) => {
  const [validScores, setValidScores] = useState<UserScore[]>([]);
  
  useEffect(() => {
    console.log('ScoreChart received scores:', scores);
    const filtered = Array.isArray(scores) ? scores.filter(score => 
      score && 
      typeof score === 'object' && 
      score.operation && 
      score.date &&
      score.range &&
      score.duration === 60 // Only show 1-minute games
    ) : [];
    setValidScores(filtered);
    console.log('Filtered valid scores for chart:', filtered);
  }, [scores]);
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
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
  
  const sortedScores = [...validScores].sort((a, b) => {
    try {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } catch (error) {
      console.error('Error sorting dates:', error);
      return 0;
    }
  });

  const calculateImprovement = () => {
    if (sortedScores.length < 2) return 0;
    const firstScore = sortedScores[0].score;
    const lastScore = sortedScores[sortedScores.length - 1].score;
    return lastScore - firstScore;
  };

  const chartData = sortedScores.map(score => ({
    date: formatDate(score.date),
    score: score.score,
    operation: score.operation,
    duration: score.duration || 60,
    settings: `${score.focusNumber ? 'Focus: ' + score.focusNumber : ''}${score.allowNegatives ? ' Negatives' : ''}`
  }));

  const gamesPlayed = validScores.length;
  const improvement = calculateImprovement();
  
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Games Played</div>
          <div className="text-3xl font-bold text-primary">{gamesPlayed}</div>
        </Card>
        
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Personal Best</div>
          <div className="text-3xl font-bold text-accent">
            {sortedScores.length ? Math.max(...sortedScores.map(score => score.score)) : 0}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Improvement</div>
          <div className="text-3xl font-bold text-emerald-500">{improvement}</div>
        </Card>
      </div>
      
      {sortedScores.length === 0 ? (
        <Card className="p-8 text-center">
          <p>No scores match your selected filters.</p>
        </Card>
      ) : (
        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
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
