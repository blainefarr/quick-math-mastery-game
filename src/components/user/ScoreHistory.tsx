
import React, { useEffect, useState } from 'react';
import { UserScore } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';

interface ScoreHistoryProps {
  scores: UserScore[];
}

const ScoreHistory = ({ scores = [] }: ScoreHistoryProps) => {
  const [validScores, setValidScores] = useState<UserScore[]>([]);
  
  // Process scores on component mount and when scores prop changes
  useEffect(() => {
    console.log('ScoreHistory received scores:', scores);
    // Filter out invalid scores
    const filtered = Array.isArray(scores) ? scores.filter(score => 
      score && 
      typeof score === 'object' && 
      score.operation && 
      score.date && 
      score.range
    ) : [];
    setValidScores(filtered);
    console.log('Filtered valid scores:', filtered);
  }, [scores]);
  
  // Get operation name in readable format
  const getOperationName = (operation: string) => {
    switch (operation) {
      case 'addition': return 'Addition';
      case 'subtraction': return 'Subtraction';
      case 'multiplication': return 'Multiplication';
      case 'division': return 'Division';
      default: return operation;
    }
  };
  
  // Format date for display with error handling
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
  // Sort scores by date (newest first) with error handling
  const sortedScores = [...validScores].sort((a, b) => {
    try {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } catch (error) {
      console.error('Error sorting dates:', error);
      return 0;
    }
  });
  
  // If no valid scores, show empty state
  if (validScores.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">You haven't completed any games yet.</p>
        <p className="text-sm">Play a game to see your score history!</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Your Score History</h3>
      
      {sortedScores.length === 0 ? (
        <Card className="p-8 text-center">
          <p>No scores match your selected filters.</p>
        </Card>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>Range</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedScores.map((score, index) => (
                <TableRow key={index}>
                  <TableCell>{formatDate(score.date)}</TableCell>
                  <TableCell>{getOperationName(score.operation)}</TableCell>
                  <TableCell>
                    {score.range.min1}-{score.range.max1} {getOperationName(score.operation)[0]} {score.range.min2}-{score.range.max2}
                  </TableCell>
                  <TableCell className="text-right font-medium">{score.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ScoreHistory;
