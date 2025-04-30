
import React from 'react';
import { GoalLevel } from '@/types';
import { getLevelEmoji } from '@/hooks/useGoalProgress';

const GoalsLegend: React.FC = () => {
  const levels: {
    level: GoalLevel;
    name: string;
    threshold: number;
  }[] = [
    {
      level: 'learning',
      name: 'Learning',
      threshold: 0
    },
    {
      level: 'bronze',
      name: 'Bronze',
      threshold: 20
    },
    {
      level: 'silver',
      name: 'Silver',
      threshold: 30
    },
    {
      level: 'gold',
      name: 'Gold',
      threshold: 40
    },
    {
      level: 'star',
      name: 'Star',
      threshold: 50
    },
    {
      level: 'legend',
      name: 'Legend',
      threshold: 60
    }
  ];

  return (
    <div className="border rounded-md p-4 bg-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
        <h3 className="font-medium text-lg mb-2 sm:mb-0">Levels</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 px-1 sm:px-8 md:px-16 lg:px-24 xl:px-32">
        {levels.map(({
          level,
          name,
          threshold
        }) => (
          <div key={level} className="flex items-center gap-2">
            <span className="text-xl">{getLevelEmoji(level)}</span>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{name}</span>
              <span className="text-xs text-muted-foreground">
                {level === 'learning' ? 'Keep Going!' : `Score ≥ ${threshold}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalsLegend;
