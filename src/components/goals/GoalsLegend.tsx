
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
      level: 'starter',
      name: 'Starter',
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
      <h3 className="font-medium mb-3 text-lg text-center">Level Legend</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 px-2 sm:px-4 md:px-8 lg:px-12 xl:px-24">
        {levels.map(({ level, name, threshold }) => (
          <div key={level} className="flex items-center gap-2">
            <span className="text-xl">{getLevelEmoji(level)}</span>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{name}</span>
              <span className="text-xs text-muted-foreground">
                {level === 'starter' ? 'Just starting' : `Score ≥ ${threshold}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalsLegend;
