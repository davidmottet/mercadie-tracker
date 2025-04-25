import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
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
                className="btn btn-sm bg-white/10 hover:bg-white/20 text-background"
                aria-label="Jour précédent"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex items-center bg-white/10 rounded-lg px-3 py-1 text-background">
                <Calendar size={18} className="mr-2" />
                <span className="font-medium font-poppins">{formattedDate}</span>
              </div>
              
              <button
                onClick={onNextDay}
                className="btn btn-sm bg-white/10 hover:bg-white/20 text-background"
                aria-label="Jour suivant"
              >
                <ChevronRight size={20} />
              </button>
              
              {!isToday && (
                <button
                  onClick={onTodayClick}
                  className="btn btn-sm bg-white/20 hover:bg-white/30 ml-2 text-background"
                >
                  Aujourd'hui
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