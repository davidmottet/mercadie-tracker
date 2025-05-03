import React from 'react';
import { NutritionLog } from '../types';
import { defaultLogs } from '../data/defaultLogs';

interface ParamsProps {
  logs: NutritionLog[];
  onUpdateTarget: (logId: string, amount: number) => void;
  onResetLog: (logId: string) => void;
  onToggleMode: () => void;
}

const Params: React.FC<ParamsProps> = ({ logs, onUpdateTarget, onResetLog, onToggleMode }) => {
  const displayLogs = logs.length > 0 ? logs : defaultLogs;
  const activeMode = displayLogs[0]?.mode || 'health';

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
            {displayLogs.map((log) => (
              <div key={log.id} className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-700">{log.name}</h3>
                  <button
                    onClick={() => onResetLog(log.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Réinitialiser
                  </button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    value={log.targetValue}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        onUpdateTarget(log.id, value);
                      }
                    }}
                    className="w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.1"
                  />
                  <span className="text-gray-600">{log.unit.name}</span>
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
                  {activeMode === 'health' ? '❤️' : '🥗'}
                </span>
                <span className="font-medium text-gray-700">
                  Mode {activeMode === 'health' ? 'Santé' : 'Régime'}
                </span>
              </div>
              
              <button
                onClick={onToggleMode}
                className={`px-6 py-3 rounded-lg text-white font-medium transition duration-300 ${
                  activeMode === 'health' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {activeMode === 'health' ? 'Santé' : 'Régime'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Params; 