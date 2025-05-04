import React from 'react';
import { NutritionLog } from '../types';

interface NutritionCardProps {
  log: NutritionLog;
  onIncrement: (amount: number) => void;
  onReset: () => void;
  onModeToggle: () => void;
}

const NutritionCard: React.FC<NutritionCardProps> = ({
  log,
  onIncrement,
  onReset,
  onModeToggle
}) => {
  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-yellow-500';
    if (progress >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const progress = (log.currentValue / log.targetValue) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{log.name}</h3>
        <button
          onClick={onModeToggle}
          className="text-sm px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          {log.mode === 'health' ? 'Santé' : 'Régime'}
        </button>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{log.currentValue} {log.unit.name}</span>
          <div className="flex items-center space-x-2">
            <span>{log.targetValue} {log.unit.name}</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${getProgressColor(progress)}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <div className="space-x-2">
          <button
            onClick={() => onIncrement(-1)}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
          >
            -1
          </button>
          <button
            onClick={() => onIncrement(1)}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
          >
            +1
          </button>
        </div>
        <button
          onClick={onReset}
          className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-red-700"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default NutritionCard;