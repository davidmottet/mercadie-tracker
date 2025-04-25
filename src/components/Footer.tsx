import React from 'react';
import { Activity, Trophy, Calendar, Settings } from 'lucide-react';

interface FooterProps {
  activeTab: 'today' | 'progress' | 'calendar' | 'params';
  onTabChange: (tab: 'today' | 'progress' | 'calendar' | 'params') => void;
}

const Footer: React.FC<FooterProps> = ({ activeTab, onTabChange }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md">
      <div className="nav-content">
        <div className="flex justify-around items-center py-2">
          <button 
            onClick={() => onTabChange('today')}
            className={`flex flex-col items-center p-2 transition-colors ${
              activeTab === 'today' ? 'text-primary' : 'text-secondary hover:text-primary'
            }`}
          >
            <Activity size={20} />
            <span className="text-xs mt-1 font-poppins">Aujourd'hui</span>
          </button>
          
          <button 
            onClick={() => onTabChange('progress')}
            className={`flex flex-col items-center p-2 transition-colors ${
              activeTab === 'progress' ? 'text-primary' : 'text-secondary hover:text-primary'
            }`}
          >
            <Trophy size={20} />
            <span className="text-xs mt-1 font-poppins">Progrès</span>
          </button>
          
          <button 
            onClick={() => onTabChange('calendar')}
            className={`flex flex-col items-center p-2 transition-colors ${
              activeTab === 'calendar' ? 'text-primary' : 'text-secondary hover:text-primary'
            }`}
          >
            <Calendar size={20} />
            <span className="text-xs mt-1 font-poppins">Calendrier</span>
          </button>

          <button 
            onClick={() => onTabChange('params')}
            className={`flex flex-col items-center p-2 transition-colors ${
              activeTab === 'params' ? 'text-primary' : 'text-secondary hover:text-primary'
            }`}
          >
            <Settings size={20} />
            <span className="text-xs mt-1 font-poppins">Paramètres</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;