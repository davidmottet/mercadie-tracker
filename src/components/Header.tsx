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
    <header className="sticky top-0 z-10 bg-primary shadow-md">
      <div className="nav-content py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold font-poppins mb-2 md:mb-0 text-background">
            NutriTrack
          </h1>
          
          {showDateNav && (
            <div className="flex items-center space-x-2">
              <button
                onClick={onPrevDay}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <span className="text-2xl">⬅️</span>
              </button>
              
              <div className="flex items-center bg-white/10 rounded-lg px-3 py-1 text-background">
                <span className="font-medium font-poppins">{formattedDate}</span>
              </div>
              
              <button
                onClick={onNextDay}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <span className="text-2xl">➡️</span>
              </button>
              
              {!isToday && (
                <button
                  onClick={onTodayClick}
                  className="p-2 hover:bg-gray-100 rounded-full"
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