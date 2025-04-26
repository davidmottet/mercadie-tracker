import React, { useState } from 'react';
import { DailyLog } from '../types';

interface CalendarProps {
  dailyLogs: Record<string, DailyLog>;
}

const Calendar: React.FC<CalendarProps> = ({ dailyLogs }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getDailyProgress = (date: string) => {
    if (!dailyLogs[date]) return null;

    const goals = dailyLogs[date].nutritionGoals;
    const mode = dailyLogs[date].activeMode;
    
    let totalProgress = 0;
    let validGoals = 0;

    goals.forEach(goal => {
      if (goal.target[mode] > 0) {
        totalProgress += (goal.current / goal.target[mode]) * 100;
        validGoals++;
      }
    });

    return validGoals > 0 ? Math.round(totalProgress / validGoals) : 0;
  };

  const getProgressColor = (progress: number | null) => {
    if (progress === null) return 'bg-gray-100';
    if (progress >= 90) return 'bg-green-100';
    if (progress >= 70) return 'bg-yellow-100';
    if (progress >= 50) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getProgressTextColor = (progress: number | null) => {
    if (progress === null) return 'text-gray-400';
    if (progress >= 90) return 'text-green-700';
    if (progress >= 70) return 'text-yellow-700';
    if (progress >= 50) return 'text-orange-700';
    return 'text-red-700';
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString('fr-FR', { month: 'long' });
  const year = currentDate.getFullYear();

  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - firstDay + 1;
    if (dayNumber > 0 && dayNumber <= daysInMonth) {
      const dateString = formatDateString(year, currentDate.getMonth(), dayNumber);
      const progress = getDailyProgress(dateString);
      return { dayNumber, dateString, progress };
    }
    return null;
  });

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <span className="text-2xl">⬅️</span>
          </button>
          
          <h2 className="text-xl font-semibold capitalize">
            {monthName} {year}
          </h2>
          
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <span className="text-2xl">➡️</span>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              className={`aspect-square p-1 ${
                day ? getProgressColor(day.progress) : 'bg-gray-50'
              } rounded-lg`}
            >
              {day && (
                <div className="h-full flex flex-col">
                  <span className="text-sm text-gray-600">{day.dayNumber}</span>
                  {day.progress !== null && (
                    <div className="flex-1 flex items-center justify-center">
                      <div className={`flex items-center ${getProgressTextColor(day.progress)}`}>
                        <span className="text-2xl">📊</span>
                        <span className="text-xs font-medium">{day.progress}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;