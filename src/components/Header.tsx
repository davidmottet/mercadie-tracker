import React from 'react';
import { formatReadableDate } from '../utils/dateUtils';

interface HeaderProps {
  currentDate: string;
  onPrevDay: () => void;
  onNextDay: () => void;
  onTodayClick: () => void;
  showDateNav?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  currentDate,
  onPrevDay,
  onNextDay,
  onTodayClick,
  showDateNav = true
}) => {
  const formattedDate = formatReadableDate(currentDate);
  const isToday = new Date(currentDate).toDateString() === new Date().toDateString();
  
  return (
    <header className="bg-gray-50 shadow-lg rounded-b-2xl">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="text-2xl">📊</span>
            <h1 className="text-2xl font-bold font-poppins text-gray-800">
              NutriTrack
            </h1>
          </div>
          
          {showDateNav && (
            <div className="flex items-center space-x-3">
              <button
                onClick={onPrevDay}
                className="p-2 hover:bg-gray-200 rounded-lg transition duration-300"
              >
                <span className="text-2xl">⬅️</span>
              </button>
              
              <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow-sm">
                <span className="font-medium font-poppins text-gray-700">{formattedDate}</span>
              </div>
              
              <button
                onClick={onNextDay}
                className="p-2 hover:bg-gray-200 rounded-lg transition duration-300"
              >
                <span className="text-2xl">➡️</span>
              </button>
              
              {!isToday && (
                <button
                  onClick={onTodayClick}
                  className="p-2 hover:bg-gray-200 rounded-lg transition duration-300"
                >
                  <span className="text-2xl">📅</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;