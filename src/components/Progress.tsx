import React from 'react';
import { NutritionLog } from '../types';

interface ProgressProps {
  dailyLogs: Record<string, NutritionLog[]>;
}

type GoalId = 'water' | 'calories' | 'protein' | 'carbs' | 'fat';

interface GoalStats {
  sum: number;
  count: number;
}

interface GoalAverage {
  id: GoalId;
  average: number;
}

interface GoalInfo {
  name: string;
  emoji: string;
  achievement: string;
}

const GOAL_INFO: Record<GoalId, GoalInfo> = {
  water: {
    name: 'Eau',
    emoji: '💧',
    achievement: "d'hydratation"
  },
  calories: {
    name: 'Calories',
    emoji: '🔥',
    achievement: 'calorique'
  },
  protein: {
    name: 'Protéines',
    emoji: '🥩',
    achievement: 'de protéines'
  },
  carbs: {
    name: 'Glucides',
    emoji: '🍞',
    achievement: 'de glucides'
  },
  fat: {
    name: 'Lipides',
    emoji: '🥑',
    achievement: 'de lipides'
  }
};

const Progress: React.FC<ProgressProps> = ({ dailyLogs }) => {
  const dates = Object.keys(dailyLogs).sort();
  const lastSevenDays = dates.slice(-7);

  const calculateAverages = (): GoalAverage[] => {
    const totals: Record<GoalId, GoalStats> = Object.keys(GOAL_INFO).reduce((acc, id) => ({
      ...acc,
      [id]: { sum: 0, count: 0 }
    }), {} as Record<GoalId, GoalStats>);
    
    lastSevenDays.forEach(date => {
      const logs = dailyLogs[date];
      if (!logs) return;

      logs.forEach(log => {
        const id = log.name.toLowerCase() as GoalId;
        if (!(id in totals)) return;

        const hasValue = log.currentValue > 0 || log.targetValue > 0;
        if (!hasValue) return;

        if (log.targetValue === 0) return;

        totals[id].sum += (log.currentValue / log.targetValue) * 100;
        totals[id].count++;
      });
    });

    return Object.entries(totals).map(([id, { sum, count }]) => ({
      id: id as GoalId,
      average: count > 0 ? Math.round(sum / count) : 0
    }));
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-500';
    if (percentage >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const averages = calculateAverages();
  const achievements = averages.filter(({ average }) => average >= 90);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 mb-6">
        <span className="text-2xl">📊</span>
        <h1 className="text-2xl font-bold text-gray-800">Progrès</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="w-full bg-gray-50 rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-2xl">📈</span>
            <h2 className="text-xl font-semibold text-gray-800">Moyennes sur 7 jours</h2>
          </div>

          <div className="space-y-6">
            {averages.map(({ id, average }) => (
              <div key={id} className="w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{GOAL_INFO[id].emoji}</span>
                    <span className="font-medium text-gray-700">
                      {GOAL_INFO[id].name}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`text-lg font-semibold ${getProgressColor(average)}`}>
                      {average}%
                    </span>
                    {average >= 90 && <span className="text-2xl">🏆</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full bg-gray-50 rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-2xl">🏆</span>
            <h2 className="text-xl font-semibold text-gray-800">Réalisations</h2>
          </div>

          <div className="space-y-6">
            {achievements.map(({ id }) => (
              <div key={id} className="w-full">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🏆</span>
                  <span className="font-medium text-gray-700">
                    Objectif {GOAL_INFO[id].achievement} atteint !
                  </span>
                </div>
              </div>
            ))}
            {achievements.length === 0 && (
              <div className="w-full">
                <p className="text-gray-500 text-center">
                  Continuez vos efforts pour débloquer des réalisations !
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;