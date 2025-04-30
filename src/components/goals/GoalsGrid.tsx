
import React from 'react';
import { GoalProgress, Operation, GoalCategory } from '@/types';
import GoalCell from './GoalCell';
import { Separator } from '@/components/ui/separator';
import OperationButton from '@/components/operation/OperationButton';

interface GoalsGridProps {
  goals: GoalProgress[];
  isLoading: boolean;
}

const GoalsGrid: React.FC<GoalsGridProps> = ({ goals, isLoading }) => {
  // Define operations and ranges to display
  const operations: Operation[] = ['addition', 'subtraction', 'multiplication', 'division'];
  
  const categories: GoalCategory[] = [
    {
      title: "Focus Numbers",
      ranges: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      isFocusNumber: true
    },
    {
      title: "Ranges", 
      ranges: ['1-5', '1-10']
    }
  ];
  
  // Find goal for a specific operation and range
  const findGoal = (operation: Operation, range: string) => {
    return goals.find(goal => goal.operation === operation && goal.range === range);
  };
  
  if (isLoading) {
    return <GoalsGridSkeleton />;
  }

  return (
    <div className="w-full px-1 sm:px-2 md:px-4">
      {categories.map((category) => (
        <React.Fragment key={category.title}>
          {/* Conditionally render operation header row for Focus Numbers only */}
          {category.title === 'Focus Numbers' && (
            <div className="grid grid-cols-5 gap-2 items-end mb-3">
              <div className="text-sm font-semibold text-muted-foreground">
                Focus Number
              </div>
              {operations.map((op) => (
                <div key={op} className="flex justify-center">
                  <div className="w-full flex justify-center">
                  <OperationButton 
                      operation={op} 
                      active={true} 
                      onClick={() => {}} 
                      isMobile={true} // or make a custom responsive prop
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
  
          {/* Category header */}
          {category.title === 'Ranges' && (
            <div className="mt-6 mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground">{category.title}</h3>
              <Separator className="mt-1" />
            </div>
          )}
          {category.title === 'Focus Numbers' && (
            <Separator className="my-3" />
          )}


  
          {/* Grid of rows */}
          {category.ranges.map((range) => (
            <div 
              key={`${category.title}-${range}`} 
              className="grid grid-cols-5 gap-2 mb-2"
            >
              <div className="col-span-1 flex items-center justify-start">
                <span className="text-sm font-medium">
                  {category.isFocusNumber 
                    ? `${range} | 1-10` 
                    : `${range} | ${range}`}
                </span>
              </div>
              <div className="col-span-4 grid grid-cols-4 gap-2">
                {operations.map((op) => (
                  <div key={`${op}-${range}`} className="col-span-1">
                    <GoalCell
                      goal={findGoal(op, range)}
                      operation={op}
                      range={range}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

        </React.Fragment>
      ))}
    </div>
  );
};

const GoalsGridSkeleton = () => {
  // Create a skeleton layout that matches our updated grid structure
  return (
    <div className="w-full px-1 sm:px-2 md:px-4">
      <div className="grid grid-cols-5 gap-2 mb-2">
        <div className="col-span-1"></div>
        <div className="col-span-4 grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="col-span-1 flex justify-center">
              <div className="h-8 w-8 bg-slate-200 rounded-full animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
      
      {[...Array(2)].map((_, categoryIndex) => (
        <React.Fragment key={categoryIndex}>
          <div className="mt-6 mb-3">
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
            <Separator className="mt-1" />
          </div>
          
          {[...Array(categoryIndex === 0 ? 10 : 2)].map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-5 gap-2 mb-2">
              <div className="col-span-1 flex items-center">
                <div className="h-4 w-16 bg-slate-200 rounded animate-pulse"></div>
              </div>
              
              <div className="col-span-4 grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, colIndex) => (
                  <div key={colIndex} className="col-span-1">
                    <div className="h-12 w-full bg-slate-200 rounded-md animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default GoalsGrid;
