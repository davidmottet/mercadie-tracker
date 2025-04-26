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
    <div className="p-4 space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-2xl">📊</span>
          <h2 className="text-xl font-semibold text-gray-800">Moyennes sur 7 jours</h2>
        </div>
        <div className="grid gap-4">
          {averages.map(({ id, average }) => (
            <div key={id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📈</span>
                <span className="font-medium capitalize">
                  {id === 'water' ? 'Eau' :
                   id === 'calories' ? 'Calories' :
                   id === 'protein' ? 'Protéines' :
                   id === 'carbs' ? 'Glucides' : 'Lipides'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${getProgressColor(average)}`}>
                  {average}%
                </span>
                {average >= 90 && <span className="text-2xl">🏆</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-2xl">🏆</span>
          <h2 className="text-xl font-semibold text-gray-800">Réalisations</h2>
        </div>
        <div className="grid gap-4">
          {averages.filter(({ average }) => average >= 90).map(({ id }) => (
            <div key={id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <span className="text-2xl">🏆</span>
              <span className="font-medium text-green-800">
                Objectif {
                  id === 'water' ? "d'hydratation" :
                  id === 'calories' ? 'calorique' :
                  id === 'protein' ? 'de protéines' :
                  id === 'carbs' ? 'de glucides' : 'de lipides'
                } atteint !
              </span>
            </div>
          ))}
          {averages.filter(({ average }) => average >= 90).length === 0 && (
            <p className="text-gray-500 text-center py-2">
              Continuez vos efforts pour débloquer des réalisations !
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Progress;