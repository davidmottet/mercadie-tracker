import React from 'react';
import { DailyLog } from '../types';

interface ParamsProps {
  onUpdateTarget: (goalId: string, amount: number) => void;
  onResetGoal: (goalId: string) => void;
  onToggleMode: () => void;
  dailyLog: DailyLog;
}

const Params: React.FC<ParamsProps> = ({ onUpdateTarget, onResetGoal, onToggleMode, dailyLog }) => {

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">⚙️</span>
          <span className="text-lg font-semibold">Paramètres</span>
        </div>
      </h1>
      
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Objectifs Journaliers</h2>
          <div className="space-y-4">
            {dailyLog.nutritionGoals.map((goal) => (
              <div key={goal.id} className="flex items-center justify-between">
                <span className="font-medium">{goal.name}</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    className="w-20 px-2 py-1 border rounded"
                    value={goal.target[dailyLog.activeMode]}
                    onChange={(e) => onUpdateTarget(goal.id, Number(e.target.value))}
                  />
                  <button
                    onClick={() => onResetGoal(goal.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Mode de Suivi</h2>
          <div className="flex items-center justify-between">
            <span className="font-medium">Mode {dailyLog.activeMode === 'health' ? 'Santé' : 'Régime'}</span>
            <button
              onClick={onToggleMode}
              className={`px-4 py-2 rounded ${
                dailyLog.activeMode === 'health' ? 'bg-green-500' : 'bg-red-500'
              } text-white`}
            >
              {dailyLog.activeMode === 'health' ? 'Santé' : 'Régime'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Params; 