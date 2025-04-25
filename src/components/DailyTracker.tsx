import React from 'react';
import { DailyLog } from '../types';
import NutritionCard from './NutritionCard';

interface DailyTrackerProps {
  dailyLog: DailyLog;
  onUpdateGoal: (goalId: string, amount: number) => void;
  onResetGoal: (goalId: string) => void;
  onToggleMode: () => void;
}

const DailyTracker: React.FC<DailyTrackerProps> = ({
  dailyLog,
  onUpdateGoal,
  onResetGoal,
  onToggleMode
}) => {
  const sortedGoals = [...dailyLog.nutritionGoals].sort((a, b) => {
    if (a.id === 'water') return -1;
    if (b.id === 'water') return 1;
    return 0;
  });
  
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedGoals.map(goal => (
          <div key={goal.id} className="h-full">
            <NutritionCard
              goal={goal}
              mode={dailyLog.activeMode}
              onIncrement={(amount) => onUpdateGoal(goal.id, amount)}
              onReset={() => onResetGoal(goal.id)}
              onModeToggle={onToggleMode}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyTracker;