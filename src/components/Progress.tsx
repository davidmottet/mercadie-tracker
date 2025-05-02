import React from 'react';
import { DailyLog } from '../types';

interface ProgressProps {
  dailyLogs: Record<string, DailyLog>;
}

const Progress: React.FC<ProgressProps> = ({ dailyLogs }) => {
  const dates = Object.keys(dailyLogs).sort();
  const lastSevenDays = dates.slice(-7);

  const calculateAverages = () => {
    const totals = {
      water: { sum: 0, count: 0 },
      calories: { sum: 0, count: 0 },
      protein: { sum: 0, count: 0 },
      carbs: { sum: 0, count: 0 },
      fat: { sum: 0, count: 0 },
    };
    
    lastSevenDays.forEach(date => {
      const log = dailyLogs[date];
      if (log && log.nutritionGoals) {
        log.nutritionGoals.forEach(goal => {
          const id = goal.id as keyof typeof totals;
          if (goal.current > 0 || goal.target[log.activeMode] > 0) {
            totals[id].sum += (goal.current / goal.target[log.activeMode]) * 100;
            totals[id].count++;
          }
        });
      }
    });

    return Object.entries(totals).map(([key, { sum, count }]) => ({
      id: key,
      average: count > 0 ? Math.round(sum / count) : 0,
    }));
  };

  const averages = calculateAverages();

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-500';
    if (percentage >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

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
                    <span className="text-2xl">
                      {id === 'water' ? '💧' :
                       id === 'calories' ? '🔥' :
                       id === 'protein' ? '🥩' :
                       id === 'carbs' ? '🍞' : '🥑'}
                    </span>
                    <span className="font-medium text-gray-700 capitalize">
                      {id === 'water' ? 'Eau' :
                       id === 'calories' ? 'Calories' :
                       id === 'protein' ? 'Protéines' :
                       id === 'carbs' ? 'Glucides' : 'Lipides'}
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
            {averages.filter(({ average }) => average >= 90).map(({ id }) => (
              <div key={id} className="w-full">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🏆</span>
                  <span className="font-medium text-gray-700">
                    Objectif {
                      id === 'water' ? "d'hydratation" :
                      id === 'calories' ? 'calorique' :
                      id === 'protein' ? 'de protéines' :
                      id === 'carbs' ? 'de glucides' : 'de lipides'
                    } atteint !
                  </span>
                </div>
              </div>
            ))}
            {averages.filter(({ average }) => average >= 90).length === 0 && (
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