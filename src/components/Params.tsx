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
      <div className="flex items-center space-x-2 mb-6">
        <span className="text-2xl">⚙️</span>
        <h1 className="text-2xl font-bold text-gray-800">Paramètres</h1>
      </div>
      
      <div className="space-y-8">
        <div className="w-full bg-gray-50 rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-2xl">🎯</span>
            <h2 className="text-xl font-semibold text-gray-800">Objectifs Journaliers</h2>
          </div>
          
          <div className="space-y-6">
            {dailyLog.nutritionGoals.map((goal) => (
              <div key={goal.id} className="w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {goal.id === 'water' ? '💧' :
                       goal.id === 'calories' ? '🔥' :
                       goal.id === 'protein' ? '🥩' :
                       goal.id === 'carbs' ? '🍞' : '🥑'}
                    </span>
                    <span className="font-medium text-gray-700">{goal.name}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={goal.target[dailyLog.activeMode]}
                      onChange={(e) => onUpdateTarget(goal.id, Number(e.target.value))}
                    />
                    <button
                      onClick={() => onResetGoal(goal.id)}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition duration-300"
                    >
                      <span className="text-2xl">🔄</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="w-full bg-gray-50 rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-2xl">🔄</span>
            <h2 className="text-xl font-semibold text-gray-800">Mode de Suivi</h2>
          </div>
          
          <div className="w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {dailyLog.activeMode === 'health' ? '❤️' : '🥗'}
                </span>
                <span className="font-medium text-gray-700">
                  Mode {dailyLog.activeMode === 'health' ? 'Santé' : 'Régime'}
                </span>
              </div>
              
              <button
                onClick={onToggleMode}
                className={`px-6 py-3 rounded-lg text-white font-medium transition duration-300 ${
                  dailyLog.activeMode === 'health' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {dailyLog.activeMode === 'health' ? 'Santé' : 'Régime'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Params; 