import React from 'react';
import { NutritionLog } from '../types';
import NutritionCard from './NutritionCard';
import { getBaseConfig } from '../services/configService';

interface DailyTrackerProps {
  logs: NutritionLog[];
  onUpdateLog: (logId: string, amount: number) => void;
  onUpdateTarget: (logId: string, amount: number) => void;
  onResetLog: (logId: string) => void;
  onToggleMode: () => void;
}

const DailyTracker: React.FC<DailyTrackerProps> = ({
  logs,
  onUpdateLog,
  onUpdateTarget,
  onResetLog,
  onToggleMode
}) => {
  const baseConfig = getBaseConfig();
  const displayLogs = logs.length > 0 ? logs.map(log => {
    const baseLog = baseConfig.find(b => b.id === log.id);
    return baseLog ? { ...log, targetValue: baseLog.targetValue } : log;
  }) : baseConfig;

  const sortedLogs = [...displayLogs].sort((a, b) => {
    if (a.name === 'Eau') return -1;
    if (b.name === 'Eau') return 1;
    return 0;
  });
  
  return (
    <div className="py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedLogs.map(log => (
          <div key={log.id} className="h-full">
            <NutritionCard
              log={log}
              onIncrement={(amount) => onUpdateLog(log.id, amount)}
              onReset={() => onResetLog(log.id)}
              onModeToggle={onToggleMode}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyTracker;