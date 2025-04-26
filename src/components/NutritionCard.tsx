import React, { useState } from 'react';
import { NutritionGoal } from '../types';

interface NutritionCardProps {
  goal: NutritionGoal;
  mode: 'health' | 'diet';
  onIncrement: (amount: number) => void;
  onReset: () => void;
  onModeToggle: () => void;
}

const getColorClasses = (color: string): {
  bgLight: string;
  bgDark: string;
  progressBg: string;
  text: string;
  border: string;
} => {
  switch (color) {
    case 'blue':
      return {
        bgLight: 'bg-primary-light/10',
        bgDark: 'bg-primary-light/20',
        progressBg: 'bg-primary',
        text: 'text-primary-dark',
        border: 'border-primary-light/30'
      };
    case 'orange':
      return {
        bgLight: 'bg-orange-100',
        bgDark: 'bg-orange-200',
        progressBg: 'bg-orange-500',
        text: 'text-orange-800',
        border: 'border-orange-200'
      };
    case 'red':
      return {
        bgLight: 'bg-red-100',
        bgDark: 'bg-red-200',
        progressBg: 'bg-red-500',
        text: 'text-red-800',
        border: 'border-red-200'
      };
    case 'yellow':
      return {
        bgLight: 'bg-yellow-100',
        bgDark: 'bg-yellow-200',
        progressBg: 'bg-yellow-500',
        text: 'text-yellow-800',
        border: 'border-yellow-200'
      };
    case 'purple':
      return {
        bgLight: 'bg-purple-100',
        bgDark: 'bg-purple-200',
        progressBg: 'bg-purple-500',
        text: 'text-purple-800',
        border: 'border-purple-200'
      };
    default:
      return {
        bgLight: 'bg-secondary-light/10',
        bgDark: 'bg-secondary-light/20',
        progressBg: 'bg-secondary',
        text: 'text-secondary-dark',
        border: 'border-secondary-light/30'
      };
  }
};

const NutritionCard: React.FC<NutritionCardProps> = ({
  goal,
  mode,
  onIncrement,
  onReset,
  onModeToggle
}) => {
  const colors = getColorClasses(goal.color);
  const target = goal.target[mode];
  const progress = target > 0 
    ? Math.min(100, (goal.current / target) * 100) 
    : 0;
  
  const getStepSize = () => {
    if (goal.unit === 'L') return 0.25;
    if (goal.unit === 'kcal') return 100;
    return 5;
  };
  
  const renderProgressIndicators = () => {
    if (goal.id !== 'water') return null;
    
    const totalIndicators = Math.ceil(target / 0.25);
    const filledIndicators = Math.floor(goal.current / 0.25);
    
    return (
      <div className="flex flex-wrap gap-1 mt-3">
        {Array.from({ length: totalIndicators }).map((_, index) => (
          <div
            key={index}
            className={`w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center ${
              index < filledIndicators 
                ? colors.progressBg 
                : 'bg-gray-200'
            }`}
          >
            {index < filledIndicators && (
              <span className="text-background text-xs">+</span>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className={`rounded-xl shadow-md overflow-hidden border ${colors.border} font-poppins h-full flex flex-col`}>
      <div className={`${colors.bgDark} px-4 py-3 flex justify-between items-center`}>
        <h3 className={`font-semibold ${colors.text}`}>{goal.name}</h3>
        <div className="flex items-center space-x-1">
          {goal.id !== 'water' && (
            <button
              onClick={onModeToggle}
              className="btn btn-sm hover:bg-white/30"
              aria-label="Changer de mode"
            >
              {mode === 'health' ? (
                <span className="text-2xl">❤️</span>
              ) : (
                <span className="text-2xl">🥗</span>
              )}
            </button>
          )}
          <button
            onClick={onReset}
            className="btn btn-sm hover:bg-white/30"
            aria-label="Réinitialiser"
          >
            <span className="text-2xl">🔄</span>
          </button>
        </div>
      </div>
      
      <div className={`${colors.bgLight} px-4 py-3 flex-1 flex flex-col`}>
        <div className="flex justify-between items-center mb-2">
          <div className={`text-lg font-semibold ${colors.text}`}>
            {goal.current} {goal.unit}
          </div>
          <div className={`text-sm ${colors.text}`}>
            {goal.id === 'water' ? (
              <span>Objectif minimum: {target} {goal.unit}</span>
            ) : (
              <span>Objectif {mode === 'health' ? 'santé' : 'régime'}: {target} {goal.unit}</span>
            )}
          </div>
        </div>
        
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colors.progressBg} transition-all duration-500 ease-out`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {renderProgressIndicators()}
        
        <div className="mt-auto pt-4 flex items-center justify-between">
          <button
            onClick={() => onIncrement(-getStepSize())}
            className={`btn btn-sm ${colors.bgDark} hover:opacity-80 ${colors.text}`}
            aria-label="Diminuer"
            disabled={goal.current <= 0}
          >
            <span>➖</span>
          </button>
          
          <div className="text-center">
            <span className={`text-sm font-medium ${colors.text}`}>
              {Math.round(progress)}%
            </span>
          </div>
          
          <button
            onClick={() => onIncrement(getStepSize())}
            className={`btn btn-sm ${colors.progressBg} text-background hover:opacity-80`}
            aria-label="Augmenter"
          >
            <span>➕</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NutritionCard;