import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import Header from './components/Header';
import DailyTracker from './components/DailyTracker';
import Progress from './components/Progress';
import Calendar from './components/Calendar';
import Params from './components/Params';
import { formatDate } from './utils/dateUtils';
import { 
  getInitialState, 
  getDailyLog, 
  updateNutritionGoal,
  updateNutritionTarget,
  resetNutritionGoal,
  toggleNutritionMode
} from './utils/storageUtils';
import { AppState } from './types';
import Parse from './parseConfig';
import Navbar from './components/Navbar';

function App() {
  const [state, setState] = useState<AppState>(getInitialState());
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const currentUser = Parse.User.current();
    setIsAuthenticated(!!currentUser);
  }, []);

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

  const handleLogout = async () => {
    await Parse.User.logOut();
    setIsAuthenticated(false);
  };

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
  
  const handleUpdateTarget = (goalId: string, amount: number) => {
    const updatedState = updateNutritionTarget(state, state.currentDate, goalId, amount);
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

  if (!isAuthenticated) {
    return <Auth onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-app">
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <div className="container mx-auto px-4 md:px-0">
          <Header
            currentDate={state.currentDate}
            onPrevDay={handlePrevDay}
            onNextDay={handleNextDay}
            onTodayClick={handleTodayClick}
            showDateNav={true}
          />
          
          <main className="flex-1 container mx-auto pb-20">
            <Routes>
              <Route path="/" element={
                <DailyTracker
                  dailyLog={currentDailyLog}
                  onUpdateGoal={handleUpdateGoal}
                  onResetGoal={handleResetGoal}
                  onToggleMode={handleToggleMode}
                />
              } />
              <Route path="/progress" element={<Progress dailyLogs={state.dailyLogs} />} />
              <Route path="/calendar" element={<Calendar dailyLogs={state.dailyLogs} />} />
              <Route path="/params" element={
                <Params
                  dailyLog={currentDailyLog}
                  onUpdateTarget={handleUpdateTarget}
                  onResetGoal={handleResetGoal}
                  onToggleMode={handleToggleMode}
                />
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;