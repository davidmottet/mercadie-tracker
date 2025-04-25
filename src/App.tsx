import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DailyTracker from './components/DailyTracker';
import Progress from './components/Progress';
import Calendar from './components/Calendar';
import Footer from './components/Footer';
import { formatDate } from './utils/dateUtils';
import { 
  getInitialState, 
  getDailyLog, 
  updateNutritionGoal,
  resetNutritionGoal,
  toggleNutritionMode
} from './utils/storageUtils';
import { AppState } from './types';

function App() {
  const [state, setState] = useState<AppState>(getInitialState());
  const [activeTab, setActiveTab] = useState<'today' | 'progress' | 'calendar'>('today');
  
  useEffect(() => {
    const today = formatDate(new Date());
    if (!state.dailyLogs[today]) {
      setState(prevState => ({
        ...prevState,
        dailyLogs: {
          ...prevState.dailyLogs,
          [today]: getDailyLog(prevState, today)
        }
      }));
    }
  }, []);
  
  const handlePrevDay = () => {
    const currentDate = new Date(state.currentDate);
    currentDate.setDate(currentDate.getDate() - 1);
    const newDate = formatDate(currentDate);
    
    setState(prevState => ({
      ...prevState,
      currentDate: newDate,
      dailyLogs: {
        ...prevState.dailyLogs,
        [newDate]: prevState.dailyLogs[newDate] || getDailyLog(prevState, newDate)
      }
    }));
  };
  
  const handleNextDay = () => {
    const currentDate = new Date(state.currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
    const newDate = formatDate(currentDate);
    
    setState(prevState => ({
      ...prevState,
      currentDate: newDate,
      dailyLogs: {
        ...prevState.dailyLogs,
        [newDate]: prevState.dailyLogs[newDate] || getDailyLog(prevState, newDate)
      }
    }));
  };
  
  const handleTodayClick = () => {
    const today = formatDate(new Date());
    
    setState(prevState => ({
      ...prevState,
      currentDate: today,
      dailyLogs: {
        ...prevState.dailyLogs,
        [today]: prevState.dailyLogs[today] || getDailyLog(prevState, today)
      }
    }));
  };
  
  const handleUpdateGoal = (goalId: string, amount: number) => {
    const updatedState = updateNutritionGoal(state, state.currentDate, goalId, amount);
    setState(updatedState);
  };
  
  const handleResetGoal = (goalId: string) => {
    const updatedState = resetNutritionGoal(state, state.currentDate, goalId);
    setState(updatedState);
  };
  
  const handleToggleMode = () => {
    const updatedState = toggleNutritionMode(state, state.currentDate);
    setState(updatedState);
  };
  
  const currentDailyLog = getDailyLog(state, state.currentDate);
  
  const renderContent = () => {
    switch (activeTab) {
      case 'progress':
        return <Progress dailyLogs={state.dailyLogs} />;
      case 'calendar':
        return <Calendar dailyLogs={state.dailyLogs} />;
      case 'today':
        return (
          <DailyTracker
            dailyLog={currentDailyLog}
            onUpdateGoal={handleUpdateGoal}
            onResetGoal={handleResetGoal}
            onToggleMode={handleToggleMode}
          />
        );
      default:
        return <DailyTracker
          dailyLog={currentDailyLog}
          onUpdateGoal={handleUpdateGoal}
          onResetGoal={handleResetGoal}
          onToggleMode={handleToggleMode}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-background font-poppins flex flex-col">
      <Header
        currentDate={state.currentDate}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
        onTodayClick={handleTodayClick}
        showDateNav={activeTab === 'today'}
      />
      
      <main className="flex-1 container mx-auto pb-20">
        {renderContent()}
      </main>
      
      <Footer activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;